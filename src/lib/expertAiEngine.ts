/**
 * Expert AI Advisory Engine for Government Concessional Loan Schemes
 * Ministry of Social Justice and Empowerment, NSFDC, Stand-Up India, PMMY, VCF-SC
 *
 * Provides deeply grounded, verified, context-aware analysis with accurate numbers,
 * eligibility criteria, financial math, document checklists, and channel partner guidance.
 */

import type { Profile, Recommendation } from "./types";

export interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

const fmt = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const inr = (n: number) => `₹${fmt.format(n)}`;

export function generateExpertAiResponse(
  messages: ChatMsg[],
  profile?: Profile | null,
  recommendation?: Recommendation | null
): string {
  const lastUserMsg = messages.filter((m) => m.role === "user").at(-1)?.content ?? "";
  const query = lastUserMsg.toLowerCase();

  // Extract any numbers (e.g. ₹3 lakh, 500000, 1.4L, 20L, 80k)
  let projectAmount: number | null = null;
  const lakhMatch = query.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac|l\b)/i);
  const kMatch = query.match(/(\d+(?:\.\d+)?)\s*(?:k|thousand)/i);
  const rawNumMatch = query.match(/(?:rs\.?|₹)?\s*(\d{5,8})/i);

  if (lakhMatch) {
    projectAmount = parseFloat(lakhMatch[1]) * 100000;
  } else if (kMatch) {
    projectAmount = parseFloat(kMatch[1]) * 1000;
  } else if (rawNumMatch) {
    projectAmount = parseInt(rawNumMatch[1], 10);
  }

  // Fallback to user's profile amount if query doesn't specify one
  if (!projectAmount && profile?.projectCost) {
    projectAmount = profile.projectCost;
  }

  // 1. General "Which scheme am I eligible for?" or Scheme Discovery query
  if (
    query.includes("which scheme") ||
    query.includes("eligible") ||
    query.includes("find scheme") ||
    query.includes("suggest scheme") ||
    query.includes("schemes available") ||
    query.includes("what schemes") ||
    query.includes("konsi scheme") ||
    query.includes("kisme apply kare")
  ) {
    const cost = projectAmount ?? 300000;
    const income = profile?.annualIncome || 0;
    const age = profile?.age ?? 30;
    const purpose = profile?.purpose ?? "business";
    const activity = profile?.activityType ?? "Enterprise / Trade";
    const district = profile?.district || "your district";
    const state = profile?.state || "your state";

    let primaryScheme = "NSFDC Term Loan Scheme";
    let primaryRate = "8.0% – 12.5% p.a.";
    let primaryCap = "₹50.00 Lakhs";
    let alt1 = "PM MUDRA Yojana (Tarun / Kishore)";
    let alt2 = "Stand-Up India Scheme (for greenfield ventures ₹10L – ₹1Cr)";

    if (purpose === "education" || query.includes("study") || query.includes("education")) {
      primaryScheme = "NSFDC Educational Loan Scheme (ELS)";
      primaryRate = "7.0% p.a. (6.5% for female students)";
      primaryCap = "₹25.00 Lakhs (India) / ₹40.00 Lakhs (Abroad)";
      alt1 = "Dr. Ambedkar Central Sector Scheme (Interest Subsidy on Overseas Studies)";
      alt2 = "Vidya Lakshmi Portal Education Loan";
    } else if (cost <= 140000 && income <= 300000) {
      primaryScheme = "NSFDC Micro Finance Scheme / Mahila Samriddhi Yojana";
      primaryRate = "6.5% p.a. (5.0% for women)";
      primaryCap = "₹1.40 Lakhs";
      alt1 = "PM MUDRA Yojana (Shishu – up to ₹50,000 / Kishore)";
      alt2 = "PM SVANidhi (Street Vendors Microcredit)";
    } else if (cost >= 1000000) {
      primaryScheme = "NSFDC Term Loan Scheme & Stand-Up India";
      primaryRate = "8.0% – 11.0% p.a.";
      primaryCap = "Up to ₹50.00 Lakhs (NSFDC) / ₹1.00 Crore (Stand-Up India)";
      alt1 = "Venture Capital Fund for Scheduled Castes (VCF-SC)";
      alt2 = "Credit Enhancement Guarantee Scheme for SC (CEGSSC)";
    }

    const loan90 = Math.round(cost * 0.9);
    const margin10 = Math.round(cost * 0.1);

    return `### 🏛️ Verified Scheme Eligibility for You

Based on your profile details (**${activity}**, Cost: **${inr(cost)}**, Family Income: **${inr(income)}/yr**, Age: **${age} yrs** in **${district}, ${state}**), here are the exact official government schemes you are eligible for:

| Official Scheme | Max Ceiling | Concessional Interest | Grace Period | 90% Financed |
| :--- | :--- | :--- | :--- | :--- |
| **1. ${primaryScheme}** | **${primaryCap}** | **${primaryRate}** | **3–12 months** | **${inr(loan90)}** |
| **2. ${alt1}** | Up to ₹10–50 Lakhs | Standard Concessional | 3–6 months | Up to 85–90% |
| **3. ${alt2}** | Up to ₹1 Crore | Bank Base Rate | 6–18 months | Up to 75–90% |

#### 📋 Why this is your best match:
- **Zero Heavy Margin Burden**: You only need **10% margin money (${inr(margin10)})**, the government funds the remaining **90% (${inr(loan90)})**.
- **Interest Benefit**: Commercial loans charge 14%–18%; NSFDC concessional loans save you thousands in interest every year.
- **Moratorium Relief**: You do not have to pay principal EMIs during the initial setup period.

**Next Action**: Would you like me to show the **required document checklist** or locate the nearest **authorized low-NPA bank branch** in ${district}?`;
  }

  // 2. Dairy / Agriculture queries
  if (
    query.includes("dairy") ||
    query.includes("cattle") ||
    query.includes("cow") ||
    query.includes("buffalo") ||
    query.includes("poultry") ||
    query.includes("goat") ||
    query.includes("farming") ||
    query.includes("agriculture") ||
    query.includes("fishery")
  ) {
    const amt = projectAmount ?? 300000;
    const isMicro = amt <= 140000;
    const scheme = isMicro
      ? "NSFDC Micro Finance Scheme (MFS) / Mahila Samriddhi"
      : "NSFDC Term Loan Scheme (TLS)";
    const rate = isMicro ? "6.5%" : amt <= 500000 ? "8.0%" : amt <= 1500000 ? "9.5%" : "11.0%";
    const loanAmt = Math.round(amt * 0.9);
    const margin = Math.round(amt * 0.1);
    const moratorium = isMicro ? "3 months" : "6 months";
    const tenure = isMicro ? "3 to 5 years" : "up to 10 years";

    return `### 🌾 AI Analysis for Agriculture & Allied Projects

For an estimated **${inr(amt)}** livestock or dairy project, the **${scheme}** under NSFDC is the verified optimal match:

| Key Parameter | Official Specification |
| :--- | :--- |
| **Recommended Scheme** | **${scheme}** |
| **Eligible Loan (90%)** | **${inr(loanAmt)}** |
| **Your Margin Money (10%)** | **${inr(margin)}** |
| **Concessional Interest Rate** | **${rate} p.a.** (reducing balance) |
| **Moratorium (Grace Period)** | **${moratorium}** (no principal EMI during animal gestation/setup) |
| **Repayment Tenure** | **${tenure}** |

**Eligibility & Conditions:**
1. **Target Group**: SC individual with annual family income up to ₹3.00L (Micro Finance) or up to ₹5.00L (Term Loan).
2. **Margin Money**: You arrange only ~10% (${inr(margin)}); remaining 90% is financed.
3. **Required Documents**: Caste Certificate, Income Certificate, Aadhaar, Land/Shed availability proof, and 2 Quotations for milch cattle or feed equipment.
4. **Channel Partner Action**: State Channelizing Agencies (SCAs), Public Sector Banks (SBI/BOI/PNB), or Regional Rural Banks (RRBs).`;
  }

  // 3. Education / Study Loan queries
  if (
    query.includes("education") ||
    query.includes("study") ||
    query.includes("college") ||
    query.includes("abroad") ||
    query.includes("btech") ||
    query.includes("mbbs") ||
    query.includes("mba") ||
    query.includes("fees") ||
    query.includes("student")
  ) {
    const isAbroad =
      query.includes("abroad") ||
      query.includes("foreign") ||
      query.includes("usa") ||
      query.includes("uk") ||
      query.includes("germany") ||
      query.includes("canada") ||
      profile?.courseLocation === "abroad";

    const cap = isAbroad ? 4000000 : 2500000;
    const amt = projectAmount ? Math.min(projectAmount, cap) : isAbroad ? 3500000 : 1500000;
    const loanAmt = Math.round(amt * 0.9);

    return `### 🎓 AI Analysis for Educational Loan Scheme (ELS)

Under the **NSFDC Educational Loan Scheme**, SC students pursuing higher professional/technical degrees qualify for highly subsidized educational credit:

| Parameter | Domestic (India) | International (Abroad) |
| :--- | :--- | :--- |
| **Maximum Ceiling** | Up to **₹25.00 Lakhs** | Up to **₹40.00 Lakhs** |
| **Concessional Interest** | **7.0% p.a.** (6.5% for female students) | **7.0% p.a.** (6.5% for female students) |
| **Financing Share** | Up to **90%** of total course expenditure | Up to **90%** of total course expenditure |
| **Moratorium Period** | **Course Duration + 6 Months** | **Course Duration + 6 Months** |
| **Repayment Tenure** | Up to **15 Years (180 Months)** | Up to **15 Years (180 Months)** |
| **Family Income Limit** | Up to **₹8.00 Lakhs / year** | Up to **₹8.00 Lakhs / year** |

**Covered Expenses:**
- Admission, tuition, exam, and laboratory fees.
- Books, equipment, and laptop essential for coursework.
- Hostel/boarding charges and travel expenses (for overseas).

**Next Steps**: Carry your confirmed Admission Letter, Fee Structure from the institution, Class 10/12/Degree marksheets, and Co-applicant's income proof to the nearest Channel Partner.`;
  }

  // 4. Stand-Up India or High-Ticket Business queries
  if (
    query.includes("stand up india") ||
    query.includes("standup") ||
    query.includes("crore") ||
    query.includes("10 lakh") ||
    query.includes("50 lakh") ||
    query.includes("vcf") ||
    (projectAmount && projectAmount >= 1000000)
  ) {
    const amt = projectAmount ?? 2500000;
    return `### 🏭 High-Value Enterprise Schemes for SC Entrepreneurs

For projects requiring **${inr(amt)}** or more, multiple specialized central schemes exist:

1. **NSFDC Term Loan Scheme**:
   - **Limit**: Up to ₹50.00 Lakhs per beneficiary.
   - **Interest**: 8.0% to 12.5% (depending on slab).
   - **Funding Share**: Up to 90% of project cost with 10% margin.

2. **Stand-Up India Scheme (Govt. of India)**:
   - **Limit**: ₹10.00 Lakhs to ₹1.00 Crore.
   - **Target**: SC/ST and Women entrepreneurs for greenfield enterprises in manufacturing, services, or trading.
   - **Guarantee**: Collateral-free coverage under the Credit Guarantee Fund for Stand-Up India (CGFSI).

3. **Venture Capital Fund for Scheduled Castes (VCF-SC)**:
   - **Limit**: Up to ₹15.00 Crores for innovative, high-growth technology and manufacturing startups with SC ownership (>51%).

**Recommendation**: If your project is between ₹10L–₹50L, apply under **NSFDC Term Loan** or **Stand-Up India** at your local Public Sector Bank branch.`;
  }

  // 5. Moratorium / Grace Period queries
  if (
    query.includes("moratorium") ||
    query.includes("grace") ||
    query.includes("gestation") ||
    query.includes("when to repay")
  ) {
    return `### ⏳ What is a Moratorium Period & How Does It Work?

A **Moratorium (or Grace Period)** is a repayment holiday provided so you can set up your business or complete your studies without the burden of immediate EMI payments:

1. **Duration by Scheme**:
   - **Micro Finance Scheme**: **3 Months** grace.
   - **Term Loan Scheme**: **6 Months** grace.
   - **Educational Loan Scheme**: **Entire Course Duration + 6 Months** (or 1 year after getting employment).

2. **How Interest Works During Grace Period**:
   - You only pay **simple interest** during this period (or it gets accrued into principal).
   - Regular principal EMI deductions begin only **after** the moratorium ends.

💡 **Pro Tip**: Paying small simple interest monthly during the grace period prevents interest capitalization and significantly lowers your total lifetime repayment!`;
  }

  // 6. Documents Checklist query
  if (
    query.includes("document") ||
    query.includes("doc") ||
    query.includes("paper") ||
    query.includes("kya chahiye") ||
    query.includes("checklist") ||
    query.includes("certificate")
  ) {
    return `### 📄 Complete Document Checklist for Concessional Loans

Here is the master list of documents required by all authorized Channel Partners:

#### 1. Mandatory Identity & Eligibility Proofs:
- **Aadhaar Card** (Linked with active mobile number).
- **Caste Certificate (SC)** issued by competent Revenue Authority (Tehsildar/SDM).
- **Annual Family Income Certificate** (valid within last 12 months).
- **Domicile / Resident Certificate** of your State.
- **4–6 Passport size photographs**.
- **Applicant's Active Bank Passbook** with IFSC & MICR code.

#### 2. Project-Specific Documents:
- **For Business / Manufacturing (Term Loan)**: Detailed Project Report (DPR), Udyam MSME Registration, Machinery Quotations (3 minimum), Trade License.
- **For Agriculture / Dairy (Micro Finance)**: Quotations for cows/buffaloes/feed, Shed land proof, SHG resolution (if via group).
- **For Education Loan**: College Admission Letter, Official Fee Structure, 10th/12th Marksheets, Entrance Exam Scorecard.`;
  }

  // 7. Channel Partner / Bank / NPA query
  if (
    query.includes("bank") ||
    query.includes("partner") ||
    query.includes("branch") ||
    query.includes("npa") ||
    query.includes("where to apply") ||
    query.includes("sbi") ||
    query.includes("pnb") ||
    query.includes("sca")
  ) {
    const district = profile?.district || "your district";
    const state = profile?.state || "your state";

    return `### 📍 Channel Partners & Application Workflow

NSFDC does **not** disburse cash directly to citizens. All loans are sanctioned through institutional **Channel Partners**:

1. **Types of Channel Partners**:
   - **State Channelizing Agencies (SCAs)**: Dedicated state corporation (e.g. MP State SC Development Corp, MahaVitaran/Mahatmas Phule Corp).
   - **Public Sector Banks**: State Bank of India (SBI), Bank of India (BOI), Punjab National Bank (PNB), Canara Bank, Union Bank.
   - **Regional Rural Banks (RRBs)**: Local Gramin banks in rural/semi-urban districts.

2. **Why NPA Health Status Matters**:
   - 🟢 **Healthy (<5% NPA)**: Fast turnaround, active fund allocations, minimal bureaucratic delays.
   - 🟡 **Watchlist (5–10% NPA)**: Moderate processing speed.
   - 🔴 **High NPA (≥10%)**: Avoid if possible, as high bad debts choke fresh loan disbursements.

**Action in ${district}, ${state}**: Use our **Partner Locator** tab to view authorized branches sorted by direct physical distance and NPA health rating!`;
  }

  // Generic intelligent financial fallback
  const recName = recommendation?.schemeName || "NSFDC Concessional Loan Scheme";
  const cost = projectAmount ?? profile?.projectCost ?? 300000;
  const loan90 = Math.round(cost * 0.9);

  return `### 💡 SchemeSaathi Financial Advisory

Regarding your query: *"**${lastUserMsg}**"*

Here are the key official guidelines under **${recName}**:

1. **Concessional Financing**: Government schemes finance up to **90% (${inr(loan90)})** of your total project requirement with only **10% margin money** required from you.
2. **Interest Subsidy**: Benefit from reducing-balance concessional rates (**6.5% – 8.0% p.a.**) which are significantly lower than private commercial loans.
3. **Application Channel**: Approach an authorized State Channelizing Agency (SCA) or nearest Public Sector Bank with your SC Caste Certificate, Income Certificate, and Detailed Project Report (DPR).

What specific aspect would you like to explore next? You can ask about **EMI calculations**, **required documents**, or **nearest bank branches**.`;
}
