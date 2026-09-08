import { NextResponse } from "next/server";
import OpenAI from "openai";
import type { Profile } from "@/lib/types";

type RecommendationContext = {
  schemeName: string;
  eligibleAmount: number;
  interestRate: number;
  moratoriumMonths: number;
  checks?: Array<{
    label: string;
    passed: boolean;
  }>;
};

function inr(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const messages = Array.isArray(body.messages) ? body.messages : [];
    const profile = body.profile as Profile | undefined;
    const recommendation = body.recommendation as
      | RecommendationContext
      | undefined;

    let contextBlock = "";

    if (profile) {
      contextBlock = `\nApplicant Profile in Context:
- State & District: ${profile.district}, ${profile.state}
- Age: ${profile.age} years
- Goal/Purpose: ${profile.purpose} (Activity: ${profile.activityType})
- Estimated Project Cost: ${inr(profile.projectCost)}
- Annual Family Income: ${inr(profile.annualIncome)}/year
- Education Level: ${profile.educationLevel}
${profile.courseLocation ? `- Course Location: ${profile.courseLocation}` : ""}
`;
    }

    if (recommendation) {
      contextBlock += `\nCurrent Scheme Recommendation:
- Scheme: ${recommendation.schemeName}
- Eligible Amount: ${inr(recommendation.eligibleAmount)}
- Interest Rate: ${recommendation.interestRate}%
- Moratorium: ${recommendation.moratoriumMonths} months
`;
    }

    const dynamicSystemPrompt = `You are NIRVAAN AI, an expert, encouraging, and authoritative AI financial advisor for Indian government concessional loan schemes.

Your role is to help applicants understand their financial assistance journey clearly and practically.

You are part of NIRVAAN, India's Official Loan Assistance Platform.

Important instructions:
- Give clear, concise, useful answers.
- Use simple language that an Indian applicant can easily understand.
- Never invent a government scheme, eligibility rule, interest rate, loan amount, or document requirement.
- When discussing a scheme, rely on the scheme information available in the current context.
- If information is unavailable, clearly say that it needs to be verified.
- Do not make guarantees about loan approval.
- Explain financial terms in plain language when necessary.
- Do not ask for sensitive information such as passwords, OTPs, bank PINs, or full account credentials.
- Treat the applicant's profile as contextual information and do not unnecessarily repeat it.
- Focus on helping the applicant understand their next step.

${contextBlock}`;

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error:
            "NIRVAAN AI is not configured yet. Please add the OpenAI API key.",
        },
        { status: 503 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: dynamicSystemPrompt,
        },
        ...messages,
      ],
      temperature: 0.3,
    });

    const reply =
      completion.choices[0]?.message?.content ??
      "I’m sorry, I couldn’t generate a response right now. Please try again.";

    return NextResponse.json({
      reply,
    });
  } catch (error) {
    console.error("NIRVAAN AI chat error:", error);

    return NextResponse.json(
      {
        error: "Unable to process your request right now.",
      },
      { status: 500 }
    );
  }
}
