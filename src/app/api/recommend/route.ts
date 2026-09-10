import { groqChat } from "@/lib/groq";
import { recommendScheme, SCHEMES } from "@/lib/schemes";
import type { Profile, Recommendation } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const inr = (n: number) =>
  `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n)}`;

export async function POST(request: Request) {
  try {
    const raw = await request.json();
    const profile = raw as Profile;
    const clientKey = raw?.apiKey || request.headers.get("x-groq-key") || undefined;
    if (
      typeof profile.projectCost !== "number" ||
      typeof profile.annualIncome !== "number" ||
      typeof profile.age !== "number"
    ) {
      return Response.json({ error: "Invalid profile parameters" }, { status: 400 });
    }

    const prevEnvKey = process.env.GROQ_API_KEY;
    if (clientKey) {
      process.env.GROQ_API_KEY = clientKey;
    }

    // 1. Compute baseline verified rule-based recommendation
    const baseline = recommendScheme(profile);

    // 2. Try Groq AI (Llama 3.3) for intelligent AI-driven scheme matching and personalized analysis
    const systemPrompt = `You are SchemeSaathi AI, an authoritative AI financial analyst specialized in Ministry of MSME, Ministry of Finance, and Ministry of Social Justice schemes (PMEGP, MUDRA, Stand-Up India, CGTMSE, PM Vishwakarma, NSFDC).

Official Verified Scheme Registry:
1. Prime Minister's Employment Generation Programme ("pmegp"):
   - Cap: ₹50,00,000 (Mfg) / ₹20,00,000 (Service) | Subsidy: 15% to 35% Govt capital grant
   - Best for: Manufacturing, agro-processing, food production, renewable energy, workshops.
   - Interest: ~8.5% p.a. | Grace: 6 months | Max tenure: 7 years

2. PM MUDRA Yojana ("mudra-shishu" up to ₹50K, "mudra-kishore" ₹50K–₹5L, "mudra-tarun" ₹5L–₹10L):
   - 100% collateral-free bank finance for small businesses, retail shops, traders, artisans, micro-units.
   - Interest: 7.5%–8.5% p.a. | Grace: 3–6 months | Max tenure: 3–5 years

3. Stand-Up India Scheme ("standup-india"):
   - For SC, ST, and Women entrepreneurs setting up greenfield enterprises.
   - Loan amount: ₹10 Lakhs to ₹1 Crore | 85% project cost coverage.
   - Interest: ~8.0% p.a. | Grace: 18 months | Max tenure: 7 years

4. CGTMSE Collateral-Free Credit Scheme ("cgtmse"):
   - 100% collateral-free credit guarantee for tech startups, IT, healthcare, and MSMEs up to ₹2 Crore.
   - Interest: ~8.75% p.a. | Grace: 6 months | Max tenure: 8 years

5. PM Vishwakarma Scheme ("pm-vishwakarma"):
   - For traditional artisans and craftspeople (carpenters, potters, weavers, blacksmiths, tailors).
   - Loans up to ₹3 Lakhs at subsidized 5.0% interest + ₹15,000 modern toolkit grant.
   - Interest: 5.0% p.a. | Grace: 3 months | Max tenure: 5 years

6. NSFDC Micro Finance Scheme ("micro-finance"):
   - Cap: ₹1,40,000 | Concessional 6.5% interest (5.0% for Mahila Samriddhi).

7. NSFDC / MSME Term Loan Scheme ("term-loan"):
   - Structured commercial project finance up to ₹50,00,000 at 8.0%–12.5%.

8. Educational Loan Scheme ("education-loan"):
   - Cap: ₹25,00,000 (India) / ₹40,00,000 (Abroad) | Full interest subsidy during moratorium for lower/middle income.
   - Interest: 7.0% p.a. | Grace: Course Duration + 12 Months | Max tenure: 15 years

Evaluate the applicant's sector, project cost, social category, and needs. Select the optimal scheme matching their profile.

You must respond ONLY with valid JSON in this exact structure:
{
  "schemeId": "pmegp" | "mudra-shishu" | "mudra-kishore" | "mudra-tarun" | "standup-india" | "cgtmse" | "pm-vishwakarma" | "micro-finance" | "term-loan" | "education-loan",
  "schemeName": "<Full Official Scheme Name>",
  "tagline": "<Brief scheme summary tagline>",
  "eligibleAmount": <number>,
  "interestRate": <number>,
  "moratoriumMonths": <number>,
  "maxTenureMonths": <number>,
  "confidence": "high" | "medium" | "low",
  "checks": [
    { "label": "<Check Label>", "passed": <boolean>, "detail": "<Specific reason and comparison>" }
  ],
  "alternatives": [
    { "schemeId": "pmegp" | "mudra-shishu" | "mudra-kishore" | "mudra-tarun" | "standup-india" | "cgtmse" | "pm-vishwakarma" | "micro-finance" | "term-loan" | "education-loan", "reason": "<Actionable alternative scheme suggestion>" }
  ],
  "aiExplanation": "<3-4 sentence plain-language personalized AI assessment>",
  "aiTips": ["<Next step or strategy 1>", "<Actionable tip 2>", "<Document advice 3>"]
}`;

    const userPrompt = `Applicant Profile:
- Purpose: ${profile.purpose}
- Business / Activity: ${profile.businessType || profile.activityType}
- Social Category: ${profile.category || "General"}
- Ownership Structure: ${profile.ownershipType || "Individual"}
- Location: ${profile.district}, ${profile.state}
- Age: ${profile.age} years
- Declared Project/Course Cost: ${inr(profile.projectCost)}
- Annual Family Income: ${inr(profile.annualIncome)}/year

Analyze this applicant thoroughly and return the optimal scheme recommendation in JSON.`;


    let aiResponse: string | null = null;
    try {
      aiResponse = await groqChat(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        { temperature: 0.2, maxTokens: 900, jsonMode: true }
      );
    } catch {
      aiResponse = null;
    } finally {
      if (clientKey && !prevEnvKey) {
        delete process.env.GROQ_API_KEY;
      }
    }

    if (aiResponse) {
      try {
        const parsed = JSON.parse(aiResponse) as Recommendation & {
          aiExplanation?: string;
          aiTips?: string[];
        };
        if (
          parsed.schemeId &&
          typeof parsed.eligibleAmount === "number" &&
          Array.isArray(parsed.checks)
        ) {
          const aiRec: Recommendation = {
            schemeId: parsed.schemeId,
            schemeName: parsed.schemeName || baseline.schemeName,
            tagline: parsed.tagline || baseline.tagline,
            eligibleAmount: parsed.eligibleAmount || baseline.eligibleAmount,
            interestRate: parsed.interestRate || baseline.interestRate,
            moratoriumMonths: parsed.moratoriumMonths ?? baseline.moratoriumMonths,
            maxTenureMonths: parsed.maxTenureMonths || baseline.maxTenureMonths,
            confidence: parsed.confidence || baseline.confidence,
            checks: parsed.checks.length > 0 ? parsed.checks : baseline.checks,
            alternatives: Array.isArray(parsed.alternatives) ? parsed.alternatives : baseline.alternatives,
            aiExplanation: parsed.aiExplanation,
            aiTips: parsed.aiTips,
            source: "groq",
          };
          return Response.json({ recommendation: aiRec });
        }
      } catch {
        // Fall through to rich baseline
      }
    }

    // High-accuracy expert fallback
    const s = SCHEMES[baseline.schemeId] || SCHEMES["term-loan"];
    const catLower = (profile.category || "").toLowerCase();
    const docTip = catLower.includes("sc")
      ? "Keep your SC caste certificate, domicile, and income certificate ready."
      : catLower.includes("st")
      ? "Keep your ST certificate, tribal proof, and domicile ready."
      : catLower.includes("obc")
      ? "Keep your OBC Non-Creamy Layer (NCL) certificate and income proof ready."
      : "Keep your Aadhaar, PAN card, and business address proof ready.";

    const fallbackRec: Recommendation = {
      ...baseline,
      aiExplanation: `Based on your profile, the ${baseline.schemeName} is your verified match. Your ${profile.activityType} project with an estimated cost of ${inr(profile.projectCost)} and family income of ${inr(profile.annualIncome)} fully meets the government guidelines. Under this program, ${s.fundingSharePct}% (${inr(baseline.eligibleAmount)}) is financed at a concessional ${baseline.interestRate}% reducing balance interest rate with a ${baseline.moratoriumMonths}-month grace period.`,
      aiTips: [
        docTip,
        "Prepare 2-3 equipment/supplier quotations or your Detailed Project Report (DPR).",
        "Use the Partner Locator to find a nearby authorized partner bank branch with low NPA.",
      ],
      source: "fallback",
    };

    return Response.json({ recommendation: fallbackRec });
  } catch (err) {
    console.error("Recommend route error:", err);
    return Response.json({ error: "Could not process profile" }, { status: 500 });
  }
}

