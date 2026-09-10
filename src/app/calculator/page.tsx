"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { useJourney } from "@/context/JourneyContext";
import { amortizationSchedule, totals } from "@/lib/emi";
import { formatINR } from "@/lib/format";
import type { Recommendation } from "@/lib/types";

export default function CalculatorPage() {
  const { recommendation, ready } = useJourney();

  if (!ready) {
    return (
      <main className="min-h-screen bg-white text-[#111827]">
        <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center px-4">
          <div className="w-full max-w-md border border-[#CBD5E1] bg-white p-8 text-center">
            <div
              className="mx-auto h-8 w-8 animate-spin border-2 border-[#D7DEE8] border-t-[#0077CC]"
              aria-hidden="true"
            />

            <p className="mt-5 text-sm font-bold text-[#002244]">
              Loading financial calculator
            </p>

            <p className="mt-2 text-xs font-medium leading-5 text-[#667085]">
              Preparing your financing options.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F7F9FB] text-[#111827]">
      {/* PAGE HEADER */}
      <section className="border-b border-[#D9E0E7] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-9 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-[3px] w-10 bg-[#0077CC]" />

                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#0077CC]">
                  NIRVAAN
                </p>
              </div>

              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[#002244] sm:text-4xl">
                Financial Calculator
              </h1>

              {recommendation ? (
                <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-[#667085]">
                  Choose the loan amount you need within your
                  recommended maximum and estimate your repayment.
                  Recommended scheme:{" "}
                  <strong className="font-extrabold text-[#0077CC]">
                    {recommendation.schemeName}
                  </strong>
                  .
                </p>
              ) : (
                <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-[#667085]">
                  Estimate monthly repayment, total interest and
                  the repayment schedule for a planned loan.
                </p>
              )}
            </div>

            <div className="w-fit border border-[#CBD5E1] bg-[#F7F9FB] px-5 py-4">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#667085]">
                Step 04
              </p>

              <p className="mt-1 text-sm font-extrabold text-[#002244]">
                Financial planning
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
        {recommendation ? (
          <CalculatorForm
            key={`${recommendation.schemeId}-${recommendation.eligibleAmount}-${recommendation.interestRate}`}
            rec={recommendation}
          />
        ) : (
          <CalculatorForm />
        )}
      </div>
    </main>
  );
}

/* =========================================================
   CALCULATOR
   ========================================================= */

function CalculatorForm({
  rec,
}: {
  rec?: Recommendation;
}) {
  const maximumAmount = rec?.eligibleAmount ?? 500000;
  const minAmount = maximumAmount <= 50000 ? 5000 : maximumAmount <= 100000 ? 10000 : 50000;

  const [amount, setAmount] = useState(() => maximumAmount);

  // Interest rate is locked to the official scheme guideline rate
  const rate = rec?.interestRate ?? 8.0;

  const [tenureMonths, setTenureMonths] = useState(
    rec?.maxTenureMonths ?? 60
  );

  const [moratorium, setMoratorium] = useState(
    rec?.moratoriumMonths ?? 6
  );

  const [payMoratoriumInterest, setPayMoratoriumInterest] =
    useState(false);

  const [expanded, setExpanded] = useState(false);

  /* =======================================================
     EMI CALCULATION
     ======================================================= */

  const rows = useMemo(
    () =>
      amortizationSchedule(
        amount,
        rate,
        tenureMonths,
        moratorium,
        payMoratoriumInterest
      ),
    [
      amount,
      rate,
      tenureMonths,
      moratorium,
      payMoratoriumInterest,
    ]
  );

  const {
    totalInterest,
    totalPayment,
    regularEmi,
  } = totals(rows);

  const interestShare =
    totalPayment > 0
      ? Math.round(
          (totalInterest / totalPayment) * 100
        )
      : 0;

  const principalShare = Math.max(
    0,
    100 - interestShare
  );

  const visibleRows = expanded
    ? rows
    : rows.slice(0, 12);

  /* =======================================================
     LOAN AMOUNT PRESETS (Clean & Responsive)
     ======================================================= */

  const loanPresets = useMemo(() => {
    if (maximumAmount <= 0) return [];
    const stepUnit = maximumAmount <= 100000 ? 10000 : 50000;
    const p25 = Math.max(minAmount, Math.round((maximumAmount * 0.25) / stepUnit) * stepUnit);
    const p50 = Math.max(minAmount, Math.round((maximumAmount * 0.5) / stepUnit) * stepUnit);
    const p75 = Math.max(minAmount, Math.round((maximumAmount * 0.75) / stepUnit) * stepUnit);
    const p100 = maximumAmount;
    return Array.from(new Set([p25, p50, p75, p100])).sort((a, b) => a - b);
  }, [maximumAmount, minAmount]);

  const hasLoanOptions = loanPresets.length > 0;

  /* =======================================================
     CONTROLS
     ======================================================= */

  const tenureMinimum = 12;
  const tenureMaximum = Math.max(
    tenureMinimum,
    rec?.maxTenureMonths ?? 180
  );

  const moratoriumMaximum = Math.max(
    0,
    Math.min(36, rec?.moratoriumMonths ?? 36)
  );

  return (
    <div className="space-y-6">
      {/* RECOMMENDED LOAN LIMIT */}
      {rec && (
        <section className="border border-[#CBD5E1] bg-white">
          <div className="grid gap-px bg-[#CBD5E1] sm:grid-cols-3">
            <div className="bg-[#002244] px-6 py-6 sm:px-7">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#9CC8EA]">
                Recommended scheme
              </p>

              <p className="mt-2 text-base font-extrabold leading-6 text-white">
                {rec.schemeName}
              </p>
            </div>

            <div className="bg-white px-6 py-6 sm:px-7">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#667085]">
                Maximum loan amount
              </p>

              <p className="mt-2 text-2xl font-extrabold tabular-nums text-[#0077CC]">
                {formatINR(maximumAmount)}
              </p>
            </div>

            <div className="bg-white px-6 py-6 sm:px-7">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#667085]">
                Planning rate
              </p>

              <p className="mt-2 text-2xl font-extrabold tabular-nums text-[#002244]">
                {rate}%
              </p>
            </div>
          </div>
        </section>
      )}

      {/* MAIN CALCULATOR */}
      <div className="grid gap-6 lg:grid-cols-[1fr_390px]">
        {/* CONTROLS */}
        <section className="border border-[#CBD5E1] bg-white">
          <div className="border-b border-[#CBD5E1] bg-[#F7F9FB] px-6 py-6 sm:px-8">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#0077CC]">
              Loan parameters
            </p>

            <h2 className="mt-1 text-xl font-extrabold text-[#002244]">
              Choose your loan amount
            </h2>

            <p className="mt-2 text-xs font-medium leading-5 text-[#667085]">
              Select an indicative amount up to your recommended maximum.
            </p>
          </div>

          <div className="space-y-8 p-6 sm:p-8">
            {/* LOAN AMOUNT */}
            <div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <label
                    htmlFor="loan-amount"
                    className="text-sm font-extrabold text-[#002244]"
                  >
                    Loan Amount
                  </label>

                  <p className="mt-1 text-[11px] font-medium leading-5 text-[#7A8797]">
                    Select an amount within your approved maximum.
                  </p>
                </div>

                <div className="w-fit border border-[#0077CC] bg-[#F0F7FC] px-4 py-2">
                  <span className="text-base font-extrabold tabular-nums text-[#0077CC]">
                    {formatINR(amount)}
                  </span>
                </div>
              </div>

              {/* Milestone Presets */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-[#667085]">
                  Quick Presets:
                </span>
                {loanPresets.map((preset) => {
                  const selected = amount === preset;

                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmount(preset)}
                      aria-pressed={selected}
                      className={`min-h-[38px] border px-3 text-xs font-extrabold transition-colors ${
                        selected
                          ? "border-[#0077CC] bg-[#0077CC] text-white"
                          : "border-[#CBD5E1] bg-white text-[#374151] hover:border-[#0077CC] hover:text-[#0077CC]"
                      }`}
                    >
                      {formatINR(preset)}
                    </button>
                  );
                })}
              </div>

              <input
                id="loan-amount"
                type="range"
                min={minAmount}
                max={maximumAmount}
                step={maximumAmount <= 100000 ? 5000 : 25000}
                value={amount}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  if (next >= minAmount && next <= maximumAmount) {
                    setAmount(next);
                  }
                }}
                className="mt-6 h-1.5 w-full cursor-pointer appearance-none bg-[#D7DEE8] accent-[#0077CC]"
                aria-label="Loan Amount"
              />

              <div className="mt-2 flex justify-between text-[10px] font-semibold text-[#8A96A6]">
                <span>{formatINR(minAmount)}</span>
                <span>{formatINR(maximumAmount)}</span>
              </div>
            </div>

            {/* INTEREST RATE (LOCKED TO SCHEME) */}
            <div className="border border-[#CBD5E1] bg-[#F7F9FB] p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-[#002244]">
                      Interest Rate
                    </span>
                    <span className="rounded bg-[#E0F2FE] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#0284C7]">
                      Common as per Scheme
                    </span>
                  </div>

                  <p className="mt-1 text-[11px] font-medium leading-5 text-[#667085]">
                    {rec
                      ? `Locked to official ${rec.schemeName} guideline.`
                      : "Official baseline concessional rate."}
                  </p>
                </div>

                <div className="w-fit border border-[#0077CC] bg-white px-4 py-2">
                  <span className="text-base font-extrabold tabular-nums text-[#0077CC]">
                    {rate}% p.a.
                  </span>
                </div>
              </div>

              <p className="mt-3 text-[11px] font-semibold text-[#047857]">
                ✓ Reducing balance interest rate is locked per government scheme norms to prevent calculation deviations.
              </p>
            </div>

                        {/* REPAYMENT TENURE */}
            <div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <label
                  htmlFor="tenure"
                  className="text-sm font-extrabold text-[#002244]"
                >
                  Repayment Tenure
                </label>

                <span className="w-fit border border-[#CBD5E1] bg-white px-3 py-2 text-sm font-extrabold tabular-nums text-[#0077CC]">
                  {tenureMonths} months (
                  {(tenureMonths / 12).toFixed(1)} years)
                </span>
              </div>

              <input
                id="tenure"
                type="range"
                min={tenureMinimum}
                max={tenureMaximum}
                step={6}
                value={tenureMonths}
                onChange={(event) =>
                  setTenureMonths(
                    Number(event.target.value)
                  )
                }
                className="mt-4 h-1.5 w-full cursor-pointer appearance-none bg-[#D7DEE8] accent-[#0077CC]"
                aria-label="Repayment Tenure"
              />

              <div className="mt-2 flex justify-between text-[10px] font-semibold text-[#8A96A6]">
                <span>{tenureMinimum} months</span>
                <span>{tenureMaximum} months</span>
              </div>
            </div>

            {/* MORATORIUM */}
            <div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <label
                  htmlFor="moratorium"
                  className="text-sm font-extrabold text-[#002244]"
                >
                  Moratorium / Grace Period
                </label>

                <span className="w-fit border border-[#CBD5E1] bg-white px-3 py-2 text-sm font-extrabold tabular-nums text-[#0077CC]">
                  {moratorium} months
                </span>
              </div>

              <p className="mt-1 text-[11px] font-medium leading-5 text-[#7A8797]">
                A grace period may delay regular EMI
                payments. Actual treatment depends on the
                applicable financing terms.
              </p>

              <input
                id="moratorium"
                type="range"
                min={0}
                max={moratoriumMaximum}
                step={3}
                value={moratorium}
                onChange={(event) =>
                  setMoratorium(
                    Number(event.target.value)
                  )
                }
                className="mt-4 h-1.5 w-full cursor-pointer appearance-none bg-[#D7DEE8] accent-[#0077CC]"
                aria-label="Moratorium or Grace Period"
              />

              <div className="mt-2 flex justify-between text-[10px] font-semibold text-[#8A96A6]">
                <span>0 months</span>
                <span>{moratoriumMaximum} months</span>
              </div>
            </div>

            {/* MORATORIUM INTEREST OPTION */}
            {moratorium > 0 && (
              <label
                htmlFor="pay-moratorium-interest"
                className="flex cursor-pointer items-start gap-3 border border-[#CBD5E1] bg-[#F7F9FB] p-4 transition-colors hover:border-[#0077CC]"
              >
                <input
                  id="pay-moratorium-interest"
                  type="checkbox"
                  checked={payMoratoriumInterest}
                  onChange={(event) =>
                    setPayMoratoriumInterest(
                      event.target.checked
                    )
                  }
                  className="mt-1 h-4 w-4 flex-none accent-[#0077CC]"
                />

                <div>
                  <p className="text-xs font-extrabold text-[#002244] sm:text-sm">
                    Pay simple interest during the grace period
                  </p>

                  <p className="mt-1 text-[11px] font-medium leading-5 text-[#667085]">
                    Turn this on to include simple interest
                    payments during the selected moratorium
                    period.
                  </p>
                </div>
              </label>
            )}
          </div>
        </section>

        {/* RESULTS */}
        <section className="border border-[#CBD5E1] bg-white">
          <div className="border-b border-[#CBD5E1] bg-[#002244] px-6 py-7 text-white sm:px-7">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#9CC8EA]">
              Estimated monthly EMI
            </p>

            <p className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              {formatINR(regularEmi)}
            </p>

            <p className="mt-2 text-xs font-medium leading-5 text-[#D8E4F0]">
              Indicative monthly repayment after the applicable
              grace period.
            </p>

            {moratorium > 0 && (
              <div className="mt-5 border-l-[3px] border-[#E87512] bg-[#07345C] px-4 py-3">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#F7C38E]">
                  Grace period
                </p>

                <p className="mt-1 text-sm font-extrabold text-white">
                  {moratorium} months
                </p>
              </div>
            )}
          </div>

          <div className="divide-y divide-[#E5EAF0]">
            {/* PRINCIPAL */}
            <div className="flex items-center justify-between gap-4 px-6 py-5 sm:px-7">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#7A8797]">
                  Principal loan
                </p>

                <p className="mt-1 text-base font-extrabold tabular-nums text-[#002244]">
                  {formatINR(amount)}
                </p>
              </div>

              <span className="border border-[#0077CC] bg-[#F0F7FC] px-3 py-1.5 text-[10px] font-extrabold text-[#0077CC]">
                {principalShare}%
              </span>
            </div>

            {/* INTEREST */}
            <div className="flex items-center justify-between gap-4 px-6 py-5 sm:px-7">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#7A8797]">
                  Total interest
                </p>

                <p className="mt-1 text-base font-extrabold tabular-nums text-[#002244]">
                  {formatINR(totalInterest)}
                </p>
              </div>

              <span className="border border-[#E87512] bg-[#FFF8F1] px-3 py-1.5 text-[10px] font-extrabold text-[#B45309]">
                {interestShare}%
              </span>
            </div>

            {/* TOTAL */}
            <div className="bg-[#F7F9FB] px-6 py-6 sm:px-7">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#667085]">
                Total repayment
              </p>

              <p className="mt-2 text-2xl font-extrabold tabular-nums text-[#002244]">
                {formatINR(totalPayment)}
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-7">
            <Link
              href="/locator"
              className="flex min-h-[48px] w-full items-center justify-center border border-[#0077CC] bg-[#0077CC] px-5 text-xs font-extrabold text-white transition-colors hover:bg-[#005FA3] sm:text-sm"
            >
              Continue to Partner Locator
              <span className="ml-3" aria-hidden="true">
                →
              </span>
            </Link>

            <p className="mt-3 text-center text-[10px] font-medium leading-4 text-[#8A96A6]">
              The calculator is for financial planning only.
              Final loan terms are determined by the applicable
              financial institution and scheme rules.
            </p>
          </div>
        </section>
      </div>

      {/* REPAYMENT COMPOSITION */}
      <section className="border border-[#CBD5E1] bg-white">
        <div className="border-b border-[#CBD5E1] bg-[#F7F9FB] px-6 py-6 sm:px-8">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#E87512]">
            Repayment composition
          </p>

          <h2 className="mt-1 text-xl font-extrabold text-[#002244]">
            Principal and interest
          </h2>

          <p className="mt-2 text-xs font-medium leading-5 text-[#667085]">
            See how the estimated total repayment is divided
            between the amount borrowed and interest.
          </p>
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex h-9 w-full border border-[#CBD5E1] bg-[#F7F9FB]">
            {principalShare > 0 && (
              <div
                className="flex items-center justify-center bg-[#0077CC] text-[10px] font-extrabold text-white"
                style={{
                  width: `${principalShare}%`,
                }}
              >
                {principalShare >= 15
                  ? `Principal ${principalShare}%`
                  : ""}
              </div>
            )}

            {interestShare > 0 && (
              <div
                className="flex items-center justify-center bg-[#E87512] text-[10px] font-extrabold text-white"
                style={{
                  width: `${interestShare}%`,
                }}
              >
                {interestShare >= 15
                  ? `Interest ${interestShare}%`
                  : ""}
              </div>
            )}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="border-l-[3px] border-[#0077CC] bg-[#F7F9FB] px-5 py-4">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#667085]">
                Principal
              </p>

              <p className="mt-1 text-lg font-extrabold tabular-nums text-[#002244]">
                {formatINR(amount)}
              </p>
            </div>

            <div className="border-l-[3px] border-[#E87512] bg-[#F7F9FB] px-5 py-4">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#667085]">
                Interest
              </p>

              <p className="mt-1 text-lg font-extrabold tabular-nums text-[#002244]">
                {formatINR(totalInterest)}
              </p>
            </div>
          </div>
        </div>
      </section>
            {/* AMORTIZATION SCHEDULE */}
      <section className="border border-[#CBD5E1] bg-white">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex min-h-[74px] w-full items-center justify-between gap-4 px-6 text-left transition-colors hover:bg-[#F7F9FB] sm:px-8"
          aria-expanded={expanded}
        >
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#0077CC]">
              Repayment details
            </p>

            <p className="mt-1 text-base font-extrabold text-[#002244] sm:text-lg">
              Repayment schedule{" "}
              <span className="font-medium text-[#667085]">
                ({rows.length} months)
              </span>
            </p>
          </div>

          <span className="flex-none border border-[#CBD5E1] bg-white px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#0077CC]">
            {expanded ? "Show less" : "View schedule"}
          </span>
        </button>

        {expanded && (
          <div className="border-t border-[#CBD5E1]">
            <div className="max-h-[460px] overflow-x-auto overflow-y-auto">
              <table className="min-w-[760px] w-full border-collapse text-left text-xs">
                <thead className="sticky top-0 z-10 bg-[#002244] text-white">
                  <tr>
                    <th className="border-r border-[#365679] px-4 py-3 font-extrabold">
                      Month
                    </th>

                    <th className="border-r border-[#365679] px-4 py-3 font-extrabold">
                      Opening Balance
                    </th>

                    <th className="border-r border-[#365679] px-4 py-3 font-extrabold">
                      Payment
                    </th>

                    <th className="border-r border-[#365679] px-4 py-3 font-extrabold">
                      Principal
                    </th>

                    <th className="border-r border-[#365679] px-4 py-3 font-extrabold">
                      Interest
                    </th>

                    <th className="px-4 py-3 font-extrabold">
                      Closing Balance
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#E5EAF0]">
                  {visibleRows.map((row) => (
                    <tr
                      key={row.month}
                      className="bg-white transition-colors hover:bg-[#F7F9FB]"
                    >
                      <td className="px-4 py-3 font-extrabold tabular-nums text-[#002244]">
                        {row.month}
                      </td>

                      <td className="px-4 py-3 tabular-nums text-[#526071]">
                        {formatINR(
                          row.openingBalance
                        )}
                      </td>

                      <td className="px-4 py-3 font-extrabold tabular-nums text-[#0077CC]">
                        {formatINR(row.emi)}
                      </td>

                      <td className="px-4 py-3 tabular-nums text-[#526071]">
                        {formatINR(row.principal)}
                      </td>

                      <td className="px-4 py-3 tabular-nums text-[#526071]">
                        {formatINR(row.interest)}
                      </td>

                      <td className="px-4 py-3 font-extrabold tabular-nums text-[#002244]">
                        {formatINR(
                          row.closingBalance
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* HOW TO READ THE CALCULATOR */}
      <section className="border border-[#CBD5E1] bg-white">
        <div className="border-b border-[#CBD5E1] bg-[#F7F9FB] px-6 py-6 sm:px-8">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#0077CC]">
            Planning guide
          </p>

          <h2 className="mt-1 text-xl font-extrabold text-[#002244]">
            How to use this calculator
          </h2>
        </div>

        <div className="grid gap-px bg-[#CBD5E1] sm:grid-cols-3">
          <div className="bg-white p-6 sm:p-7">
            <div className="flex items-start gap-4">
              <span className="flex h-8 w-8 flex-none items-center justify-center border border-[#0077CC] bg-[#F0F7FC] text-xs font-extrabold text-[#0077CC]">
                01
              </span>

              <div>
                <h3 className="text-sm font-extrabold text-[#002244]">
                  Select the amount
                </h3>

                <p className="mt-2 text-xs font-medium leading-5 text-[#667085]">
                  Choose the amount you actually need from
                  the available ₹50,000 increments.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-7">
            <div className="flex items-start gap-4">
              <span className="flex h-8 w-8 flex-none items-center justify-center border border-[#0077CC] bg-[#F0F7FC] text-xs font-extrabold text-[#0077CC]">
                02
              </span>

              <div>
                <h3 className="text-sm font-extrabold text-[#002244]">
                  Review repayment
                </h3>

                <p className="mt-2 text-xs font-medium leading-5 text-[#667085]">
                  Adjust the rate, tenure and grace period to
                  understand the estimated repayment burden.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-7">
            <div className="flex items-start gap-4">
              <span className="flex h-8 w-8 flex-none items-center justify-center border border-[#0077CC] bg-[#F0F7FC] text-xs font-extrabold text-[#0077CC]">
                03
              </span>

              <div>
                <h3 className="text-sm font-extrabold text-[#002244]">
                  Find a partner
                </h3>

                <p className="mt-2 text-xs font-medium leading-5 text-[#667085]">
                  Continue to the partner locator to explore
                  nearby financing partners and plan your next
                  step.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* IMPORTANT INFORMATION */}
      <section className="border border-[#CBD5E1] bg-white">
        <div className="border-l-[3px] border-[#E87512] bg-[#FFF8F1] px-6 py-6 sm:px-8">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#8A4B08]">
            Important information
          </p>

          <p className="mt-2 text-xs font-medium leading-5 text-[#667085]">
            This calculator provides an indicative financial
            estimate based on the values entered. Actual interest,
            processing charges, moratorium treatment, repayment
            schedule and final loan terms may differ according to
            the applicable scheme and the concerned financial
            institution.
          </p>

          <p className="mt-2 text-xs font-medium leading-5 text-[#667085]">
            NIRVAAN is an independent platform for scheme
            discovery and application assistance. An AI-assisted
            calculation does not constitute loan approval,
            sanction or a financial guarantee.
          </p>
        </div>
      </section>

      {/* NAVIGATION */}
      <div className="flex flex-col gap-3 py-2 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/recommendation"
          className="inline-flex min-h-[46px] items-center justify-center border border-[#B9C4D1] bg-white px-6 text-xs font-extrabold text-[#374151] transition-colors hover:border-[#0077CC] hover:text-[#0077CC] sm:text-sm"
        >
          ← Back to Recommendation
        </Link>

        <Link
          href="/locator"
          className="inline-flex min-h-[46px] items-center justify-center border border-[#0077CC] bg-[#0077CC] px-7 text-xs font-extrabold text-white transition-colors hover:bg-[#005FA3] sm:text-sm"
        >
          Continue to Partner Locator
          <span className="ml-3" aria-hidden="true">
            →
          </span>
        </Link>
      </div>
    </div>
  );
}
