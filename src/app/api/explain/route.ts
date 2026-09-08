import { groqChat } from "@/lib/groq";
import { SCHEMES } from "@/lib/schemes";
import type { Profile, Recommendation } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const inr = (n: number) =>
  `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n)}`;

function fallbackExplanation(profile: Profile, rec: Recommendation): string {
  const s = SCHEMES[rec.schemeId];
  return `Based on your details, the ${rec.schemeName} is the right fit. Your project cost of ${inr(profile.projectCost)} and family income of ${inr(profile.annualIncome)} place you within this scheme's limits. Under it, up to ${s.fundingSharePct}% of your cost (${inr(rec.eligibleAmount)}) can be financed at ${rec.interestRate}% interest with a ${rec.moratoriumMonths}-month grace period before repayment begins. Take this recommendation to a nearby Channel Partner to begin your application.`;
}

export async function POST(request: Request) {
  let body: { profile?: Profile; recommendation?: Recommendation; apiKey?: string };
  let clientKey: string | undefined;
  try {
    body = await request.json();
    clientKey = body?.apiKey || request.headers.get("x-groq-key") || undefined;
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  const { profile, recommendation } = body;
  if (!profile || !recommendation) {
    return Response.json({ error: "Missing profile or recommendation" }, { status: 400 });
  }

  const prevEnvKey = process.env.GROQ_API_KEY;
  if (clientKey) {
    process.env.GROQ_API_KEY = clientKey;
  }

  const systemPrompt = `You are SchemeSaathi, a helpful assistant explaining Indian government loan schemes for Scheduled Caste (SC) entrepreneurs and students (NSFDC-style schemes). Explain in simple English suitable for a first-generation applicant. Be encouraging but factual — never invent figures beyond what is provided.

Scheme facts:
${Object.values(SCHEMES)
  .map(
    (s) =>
      `- ${s.name}: loans ${inr(s.minLoan)}–${inr(s.maxLoan)}, funds up to ${s.fundingSharePct}% of cost, income limit ${inr(s.incomeLimit)}/yr, interest ${s.rate}%, grace period ${s.moratoriumMonths} months, tenure up to ${s.maxTenureMonths / 12} years.`
  )
  .join("\n")}

Respond ONLY with valid JSON in this exact shape:
{"explanation": "<3-4 sentence plain-language explanation of why this scheme fits this person>", "tips": ["<next step 1>", "<next step 2>", "<document/step 3>"]}`;

  const userPrompt = `Applicant profile: purpose=${profile.purpose}, activity=${profile.activityType}, state=${profile.state}, district=${profile.district}, age=${profile.age}, education=${profile.educationLevel}, annual family income=${inr(profile.annualIncome)}, project/course cost=${inr(profile.projectCost)}.
  Recommended scheme: ${recommendation.schemeName}, eligible amount ${inr(recommendation.eligibleAmount)}, rate ${recommendation.interestRate}%, moratorium ${recommendation.moratoriumMonths} months.
Eligibility checks: ${(recommendation.checks ?? [])
    .map((c) => `${c.label}: ${c.passed ? "passed" : "not passed"}`)
    .join("; ") || "not provided"}.`;

  const content = await groqChat(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    { temperature: 0.3, maxTokens: 500 }
  );

  if (content) {
    const match = content.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]) as { explanation?: string; tips?: string[] };
        if (parsed.explanation && Array.isArray(parsed.tips)) {
          return Response.json({
            explanation: parsed.explanation,
            tips: parsed.tips.slice(0, 5),
            source: "groq",
          });
        }
      } catch {
        // fall through
      }
    }
  }

  return Response.json({
    explanation: fallbackExplanation(profile, recommendation),
    tips: [
      "Keep your caste certificate, income certificate and Aadhaar ready.",
      "Collect a detailed project report or admission letter.",
      "Use the Partner Locator to find a healthy Channel Partner near you.",
    ],
    source: "fallback",
  });
}
