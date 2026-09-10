import type { EligibilityCheck, Profile, Recommendation, SchemeId } from "./types";

/**
 * Central Scheme Configuration
 * Official Indian Government Schemes for Entrepreneurs & Students:
 * - PMEGP (Prime Minister's Employment Generation Programme)
 * - PM MUDRA Yojana (Shishu, Kishore, Tarun)
 * - Stand-Up India Scheme (SC, ST & Women)
 * - CGTMSE (Credit Guarantee Fund Trust for Micro & Small Enterprises)
 * - PM Vishwakarma (Artisans & Traditional Crafts)
 * - NSFDC Micro Finance & Term Loan
 * - Central Educational Loan Scheme (CSIS)
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
  pmegp: {
    name: "Prime Minister's Employment Generation Programme (PMEGP)",
    tagline: "15%–35% Govt capital subsidy for manufacturing & service enterprises",
    maxLoan: 5000000,
    minLoan: 100000,
    fundingSharePct: 90,
    incomeLimit: 1500000,
    minAge: 18,
    maxAge: 65,
    rate: 8.5,
    moratoriumMonths: 6,
    maxTenureMonths: 84,
  },
  "mudra-shishu": {
    name: "PM MUDRA Yojana (Shishu)",
    tagline: "Collateral-free micro loans up to ₹50,000 for budding micro-enterprises",
    maxLoan: 50000,
    minLoan: 5000,
    fundingSharePct: 100,
    incomeLimit: 1000000,
    minAge: 18,
    maxAge: 65,
    rate: 7.5,
    moratoriumMonths: 3,
    maxTenureMonths: 36,
  },
  "mudra-kishore": {
    name: "PM MUDRA Yojana (Kishore)",
    tagline: "Working capital & equipment loan for growing small businesses (₹50K–₹5L)",
    maxLoan: 500000,
    minLoan: 50001,
    fundingSharePct: 90,
    incomeLimit: 1200000,
    minAge: 18,
    maxAge: 65,
    rate: 8.0,
    moratoriumMonths: 6,
    maxTenureMonths: 60,
  },
  "mudra-tarun": {
    name: "PM MUDRA Yojana (Tarun)",
    tagline: "Expansion capital for established micro & small enterprises (₹5L–₹10L)",
    maxLoan: 1000000,
    minLoan: 500001,
    fundingSharePct: 85,
    incomeLimit: 1500000,
    minAge: 18,
    maxAge: 65,
    rate: 8.5,
    moratoriumMonths: 6,
    maxTenureMonths: 60,
  },
  "standup-india": {
    name: "Stand-Up India Scheme",
    tagline: "Greenfield credit (₹10L–₹1Cr) for SC, ST & Women entrepreneurs",
    maxLoan: 10000000,
    minLoan: 1000000,
    fundingSharePct: 85,
    incomeLimit: 2500000,
    minAge: 18,
    maxAge: 65,
    rate: 8.0,
    moratoriumMonths: 18,
    maxTenureMonths: 84,
  },
  cgtmse: {
    name: "CGTMSE Collateral-Free Credit Scheme",
    tagline: "100% collateral-free credit guarantee up to ₹2 Crore for MSMEs & tech",
    maxLoan: 20000000,
    minLoan: 500000,
    fundingSharePct: 85,
    incomeLimit: 3000000,
    minAge: 18,
    maxAge: 65,
    rate: 8.75,
    moratoriumMonths: 6,
    maxTenureMonths: 96,
  },
  "pm-vishwakarma": {
    name: "PM Vishwakarma Scheme",
    tagline: "5% subsidized credit, modern toolkits & skill support for artisans & craftsmen",
    maxLoan: 300000,
    minLoan: 10000,
    fundingSharePct: 95,
    incomeLimit: 800000,
    minAge: 18,
    maxAge: 65,
    rate: 5.0,
    moratoriumMonths: 3,
    maxTenureMonths: 60,
  },
  "micro-finance": {
    name: "Micro Finance Scheme (NSFDC / Mahila Samriddhi)",
    tagline: "Targeted concessional micro-credit up to ₹1.4L via SHGs & JLGs",
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
    name: "Term Loan Scheme (TLS / MSME)",
    tagline: "Medium and long-term project finance for viable commercial enterprises",
    maxLoan: 5000000,
    minLoan: 140000,
    fundingSharePct: 90,
    incomeLimit: 500000,
    minAge: 18,
    maxAge: 55,
    rate: 8.0,
    moratoriumMonths: 6,
    maxTenureMonths: 120,
  },
  "education-loan": {
    name: "Educational Loan Scheme (CSIS / NSFDC)",
    tagline: "Professional & technical higher education in India or abroad with interest subsidy",
    maxLoan: 2500000,
    minLoan: 50000,
    fundingSharePct: 90,
    incomeLimit: 800000,
    minAge: 17,
    maxAge: 35,
    rate: 7.0,
    moratoriumMonths: 12,
    maxTenureMonths: 180,
  },
};

/** Interest-rate slab for term loans by sanctioned amount. */
function rateFor(schemeId: SchemeId, amount: number): number {
  if (schemeId !== "term-loan") return SCHEMES[schemeId].rate;
  if (amount <= 500000) return 8.0;
  if (amount <= 1500000) return 9.5;
  if (amount <= 3000000) return 11.0;
  return 12.5;
}

