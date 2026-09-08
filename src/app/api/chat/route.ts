import { generateExpertAiResponse } from "@/lib/expertAiEngine";
import { groqChat } from "@/lib/groq";
import type { Profile, Recommendation } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const inr = (n: number) =>
  `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n)}`;

export async function POST(request: Request) {
  let messages: ChatMessage[];
  let clientKey: string | undefined;
  let profile: Profile | null = null;
  let recommendation: Recommendation | null = null;

  try {
    const body = await request.json();
    messages = Array.isArray(body?.messages) ? body.messages : [];
    clientKey = body?.apiKey || request.headers.get("x-groq-key") || undefined;
    profile = body?.profile || null;
    recommendation = body?.recommendation || null;
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  if (messages.length === 0) {
    return Response.json({ error: "No messages" }, { status: 400 });
  }

  const trimmed = messages.slice(-10);

  // Build context-aware personalized system prompt
  let contextBlock = "";
  if (profile) {
    contextBlock = `\nApplicant Profile in Context:
- State & District: ${profile.district}, ${profile.state}
- Age: ${profile.age} years
- Goal/Purpose: ${profile.purpose} (Activity: ${profile.activityType})
- Estimated Project Cost: ${inr(profile.projectCost)}
- Annual Family Income: ${inr(profile.annualIncome)}/year
- Education Level: ${profile.educationLevel}
${recommendation ? `- Current Recommended Scheme: ${recommendation.schemeName} (Eligible: ${inr(recommendation.eligibleAmount)}, Rate: ${recommendation.interestRate}%, Grace: ${recommendation.moratoriumMonths}mo)` : ""}`;
  }

  const dynamicSystemPrompt = `You are SchemeSaathi AI, an expert, encouraging, and authoritative AI financial advisor for Indian government concessional loan schemes (Ministry of Social Justice and Empowerment, NSFDC, Stand-Up India, PMMY, NSKFDC, VCF-SC).
${contextBlock}

Official Verified Scheme Parameters:
1. NSFDC Micro Finance Scheme ("micro-finance"):
   - Loan ceiling: ₹1.40 Lakh | Minimum: ₹10,000 | 90% financed (${"₹1.26 Lakh"} max) | Margin: 10%
   - Concessional Interest: 6.5% p.a. (5.0% for women under Mahila Samriddhi Yojana)
   - Grace period: 3 months | Repayment: 3 to 5 years (36 to 60 months)
   - Annual family income limit: ₹3.00 Lakh/year | Age: 18–55

2. NSFDC Term Loan Scheme ("term-loan"):
   - Loan ceiling: ₹50.00 Lakh | Minimum: ₹1.40 Lakh | 90% financed | Margin: 10%
   - Interest Slabs: ≤₹5L @ 8.0%, ₹5L–₹15L @ 9.5%, ₹15L–₹30L @ 11.0%, >₹30L @ 12.5%
   - Grace period: 6 months | Repayment: Up to 10 years (120 months)
   - Annual family income limit: ₹5.00 Lakh/year | Age: 18–55

3. NSFDC Educational Loan Scheme ("education-loan"):
   - Domestic Cap (India): ₹25.00 Lakh | International Cap (Abroad): ₹40.00 Lakh | 90% financed
   - Concessional Interest: 7.0% p.a. (6.5% for female students)
   - Moratorium: Entire Course Duration + 6 Months before first repayment
   - Repayment tenure: Up to 15 years (180 months)
   - Annual family income limit: ₹8.00 Lakh/year | Age: 17–35

4. Stand-Up India Scheme (Govt. of India):
   - Loans from ₹10 Lakhs up to ₹1.00 Crore for SC/ST and Women entrepreneurs for greenfield manufacturing, services, or trading units.

5. Pradhan Mantri MUDRA Yojana (PMMY):
   - Shishu: up to ₹50,000 | Kishore: ₹50,001 to ₹5,00,000 | Tarun: ₹5,00,001 to ₹10,00,000.

Guidelines:
- Give exact official scheme names, precise interest rates, margin percentages, and document lists.
- Directly answer the applicant's query with friendly, clear, and structured advice. Use markdown tables and bold highlights.
- Support English, Hindi, and Hinglish.`;

  // If a client API key was passed, set it temporarily for groqChat
  const prevEnvKey = process.env.GROQ_API_KEY;
  if (clientKey) {
    process.env.GROQ_API_KEY = clientKey;
  }

  let content: string | null = null;
  try {
    content = await groqChat(
      [{ role: "system", content: dynamicSystemPrompt }, ...trimmed],
      { temperature: 0.3, maxTokens: 750 }
    );
  } finally {
    if (clientKey && !prevEnvKey) {
      delete process.env.GROQ_API_KEY;
    }
  }

  if (content) {
    return Response.json({
      reply: content,
      source: "groq",
    });
  }

  // High-accuracy expert AI engine fallback
  const expertReply = generateExpertAiResponse(trimmed, profile, recommendation);
  return Response.json({
    reply: expertReply,
    source: "expert-ai",
  });
}
