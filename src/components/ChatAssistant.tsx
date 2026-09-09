"use client";

import { useEffect, useRef, useState } from "react";
import { useJourney } from "@/context/JourneyContext";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

const QUICK_ACTIONS = [
  "What schemes are available for women entrepreneurs?",
  "Which grants offer 0% interest?",
  "Tell me about the Tech Startup Seed Fund.",
  "What loan options exist for education abroad?",
];

function NirvaanMark() {
  return (
    <span className="relative inline-flex items-center">
      <span className="nirvaan-wordmark text-[15px] font-extrabold tracking-[0.08em] text-white">
        NIRVAAN
      </span>
      <span
        aria-hidden="true"
        className="absolute -right-1.5 -top-1 h-1.5 w-1.5 bg-[#F47B20]"
      />
    </span>
  );
}

export default function ChatAssistant() {
  const { profile, recommendation } = useJourney();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content:
        "Hello! I am your NIRVAAN Scheme & Loan Chatbot powered by Groq Llama 3.3. Ask me anything about government loan schemes, grants, 0% interest subsidies, eligibility criteria, or required documents.",
    },
  ]);

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, open]);

  const sendMessage = async (messageText?: string) => {
    const text = (messageText ?? input).trim();
    if (!text || sending) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: text,
    };

    setMessages((previous) => [...previous, userMessage]);
    setInput("");
    setSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          profile: profile ?? null,
          recommendation: recommendation ?? null,
        }),
      });

      if (!response.ok) {
        throw new Error("Chat request failed");
      }

      const data = await response.json();
      const answer =
        typeof data.reply === "string"
          ? data.reply
          : typeof data.answer === "string"
          ? data.answer
          : typeof data.message === "string"
          ? data.message
          : "I’m unable to answer that right now. Please try again.";

      setMessages((previous) => [
        ...previous,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: answer,
        },
      ]);
    } catch {
      setMessages((previous) => [
        ...previous,
        {
          id: Date.now() + 1,
          role: "assistant",
          content:
            "I couldn't reach the AI service right now. Please check your connection and try again.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* =====================================================
          FLOATING CHAT TRIGGER BUTTON
          Fixed position, isolated, no layout shift
          ===================================================== */}
      <div className="fixed bottom-5 right-5 z-[999] sm:bottom-7 sm:right-7 print:hidden">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-label={open ? "Close Scheme Chatbot" : "Open Scheme Chatbot"}
          aria-expanded={open}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#1769D2] text-white shadow-[0_8px_25px_rgba(23,105,210,0.35)] transition-all duration-200 hover:bg-[#0F5DBD] hover:scale-105 active:scale-95 focus:outline-none"
        >
          {open ? (
            <span aria-hidden="true" className="text-2xl font-light leading-none">
              ✕
            </span>
          ) : (
            <div className="relative flex items-center justify-center">
              <svg
                className="h-6 w-6 transition-transform group-hover:scale-110"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              {/* Pulsing indicator */}
              <span className="absolute -right-1 -top-1 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
              </span>
            </div>
          )}
        </button>
      </div>

      {/* =====================================================
          FLOATING CHAT PANEL
          Fixed position, isolated from main page content
          ===================================================== */}
      {open ? (
        <section
          aria-label="NIRVAAN Scheme Chatbot"
          className="fixed bottom-24 right-5 z-[998] flex w-[calc(100vw-40px)] max-w-[400px] flex-col overflow-hidden rounded-xl border border-[#CBD5E1] bg-white shadow-[0_20px_60px_rgba(16,42,67,0.22)] dark:border-[#334458] dark:bg-[#0F1722] sm:bottom-24 sm:right-7 print:hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#1E3A5F] bg-[#0E2A4A] px-5 py-3.5 text-white">
            <div className="flex items-center gap-2.5">
              <NirvaanMark />
              <span className="h-4 w-px bg-[#415F80]" />
              <div>
                <p className="text-xs font-black tracking-wide text-white">
                  Scheme Chatbot
                </p>
                <p className="text-[10px] text-[#A5C3E2]">
                  Powered by Groq • Llama 3.3
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="flex h-8 w-8 items-center justify-center rounded text-base text-[#A5C3E2] transition hover:bg-[#1E3A5F] hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Messages list */}
          <div className="max-h-[380px] min-h-[260px] overflow-y-auto bg-[#F8FAFC] p-4 dark:bg-[#0B1118]">
            <div className="space-y-3.5">
              {messages.map((message) => {
                const isUser = message.role === "user";
                return (
                  <div
                    key={message.id}
                    className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[90%] rounded-lg px-3.5 py-2.5 text-xs font-medium leading-5 shadow-sm whitespace-pre-line ${
                        isUser
                          ? "bg-[#1769D2] text-white"
                          : "border border-[#E2E8F0] bg-white text-[#1E293B] dark:border-[#2A3A4D] dark:bg-[#162232] dark:text-[#E2E8F0]"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                );
              })}

              {sending ? (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-semibold text-[#64748B] dark:border-[#2A3A4D] dark:bg-[#162232] dark:text-[#94A3B8]">
                    <span className="flex h-2 w-2 animate-ping rounded-full bg-[#1769D2]" />
                    Analyzing scheme database...
                  </div>
                </div>
              ) : null}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Quick Questions */}
          <div className="border-t border-[#E2E8F0] bg-white px-4 py-2.5 dark:border-[#263445] dark:bg-[#0F1722]">
            <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
              Frequently Asked
            </p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => sendMessage(action)}
                  disabled={sending}
                  className="rounded border border-[#CBD5E1] bg-[#F8FAFC] px-2.5 py-1 text-left text-[10px] font-bold text-[#334155] transition hover:border-[#1769D2] hover:bg-[#EBF3FC] hover:text-[#1769D2] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#2E3E50] dark:bg-[#141E2B] dark:text-[#CBD5E1] dark:hover:border-[#38BDF8] dark:hover:text-[#38BDF8]"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>

          {/* Input form */}
          <div className="border-t border-[#E2E8F0] bg-white p-3 dark:border-[#263445] dark:bg-[#0F1722]">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void sendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about schemes, grants, or loans..."
                disabled={sending}
                aria-label="Message Scheme Chatbot"
                className="min-h-10 min-w-0 flex-1 rounded border border-[#CBD5E1] bg-[#F8FAFC] px-3 text-xs font-medium text-[#1E293B] outline-none transition focus:border-[#1769D2] focus:ring-1 focus:ring-[#1769D2] disabled:bg-[#F1F5F9] dark:border-[#334458] dark:bg-[#141E2B] dark:text-[#F1F5F9] dark:placeholder:text-[#64748B]"
              />

              <button
                type="submit"
                disabled={!input.trim() || sending}
                className="flex min-h-10 items-center justify-center rounded bg-[#1769D2] px-3.5 text-xs font-bold text-white transition hover:bg-[#0F5DBD] disabled:cursor-not-allowed disabled:bg-[#CBD5E1] dark:disabled:bg-[#283849]"
              >
                Send
              </button>
            </form>

            <p className="mt-2 text-center text-[9px] text-[#94A3B8] dark:text-[#64748B]">
              Grounded in official scheme dataset • Demo for Smart India Hackathon
            </p>
          </div>
        </section>
      ) : null}
    </>
  );
}
