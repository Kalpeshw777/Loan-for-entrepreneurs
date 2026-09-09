// data/mockSchemes.js
// Demo/mock loan & scheme dataset — NOT real government data.
// Used to ground the Groq chatbot so it doesn't hallucinate scheme details.

const schemeData = [
  {
    id: "scheme001",
    category: "Business Loan",
    name: "SC Entrepreneur Startup Loan",
    provider: "National SC Finance Corp",
    interestRate: "4% p.a.",
    maxAmount: "₹10,00,000",
    eligibility: "SC category, age 18-45, first-time entrepreneur",
    documents: ["Caste certificate", "Aadhaar", "Business plan", "Income proof"],
    processingTime: "15-20 days"
  },
  {
    id: "scheme002",
    category: "Grant",
    name: "Marginalized Community Business Grant",
    provider: "State Social Justice Dept",
    interestRate: "0% (grant, not loan)",
    maxAmount: "₹5,00,000",
    eligibility: "Annual income below ₹3,00,000",
    documents: ["Income certificate", "Bank statement"],
    processingTime: "30 days"
  },
  {
    id: "scheme003",
    category: "Business Loan",
    name: "Micro Enterprise Growth Loan",
    provider: "Regional Rural Development Bank",
    interestRate: "6.5% p.a.",
    maxAmount: "₹2,00,000",
    eligibility: "Existing micro-business, min 1 year operational",
    documents: ["Business registration", "Aadhaar", "GST (if applicable)", "6-month bank statement"],
    processingTime: "10 days"
  },
  {
    id: "scheme004",
    category: "Education Loan",
    name: "Skill Development & Vocational Loan",
    provider: "National Skill Finance Board",
    interestRate: "3% p.a.",
    maxAmount: "₹1,50,000",
    eligibility: "Enrolled in a recognized vocational/skill course, age 18-35",
    documents: ["Admission letter", "Aadhaar", "Fee structure"],
    processingTime: "7 days"
  },
  {
    id: "scheme005",
    category: "Housing",
    name: "Affordable Housing Assistance Scheme",
    provider: "State Housing Board",
    interestRate: "5% p.a. (subsidized)",
    maxAmount: "₹15,00,000",
    eligibility: "First-time homebuyer, annual household income below ₹6,00,000",
    documents: ["Income certificate", "Property documents", "Aadhaar", "Bank statement"],
    processingTime: "45 days"
  },
  {
    id: "scheme006",
    category: "Business Loan",
    name: "Women Entrepreneur Empowerment Loan",
    provider: "Women's Development Finance Corp",
    interestRate: "3.5% p.a.",
    maxAmount: "₹8,00,000",
    eligibility: "Women-led business, any social category",
    documents: ["Aadhaar", "Business plan", "Bank statement"],
    processingTime: "12 days"
  },
  {
    id: "scheme007",
    category: "Grant",
    name: "Rural Artisan Support Grant",
    provider: "Ministry of Rural Development",
    interestRate: "0% (grant, not loan)",
    maxAmount: "₹1,00,000",
    eligibility: "Registered artisan/craftsperson in a rural area",
    documents: ["Artisan ID card", "Aadhaar", "Sample work portfolio"],
    processingTime: "20 days"
  },
  {
    id: "scheme008",
    category: "Business Loan",
    name: "Tech Startup Seed Fund",
    provider: "State Innovation & Startup Mission",
    interestRate: "2% p.a.",
    maxAmount: "₹25,00,000",
    eligibility: "Registered startup, less than 3 years old, tech/innovation focus",
    documents: ["Company registration (DPIIT/Udyam)", "Pitch deck", "PAN", "Bank statement"],
    processingTime: "25 days"
  },
  {
    id: "scheme009",
    category: "Agriculture",
    name: "Farmer Equipment Purchase Loan",
    provider: "Agricultural Credit Cooperative",
    interestRate: "4.5% p.a.",
    maxAmount: "₹3,00,000",
    eligibility: "Registered farmer, owns or leases agricultural land",
    documents: ["Land record (7/12 extract)", "Aadhaar", "Quotation for equipment"],
    processingTime: "10 days"
  },
  {
    id: "scheme010",
    category: "Business Loan",
    name: "Disabled Entrepreneur Support Loan",
    provider: "National Handicapped Finance & Development Corp",
    interestRate: "3% p.a.",
    maxAmount: "₹5,00,000",
    eligibility: "Person with disability (40%+), any business type",
    documents: ["Disability certificate", "Aadhaar", "Business plan"],
    processingTime: "15 days"
  },
  {
    id: "scheme011",
    category: "Grant",
    name: "ST Entrepreneur Development Grant",
    provider: "Tribal Welfare Finance Corp",
    interestRate: "0% (grant, not loan)",
    maxAmount: "₹4,00,000",
    eligibility: "ST category, first-generation entrepreneur",
    documents: ["Tribal certificate", "Aadhaar", "Business plan"],
    processingTime: "25 days"
  },
  {
    id: "scheme012",
    category: "Business Loan",
    name: "Retail Shop Expansion Loan",
    provider: "Urban Cooperative Bank",
    interestRate: "7% p.a.",
    maxAmount: "₹6,00,000",
    eligibility: "Existing retail shop owner, min 2 years operational",
    documents: ["Shop license", "Aadhaar", "12-month bank statement", "ITR"],
    processingTime: "14 days"
  },
  {
    id: "scheme013",
    category: "Education Loan",
    name: "Higher Education Abroad Loan",
    provider: "National Education Finance Bank",
    interestRate: "8% p.a.",
    maxAmount: "₹40,00,000",
    eligibility: "Admission confirmed in a foreign university, co-applicant required",
    documents: ["Admission letter", "Visa", "Co-applicant income proof", "Collateral (above ₹20L)"],
    processingTime: "30 days"
  },
  {
    id: "scheme014",
    category: "Business Loan",
    name: "OBC Small Business Loan",
    provider: "Backward Classes Finance & Development Corp",
    interestRate: "4% p.a.",
    maxAmount: "₹6,00,000",
    eligibility: "OBC category, annual income below ₹3,00,000",
    documents: ["OBC certificate", "Income certificate", "Aadhaar", "Business plan"],
    processingTime: "18 days"
  },
  {
    id: "scheme015",
    category: "Grant",
    name: "Women Self-Help Group Micro Grant",
    provider: "State Rural Livelihoods Mission",
    interestRate: "0% (grant, not loan)",
    maxAmount: "₹50,000",
    eligibility: "Member of a registered Self-Help Group (SHG)",
    documents: ["SHG membership certificate", "Aadhaar", "Group resolution letter"],
    processingTime: "20 days"
  },
  {
    id: "scheme016",
    category: "Business Loan",
    name: "Food Processing Unit Loan",
    provider: "Food Industries Finance Corp",
    interestRate: "5% p.a.",
    maxAmount: "₹12,00,000",
    eligibility: "Setting up or expanding a food processing unit, FSSAI registration",
    documents: ["FSSAI license", "Business plan", "Aadhaar", "Site/lease documents"],
    processingTime: "22 days"
  }
];

module.exports = schemeData;
module.exports.default = schemeData;
module.exports.schemeData = schemeData;
