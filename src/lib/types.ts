export type SchemeId = "micro-finance" | "term-loan" | "education-loan";

export type PartnerType =
  | "public-sector-bank"
  | "private-bank"
  | "nbfc"
  | "regional-agency"
  | "cooperative";

export interface Profile {
  state: string;
  district: string;
  age: number;
  purpose: "business" | "agriculture" | "education";
  activityType: string;
  projectCost: number;
  annualIncome: number;
  educationLevel: "below-10th" | "10th-12th" | "graduate" | "post-graduate";
  courseLocation?: "india" | "abroad";
}

export interface EligibilityCheck {
  label: string;
  passed: boolean;
  detail: string;
}

export interface Recommendation {
  schemeId: SchemeId;
  schemeName: string;
  tagline: string;
  eligibleAmount: number;
  interestRate: number;
  moratoriumMonths: number;
  maxTenureMonths: number;
  checks: EligibilityCheck[];
  confidence: "high" | "medium" | "low";
  alternatives: { schemeId: SchemeId; reason: string }[];
  aiExplanation?: string;
  aiTips?: string[];
  source?: "groq" | "fallback";
}

export interface Partner {
  id: string;
  name: string;
  type: PartnerType;
  schemes: SchemeId[];
  npaPercent: number;
  address: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  phone: string;
  lat: number;
  lng: number;
}

export interface PartnerWithMeta extends Partner {
  distanceKm: number;
  healthStatus: "green" | "yellow" | "red";
}
