import { NextResponse } from "next/server";

// Import mock scheme dataset
import schemeData from "../../../../data/mockSchemes.js";

export const dynamic = "force-dynamic";

interface SchemeItem {
  id: string;
  category: string;
  name: string;
  provider: string;
  interestRate: string;
  maxAmount: string;
  eligibility: string;
  documents: string[];
  processingTime: string;
}

/**
 * Fallback generator when GROQ_API_KEY is not configured or Groq API is unavailable.
 * Matches user query against the verified mockSchemes database to provide accurate grounding.
 */
function generateFallbackReply(query: string): string {
  const q = query.toLowerCase().trim();
  const schemes: SchemeItem[] = Array.isArray(schemeData) ? schemeData : [];

  // If query is very generic or greeting
  if (q.includes("hello") || q.includes("hi") || q.includes("help") || q === "") {
    return (
      "Hello! I am your Scheme & Loan Assistant. You can ask me about eligible loan schemes, " +
      "interest rates, grants (0% interest), subsidy options, documents required, or assistance for SC/ST/OBC, " +
      "women entrepreneurs, startups, farmers, and students."
    );
  }

  // Find matching schemes based on keywords
  const matched = schemes.filter((s) => {
    const text = `${s.name} ${s.category} ${s.provider} ${s.eligibility} ${s.documents.join(" ")}`.toLowerCase();
    
    if (q.includes("women") || q.includes("female") || q.includes("mahila")) {
      return text.includes("women");
    }
    if (q.includes("grant") || q.includes("free") || q.includes("0%")) {
      return s.category.toLowerCase().includes("grant") || s.interestRate.includes("0%");
    }
    if (q.includes("student") || q.includes("education") || q.includes("abroad") || q.includes("study") || q.includes("course") || q.includes("vocational")) {
      return s.category.toLowerCase().includes("education") || text.includes("education") || text.includes("skill");
    }
    if (q.includes("startup") || q.includes("tech") || q.includes("seed")) {
      return text.includes("startup") || text.includes("seed");
    }
    if (q.includes("sc ") || q.includes("scheduled caste") || q.includes("dalit")) {
      return text.includes("sc category") || text.includes("sc entrepreneur");
    }
    if (q.includes("st ") || q.includes("scheduled tribe") || q.includes("tribal")) {
      return text.includes("st category") || text.includes("tribal");
    }
    if (q.includes("obc") || q.includes("backward")) {
      return text.includes("obc");
    }
    if (q.includes("farm") || q.includes("agriculture") || q.includes("kisan") || q.includes("tractor")) {
      return s.category.toLowerCase().includes("agriculture") || text.includes("farmer");
    }
    if (q.includes("house") || q.includes("housing") || q.includes("home")) {
      return s.category.toLowerCase().includes("housing");
    }
    if (q.includes("disabled") || q.includes("handicapped") || q.includes("divyang")) {
      return text.includes("disabled");
    }
    if (q.includes("artisan") || q.includes("craft") || q.includes("rural")) {
      return text.includes("artisan");
    }
    if (q.includes("retail") || q.includes("shop") || q.includes("store")) {
      return text.includes("retail");
    }
    if (q.includes("food") || q.includes("fssai") || q.includes("processing")) {
      return text.includes("food");
    }
    if (q.includes("document") || q.includes("paper") || q.includes("proof")) {
      return text.includes("documents") || text.includes("proof");
    }

    // Direct token matching ignoring generic stopwords
    const STOPWORDS = new Set([
      "loan", "loans", "scheme", "schemes", "grant", "grants", "money", "fund", "funds",
      "what", "which", "where", "when", "how", "tell", "show", "give", "need", "want",
      "have", "about", "eligible", "eligibility", "apply", "available", "interest", "rate",
      "much", "many", "please", "help", "good", "best", "some", "with", "this", "that"
    ]);
    const tokens = q.split(/[^a-z0-9]+/).filter((t) => t.length >= 4 && !STOPWORDS.has(t));
    return tokens.length > 0 && tokens.some((t) => text.includes(t));
  });

  if (matched.length === 0) {
    return "This scheme isn't in our current database.";
  }

  const list = matched.slice(0, 3).map((s) => (
    `• **${s.name}** (${s.category})\n` +
    `  - **Provider:** ${s.provider}\n` +
    `  - **Max Amount:** ${s.maxAmount} | **Interest Rate:** ${s.interestRate}\n` +
    `  - **Eligibility:** ${s.eligibility}\n` +
    `  - **Processing Time:** ${s.processingTime}\n` +
    `  - **Required Documents:** ${s.documents.join(", ")}`
  )).join("\n\n");

  return `Here are the matching schemes from our verified database:\n\n${list}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));

    // Extract user question from message or messages array
    let message = "";
    if (typeof body.message === "string" && body.message.trim()) {
      message = body.message.trim();
    } else if (Array.isArray(body.messages) && body.messages.length > 0) {
      const last = body.messages[body.messages.length - 1];
      message = typeof last?.content === "string" ? last.content.trim() : "";
    }

    if (!message) {
      return NextResponse.json(
        {
          error: "Message is required.",
          reply: "Please type a question about government loan schemes or grants.",
        },
        { status: 400 }
      );
    }

    const groqKey =
      process.env.GROQ_API_KEY ||
      body.apiKey ||
      request.headers.get("x-groq-key") ||
      undefined;

    // Fallback response if GROQ_API_KEY is not configured
    if (!groqKey) {
      const fallbackReply = generateFallbackReply(message);
      return NextResponse.json({
        reply: fallbackReply,
        answer: fallbackReply,
        message: fallbackReply,
        source: "fallback",
      });
    }

    // Prepare system prompt with the full mock scheme dataset
    const systemPrompt = `You are a helpful and authoritative loan and scheme assistant.
Your job is to answer user questions about financial assistance, loans, grants, and subsidies ONLY using the verified scheme dataset provided below.

VERIFIED SCHEME DATABASE:
${JSON.stringify(schemeData, null, 2)}

STRICT OPERATING INSTRUCTIONS:
1. Grounding: Answer the user's question strictly and exclusively using the scheme data provided above.
2. If the user asks about a scheme, category, or requirement that is NOT covered in the provided database above, you MUST explicitly state: "This scheme isn't in our current database."
3. Accuracy: Accurately state interest rates, max amounts, eligibility criteria, required documents, and processing times from the dataset.
4. Formatting: Keep your answers clear, concise, and structured with bullet points where appropriate.`;

    // Call Groq API with llama-3.3-70b-versatile
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: 0.2,
        max_tokens: 1024,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      console.warn(`Groq API returned HTTP ${response.status}. Using grounded fallback.`);
      const fallbackReply = generateFallbackReply(message);
      return NextResponse.json({
        reply: fallbackReply,
        answer: fallbackReply,
        message: fallbackReply,
        source: "fallback",
      });
    }

    const data = await response.json();
    const reply =
      data?.choices?.[0]?.message?.content ||
      "This scheme isn't in our current database.";

    return NextResponse.json({
      reply,
      answer: reply,
      message: reply,
      source: "groq",
    });
  } catch (error) {
    console.error("Chat API error:", error);

    // Friendly fallback instead of 500 error
    const fallbackReply =
      "I’m having trouble connecting to the AI service right now. Please try again in a moment.";

    return NextResponse.json({
      reply: fallbackReply,
      answer: fallbackReply,
      message: fallbackReply,
      source: "error-fallback",
    });
  }
}
