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
    const systemPrompt = `You are SchemeSaathi AI, an authoritative AI financial analyst specialized in Ministry of Social Justice and Empowerment schemes (NSFDC, NSKFDC, Stand-Up India, MUDRA).

Official Verified Scheme Database:
1. NSFDC Micro Finance Scheme ("micro-finance"):
   - Cap: ₹1,40,000 | Min: ₹10,000 | Financed: 90% (₹1.26L max) | Margin: 10%
   - Income limit: ₹3,00,000/yr | Age: 18–55 | Interest: 6.5% p.a. (5.0% for women under Mahila Samriddhi) | Grace: 3 months | Max tenure: 5 years

2. NSFDC Term Loan Scheme ("term-loan"):
   - Cap: ₹50,00,000 | Min: ₹1,40,000 | Financed: 90% | Margin: 10%
   - Income limit: ₹5,00,000/yr | Age: 18–55
   - Interest Slabs: ≤₹5L @ 8.0%, ₹5L–₹15L @ 9.5%, ₹15L–₹30L @ 11.0%, >₹30L @ 12.5%
   - Grace: 6 months | Max tenure: 10 years

3. NSFDC Educational Loan Scheme ("education-loan"):
   - Cap: ₹25,00,000 (India) / ₹40,00,000 (Abroad) | Min: ₹50,000 | Financed: 90%
   - Income limit: ₹8,00,000/yr | Age: 17–35 | Interest: 7.0% p.a. (6.5% for women)
   - Grace: Course Duration + 6 Months | Max tenure: 15 years

4. Parallel Schemes to consider in alternatives:
   - Stand-Up India (for greenfield ventures ₹10L–₹1Cr)
   - PM MUDRA Yojana (Shishu/Kishore/Tarun up to ₹10L)
   - Venture Capital Fund for SC (VCF-SC up to ₹15Cr)

Evaluate the applicant's profile, select the best scheme, calculate the exact eligible loan amount (up to 90% of cost within cap), verify all eligibility rules, and provide intelligent strategic advice.

You must respond ONLY with valid JSON in this exact structure:
{
  "schemeId": "micro-finance" | "term-loan" | "education-loan",
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
    { "schemeId": "micro-finance" | "term-loan" | "education-loan", "reason": "<Actionable strategic suggestion mentioning Stand-Up India or MUDRA if relevant>" }
  ],
  "aiExplanation": "<3-4 sentence plain-language personalized AI assessment>",
  "aiTips": ["<Next step or strategy 1>", "<Actionable tip 2>", "<Document advice 3>"]
}`;

    const userPrompt = `Applicant Profile:
- Purpose: ${profile.purpose} (${profile.activityType})
- Location: ${profile.district}, ${profile.state}
- Age: ${profile.age} years
- Education: ${profile.educationLevel}
- Course Location: ${profile.courseLocation ?? "india"}
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
    const s = SCHEMES[baseline.schemeId];
    const fallbackRec: Recommendation = {
      ...baseline,
      aiExplanation: `Based on your profile, the ${baseline.schemeName} is your verified match. Your ${profile.activityType} project with an estimated cost of ${inr(profile.projectCost)} and family income of ${inr(profile.annualIncome)} fully meets the government guidelines. Under this program, ${s.fundingSharePct}% (${inr(baseline.eligibleAmount)}) is financed at a concessional ${baseline.interestRate}% reducing balance interest rate with a ${baseline.moratoriumMonths}-month grace period.`,
      aiTips: [
        "Keep your SC caste certificate, domicile, and income certificate ready.",
        "Prepare 2-3 equipment/supplier quotations or your Detailed Project Report (DPR).",
        "Use the Partner Locator to find a nearby authorized PSU Bank or SCA branch with low NPA.",
      ],
      source: "fallback",
    };

    return Response.json({ recommendation: fallbackRec });
  } catch {
    return Response.json({ error: "Could not process profile" }, { status: 500 });
  }
}
