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
 * Matches user query against the verified mockSchemes database to provide accurate grounding,
 * or provides comprehensive entrepreneurial & financial guidance.
 */
function generateFallbackReply(query: string): string {
  const q = query.toLowerCase().trim();
  const schemes: SchemeItem[] = Array.isArray(schemeData) ? schemeData : [];

  // Greetings
  if (q.includes("hello") || q.includes("hi") || q.includes("hey") || q === "") {
    return (
      "Hello! I am Nirvaan AI, your financial and business advisor. " +
      "You can ask me about eligible government loan schemes, 0% interest grants, " +
      "how to register your business (Udyam, GST, Pvt Ltd), CIBIL score requirements, or step-by-step startup guidance."
    );
  }

  // General Entrepreneurship & Business Topics Fallback
  if (q.includes("register") || q.includes("company") || q.includes("incorporate") || q.includes("pvt ltd") || q.includes("llp") || q.includes("sole proprietorship")) {
    return (
      "**How to Register a Business in India:**\n\n" +
      "1. **Choose a Structure:** Sole Proprietorship (simplest), LLP (flexible partnership), or Private Limited (best for venture funding).\n" +
      "2. **Obtain DSC & DIN:** Digital Signature Certificate and Director Identification Number from the Ministry of Corporate Affairs (MCA).\n" +
      "3. **Name Approval & SPICe+ Form:** File via MCA portal (mca.gov.in) which integrates PAN, TAN, EPFO, ESIC, and bank account opening in one step.\n" +
      "4. **MSME / Udyam Registration:** Free online registration at **udyamregistration.gov.in** to unlock concessional loans, priority lending, and collateral waivers."
    );
  }

  if (q.includes("gst") || q.includes("tax") || q.includes("gstin")) {
    return (
      "**GST (Goods and Services Tax) Registration Guide:**\n\n" +
      "• **Threshold Limit:** Mandatory if aggregate turnover exceeds ₹40 Lakhs for goods (₹20 Lakhs for special states) or ₹20 Lakhs for services (₹10 Lakhs for special states).\n" +
      "• **Voluntary Registration:** Recommended for B2B startups to claim Input Tax Credit (ITC) and sell on interstate e-commerce platforms.\n" +
      "• **Application Portal:** 100% free and online at **gst.gov.in** using your PAN, Aadhaar, business address proof, and bank statement."
    );
  }

  if (q.includes("cibil") || q.includes("credit score") || q.includes("score")) {
    return (
      "**CIBIL & Credit Score for Loans:**\n\n" +
      "• **Ideal Score:** A score of **750+** is generally preferred by Indian banks for instant loan approval and the lowest interest rates.\n" +
      "• **For Scores Below 700:** You can still qualify under special government schemes (like PM SVANidhi or CGTMSE collateral-free lending) or micro-finance programs.\n" +
      "• **Tips to Improve:** Pay existing credit card bills on time, keep credit utilization below 30%, and avoid multiple hard loan inquiries simultaneously."
    );
  }

  if (q.includes("business plan") || q.includes("project report") || q.includes("pitch")) {
    return (
      "**Key Elements of a Bank Loan Project Report / Business Plan:**\n\n" +
      "1. **Executive Summary:** Business concept, promoter profile, and funding requested.\n" +
      "2. **Market & Industry Analysis:** Target customer segment, competitors, and demand projections.\n" +
      "3. **Technical & Operational Feasibility:** Machinery, raw materials, manufacturing process, and location.\n" +
      "4. **Financial Projections (3–5 Years):** Projected Balance Sheet, Profit & Loss statement, Break-even analysis, and Debt Service Coverage Ratio (DSCR > 1.5 is favored by banks)."
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

  if (matched.length > 0) {
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

  // Broad helpful answer when neither keyword nor scheme matches directly
  return (
    "I am here to help you with loan schemes, grants, subsidies, and business setup! " +
    "You can ask me specific questions like:\n" +
    "• *'Which schemes offer 0% interest grants?'*\n" +
    "• *'What are the eligibility criteria for women entrepreneurs?'*\n" +
    "• *'How do I register an MSME on Udyam?'*\n" +
    "• *'How can I prepare a project report for a bank loan?'*"
  );
}

export async function POST(request: Request) {
  let message = "";
  try {
    const body = await request.json().catch(() => ({}));

    // Extract user question from message or messages array
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
          reply: "Please type a question about government loan schemes, grants, or starting a business.",
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

    // Prepare system prompt with the full scheme dataset AND full conversational AI capability
    const systemPrompt = `You are Nirvaan AI, an intelligent, authoritative, and helpful financial & entrepreneurship advisor built for NIRVAAN (India's Loan & Scheme Assistance Portal).

VERIFIED GOVERNMENT SCHEME DATABASE (Official Featured Schemes):
${JSON.stringify(schemeData, null, 2)}

OPERATING GUIDELINES:
1. Grounded Scheme Matching: When the user asks about specific government loan schemes, grants, 0% interest subsidies, eligibility criteria, required documents, or processing times that match schemes in the database above, prioritize these verified schemes and provide exact figures (rates, caps, docs).
2. Broad AI Knowledge for Entrepreneurship & Business: When the user asks about general business topics (e.g. how to start a business, company formation [Pvt Ltd, LLP, Sole Proprietorship], MSME Udyam registration, GST filing, business plans, pitch decks, budgeting, marketing, accounting, CIBIL score improvement, or banking terms), DO NOT refuse or say it's not in the database! Answer thoroughly, practically, and helpfully using your full AI knowledge.
3. Other Government Schemes & Subsidies: If the user asks about an Indian government loan scheme or grant not in the 16-scheme featured dataset (such as PM Mudra Yojana, PMEGP, Stand-Up India, PM SVANidhi, Startup India Seed Fund, Credit Guarantee CGTMSE, NABARD loans, or state subsidies), provide accurate, detailed information about that scheme, eligibility, and official application portals (like janSamarth.in, udyamregistration.gov.in, kviconline.gov.in), and note that they can also apply for NIRVAAN's fast-track partner schemes.
4. Formatting: Keep responses professional, warm, structured with bullet points, and easy for an Indian entrepreneur or citizen to read. Never answer with "This scheme isn't in our current database" for general queries.`;

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
        temperature: 0.3,
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
      generateFallbackReply(message);

    return NextResponse.json({
      reply,
      answer: reply,
      message: reply,
      source: "groq",
    });
  } catch (error) {
    console.error("Chat API error:", error);

    // Friendly fallback instead of 500 error
    const fallbackReply = generateFallbackReply(message);

    return NextResponse.json({
      reply: fallbackReply,
      answer: fallbackReply,
      message: fallbackReply,
      source: "error-fallback",
    });
  }
}