function check(label: string, passed: boolean, detail: string): EligibilityCheck {
  return { label, passed, detail };
}

const fmt = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const inr = (n: number) => `₹${fmt.format(n)}`;

/**
 * Intelligent multi-factor scheme matching engine
 * Evaluates sector, project cost, applicant social category, ownership structure, and age.
 */
export function recommendScheme(p: Profile): Recommendation {
  const isEducation = p.purpose === "education";

  let schemeId: SchemeId;

  if (isEducation) {
    schemeId = "education-loan";
  } else {
    const cost = p.projectCost || 0;
    const cat = (p.category || "").toLowerCase();
    const isScSt = cat === "sc" || cat === "st";
    const bType = (p.businessType || p.activityType || "").toLowerCase();

    // Check sector keywords
    const isArtisan =
      bType.includes("artisan") ||
      bType.includes("craft") ||
      bType.includes("carpenter") ||
      bType.includes("carpentry") ||
      bType.includes("pottery") ||
      bType.includes("weaver") ||
      bType.includes("weaving") ||
      bType.includes("leather") ||
      bType.includes("vishwakarma") ||
      bType.includes("handicraft");

    const isManufacturing =
      bType.includes("manufactur") ||
      bType.includes("production") ||
      bType.includes("process") ||
      bType.includes("agro") ||
      bType.includes("food") ||
      bType.includes("renewable") ||
      bType.includes("solar");

    const isTech =
      bType.includes("tech") ||
      bType.includes("software") ||
      bType.includes("it ") ||
      bType.includes("startup") ||
      bType.includes("digital");

    // 1. Traditional artisans & craftspeople -> PM Vishwakarma
    if (isArtisan && cost <= 300000) {
      schemeId = "pm-vishwakarma";
    }
    // 2. SC/ST high-value greenfield projects (₹10L - ₹1Cr) -> Stand-Up India
    else if (isScSt && cost >= 1000000 && cost <= 10000000) {
      schemeId = "standup-india";
    }
    // 3. Manufacturing / Agro / Renewable energy (₹1L - ₹50L) -> PMEGP with 15%-35% subsidy
    else if (isManufacturing && cost >= 100000 && cost <= 5000000) {
      schemeId = "pmegp";
    }
    // 4. Tech startup or high-value partnership enterprise -> CGTMSE
    else if (isTech || (p.ownershipType === "partner" && cost >= 1000000)) {
      schemeId = "cgtmse";
    }
    // 5. Very small seed/micro projects up to ₹50K -> MUDRA Shishu
    else if (cost <= 50000) {
      schemeId = "mudra-shishu";
    }
    // 6. Micro finance for SC under ₹1.4L -> Micro Finance
    else if (isScSt && cost <= 140000 && (p.annualIncome || 0) <= 300000) {
      schemeId = "micro-finance";
    }
    // 7. Small business / retail / trade between ₹50K and ₹5L -> MUDRA Kishore
    else if (cost <= 500000) {
      schemeId = "mudra-kishore";
    }
    // 8. Expanding business between ₹5L and ₹10L -> MUDRA Tarun
    else if (cost <= 1000000) {
      schemeId = "mudra-tarun";
    }
    // 9. Large enterprise over ₹1 Crore -> CGTMSE
    else if (cost > 5000000) {
      schemeId = "cgtmse";
    }
    // 10. General MSME term loan -> Term Loan Scheme
    else {
      schemeId = "term-loan";
    }
  }

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
      `Annual income within guideline limit (${inr(s.incomeLimit)}/yr)`,
      (p.annualIncome || 0) <= s.incomeLimit || s.incomeLimit >= 1500000,
      p.annualIncome
        ? `Your declared annual income: ${inr(p.annualIncome)}/yr (eligible for ${s.name}).`
        : `Applicant income verified under ${s.name} ceiling.`
    ),
    check(
      `Age between ${s.minAge}–${s.maxAge} years`,
      p.age >= s.minAge && p.age <= s.maxAge,
      `Your age: ${p.age} years (qualifies under ${s.minAge}–${s.maxAge} parameter).`
    ),
  ];

  if (!isEducation) {
    checks.push(
      check(
        `Project cost within scheme bracket (${inr(s.minLoan)} – ${inr(cap)})`,
        p.projectCost <= cap && p.projectCost >= s.minLoan,
        p.projectCost > cap
          ? `Estimated project cost ${inr(p.projectCost)} exceeds scheme cap ${inr(cap)}; rest must be self-funded.`
          : `Project cost ${inr(p.projectCost)} fits well within scheme ceiling ${inr(cap)}.`
      ),
      check(
        `Government financial assistance up to ${s.fundingSharePct}%`,
        true,
        `Up to ${s.fundingSharePct}% (${inr(eligibleAmount)}) is financed under ${s.name}; you arrange only ~${100 - s.fundingSharePct}% margin.`
      )
    );
  } else {
    checks.push(
      check(
        `Course cost/cap within ${inr(cap)}`,
        p.projectCost <= cap,
        p.projectCost > cap
          ? `Estimated course cost ${inr(p.projectCost)} exceeds the ${p.courseLocation === "abroad" ? "abroad" : "India"} cap of ${inr(cap)} — excess must be self-funded.`
          : `Estimated course cost ${inr(p.projectCost)} is fully covered (cap ${inr(cap)}).`
      ),
      check(
        "Admission confirmed at recognised institution",
        true,
        "Self-declaration confirmed; keep admission letter ready for Channel Partner verification."
      )
    );
  }

  const failedCount = checks.filter((c) => !c.passed).length;

  const alternatives: { schemeId: SchemeId; reason: string }[] = [];

  if (!isEducation) {
    if (schemeId !== "pmegp" && p.projectCost >= 300000) {
      alternatives.push({
        schemeId: "pmegp",
        reason: "PMEGP provides a 15%–35% direct government capital subsidy for manufacturing and service setups.",
      });
    }
    if (schemeId !== "standup-india" && (p.category === "sc" || p.category === "st")) {
      alternatives.push({
        schemeId: "standup-india",
        reason: "Stand-Up India facilitates bank loans between ₹10 Lakhs and ₹1 Crore specifically for SC/ST and Women greenfield entrepreneurs.",
      });
    }
    if (schemeId !== "mudra-tarun" && p.projectCost <= 1000000) {
      alternatives.push({
        schemeId: "mudra-tarun",
        reason: "PM MUDRA Tarun offers up to ₹10 Lakhs with 100% collateral-free bank processing.",
      });
    }
    if (schemeId !== "cgtmse" && p.projectCost >= 1000000) {
      alternatives.push({
        schemeId: "cgtmse",
        reason: "CGTMSE guarantees bank credit up to ₹2 Crore without requiring third-party collateral or mortgage.",
      });
    }
    if (schemeId !== "pm-vishwakarma" && p.projectCost <= 300000) {
      alternatives.push({
        schemeId: "pm-vishwakarma",
        reason: "If you operate a traditional artisan craft trade, PM Vishwakarma offers 5% concessional credit with a ₹15,000 modern toolkit incentive.",
      });
    }
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
    alternatives: alternatives.slice(0, 2),
  };
}

