import type { EligibilityCheck, Profile, Recommendation, SchemeId } from "./types";

/**
 * Central scheme configuration — tune every number here before the demo.
 * Sources: NSFDC Micro Finance Scheme, Term Loan scheme & Education Loan
 * scheme guidelines (values simplified for prototype).
 */
export const SCHEMES: Record<
  SchemeId,
  {
    name: string;
    tagline: string;
    maxLoan: number;
    minLoan: number;
    fundingSharePct: number;
    incomeLimit: number;
    minAge: number;
    maxAge: number;
    rate: number;
    moratoriumMonths: number;
    maxTenureMonths: number;
  }
> = {
  "micro-finance": {
    name: "Micro Finance Scheme",
    tagline: "Small income-generating projects via SHGs / Joint Liability Groups",
    maxLoan: 140000,
    minLoan: 10000,
    fundingSharePct: 90,
    incomeLimit: 300000,
    minAge: 18,
    maxAge: 55,
    rate: 6.5,
    moratoriumMonths: 3,
    maxTenureMonths: 60,
  },
  "term-loan": {
    name: "Term Loan Scheme",
    tagline: "Bigger business / manufacturing / service projects with structured repayment",
    maxLoan: 5000000,
    minLoan: 140000,
    fundingSharePct: 90,
    incomeLimit: 500000,
    minAge: 18,
    maxAge: 55,
    rate: 8, // base slab; slabs applied in rateFor()
    moratoriumMonths: 6,
    maxTenureMonths: 120,
  },
  "education-loan": {
    name: "Educational Loan Scheme",
    tagline: "Professional & technical higher education in India or abroad",
    maxLoan: 2500000,
    minLoan: 50000,
    fundingSharePct: 90,
    incomeLimit: 800000,
    minAge: 17,
    maxAge: 35,
    rate: 7,
    moratoriumMonths: 12,
    maxTenureMonths: 180,
  },
};

/** Interest-rate slab for term loans by sanctioned amount. */
function rateFor(schemeId: SchemeId, amount: number): number {
  if (schemeId !== "term-loan") return SCHEMES[schemeId].rate;
  if (amount <= 500000) return 8;
  if (amount <= 1500000) return 9.5;
  if (amount <= 3000000) return 11;
  return 12.5;
}

function check(label: string, passed: boolean, detail: string): EligibilityCheck {
  return { label, passed, detail };
}

const fmt = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const inr = (n: number) => `₹${fmt.format(n)}`;

export function recommendScheme(p: Profile): Recommendation {
  const isEducation = p.purpose === "education";
  const schemeId: SchemeId = isEducation
    ? "education-loan"
    : p.projectCost <= SCHEMES["micro-finance"].maxLoan
    ? "micro-finance"
    : "term-loan";
  const s = SCHEMES[schemeId];

  const cap = isEducation
    ? p.courseLocation === "abroad"
      ? 4000000
      : s.maxLoan
    : s.maxLoan;
  const cost = Math.min(p.projectCost, cap);
  const eligibleAmount = Math.max(
    s.minLoan,
    Math.round((cost * s.fundingSharePct) / 100)
  );
  const rate = rateFor(schemeId, eligibleAmount);

  const checks: EligibilityCheck[] = [
    
    check(
      `Family income ≤ ${inr(s.incomeLimit)}/yr`,
      p.annualIncome <= s.incomeLimit,
      `Your declared family income: ${inr(p.annualIncome)}/yr vs limit ${inr(s.incomeLimit)}.`
    ),
    check(
      `Age between ${s.minAge}–${s.maxAge}`,
      p.age >= s.minAge && p.age <= s.maxAge,
      `Your age: ${p.age}.`
    ),
  ];

  if (!isEducation) {
    checks.push(
      check(
        `Project cost within ${inr(cap)}`,
        p.projectCost <= cap && p.projectCost >= s.minLoan,
        p.projectCost > cap
          ? `Estimated project cost ${inr(p.projectCost)} exceeds scheme cap ${inr(cap)}.`
          : `Project cost ${inr(p.projectCost)} fits the scheme range (${inr(s.minLoan)} – ${inr(cap)}).`
      ),
      check(
        "10% margin money available",
        true,
        `You arrange ~10% of project cost (${inr(Math.round(p.projectCost * 0.1))}); rest up to 90% is financed.`
      )
    );
  } else {
    checks.push(
      check(
        `Course cost/cap within ${inr(cap)}`,
        p.projectCost <= cap,
        p.projectCost > cap
          ? `Estimated course cost ${inr(p.projectCost)} exceeds the ${p.courseLocation === "abroad" ? "abroad" : "India"} cap of ${inr(cap)} — excess must be self-funded.`
          : `Estimated course cost ${inr(p.projectCost)} is covered (cap ${inr(cap)}).`
      ),
      check(
        "Admission confirmed at recognised institution",
        true,
        "Self-declaration now; keep admission letter ready for the Channel Partner."
      )
    );
  }

  const failedCount = checks.filter((c) => !c.passed).length;

  const alternatives: { schemeId: SchemeId; reason: string }[] = [];
  if (!isEducation && p.projectCost > SCHEMES["micro-finance"].maxLoan) {
    alternatives.push({
      schemeId: "micro-finance",
      reason: "If you scale the project down to ₹1.4 lakh or less, the cheaper Micro Finance Scheme applies.",
    });
  }
  if (!isEducation && p.projectCost <= SCHEMES["micro-finance"].maxLoan) {
    alternatives.push({
      schemeId: "term-loan",
      reason: "If you expand the project beyond ₹1.4 lakh, the Term Loan Scheme covers it.",
    });
  }

  return {
    schemeId,
    schemeName: s.name,
    tagline: s.tagline,
    eligibleAmount,
    interestRate: rate,
    moratoriumMonths: s.moratoriumMonths,
    maxTenureMonths: s.maxTenureMonths,
    checks,
    confidence: failedCount === 0 ? "high" : failedCount <= 1 ? "medium" : "low",
    alternatives,
  };
}
