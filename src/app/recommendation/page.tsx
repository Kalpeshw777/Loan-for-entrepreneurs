"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  Loader2,
  Sparkles,
} from "lucide-react";

import { useJourney } from "@/context/JourneyContext";
import { formatINR } from "@/lib/format";

interface Explanation {
  explanation: string;
  tips: string[];
  source: "groq" | "fallback";
}

export default function RecommendationPage() {
  const router = useRouter();
  const {
    profile,
    recommendation,
    ready,
  } = useJourney();

  const [ai, setAi] = useState<Explanation | null>(() => {
    if (recommendation?.aiExplanation) {
      return {
        explanation: recommendation.aiExplanation,
        tips: recommendation.aiTips ?? [],
        source: recommendation.source ?? "groq",
      };
    }

    return null;
  });

  const [aiLoading, setAiLoading] = useState(false);
  const requested = useRef(false);

  useEffect(() => {
    if (ready && !recommendation) {
      router.replace("/wizard");
    }
  }, [ready, recommendation, router]);

  useEffect(() => {
    if (!profile || !recommendation || requested.current) {
      return;
    }

    if (recommendation.aiExplanation) {
      setAi({
        explanation: recommendation.aiExplanation,
        tips: recommendation.aiTips ?? [],
        source: recommendation.source ?? "groq",
      });

      return;
    }

    requested.current = true;
    setAiLoading(true);

    const storedKey =
      typeof window !== "undefined"
        ? localStorage.getItem("groq-api-key") || ""
        : "";

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (storedKey) {
      headers["x-groq-key"] = storedKey;
    }

    fetch("/api/explain", {
      method: "POST",
      headers,
      body: JSON.stringify({
        profile,
        recommendation,
        apiKey: storedKey,
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Unable to load explanation");
        }

        return response.json();
      })
      .then((data: Explanation) => {
        setAi(data);
      })
      .catch(() => {
        setAi({
          explanation:
            "The recommendation is available, but the AI explanation could not be loaded right now.",
          tips: [],
          source: "fallback",
        });
      })
      .finally(() => {
        setAiLoading(false);
      });
  }, [profile, recommendation]);

  if (!ready || !recommendation || !profile) {
    return (
      <main className="min-h-screen bg-white">
        <section className="border-b border-[#D9E0E7] bg-[#F7F9FB]">
          <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="border border-[#CBD5E1] bg-white p-8">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center border border-[#0077CC] bg-[#F0F7FC]">
                  <Loader2
                    className="h-5 w-5 animate-spin text-[#0077CC]"
                    strokeWidth={2}
                  />
                </div>

                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#0077CC]">
                    NIRVAAN
                  </p>

                  <p className="mt-1 text-sm font-extrabold text-[#002244]">
                    Preparing your scheme recommendation
                  </p>

                  <p className="mt-1 text-xs font-medium leading-5 text-[#667085]">
                    Please wait while your verified journey
                    information is loaded.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const confidenceStyles = {
    high: {
      wrapper:
        "border-[#16A34A] bg-[#F0FDF4] text-[#15803D]",
      label: "Strong match",
    },
    medium: {
      wrapper:
        "border-[#D97706] bg-[#FFFBEB] text-[#A16207]",
      label: "Moderate match",
    },
    low: {
      wrapper:
        "border-[#DC2626] bg-[#FEF2F2] text-[#B91C1C]",
      label: "Limited match",
    },
  }[recommendation.confidence];

  return (
    <main className="min-h-screen bg-white">
      {/* PAGE HEADER */}
      <section className="border-b border-[#D9E0E7] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-[3px] w-10 bg-[#0077CC]" />

                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#0077CC]">
                  NIRVAAN
                </p>
              </div>

              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[#002244] sm:text-4xl">
                Smart Scheme Recommender
              </h1>

              <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-[#667085]">
                Your verified journey information has been
                assessed to identify a suitable scheme and
                maximum loan amount.
              </p>
            </div>

            <Link
              href="/wizard"
              className="inline-flex min-h-[42px] items-center justify-center border border-[#B9C4D1] bg-white px-5 text-xs font-bold text-[#526071] transition-colors hover:border-[#0077CC] hover:text-[#0077CC]"
            >
              Back to Journey
            </Link>
          </div>
        </div>
      </section>

      {/* RECOMMENDATION HERO */}
      <section className="border-b border-[#D9E0E7] bg-[#F7F9FB]">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="border border-[#CBD5E1] bg-white">
            <div className="border-b border-[#CBD5E1] bg-[#002244] px-6 py-7 sm:px-8">
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center border border-[#6BA9D6] bg-[#07345C]">
                      <Sparkles
                        className="h-5 w-5 text-[#9CC8EA]"
                        strokeWidth={2}
                      />
                    </div>

                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#9CC8EA]">
                        AI-assisted result
                      </p>

                      <p className="mt-1 text-xs font-semibold text-[#D8E4F0]">
                        Recommended financing option
                      </p>
                    </div>
                  </div>

                  <h2 className="mt-6 text-2xl font-extrabold text-white sm:text-3xl">
                    {recommendation.schemeName}
                  </h2>
                </div>

                <div
                  className={`border px-4 py-3 ${confidenceStyles.wrapper}`}
                >
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.1em]">
                    Match assessment
                  </p>

                  <p className="mt-1 text-sm font-extrabold">
                    {confidenceStyles.label}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-px border-b border-[#CBD5E1] bg-[#CBD5E1] sm:grid-cols-2">
              <div className="bg-white p-6 sm:p-7">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#667085]">
                  Maximum loan amount
                </p>

                <p className="mt-3 text-3xl font-extrabold tracking-tight text-[#0077CC]">
                  {formatINR(
                    recommendation.eligibleAmount
                  )}
                </p>

                <p className="mt-2 text-xs font-medium leading-5 text-[#7A8797]">
                  Upper amount available for planning in the
                  next stage, subject to applicable eligibility
                  and approval.
                </p>
              </div>

              <div className="bg-white p-6 sm:p-7">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#667085]">
                  Recommended interest rate
                </p>

                <p className="mt-3 text-3xl font-extrabold tracking-tight text-[#002244]">
                  {recommendation.interestRate}%
                </p>

                <p className="mt-2 text-xs font-medium leading-5 text-[#7A8797]">
                  Indicative rate used for the financial
                  planning stage.
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="border border-[#CBD5E1] bg-[#F7F9FB] p-5">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#667085]">
                    Scheme
                  </p>

                  <p className="mt-2 text-sm font-extrabold text-[#002244]">
                    {recommendation.schemeName}
                  </p>
                </div>

                <div className="border border-[#CBD5E1] bg-[#F7F9FB] p-5">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#667085]">
                    Maximum
                  </p>

                  <p className="mt-2 text-sm font-extrabold text-[#002244]">
                    {formatINR(
                      recommendation.eligibleAmount
                    )}
                  </p>
                </div>

                <div className="border border-[#CBD5E1] bg-[#F7F9FB] p-5">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#667085]">
                    AI source
                  </p>

                  <p className="mt-2 text-sm font-extrabold text-[#002244]">
                    {recommendation.source === "groq"
                      ? "AI model"
                      : "NIRVAAN fallback"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
            {/* AI EXPLANATION */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
            <div className="border border-[#CBD5E1] bg-white">
              <div className="border-b border-[#CBD5E1] bg-[#F7F9FB] px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center border border-[#0077CC] bg-white">
                    <Sparkles
                      className="h-4 w-4 text-[#0077CC]"
                      strokeWidth={2}
                    />
                  </div>

                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#0077CC]">
                      AI explanation
                    </p>

                    <h3 className="mt-1 text-base font-extrabold text-[#002244]">
                      Why this recommendation?
                    </h3>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-7">
                {aiLoading ? (
                  <div className="flex items-center gap-3 border border-[#CBD5E1] bg-[#F7F9FB] px-5 py-5">
                    <Loader2
                      className="h-4 w-4 animate-spin text-[#0077CC]"
                      strokeWidth={2}
                    />

                    <p className="text-xs font-semibold text-[#526071]">
                      Preparing your AI explanation...
                    </p>
                  </div>
                ) : ai?.explanation ? (
                  <>
                    <p className="text-sm font-medium leading-7 text-[#526071]">
                      {ai.explanation}
                    </p>

                    {ai.source && (
                      <p className="mt-4 text-[10px] font-semibold text-[#8A96A6]">
                        Explanation source:{" "}
                        {ai.source === "groq"
                          ? "AI model"
                          : "NIRVAAN fallback guidance"}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm font-medium leading-7 text-[#667085]">
                    Your recommendation is based on the verified
                    information available from your journey.
                  </p>
                )}
              </div>
            </div>

            {/* PROFILE SUMMARY */}
            <div className="border border-[#CBD5E1] bg-white">
              <div className="border-b border-[#CBD5E1] bg-[#002244] px-6 py-5">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#9CC8EA]">
                  Assessment context
                </p>

                <h3 className="mt-1 text-base font-extrabold text-white">
                  Your journey profile
                </h3>
              </div>

              <div className="divide-y divide-[#D9E0E7]">
                <div className="p-5">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#7A8797]">
                    Route
                  </p>

                  <p className="mt-1 text-sm font-extrabold text-[#002244]">
  {profile ? "Verified profile" : "Profile"}
</p>
                </div>

                <div className="p-5">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#7A8797]">
                    Annual Family Income
                  </p>

                  <p className="mt-1 text-sm font-extrabold text-[#002244]">
                    {typeof profile.annualIncome === "number" && profile.annualIncome > 0
                      ? formatINR(profile.annualIncome)
                      : profile.annualIncome === 0
                      ? "₹0 (Non-earning applicant)"
                      : "Verified under scheme limit"}
                  </p>
                </div>

                <div className="p-5">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#7A8797]">
                    Recommendation status
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <Check
                      className="h-4 w-4 text-[#16A34A]"
                      strokeWidth={2.5}
                    />

                    <p className="text-xs font-bold text-[#166534]">
                      Recommendation generated
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI TIPS */}
          {ai?.tips && ai.tips.length > 0 && (
            <div className="mt-6 border border-[#CBD5E1] bg-white">
              <div className="border-b border-[#CBD5E1] bg-[#F7F9FB] px-6 py-5">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#0077CC]">
                  Preparation guidance
                </p>

                <h3 className="mt-1 text-base font-extrabold text-[#002244]">
                  Before you continue
                </h3>
              </div>

              <div className="grid gap-px bg-[#CBD5E1] sm:grid-cols-2 lg:grid-cols-3">
                {ai.tips.map((tip, index) => (
                  <div
                    key={`${tip}-${index}`}
                    className="bg-white p-5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center border border-[#CBD5E1] bg-[#F7F9FB] text-[10px] font-extrabold text-[#0077CC]">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <p className="text-xs font-semibold leading-5 text-[#526071]">
                        {tip}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
                    {/* RECOMMENDATION DETAILS */}
          <div className="mt-6 border border-[#CBD5E1] bg-white">
            <div className="border-b border-[#CBD5E1] bg-[#F7F9FB] px-6 py-5">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#0077CC]">
                Recommendation details
              </p>

              <h3 className="mt-1 text-base font-extrabold text-[#002244]">
                Financing information
              </h3>
            </div>

            <div className="grid gap-px bg-[#CBD5E1] sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white p-5">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#7A8797]">
                  Scheme
                </p>

                <p className="mt-2 text-sm font-extrabold leading-5 text-[#002244]">
                  {recommendation.schemeName}
                </p>
              </div>

              <div className="bg-white p-5">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#7A8797]">
                  Maximum loan
                </p>

                <p className="mt-2 text-sm font-extrabold text-[#0077CC]">
                  {formatINR(
                    recommendation.eligibleAmount
                  )}
                </p>
              </div>

              <div className="bg-white p-5">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#7A8797]">
                  Interest rate
                </p>

                <p className="mt-2 text-sm font-extrabold text-[#002244]">
                  {recommendation.interestRate}%
                </p>
              </div>

              <div className="bg-white p-5">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#7A8797]">
                  Maximum tenure
                </p>

                <p className="mt-2 text-sm font-extrabold text-[#002244]">
                  {recommendation.maxTenureMonths
                    ? `${recommendation.maxTenureMonths} months`
                    : "As applicable"}
                </p>
              </div>
            </div>
          </div>

          {/* NEXT STEP */}
          <div className="mt-6 border border-[#CBD5E1] bg-white">
            <div className="border-l-[3px] border-[#0077CC] px-6 py-6 sm:px-7">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#0077CC]">
                Step 04
              </p>

              <h3 className="mt-2 text-xl font-extrabold text-[#002244]">
                Continue to Financial Calculator
              </h3>

              <p className="mt-2 max-w-2xl text-xs font-medium leading-5 text-[#667085]">
                Use the recommended maximum as your upper
                limit and select the amount you actually need.
                Available selections increase in ₹50,000
                increments, beginning at ₹50,000.
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/calculator"
                  className="inline-flex min-h-[46px] items-center justify-center border border-[#0077CC] bg-[#0077CC] px-7 text-xs font-bold text-white transition-colors hover:bg-[#005FA3]"
                >
                  Open Financial Calculator
                  <ArrowRight
                    className="ml-3 h-4 w-4"
                    strokeWidth={2}
                  />
                </Link>

                <Link
                  href="/wizard"
                  className="inline-flex min-h-[46px] items-center justify-center border border-[#B9C4D1] bg-white px-7 text-xs font-bold text-[#526071] transition-colors hover:border-[#0077CC] hover:text-[#0077CC]"
                >
                  Review Journey
                </Link>
              </div>
            </div>
          </div>

          {/* DISCLAIMER */}
          <div className="mt-8 border-l-[3px] border-[#E87512] bg-[#FFF8F1] px-5 py-4">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#8A4B08]">
              Important information
            </p>

            <p className="mt-2 text-xs font-medium leading-5 text-[#667085]">
              NIRVAAN is an independent platform for scheme
              discovery and application assistance. An AI-assisted
              recommendation is intended for guidance and does not
              constitute a sanction, approval, financial guarantee
              or official determination of eligibility. Final
              eligibility, loan limits, interest rates and approval
              are subject to the applicable scheme rules and the
              concerned institution.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
