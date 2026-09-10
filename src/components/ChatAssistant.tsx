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
  "How do I register a business in India?",
  "Tell me about the Tech Startup Seed Fund.",
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
        "Hello! I am Nirvaan AI, your financial and business advisor powered by Groq Llama 3.3. Ask me anything about government loan schemes, 0% interest grants, business registration, GST, CIBIL, or starting a venture.",
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
          NIRVAAN AI ROBOT TRIGGER (Combined Chatbot Trigger)
          Displays on every page; clicking toggles the chatbot
          ===================================================== */}
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? "Close Nirvaan AI Chatbot" : "Open Nirvaan AI Chatbot"}
        aria-expanded={open}
        className="nirvaan-ai group print:hidden focus:outline-none"
      >
        <div className="relative inline-block">
          <img
            src="/nirvaan-ai.png"
            alt="Nirvaan AI Assistant - Click to Chat"
            className="nirvaan-ai-image"
          />

          {/* Active online pulse ring */}
          <span className="absolute top-2 right-4 flex h-3.5 w-3.5 sm:top-3 sm:right-5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 shadow-sm" />
          </span>

          {/* Close indicator when chat window is active */}
          {open && (
            <span className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#E11D48] text-white shadow-lg text-xs font-black transition-transform group-hover:scale-110">
              ✕
            </span>
          )}
        </div>
      </button>

      {/* =====================================================
          FLOATING CHAT PANEL
          Positioned directly above the Nirvaan AI robot
          ===================================================== */}
      {open ? (
        <section
          aria-label="NIRVAAN Scheme & Enterprise Chatbot"
          className="fixed bottom-[135px] right-3 z-[998] flex w-[calc(100vw-24px)] max-w-[420px] flex-col overflow-hidden rounded-2xl border border-[#CBD5E1] bg-white shadow-[0_25px_70px_rgba(16,42,67,0.28)] dark:border-[#334458] dark:bg-[#0F1722] sm:bottom-[150px] sm:right-6 print:hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#1E3A5F] bg-[#0E2A4A] px-5 py-3.5 text-white">
            <div className="flex items-center gap-2.5">
              <NirvaanMark />
              <span className="h-4 w-px bg-[#415F80]" />
              <div>
                <p className="text-xs font-black tracking-wide text-white">
                  Nirvaan AI Advisor
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
              className="flex h-8 w-8 items-center justify-center rounded-lg text-base text-[#A5C3E2] transition hover:bg-[#1E3A5F] hover:text-white"
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
                      className={`max-w-[90%] rounded-xl px-3.5 py-2.5 text-xs font-medium leading-5 shadow-sm whitespace-pre-line ${
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
                    Nirvaan AI is thinking...
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
                  className="rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] px-2.5 py-1 text-left text-[10px] font-bold text-[#334155] transition hover:border-[#1769D2] hover:bg-[#EBF3FC] hover:text-[#1769D2] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#2E3E50] dark:bg-[#141E2B] dark:text-[#CBD5E1] dark:hover:border-[#38BDF8] dark:hover:text-[#38BDF8]"
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
                placeholder="Ask about schemes, loans, business registration, or advice..."
                disabled={sending}
                aria-label="Message Nirvaan AI"
                className="min-h-10 min-w-0 flex-1 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] px-3.5 text-xs font-medium text-[#1E293B] outline-none transition focus:border-[#1769D2] focus:ring-1 focus:ring-[#1769D2] disabled:bg-[#F1F5F9] dark:border-[#334458] dark:bg-[#141E2B] dark:text-[#F1F5F9] dark:placeholder:text-[#64748B]"
              />

              <button
                type="submit"
                disabled={!input.trim() || sending}
                className="flex min-h-10 items-center justify-center rounded-xl bg-[#1769D2] px-4 text-xs font-bold text-white transition hover:bg-[#0F5DBD] disabled:cursor-not-allowed disabled:bg-[#CBD5E1] dark:disabled:bg-[#283849]"
              >
                Send
              </button>
            </form>

            <p className="mt-2 text-center text-[9px] text-[#94A3B8] dark:text-[#64748B]">
              Powered by Llama 3.3 • Official NIRVAAN Intelligence
            </p>
          </div>
        </section>
      ) : null}
    </>
  );
}
