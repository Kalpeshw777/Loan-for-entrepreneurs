"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { useJourney } from "@/context/JourneyContext";
import type { Profile } from "@/lib/types";
import {
  AGRICULTURE_ACTIVITIES,
  BUSINESS_ACTIVITIES,
  LOCATIONS,
} from "@/lib/locations";

type EarningStatus =
  | "earning"
  | "non-earning"
  | "";

type VerificationMethod =
  | "aadhaar"
  | "pan";

type AssessmentPurpose =
  | "education"
  | "small-project"
  | "";

type CategoryType = "general" | "obc" | "sc" | "st" | "other" | "";

type FormData = {
  // Step 1: User details
  fullName: string;
  contactNo: string;
  email: string;
  dob: string;
  age: string;
  aadhaar: string;
  otp: string;
  otpSent: boolean;
  verificationComplete: boolean;
  generatedOtp: string;
  pan: string;
  currentAddress: string;
  permanentAddress: string;
  sameAsPermanent: boolean;
  state: string;
  district: string;
  pincode: string;
  category: CategoryType;

  // Compatibility fields
  verificationMethod: VerificationMethod;
  verificationValue: string;

  earningStatus: EarningStatus;
  annualIncome: string;
  incomeProof: File | null;

  assessmentPurpose: AssessmentPurpose;
  amountNeeded: string;
  repaymentPlan: string;
  guarantor: string;
  securityDetails: string;
  videoRequested: boolean;
  teamVerificationAccepted: boolean;

  purpose: Profile["purpose"] | undefined;
  activityType: string;
  projectCost: string;
  educationLevel: string;
  courseLocation: string;
  businessType: string;
  businessName: string;
  businessLocation: string;
  udyamNo: string;
  gstinNo: string;
  ownershipType: "individual" | "partner" | "";
};

const CATEGORIES = [
  { id: "general" as const, label: "General", desc: "Open / Unreserved" },
  { id: "obc" as const, label: "OBC", desc: "Other Backward Class" },
  { id: "sc" as const, label: "SC", desc: "Scheduled Caste" },
  { id: "st" as const, label: "ST", desc: "Scheduled Tribe" },
  { id: "other" as const, label: "Other", desc: "Special / Minority" },
];

const STEPS = [
  {
    number: "01",
    title: "User details",
    description:
      "Enter your personal, contact, identification, and residential details.",
  },
  {
    number: "02",
    title: "Smart Scheme Recommender",
    description:
      "Select Entrepreneur or Education assistance to discover eligible schemes.",
  },
  {
    number: "03",
    title: "Financial Calculator",
    description:
      "Select an amount and understand your repayment plan.",
  },
  {
    number: "04",
    title: "Geo-Spatial Partner Locator & Router",
    description:
      "Find a suitable partner location and plan your visit.",
  },
];

const INITIAL_DATA: FormData = {
  fullName: "",
  contactNo: "",
  email: "",
  dob: "",
  age: "",
  aadhaar: "",
  otp: "",
  otpSent: false,
  verificationComplete: false,
  generatedOtp: "654321",
  pan: "",
  currentAddress: "",
  permanentAddress: "",
  sameAsPermanent: false,
  state: "",
  district: "",
  pincode: "",
  category: "",

  verificationMethod: "aadhaar",
  verificationValue: "",

  earningStatus: "",
  annualIncome: "",
  incomeProof: null,

  assessmentPurpose: "",
  amountNeeded: "",
  repaymentPlan: "",
  guarantor: "",
  securityDetails: "",
  videoRequested: false,
  teamVerificationAccepted: false,

  purpose: undefined,
  activityType: "",
  projectCost: "",
  educationLevel: "",
  courseLocation: "",
  businessType: "",
  businessName: "",
  businessLocation: "",
  udyamNo: "",
  gstinNo: "",
  ownershipType: "",
};


const PURPOSE_OPTIONS = [
  {
    value: "education",
    label: "Educational Loan",
    description:
      "For education, training and eligible study-related requirements.",
  },
  {
    value: "small-project",
    label: "Small Project Loan",
    description:
      "For a small income-generating project or entrepreneurial requirement.",
  },
];

const BUSINESS_TYPES = [
  "Retail & Grocery Store (Kirana / General Store)",
  "Wholesale Trading & Distribution",
  "Manufacturing & Production Enterprise",
  "Engineering, Fabrication & Welding Works",
  "Automobile Repair, Workshop & Service Station",
  "Agriculture, Dairy & Livestock Farming",
  "Poultry, Fisheries & Agro Allied Services",
  "Food Processing, Bakery, Restaurant & Catering",
  "Textiles, Garments, Tailoring & Fashion Boutique",
  "IT, Software, Digital Services & Cyber Cafe",
  "Handicrafts, Handloom, Pottery & Artisan Products",
  "Healthcare, Pharmacy, Clinic & Diagnostics",
  "Transportation, Logistics & Goods Carrier",
  "Construction, Hardware & Building Materials",
  "Beauty Parlour, Unisex Salon & Wellness Center",
  "Education, Coaching Classes & Skill Training Institute",
  "Solar Power & Renewable Energy Equipment",
  "Electrical & Electronics Sales and Services",
  "Printing Press, Packaging & Graphic Designing",
  "Leather, Footwear & Accessories Manufacturing",
  "Chemicals, Plastics, Polymers & Packaging",
  "Hotel, Lodging, Tourism & Travel Services",
  "Cold Storage, Warehousing & Supply Chain",
  "Other Micro, Small or Medium Enterprise (MSME)",
];

const EDUCATION_OPTIONS = [
  "School",
  "ITI",
  "Diploma",
  "Undergraduate",
  "Postgraduate",
  "Professional Course",
  "Vocational Training",
];

function formatINR(value: number) {
  if (!Number.isFinite(value)) {
    return "₹0";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getPurposeFromAssessment(
  purpose: AssessmentPurpose
): Profile["purpose"] | undefined {
  if (purpose === "education") {
    return "education";
  }

  if (purpose === "small-project") {
    return "business";
  }

  return undefined;
}

function getActivityForPurpose(
  purpose: Profile["purpose"] | undefined
) {
  if (purpose === "education") {
    return {
      activity: "",
      cost: 1000000,
    };
  }

  if (purpose === "agriculture") {
    return {
      activity: AGRICULTURE_ACTIVITIES[0] ?? "",
      cost: 250000,
    };
  }

  return {
    activity: BUSINESS_ACTIVITIES[0] ?? "",
    cost: 300000,
  };
}

function calculateAge(dobString: string): number | null {
  if (!dobString) return null;
  const birthDate = new Date(dobString);
  if (isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

export default function WizardPage() {
  const router = useRouter();
  const { profile, setJourney } = useJourney();

  const [step, setStep] = useState(0);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [data, setData] =
    useState<FormData>(INITIAL_DATA);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] =
    useState(false);
  const [fetchingDigiLocker, setFetchingDigiLocker] =
    useState(false);

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  };

  useEffect(() => {
    scrollToTop();
    const timeoutId = setTimeout(() => {
      scrollToTop();
    }, 10);
    return () => clearTimeout(timeoutId);
  }, [step]);

  const stateList = useMemo(
    () => Object.keys(LOCATIONS),
    []
  );

  const districtList = useMemo(() => {
    if (!data.state) {
      return [];
    }

    return LOCATIONS[data.state] ?? [];
  }, [data.state]);

  const update = <K extends keyof FormData>(
    key: K,
    value: FormData[K]
  ) => {
    setData((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const resetMessages = () => {
    setError("");
    setNotice("");
  };

  const handleDobChange = (event: ChangeEvent<HTMLInputElement>) => {
    resetMessages();
    const newDob = event.target.value;
    const computedAge = calculateAge(newDob);
    setData((previous) => ({
      ...previous,
      dob: newDob,
      age: computedAge !== null ? String(computedAge) : "",
    }));
  };

  const sendAadhaarOtp = () => {
    resetMessages();

    const cleanAadhaar = data.aadhaar.replace(/\D/g, "");
    if (!cleanAadhaar || cleanAadhaar.length !== 12) {
      setError("Please enter a valid 12-digit Aadhaar number before requesting an OTP.");
      return;
    }

    setSendingOtp(true);
    setTimeout(() => {
      const demoCode = Math.floor(100000 + Math.random() * 900000).toString();
      setData((previous) => ({
        ...previous,
        otpSent: true,
        verificationComplete: false,
        generatedOtp: demoCode,
        verificationValue: cleanAadhaar,
      }));
      setSendingOtp(false);
      setNotice("Simulated OTP dispatched to mobile linked with Aadhaar.");
    }, 350);
  };

  const verifyAadhaarOtp = () => {
    resetMessages();

    const entered = data.otp.trim();
    if (!entered) {
      setError("Please enter the OTP to continue.");
      return;
    }

    setVerifyingOtp(true);
    setTimeout(() => {
      if (entered === data.generatedOtp || entered === "123456" || entered.length === 6) {
        setData((previous) => ({
          ...previous,
          verificationComplete: true,
        }));
        setNotice("Aadhaar verified successfully via prototype simulation. You may now continue below.");
      } else {
        setError(`Invalid OTP. Please enter the prototype simulated OTP (${data.generatedOtp}).`);
      }
      setVerifyingOtp(false);
    }, 300);
  };

  const handleCurrentAddressChange = (
    event: ChangeEvent<HTMLTextAreaElement>
  ) => {
    const val = event.target.value;
    setData((previous) => ({
      ...previous,
      currentAddress: val,
      permanentAddress: previous.sameAsPermanent ? val : previous.permanentAddress,
    }));
  };

  const handleSameAddressToggle = (checked: boolean) => {
    setData((previous) => ({
      ...previous,
      sameAsPermanent: checked,
      permanentAddress: checked ? previous.currentAddress : previous.permanentAddress,
    }));
  };

  const sendOtp = () => {
    sendAadhaarOtp();
  };

  const verifyOtp = () => {
    verifyAadhaarOtp();
  };

  const handleDigiLockerFetch = () => {
    resetMessages();
    setFetchingDigiLocker(true);
    setTimeout(() => {
      setData((previous) => ({
        ...previous,
        fullName: "Ramesh Kumar Patel",
        contactNo: "9876543210",
        email: "ramesh.patel@govmail.in",
        dob: "1998-08-15",
        age: "28",
        aadhaar: "548963214785",
        verificationValue: "548963214785",
        otpSent: true,
        verificationComplete: true,
        pan: "ABCDE1234F",
        currentAddress: "Plot 233, Sector 4, Gandhinagar",
        state: "Gujarat",
        district: "Gandhinagar",
        pincode: "382004",
        sameAsPermanent: true,
        permanentAddress: "Plot 233, Sector 4, Gandhinagar",
        category: previous.category || "general",
      }));
      setFetchingDigiLocker(false);
      setNotice(
        "✓ DigiLocker Verified: Identity, Aadhaar, PAN, and Address details successfully fetched from DigiLocker (Government of India)."
      );
    }, 600);
  };

  const onFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    resetMessages();

    const file =
      event.target.files?.[0] ?? null;

    if (!file) {
      update("incomeProof", null);
      return;
    }

    if (file.type !== "application/pdf") {
      setError(
        "Please upload your income proof as a PDF file."
      );
      event.target.value = "";
      return;
    }

    update("incomeProof", file);
  };

  const selectEarningStatus = (
    status: EarningStatus
  ) => {
    resetMessages();

    setData((previous) => ({
      ...previous,
      earningStatus: status,
      annualIncome:
        status === "earning"
          ? previous.annualIncome
          : "",
      incomeProof:
        status === "earning"
          ? previous.incomeProof
          : null,
    }));
  };

  const selectAssessmentPurpose = (
    purpose: AssessmentPurpose
  ) => {
    resetMessages();

    const profilePurpose =
      getPurposeFromAssessment(purpose);

    const defaults =
      getActivityForPurpose(profilePurpose);

    setData((previous) => ({
      ...previous,
      assessmentPurpose: purpose,
      purpose: profilePurpose,
      activityType: defaults.activity,
      projectCost: String(defaults.cost),
    }));
  };

  const validateVerification = () => {
    if (!data.fullName.trim()) {
      setError("Please enter your full name as per your Aadhaar card (or click 'Continue with DigiLocker' above).");
      return false;
    }

    const cleanPhone = data.contactNo.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      setError("Please enter a valid 10-digit contact mobile number.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email.trim() || !emailRegex.test(data.email.trim())) {
      setError("Please enter a valid email address (e.g. name@example.com).");
      return false;
    }

    if (!data.dob) {
      setError("Please select your date of birth using the calendar.");
      return false;
    }

    const age = Number(data.age);
    if (!Number.isFinite(age) || age < 18) {
      setError("Applicant must be at least 18 years of age to proceed.");
      return false;
    }

    const cleanAadhaar = data.aadhaar.replace(/\D/g, "");
    if (!cleanAadhaar || cleanAadhaar.length < 12) {
      setError("Please enter your 12-digit Aadhaar number.");
      return false;
    }

    if (!data.verificationComplete) {
      // Auto-complete simulation if user entered 12 digits so they are never blocked on the OTP gate
      setData((prev) => ({
        ...prev,
        verificationComplete: true,
        otpSent: true,
        verificationValue: cleanAadhaar,
      }));
    }

    if (!data.pan.trim()) {
      setError("Please enter your 10-character PAN card number (e.g. ABCDE1234F).");
      return false;
    }

    if (!data.currentAddress.trim()) {
      setError("Please enter your current residential address.");
      return false;
    }

    if (!data.state) {
      setError("Please select your residential state.");
      return false;
    }

    if (!data.district) {
      setError("Please select your residential district.");
      return false;
    }

    if (!data.sameAsPermanent && !data.permanentAddress.trim()) {
      setError("Please enter your permanent address, or tick 'Keep current address as permanent address'.");
      return false;
    }

    if (!data.category) {
      setError("Please select your social category (General, OBC, SC, ST, Other) below.");
      return false;
    }

    return true;
  };

  const validateScheme = () => {
    if (!data.purpose) {
      setError(
        "Please select your assistance category: Entrepreneur or Education."
      );
      return false;
    }

    if (data.purpose === "business") {
      if (!data.businessType && !data.activityType) {
        setError("Please select your business type.");
        return false;
      }

      if (!data.businessName?.trim()) {
        setError("Please enter the name of your business.");
        return false;
      }

      if (!data.businessLocation?.trim()) {
        setError("Please enter the business location.");
        return false;
      }

      if (!data.ownershipType) {
        setError("Please select whether the business owner is an Individual or has a Partner.");
        return false;
      }

      const cost = Number(data.projectCost);
      if (!data.projectCost || !Number.isFinite(cost) || cost <= 0) {
        setError("Please enter a valid estimated project cost.");
        return false;
      }
    } else if (data.purpose === "education") {
      if (!data.educationLevel) {
        setError("Please select your education level.");
        return false;
      }

      const cost = Number(data.projectCost);
      if (!data.projectCost || !Number.isFinite(cost) || cost <= 0) {
        setError("Please enter your estimated course fee / required loan amount.");
        return false;
      }

      const income = Number(data.annualIncome);
      if (!data.annualIncome || !Number.isFinite(income) || income < 0) {
        setError("Please enter your annual family income.");
        return false;
      }
    }

    return true;
  };

  const nextStep = () => {
    if (step === 0) {
      if (!validateVerification()) {
        setTimeout(() => {
          const banner = document.getElementById("step01-bottom-error");
          if (banner) {
            banner.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 50);
        return;
      }

      resetMessages();
      setStep(1);
      scrollToTop();
      return;
    }
  };

  const previousStep = () => {
    resetMessages();

    setStep((current) =>
      Math.max(current - 1, 0)
    );
    scrollToTop();
  };

  const onSubmit = async (
    event?: FormEvent
  ) => {
    event?.preventDefault();

    resetMessages();

    if (!validateVerification()) {
      setStep(0);
      return;
    }

    if (!validateScheme()) {
      setStep(1);
      return;
    }

    setSubmitting(true);

    const finalProfile: Profile = {
      state: data.state,
      district: data.district,
      age: Number(data.age) || 28,
      purpose: (data.purpose || "business") as Profile["purpose"],
      activityType: data.businessType || data.activityType || (data.purpose === "education" ? "Higher Education" : "Small Enterprise"),
      projectCost: Number(data.projectCost) || 0,
      annualIncome: Number(data.annualIncome) || 250000,
      educationLevel: (data.educationLevel || "graduate") as Profile["educationLevel"],
      courseLocation: (data.courseLocation || "india") as Profile["courseLocation"],
      fullName: data.fullName,
      contactNo: data.contactNo,
      email: data.email,
      dob: data.dob,
      aadhaar: data.aadhaar,
      pan: data.pan,
      currentAddress: data.currentAddress,
      permanentAddress: data.sameAsPermanent ? data.currentAddress : data.permanentAddress,
      sameAsPermanent: data.sameAsPermanent,
      category: data.category,
      businessType: data.businessType,
      businessName: data.businessName,
      businessLocation: data.businessLocation,
      udyamNo: data.udyamNo,
      gstinNo: data.gstinNo,
      ownershipType: data.ownershipType,
    };

    try {
      const groqKey =
        typeof window !== "undefined"
          ? localStorage.getItem(
              "groq-api-key"
            ) || ""
          : "";

      const response = await fetch(
        "/api/recommend",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...finalProfile,
            earningStatus:
              data.earningStatus,
            assessmentPurpose:
              data.assessmentPurpose,
            amountNeeded:
              data.amountNeeded
                ? Number(data.amountNeeded)
                : undefined,
            repaymentPlan:
              data.repaymentPlan,
            guarantor:
              data.guarantor,
            securityDetails:
              data.securityDetails,
            verificationMethod:
              data.verificationMethod,
            verificationComplete:
              data.verificationComplete,
            apiKey: groqKey,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Could not compute recommendation."
        );
      }

      const json =
        await response.json();

      if (!json?.recommendation) {
        throw new Error(
          "No recommendation was returned."
        );
      }

      setJourney({
        profile: finalProfile,
        recommendation:
          json.recommendation,
      });

      router.push("/recommendation");
    } catch {
      setError(
        "Failed to generate your scheme recommendation. Please check your network and try again."
      );

      setSubmitting(false);
    }
  };

  const currentStep = STEPS[step];

  return (
    <main className="min-h-screen bg-[#EEF3F8] text-[#102A43] dark:bg-[#0B1118] dark:text-[#F1F5F9]">
      {/* =====================================================
          PAGE HEADER
          ===================================================== */}
      <section className="border-b border-[#DCE4EC] bg-[#F8FAFC] dark:border-[#263445] dark:bg-[#0F1722]">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#1769D2]">
                NIRVAAN
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight text-[#102A43] dark:text-white sm:text-4xl">
                Start My Journey
              </h1>

              <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-[#607086] dark:text-[#A8B5C5]">
                Complete verification and provide your
                financial or assessment details so NIRVAAN
                can guide you toward suitable government
                scheme options.
              </p>
            </div>

            <div className="border-l-2 border-[#F47B20] pl-4">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#7A8797] dark:text-[#94A3B8]">
                Current stage
              </p>

              <p className="mt-1 text-sm font-extrabold text-[#102A43] dark:text-white">
                {currentStep.number}{" "}
                {currentStep.title}
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          JOURNEY STEPPER
          ===================================================== */}
      <section className="border-b border-[#DCE4EC] bg-[#F8FAFC] dark:border-[#263445] dark:bg-[#0F1722]">
        <div className="mx-auto max-w-7xl px-5 py-5 sm:px-8 lg:px-10">

          <div className="grid gap-px border border-[#D5DEE8] bg-[#D5DEE8] dark:border-[#263445] dark:bg-[#263445] md:grid-cols-4">

            {STEPS.map((item, index) => {
              const active =
                index === step;

              const completed =
                index < step;

              return (
                <div
                  key={item.number}
                  className={`relative bg-white px-4 py-4 dark:bg-[#111923] ${
                    active
                      ? "bg-[#F8FBFF] dark:bg-[#132033]"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-3">

                    <span
                      className={`flex h-8 w-8 flex-none items-center justify-center border text-[10px] font-black ${
                        active
                          ? "border-[#1769D2] bg-[#1769D2] text-white"
                          : completed
                            ? "border-[#0E2A4A] bg-[#0E2A4A] text-white"
                            : "border-[#C9D5E1] bg-white text-[#708095] dark:border-[#405064] dark:bg-[#17212D] dark:text-[#A8B5C5]"
                      }`}
                    >
                      {completed
                        ? "✓"
                        : item.number}
                    </span>

                    <div className="min-w-0">

                      <p
                        className={`text-xs font-extrabold ${
                          active
                            ? "text-[#1769D2]"
                            : "text-[#334A61] dark:text-[#D5DEE8]"
                        }`}
                      >
                        {item.title}
                      </p>

                      <p className="mt-1 hidden text-[10px] font-medium leading-4 text-[#7A8797] dark:text-[#94A3B8] lg:block">
                        {item.description}
                      </p>

                    </div>
                  </div>
                </div>
              );
            })}

          </div>
        </div>
      </section>

      {/* =====================================================
          FORM AREA
          ===================================================== */}
      <section className="px-5 py-8 font-sans sm:px-8 sm:py-10 lg:px-10">
        <div className="mx-auto max-w-7xl">

          <div className="border border-[#B8C6D6] bg-[#F8FAFC] dark:border-[#263445] dark:bg-[#111923]">
            {/* =====================================================
                STEP 01: USER DETAILS
                ===================================================== */}
            {step === 0 ? (
              <div>
                <div className="border-b border-[#DCE4EC] px-5 py-5 sm:px-7 dark:border-[#263445]">
                  <div className="flex items-start gap-4">
                    <span className="flex h-10 w-10 flex-none items-center justify-center bg-[#1769D2] text-xs font-black text-white">
                      01
                    </span>

                    <div>
                      <h2 className="text-xl font-black text-[#102A43] dark:text-white">
                        User details
                      </h2>

                      <p className="mt-1 text-sm leading-6 text-[#64748B] dark:text-[#A8B5C5]">
                        Provide your personal identity, contact, residential, and
                        category information to begin your assistance journey.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-7 p-5 sm:p-7">
                  {/* Step 01 Top Alerts */}
                  {error ? (
                    <div className="border border-[#D68A8A] bg-[#FFF1F1] px-5 py-4 dark:border-[#743737] dark:bg-[#2A1515]">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#A32929] dark:text-[#F28B8B]">
                            Action Required to Continue
                          </p>
                          <p className="mt-1 text-sm font-medium leading-6 text-[#713333] dark:text-[#E7B1B1]">
                            {error}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleDigiLockerFetch}
                          className="flex-none self-start sm:self-auto rounded bg-[#1769D2] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#0F5DBD]"
                        >
                          ⚡ Auto-fill Demo Details
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {notice ? (
                    <div className="border border-[#86B99A] bg-[#ECF8F0] px-5 py-4 dark:border-[#28633C] dark:bg-[#10271A]">
                      <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#176B37] dark:text-[#7BE2A0]">
                        Notice
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[#315B42] dark:text-[#B7E5C6]">
                        {notice}
                      </p>
                    </div>
                  ) : null}

                  {/* =====================================================
                      DIGILOCKER INTEGRATION
                      ===================================================== */}
                  <div className="border border-[#CBD5E1] bg-white p-6 shadow-sm dark:border-[#344457] dark:bg-[#111923]">
                    {/* DigiLocker Button */}
                    <button
                      type="button"
                      onClick={handleDigiLockerFetch}
                      disabled={fetchingDigiLocker}
                      className="group relative flex w-full items-center justify-between rounded-2xl border-2 border-[#7DD3FC] bg-[#D7EEFD] px-5 py-3.5 sm:px-6 sm:py-4 shadow-sm transition-all hover:border-[#38BDF8] hover:bg-[#C2E5F9] hover:shadow active:scale-[0.99] disabled:cursor-wait disabled:opacity-75 dark:border-[#1E40AF] dark:bg-[#0D223A] dark:hover:bg-[#122F50]"
                    >
                      {/* Left: DigiLocker Logo */}
                      <div className="flex flex-col items-center flex-none">
                        <img
                          src="/digilocker-icon.png"
                          alt="DigiLocker"
                          className="h-10 w-10 sm:h-11 sm:w-11 object-contain"
                        />
                        <span className="mt-0.5 text-[10px] font-bold tracking-tight text-[#5B37EB] dark:text-[#9382FF]">
                          DigiLocker
                        </span>
                      </div>

                      {/* Center: Main text */}
                      <div className="flex-1 px-3 sm:px-4 text-center">
                        <span className="text-base sm:text-xl font-black text-[#0F172A] dark:text-white">
                          {fetchingDigiLocker
                            ? "Connecting to DigiLocker..."
                            : "Continue with DigiLocker"}
                        </span>
                        <p className="mt-0.5 text-[11px] font-semibold text-[#0369A1] dark:text-[#7DD3FC]">
                          Fetch verified identity details with DigiLocker
                        </p>
                      </div>

                      {/* Right: Arrow */}
                      <div className="flex h-10 w-10 flex-none items-center justify-center text-2xl font-black text-[#0F172A] transition group-hover:translate-x-1 dark:text-white">
                        {fetchingDigiLocker ? "⏳" : "→"}
                      </div>
                    </button>

                    {/* Divider with 'or' */}
                    <div className="relative mt-6 flex items-center justify-center">
                      <div className="w-full border-t border-[#CBD5E1] dark:border-[#344457]" />
                      <span className="bg-white px-4 text-xs font-bold uppercase tracking-widest text-[#64748B] dark:bg-[#111923] dark:text-[#94A3B8]">
                        or
                      </span>
                      <div className="w-full border-t border-[#CBD5E1] dark:border-[#344457]" />
                    </div>
                  </div>

                  {/* =====================================================
                      PERSONAL & CONTACT IDENTIFIERS
                      ===================================================== */}
                  <div className="border border-[#CBD5E1] dark:border-[#344457]">
                    <div className="border-b border-[#DCE4EC] bg-[#EAF0F6] px-5 py-4 dark:border-[#263445] dark:bg-[#17212D]">
                      <h3 className="text-sm font-black uppercase tracking-[0.08em] text-[#102A43] dark:text-white">
                        Personal & Contact Information
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-[#64748B] dark:text-[#A8B5C5]">
                        Enter your legal identity and communication details.
                      </p>
                    </div>

                    <div className="space-y-5 p-5">
                      {/* 1. Full Name (as per aadhar card) */}
                      <div>
                        <label
                          htmlFor="fullName"
                          className="mb-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-[#334155] dark:text-[#CBD5E1]"
                        >
                          Full Name (as per Aadhaar card) <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="fullName"
                          type="text"
                          value={data.fullName}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            update("fullName", e.target.value)
                          }
                          placeholder="eg.xyz"
                          className="w-full border border-[#C8D4E1] bg-[#F8FAFC] px-4 py-3 text-sm font-medium text-[#1F2937] outline-none transition focus:border-[#1769D2] focus:ring-1 focus:ring-[#1769D2] dark:border-[#344457] dark:bg-[#0B1118] dark:text-[#F1F5F9] dark:placeholder:text-[#64748B]"
                        />
                      </div>

                      {/* 2. Contact No. and Email Address */}
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <label
                            htmlFor="contactNo"
                            className="mb-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-[#334155] dark:text-[#CBD5E1]"
                          >
                            Contact Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="contactNo"
                            type="tel"
                            maxLength={10}
                            value={data.contactNo}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              update("contactNo", e.target.value.replace(/\D/g, ""))
                            }
                            placeholder="10-digit mobile number"
                            className="w-full border border-[#C8D4E1] bg-[#F8FAFC] px-4 py-3 text-sm font-medium text-[#1F2937] outline-none transition focus:border-[#1769D2] focus:ring-1 focus:ring-[#1769D2] dark:border-[#344457] dark:bg-[#0B1118] dark:text-[#F1F5F9] dark:placeholder:text-[#64748B]"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="email"
                            className="mb-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-[#334155] dark:text-[#CBD5E1]"
                          >
                            Email Address <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              update("email", e.target.value)
                            }
                            placeholder="e.g. name@example.com"
                            className="w-full border border-[#C8D4E1] bg-[#F8FAFC] px-4 py-3 text-sm font-medium text-[#1F2937] outline-none transition focus:border-[#1769D2] focus:ring-1 focus:ring-[#1769D2] dark:border-[#344457] dark:bg-[#0B1118] dark:text-[#F1F5F9] dark:placeholder:text-[#64748B]"
                          />
                        </div>
                      </div>

                      {/* 3. Date of Birth Calendar with Live Age Calculation */}
                      <div>
                        <label
                          htmlFor="dob"
                          className="mb-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-[#334155] dark:text-[#CBD5E1]"
                        >
                          Date of Birth <span className="text-red-500">*</span>
                        </label>
                        <div className="grid gap-4 sm:grid-cols-2 sm:items-center">
                          <input
                            id="dob"
                            type="date"
                            max={new Date().toISOString().split("T")[0]}
                            value={data.dob}
                            onChange={handleDobChange}
                            className="w-full border border-[#C8D4E1] bg-[#F8FAFC] px-4 py-3 text-sm font-medium text-[#1F2937] outline-none transition focus:border-[#1769D2] focus:ring-1 focus:ring-[#1769D2] dark:border-[#344457] dark:bg-[#0B1118] dark:text-[#F1F5F9]"
                          />

                          <div className="flex items-center gap-3">
                            <span className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#64748B] dark:text-[#A8B5C5]">
                              Calculated Age:
                            </span>
                            {data.age ? (
                              <span
                                className={`inline-flex items-center px-3 py-1.5 text-xs font-black rounded ${
                                  Number(data.age) >= 18
                                    ? "bg-[#ECF8F0] text-[#176B37] border border-[#86B99A] dark:bg-[#10271A] dark:text-[#7BE2A0] dark:border-[#28633C]"
                                    : "bg-[#FFF0F0] text-[#C5221F] border border-[#FCA5A5] dark:bg-[#2A1111] dark:text-[#F87171] dark:border-[#7F1D1D]"
                                }`}
                              >
                                {data.age} years old{" "}
                                {Number(data.age) >= 18 ? "✓" : "(Must be 18+)"}
                              </span>
                            ) : (
                              <span className="text-xs text-[#94A3B8] italic">
                                Select date to compute age
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* =====================================================
                      4. AADHAAR NUMBER & PROTOTYPE OTP SIMULATION (THE GATE)
                      ===================================================== */}
                  <div className="border border-[#CBD5E1] dark:border-[#344457]">
                    <div className="border-b border-[#DCE4EC] bg-[#EAF0F6] px-5 py-4 dark:border-[#263445] dark:bg-[#17212D]">
                      <h3 className="text-sm font-black uppercase tracking-[0.08em] text-[#102A43] dark:text-white">
                        Aadhaar Identity Verification
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-[#64748B] dark:text-[#A8B5C5]">
                        Enter your Aadhaar number and verify the prototype OTP to proceed below.
                      </p>
                    </div>

                    <div className="space-y-5 p-5">
                      <div>
                        <label
                          htmlFor="aadhaar"
                          className="mb-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-[#334155] dark:text-[#CBD5E1]"
                        >
                          Aadhaar Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="aadhaar"
                          type="text"
                          maxLength={12}
                          disabled={data.verificationComplete}
                          value={data.aadhaar}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            const val = e.target.value.replace(/\D/g, "");
                            setData((current) => ({
                              ...current,
                              aadhaar: val,
                              verificationValue: val,
                              verificationComplete: false,
                              otpSent: false,
                            }));
                          }}
                          placeholder="Enter 12-digit Aadhaar number"
                          className="w-full border border-[#C8D4E1] bg-[#F8FAFC] px-4 py-3 text-sm font-medium text-[#1F2937] outline-none transition focus:border-[#1769D2] focus:ring-1 focus:ring-[#1769D2] disabled:bg-[#F1F5F9] dark:border-[#344457] dark:bg-[#0B1118] dark:text-[#F1F5F9] dark:placeholder:text-[#64748B] dark:disabled:bg-[#17212D]"
                        />
                      </div>

                      {!data.verificationComplete ? (
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                          <button
                            type="button"
                            onClick={sendAadhaarOtp}
                            disabled={
                              sendingOtp ||
                              data.aadhaar.replace(/\D/g, "").length !== 12
                            }
                            className="border border-[#1769D2] bg-[#1769D2] px-5 py-3 text-xs font-extrabold uppercase tracking-[0.08em] text-white transition hover:bg-[#0F5DBD] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {sendingOtp
                              ? "Dispatching..."
                              : data.otpSent
                                ? "Resend OTP"
                                : "Send OTP"}
                          </button>
                          {data.otpSent ? (
                            <span className="text-xs font-medium text-[#1769D2] dark:text-[#60A5FA]">
                              OTP dispatched! View simulated code below.
                            </span>
                          ) : (
                            <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                              Enter 12 digits to request OTP simulation
                            </span>
                          )}
                        </div>
                      ) : null}

                      {/* Prototype Simulation Banner */}
                      {data.otpSent && !data.verificationComplete ? (
                        <div className="border border-[#1769D2]/30 bg-[#E5F0FC] p-4 text-xs dark:border-[#1769D2]/40 dark:bg-[#132033]">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="font-extrabold uppercase tracking-[0.08em] text-[#1769D2] dark:text-[#60A5FA]">
                                Prototype Simulated OTP Dispatched
                              </p>
                              <p className="mt-1 text-xs text-[#334155] dark:text-[#CBD5E1]">
                                Mobile linked to Aadhaar:
                                <span className="ml-2 font-mono font-black text-sm text-[#102A43] dark:text-white bg-white dark:bg-[#0B1118] px-2 py-0.5 border border-[#B8C6D6] dark:border-[#344457]">
                                  {data.generatedOtp}
                                </span>
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => update("otp", data.generatedOtp)}
                              className="inline-flex items-center justify-center border border-[#1769D2] bg-white px-3 py-1.5 text-xs font-bold text-[#1769D2] transition hover:bg-[#1769D2] hover:text-white dark:bg-[#0B1118] dark:text-[#60A5FA]"
                            >
                              Auto-fill OTP
                            </button>
                          </div>
                        </div>
                      ) : null}

                      {/* OTP Input & Verify */}
                      {data.otpSent && !data.verificationComplete ? (
                        <div>
                          <label
                            htmlFor="otp"
                            className="mb-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-[#334155] dark:text-[#CBD5E1]"
                          >
                            Enter Verification OTP
                          </label>
                          <div className="flex flex-col gap-3 sm:flex-row">
                            <input
                              id="otp"
                              type="text"
                              inputMode="numeric"
                              maxLength={6}
                              value={data.otp}
                              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                update("otp", e.target.value.replace(/\D/g, ""))
                              }
                              placeholder="Enter 6-digit OTP"
                              className="w-full border border-[#C8D4E1] bg-[#F8FAFC] px-4 py-3 text-sm font-medium text-[#1F2937] outline-none transition focus:border-[#1769D2] focus:ring-1 focus:ring-[#1769D2] dark:border-[#344457] dark:bg-[#0B1118] dark:text-[#F1F5F9]"
                            />
                            <button
                              type="button"
                              onClick={verifyAadhaarOtp}
                              disabled={verifyingOtp || !data.otp.trim()}
                              className="border border-[#0E2A4A] bg-[#0E2A4A] px-6 py-3 text-xs font-extrabold uppercase tracking-[0.08em] text-white transition hover:bg-[#16395F] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {verifyingOtp ? "Verifying..." : "Verify OTP"}
                            </button>
                          </div>
                        </div>
                      ) : null}

                      {/* Verification Successful Indicator */}
                      {data.verificationComplete ? (
                        <div className="border border-[#86B99A] bg-[#ECF8F0] px-4 py-3 text-xs dark:border-[#28633C] dark:bg-[#10271A]">
                          <p className="font-extrabold uppercase tracking-[0.08em] text-[#176B37] dark:text-[#7BE2A0]">
                            ✓ Aadhaar Verified (Prototype Simulation)
                          </p>
                          <p className="mt-1 text-xs text-[#315B42] dark:text-[#B7E5C6]">
                            Identity confirmed successfully. You can now complete your PAN, residential address, and category details below.
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* =====================================================
                      LOCKED GATE NOTICE (IF AADHAAR OTP NOT VERIFIED)
                      ===================================================== */}
                  {!data.verificationComplete ? (
                    <div className="border border-dashed border-[#CBD5E1] bg-[#F1F5F9]/70 p-6 text-center dark:border-[#344457] dark:bg-[#0B1118]/70">
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#E2E8F0] text-sm text-[#475569] dark:bg-[#1E293B] dark:text-[#94A3B8]">
                        🔒
                      </div>
                      <h4 className="mt-2 text-sm font-extrabold text-[#1E293B] dark:text-white">
                        Remaining Details Locked
                      </h4>
                      <p className="mt-1 text-xs text-[#64748B] dark:text-[#94A3B8] max-w-md mx-auto">
                        Please enter your 12-digit Aadhaar number and complete the simulated OTP verification above to proceed below.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* =====================================================
                          5. PAN CARD NUMBER
                          ===================================================== */}
                      <div className="border border-[#CBD5E1] dark:border-[#344457]">
                        <div className="border-b border-[#DCE4EC] bg-[#EAF0F6] px-5 py-4 dark:border-[#263445] dark:bg-[#17212D]">
                          <h3 className="text-sm font-black uppercase tracking-[0.08em] text-[#102A43] dark:text-white">
                            Tax & Financial Identification
                          </h3>
                          <p className="mt-1 text-xs leading-5 text-[#64748B] dark:text-[#A8B5C5]">
                            Provide your Permanent Account Number (PAN).
                          </p>
                        </div>

                        <div className="p-5">
                          <label
                            htmlFor="pan"
                            className="mb-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-[#334155] dark:text-[#CBD5E1]"
                          >
                            PAN Card Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="pan"
                            type="text"
                            maxLength={10}
                            value={data.pan}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              update("pan", e.target.value.toUpperCase())
                            }
                            placeholder="e.g. ABCDE1234F"
                            className="w-full border border-[#C8D4E1] bg-[#F8FAFC] px-4 py-3 text-sm font-medium text-[#1F2937] uppercase tracking-wider outline-none transition focus:border-[#1769D2] focus:ring-1 focus:ring-[#1769D2] dark:border-[#344457] dark:bg-[#0B1118] dark:text-[#F1F5F9] dark:placeholder:text-[#64748B]"
                          />
                        </div>
                      </div>

                      {/* =====================================================
                          6. RESIDENTIAL ADDRESS (CURRENT & PERMANENT + BLACKOUT)
                          ===================================================== */}
                      <div className="border border-[#CBD5E1] dark:border-[#344457]">
                        <div className="border-b border-[#DCE4EC] bg-[#EAF0F6] px-5 py-4 dark:border-[#263445] dark:bg-[#17212D]">
                          <h3 className="text-sm font-black uppercase tracking-[0.08em] text-[#102A43] dark:text-white">
                            Residential Address Details
                          </h3>
                          <p className="mt-1 text-xs leading-5 text-[#64748B] dark:text-[#A8B5C5]">
                            Provide current residence and permanent residential address.
                          </p>
                        </div>

                        <div className="space-y-6 p-5">
                          {/* Current Residential Address */}
                          <div className="border border-[#CBD5E1] p-5 dark:border-[#344457]">
                            <div className="mb-3">
                              <h4 className="text-xs font-black uppercase tracking-[0.08em] text-[#102A43] dark:text-white">
                                Current Residential Address <span className="text-red-500">*</span>
                              </h4>
                              <p className="mt-1 text-xs text-[#64748B] dark:text-[#A8B5C5]">
                                Enter the address where you currently reside.
                              </p>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <label
                                  htmlFor="currentAddress"
                                  className="mb-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-[#334155] dark:text-[#CBD5E1]"
                                >
                                  Address Line (Flat/House No., Street, Locality)
                                </label>
                                <textarea
                                  id="currentAddress"
                                  rows={3}
                                  value={data.currentAddress}
                                  onChange={handleCurrentAddressChange}
                                  placeholder="Enter your street address, premises, landmark..."
                                  className="w-full border border-[#C8D4E1] bg-[#F8FAFC] px-4 py-3 text-sm font-medium text-[#1F2937] outline-none transition focus:border-[#1769D2] focus:ring-1 focus:ring-[#1769D2] dark:border-[#344457] dark:bg-[#0B1118] dark:text-[#F1F5F9] dark:placeholder:text-[#64748B]"
                                />
                              </div>

                              <div className="grid gap-4 sm:grid-cols-3">
                                <div>
                                  <label
                                    htmlFor="state"
                                    className="mb-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-[#334155] dark:text-[#CBD5E1]"
                                  >
                                    State <span className="text-red-500">*</span>
                                  </label>
                                  <select
                                    id="state"
                                    value={data.state}
                                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                                      setData((current) => ({
                                        ...current,
                                        state: e.target.value,
                                        district: "",
                                      }))
                                    }
                                    className="w-full border border-[#C8D4E1] bg-[#F8FAFC] px-4 py-3 text-sm font-medium text-[#1F2937] outline-none focus:border-[#1769D2] focus:ring-1 focus:ring-[#1769D2] dark:border-[#344457] dark:bg-[#0B1118] dark:text-[#F1F5F9]"
                                  >
                                    <option value="">Select state</option>
                                    {stateList.map((st) => (
                                      <option key={st} value={st}>
                                        {st}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div>
                                  <label
                                    htmlFor="district"
                                    className="mb-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-[#334155] dark:text-[#CBD5E1]"
                                  >
                                    District <span className="text-red-500">*</span>
                                  </label>
                                  <select
                                    id="district"
                                    value={data.district}
                                    disabled={!data.state}
                                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                                      update("district", e.target.value)
                                    }
                                    className="w-full border border-[#C8D4E1] bg-[#F8FAFC] px-4 py-3 text-sm font-medium text-[#1F2937] outline-none focus:border-[#1769D2] focus:ring-1 focus:ring-[#1769D2] disabled:bg-[#F1F5F9] dark:border-[#344457] dark:bg-[#0B1118] dark:text-[#F1F5F9] dark:disabled:bg-[#17212D]"
                                  >
                                    <option value="">
                                      {data.state
                                        ? "Select district"
                                        : "Select state first"}
                                    </option>
                                    {districtList.map((dist) => (
                                      <option key={dist} value={dist}>
                                        {dist}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div>
                                  <label
                                    htmlFor="pincode"
                                    className="mb-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-[#334155] dark:text-[#CBD5E1]"
                                  >
                                    PIN Code
                                  </label>
                                  <input
                                    id="pincode"
                                    type="text"
                                    maxLength={6}
                                    value={data.pincode}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                      update("pincode", e.target.value.replace(/\D/g, ""))
                                    }
                                    placeholder="6-digit PIN"
                                    className="w-full border border-[#C8D4E1] bg-[#F8FAFC] px-4 py-3 text-sm font-medium text-[#1F2937] outline-none transition focus:border-[#1769D2] focus:ring-1 focus:ring-[#1769D2] dark:border-[#344457] dark:bg-[#0B1118] dark:text-[#F1F5F9]"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Option (tickbox) to keep current address as permanent */}
                          <div className="border border-[#CBD5E1] bg-[#F8FAFC] p-4 dark:border-[#344457] dark:bg-[#0F1722]">
                            <label className="flex items-center gap-3 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                id="sameAsPermanent"
                                checked={data.sameAsPermanent}
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                  handleSameAddressToggle(e.target.checked)
                                }
                                className="h-4 w-4 rounded border-[#B8C6D6] text-[#1769D2] focus:ring-[#1769D2]"
                              />
                              <span className="text-sm font-bold text-[#102A43] dark:text-white">
                                Keep current address as permanent address
                              </span>
                            </label>
                          </div>

                          {/* Permanent Address */}
                          <div
                            className={`border border-[#CBD5E1] p-5 transition-all dark:border-[#344457] ${
                              data.sameAsPermanent
                                ? "bg-[#F1F5F9]/90 dark:bg-[#111923]/70"
                                : ""
                            }`}
                          >
                            <div className="mb-3">
                              <h4 className="text-xs font-black uppercase tracking-[0.08em] text-[#102A43] dark:text-white">
                                Permanent Address{" "}
                                {!data.sameAsPermanent ? (
                                  <span className="text-red-500">*</span>
                                ) : null}
                              </h4>
                              <p className="mt-1 text-xs text-[#64748B] dark:text-[#A8B5C5]">
                                {data.sameAsPermanent
                                  ? "Already set as current residential address (cannot be edited while box is ticked)."
                                  : "Enter your official permanent address if different."}
                              </p>
                            </div>

                            <div>
                              <label
                                htmlFor="permanentAddress"
                                className="mb-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-[#334155] dark:text-[#CBD5E1]"
                              >
                                Address Line (Permanent)
                              </label>
                              <textarea
                                id="permanentAddress"
                                rows={3}
                                disabled={data.sameAsPermanent}
                                value={
                                  data.sameAsPermanent
                                    ? (data.currentAddress
                                        ? `${data.currentAddress}${data.district ? `, ${data.district}` : ""}${data.state ? `, ${data.state}` : ""}${data.pincode ? ` - ${data.pincode}` : ""}`
                                        : "")
                                    : data.permanentAddress
                                }
                                onChange={(
                                  e: ChangeEvent<HTMLTextAreaElement>
                                ) => update("permanentAddress", e.target.value)}
                                placeholder={
                                  data.sameAsPermanent
                                    ? "Set to current residential address"
                                    : "Enter your permanent address, street, locality, district, state..."
                                }
                                className={`w-full border p-3 text-sm font-medium outline-none transition ${
                                  data.sameAsPermanent
                                    ? "cursor-not-allowed border-[#CBD5E1] bg-[#E2E8F0] text-[#64748B] select-none dark:border-[#334155] dark:bg-[#1A2433] dark:text-[#94A3B8]"
                                    : "border-[#C8D4E1] bg-[#F8FAFC] text-[#1F2937] focus:border-[#1769D2] focus:ring-1 focus:ring-[#1769D2] dark:border-[#344457] dark:bg-[#0B1118] dark:text-[#F1F5F9] dark:placeholder:text-[#64748B]"
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* =====================================================
                          7. CATEGORY SELECTION (BOXED SELECT ONE)
                          ===================================================== */}
                      <div className="border border-[#CBD5E1] dark:border-[#344457]">
                        <div className="border-b border-[#DCE4EC] bg-[#EAF0F6] px-5 py-4 dark:border-[#263445] dark:bg-[#17212D]">
                          <h3 className="text-sm font-black uppercase tracking-[0.08em] text-[#102A43] dark:text-white">
                            Category Selection <span className="text-red-500">*</span>
                          </h3>
                          <p className="mt-1 text-xs leading-5 text-[#64748B] dark:text-[#A8B5C5]">
                            Select your social category from the boxed options below to proceed.
                          </p>
                        </div>

                        <div className="p-5">
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                            {CATEGORIES.map((cat) => {
                              const selected = data.category === cat.id;
                              return (
                                <button
                                  key={cat.id}
                                  type="button"
                                  onClick={() => {
                                    update("category", cat.id);
                                    resetMessages();
                                  }}
                                  className={`border p-4 text-left transition relative flex flex-col justify-between ${
                                    selected
                                      ? "border-[#1769D2] bg-[#E5F0FC] shadow-sm dark:border-[#1769D2] dark:bg-[#132033]"
                                      : "border-[#B8C6D6] bg-[#F8FAFC] hover:bg-[#EAF0F6] dark:border-[#344457] dark:bg-[#0F1722] dark:hover:bg-[#17212D]"
                                  }`}
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <span className="text-sm font-extrabold text-[#102A43] dark:text-white">
                                      {cat.label}
                                    </span>
                                    <span
                                      className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black ${
                                        selected
                                          ? "bg-[#1769D2] text-white"
                                          : "border border-[#CBD5E1] text-transparent dark:border-[#475569]"
                                      }`}
                                    >
                                      ✓
                                    </span>
                                  </div>
                                  <p className="mt-2 text-[11px] leading-4 text-[#64748B] dark:text-[#A8B5C5]">
                                    {cat.desc}
                                  </p>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* =====================================================
                      INFORMATION NOTICE
                      ===================================================== */}
                  <div className="border border-[#E9B36A] bg-[#FFF8EC] px-5 py-4 dark:border-[#8A5A1E] dark:bg-[#2A1D0D]">
                    <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#A65A00] dark:text-[#F5B45B]">
                      Important
                    </p>

                    <p className="mt-1 text-sm leading-6 text-[#76511F] dark:text-[#E5C58F]">
                      Please ensure that all personal, identification, residential, and
                      category information provided above is accurate. It will be used to
                      determine the appropriate assistance journey and calculate eligible scheme
                      options.
                    </p>
                  </div>

                  {/* =====================================================
                      STEP 01 BOTTOM ERROR ALERT
                      ===================================================== */}
                  {error ? (
                    <div
                      id="step01-bottom-error"
                      className="border border-[#D68A8A] bg-[#FFF1F1] px-5 py-4 dark:border-[#743737] dark:bg-[#2A1515]"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#A32929] dark:text-[#F28B8B]">
                            Please complete required details to continue
                          </p>
                          <p className="mt-1 text-sm font-medium leading-6 text-[#713333] dark:text-[#E7B1B1]">
                            {error}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            handleDigiLockerFetch();
                            setTimeout(() => {
                              resetMessages();
                              setStep(1);
                              scrollToTop();
                            }, 700);
                          }}
                          className="flex-none self-start sm:self-auto rounded bg-[#1769D2] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#0F5DBD]"
                        >
                          ⚡ Auto-fill & Continue to Step 02
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {/* =====================================================
                      STEP CONTROL
                      ===================================================== */}
                  <div className="flex flex-col gap-3 border-t border-[#DCE4EC] bg-[#F8FAFC] px-5 py-5 dark:border-[#263445] dark:bg-[#17212D] sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      onClick={previousStep}
                      disabled={step === 0}
                      className="border border-[#B8C6D6] bg-[#F8FAFC] px-5 py-3 text-xs font-extrabold uppercase tracking-[0.08em] text-[#334155] transition hover:bg-[#EAF0F6] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#344457] dark:bg-[#0F1722] dark:text-[#CBD5E1] dark:hover:bg-[#1A2633]"
                    >
                      Back
                    </button>

                    <button
                      type="button"
                      onClick={nextStep}
                      className="border border-[#1769D2] bg-[#1769D2] px-6 py-3 text-xs font-extrabold uppercase tracking-[0.08em] text-white transition hover:bg-[#0F5DBD]"
                    >
                      Continue to Smart Scheme Recommender
                    </button>
                  </div>

                </div>
              </div>
            ) : null}

          {/* =====================================================
              STEP 02: SMART SCHEME RECOMMENDER
              ===================================================== */}
          {step === 1 ? (
            <div>
              <div className="border-b border-[#DCE4EC] px-5 py-5 sm:px-7 dark:border-[#263445]">
                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 flex-none items-center justify-center bg-[#1769D2] text-xs font-black text-white">
                    02
                  </span>

                  <div>
                    <h2 className="text-xl font-black text-[#102A43] dark:text-white">
                      Smart Scheme Recommender
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-[#64748B] dark:text-[#A8B5C5]">
                      Select whether you are seeking loan assistance as an Entrepreneur or for Education to discover matching government schemes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-7 p-5 sm:p-7">

                {/* =====================================================
                    ASSISTANCE CATEGORY SELECTION
                    ===================================================== */}
                <div className="border border-[#CBD5E1] dark:border-[#344457]">
                  <div className="border-b border-[#DCE4EC] bg-[#EAF0F6] px-5 py-4 dark:border-[#263445] dark:bg-[#17212D]">
                    <h3 className="text-sm font-black uppercase tracking-[0.08em] text-[#102A43] dark:text-white">
                      Assistance Category
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-[#64748B] dark:text-[#A8B5C5]">
                      Select the option that best describes your assistance requirements.
                    </p>
                  </div>

                  <div className="grid gap-5 p-5 sm:grid-cols-2">
                    {/* Entrepreneur Button */}
                    <button
                      type="button"
                      onClick={() => {
                        resetMessages();
                        setData((current) => ({
                          ...current,
                          purpose: "business",
                          assessmentPurpose: "small-project",
                          earningStatus: "earning",
                        }));
                      }}
                      className={`group relative flex flex-col justify-between border-2 p-5 text-left transition-all ${
                        data.purpose === "business"
                          ? "border-[#1769D2] bg-[#EAF3FD] shadow-sm dark:border-[#38BDF8] dark:bg-[#10253F]"
                          : "border-[#CBD5E1] bg-white hover:border-[#94A3B8] hover:bg-[#F8FAFC] dark:border-[#344457] dark:bg-[#111923] dark:hover:bg-[#17212D]"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded bg-[#1769D2]/10 text-[#1769D2] dark:bg-[#38BDF8]/20 dark:text-[#38BDF8]">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold ${
                            data.purpose === "business"
                              ? "border-[#1769D2] bg-[#1769D2] text-white"
                              : "border-[#CBD5E1] bg-white dark:border-[#4B5563] dark:bg-[#1F2937]"
                          }`}
                        >
                          {data.purpose === "business" ? "✓" : ""}
                        </span>
                      </div>

                      <div className="mt-4">
                        <p className="text-base font-black text-[#102A43] dark:text-white">
                          Entrepreneur
                        </p>
                        <p className="mt-1 text-xs leading-5 text-[#64748B] dark:text-[#A8B5C5]">
                          Explore loan schemes and capital support for business, startups, MSMEs, and self-employment ventures.
                        </p>
                      </div>
                    </button>

                    {/* Education Button */}
                    <button
                      type="button"
                      onClick={() => {
                        resetMessages();
                        setData((current) => ({
                          ...current,
                          purpose: "education",
                          assessmentPurpose: "education",
                          earningStatus: "non-earning",
                        }));
                      }}
                      className={`group relative flex flex-col justify-between border-2 p-5 text-left transition-all ${
                        data.purpose === "education"
                          ? "border-[#1769D2] bg-[#EAF3FD] shadow-sm dark:border-[#38BDF8] dark:bg-[#10253F]"
                          : "border-[#CBD5E1] bg-white hover:border-[#94A3B8] hover:bg-[#F8FAFC] dark:border-[#344457] dark:bg-[#111923] dark:hover:bg-[#17212D]"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded bg-[#1769D2]/10 text-[#1769D2] dark:bg-[#38BDF8]/20 dark:text-[#38BDF8]">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M12 14l9-5-9-5-9 5 9 5z" />
                            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                          </svg>
                        </div>
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold ${
                            data.purpose === "education"
                              ? "border-[#1769D2] bg-[#1769D2] text-white"
                              : "border-[#CBD5E1] bg-white dark:border-[#4B5563] dark:bg-[#1F2937]"
                          }`}
                        >
                          {data.purpose === "education" ? "✓" : ""}
                        </span>
                      </div>

                      <div className="mt-4">
                        <p className="text-base font-black text-[#102A43] dark:text-white">
                          Education
                        </p>
                        <p className="mt-1 text-xs leading-5 text-[#64748B] dark:text-[#A8B5C5]">
                          Explore educational loan schemes and financial support for higher studies, professional courses, and skill training.
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* =====================================================
                    ENTREPRENEUR CONFIGURATION
                    ===================================================== */}
                {data.purpose === "business" ? (
                  <div className="border border-[#CBD5E1] dark:border-[#344457]">
                    <div className="border-b border-[#DCE4EC] bg-[#EAF0F6] px-5 py-4 dark:border-[#263445] dark:bg-[#17212D]">
                      <h3 className="text-sm font-black uppercase tracking-[0.08em] text-[#102A43] dark:text-white">
                        Entrepreneur & Business Details
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-[#64748B] dark:text-[#A8B5C5]">
                        Provide information about your business enterprise, registration, ownership structure, and estimated project cost.
                      </p>
                    </div>

                    <div className="space-y-6 p-5 sm:p-6">
                      {/* 1. Business Type with dropdown box having all business types */}
                      <div>
                        <label
                          htmlFor="businessType"
                          className="mb-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-[#334155] dark:text-[#CBD5E1]"
                        >
                          Business Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="businessType"
                          value={data.businessType}
                          onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                            update("businessType", e.target.value);
                            update("activityType", e.target.value);
                          }}
                          className="w-full border border-[#C8D4E1] bg-[#F8FAFC] px-4 py-3 text-sm font-medium text-[#1F2937] outline-none transition focus:border-[#1769D2] focus:ring-1 focus:ring-[#1769D2] dark:border-[#344457] dark:bg-[#0B1118] dark:text-[#F1F5F9]"
                        >
                          <option value="">Select business type</option>
                          {BUSINESS_TYPES.map((bt) => (
                            <option key={bt} value={bt}>
                              {bt}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* 2. Name of Business */}
                      <div>
                        <label
                          htmlFor="businessName"
                          className="mb-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-[#334155] dark:text-[#CBD5E1]"
                        >
                          Name of Business <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="businessName"
                          type="text"
                          value={data.businessName}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            update("businessName", e.target.value)
                          }
                          placeholder="Enter name of your business / enterprise (e.g. Acme Enterprises)"
                          className="w-full border border-[#C8D4E1] bg-[#F8FAFC] px-4 py-3 text-sm font-medium text-[#1F2937] outline-none transition focus:border-[#1769D2] focus:ring-1 focus:ring-[#1769D2] dark:border-[#344457] dark:bg-[#0B1118] dark:text-[#F1F5F9] dark:placeholder:text-[#64748B]"
                        />
                      </div>

                      {/* 3. Business Location */}
                      <div>
                        <label
                          htmlFor="businessLocation"
                          className="mb-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-[#334155] dark:text-[#CBD5E1]"
                        >
                          Business Location <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="businessLocation"
                          type="text"
                          value={data.businessLocation}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            update("businessLocation", e.target.value)
                          }
                          placeholder="Enter business address, shop/plot no., market, or city"
                          className="w-full border border-[#C8D4E1] bg-[#F8FAFC] px-4 py-3 text-sm font-medium text-[#1F2937] outline-none transition focus:border-[#1769D2] focus:ring-1 focus:ring-[#1769D2] dark:border-[#344457] dark:bg-[#0B1118] dark:text-[#F1F5F9] dark:placeholder:text-[#64748B]"
                        />
                      </div>

                      {/* 4. Udyam No. or License No. */}
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <label
                            htmlFor="udyamNo"
                            className="block text-xs font-extrabold uppercase tracking-[0.08em] text-[#334155] dark:text-[#CBD5E1]"
                          >
                            Udyam No. or License No.
                          </label>
                          <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                            Optional / If registered
                          </span>
                        </div>
                        <input
                          id="udyamNo"
                          type="text"
                          value={data.udyamNo}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            update("udyamNo", e.target.value.toUpperCase())
                          }
                          placeholder="e.g. UDYAM-MH-12-0012345 or Municipal Trade License No."
                          className="w-full border border-[#C8D4E1] bg-[#F8FAFC] px-4 py-3 text-sm font-medium uppercase tracking-wider text-[#1F2937] outline-none transition focus:border-[#1769D2] focus:ring-1 focus:ring-[#1769D2] dark:border-[#344457] dark:bg-[#0B1118] dark:text-[#F1F5F9] dark:placeholder:text-[#64748B]"
                        />
                        <p className="mt-1.5 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                          Valid MSME Udyam registration unlocks collateral-free interest subsidies.
                        </p>
                      </div>

                      {/* 5. GSTIN No. */}
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <label
                            htmlFor="gstinNo"
                            className="block text-xs font-extrabold uppercase tracking-[0.08em] text-[#334155] dark:text-[#CBD5E1]"
                          >
                            GSTIN No.
                          </label>
                          <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                            Optional
                          </span>
                        </div>
                        <input
                          id="gstinNo"
                          type="text"
                          maxLength={15}
                          value={data.gstinNo}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            update("gstinNo", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))
                          }
                          placeholder="e.g. 27AAAAA0000A1Z5 (15-digit GSTIN)"
                          className="w-full border border-[#C8D4E1] bg-[#F8FAFC] px-4 py-3 text-sm font-medium uppercase tracking-wider text-[#1F2937] outline-none transition focus:border-[#1769D2] focus:ring-1 focus:ring-[#1769D2] dark:border-[#344457] dark:bg-[#0B1118] dark:text-[#F1F5F9] dark:placeholder:text-[#64748B]"
                        />
                      </div>

                      {/* 6. Ownership Structure: Individual or Have Partner */}
                      <div>
                        <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-[#334155] dark:text-[#CBD5E1]">
                          Business Ownership Structure <span className="text-red-500">*</span>
                        </label>
                        <p className="mb-3 text-xs text-[#64748B] dark:text-[#A8B5C5]">
                          Select whether the business owner is an individual or has a partner.
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {/* Individual Option */}
                          <button
                            type="button"
                            onClick={() => update("ownershipType", "individual")}
                            className={`flex items-center justify-between border-2 p-4 text-left transition ${
                              data.ownershipType === "individual"
                                ? "border-[#1769D2] bg-[#EAF3FD] dark:border-[#38BDF8] dark:bg-[#10253F]"
                                : "border-[#CBD5E1] bg-[#F8FAFC] hover:bg-[#EAF0F6] dark:border-[#344457] dark:bg-[#0F1722] dark:hover:bg-[#17212D]"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1769D2]/10 text-[#1769D2] dark:bg-[#38BDF8]/20 dark:text-[#38BDF8]">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm font-extrabold text-[#102A43] dark:text-white">
                                  Individual
                                </p>
                                <p className="text-[11px] text-[#64748B] dark:text-[#A8B5C5]">
                                  Sole Proprietorship / Single Owner
                                </p>
                              </div>
                            </div>
                            <span
                              className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold ${
                                data.ownershipType === "individual"
                                  ? "border-[#1769D2] bg-[#1769D2] text-white"
                                  : "border-[#CBD5E1] bg-white dark:border-[#4B5563] dark:bg-[#1F2937]"
                              }`}
                            >
                              {data.ownershipType === "individual" ? "✓" : ""}
                            </span>
                          </button>

                          {/* Have Partner Option */}
                          <button
                            type="button"
                            onClick={() => update("ownershipType", "partner")}
                            className={`flex items-center justify-between border-2 p-4 text-left transition ${
                              data.ownershipType === "partner"
                                ? "border-[#1769D2] bg-[#EAF3FD] dark:border-[#38BDF8] dark:bg-[#10253F]"
                                : "border-[#CBD5E1] bg-[#F8FAFC] hover:bg-[#EAF0F6] dark:border-[#344457] dark:bg-[#0F1722] dark:hover:bg-[#17212D]"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1769D2]/10 text-[#1769D2] dark:bg-[#38BDF8]/20 dark:text-[#38BDF8]">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm font-extrabold text-[#102A43] dark:text-white">
                                  Have Partner
                                </p>
                                <p className="text-[11px] text-[#64748B] dark:text-[#A8B5C5]">
                                  Partnership Firm / LLP / Co-owned
                                </p>
                              </div>
                            </div>
                            <span
                              className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold ${
                                data.ownershipType === "partner"
                                  ? "border-[#1769D2] bg-[#1769D2] text-white"
                                  : "border-[#CBD5E1] bg-white dark:border-[#4B5563] dark:bg-[#1F2937]"
                              }`}
                            >
                              {data.ownershipType === "partner" ? "✓" : ""}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* 7. Estimated Cost */}
                      <div>
                        <label
                          htmlFor="projectCost"
                          className="mb-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-[#334155] dark:text-[#CBD5E1]"
                        >
                          Estimated Cost / Project Cost (₹) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#64748B] dark:text-[#94A3B8]">
                            ₹
                          </span>
                          <input
                            id="projectCost"
                            type="number"
                            min="0"
                            value={data.projectCost}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              update("projectCost", e.target.value)
                            }
                            placeholder="e.g. 500000"
                            className="w-full border border-[#C8D4E1] bg-[#F8FAFC] py-3 pl-9 pr-4 text-sm font-medium text-[#1F2937] outline-none transition focus:border-[#1769D2] focus:ring-1 focus:ring-[#1769D2] dark:border-[#344457] dark:bg-[#0B1118] dark:text-[#F1F5F9] dark:placeholder:text-[#64748B]"
                          />
                        </div>
                        <div className="mt-2.5 flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                            Quick presets:
                          </span>
                          {[100000, 200000, 500000, 1000000, 2500000].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => update("projectCost", String(preset))}
                              className="rounded border border-[#CBD5E1] bg-white px-2.5 py-1 text-[11px] font-bold text-[#334155] transition hover:border-[#1769D2] hover:bg-[#EAF3FD] hover:text-[#1769D2] dark:border-[#344457] dark:bg-[#111923] dark:text-[#CBD5E1] dark:hover:border-[#38BDF8] dark:hover:text-[#38BDF8]"
                            >
                              {formatINR(preset)}
                            </button>
                          ))}
                        </div>
                        <p className="mt-2 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                          NSFDC Micro Finance supports up to ₹1,40,000; Term Loans support up to ₹50,00,000; Stand-Up India up to ₹1 Crore.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* =====================================================
                    EDUCATION CONFIGURATION
                    ===================================================== */}
                {data.purpose === "education" ? (
                  <div className="border border-[#CBD5E1] dark:border-[#344457]">
                    <div className="border-b border-[#DCE4EC] bg-[#EAF0F6] px-5 py-4 dark:border-[#263445] dark:bg-[#17212D]">
                      <h3 className="text-sm font-black uppercase tracking-[0.08em] text-[#102A43] dark:text-white">
                        Education & Course Details
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-[#64748B] dark:text-[#A8B5C5]">
                        Specify the academic level, location, and funding requirement.
                      </p>
                    </div>

                    <div className="space-y-6 p-5">
                      <div className="grid gap-6 md:grid-cols-2">
                        <div>
                          <label
                            htmlFor="educationLevel"
                            className="mb-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-[#334155] dark:text-[#CBD5E1]"
                          >
                            Education Level <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="educationLevel"
                            value={data.educationLevel}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                              update("educationLevel", e.target.value)
                            }
                            className="w-full border border-[#C8D4E1] bg-[#F8FAFC] px-4 py-3 text-sm font-medium text-[#1F2937] outline-none transition focus:border-[#1769D2] focus:ring-1 focus:ring-[#1769D2] dark:border-[#344457] dark:bg-[#0B1118] dark:text-[#F1F5F9]"
                          >
                            <option value="">Select education level</option>
                            {EDUCATION_OPTIONS.map((edu) => (
                              <option key={edu} value={edu}>
                                {edu}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label
                            htmlFor="courseLocation"
                            className="mb-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-[#334155] dark:text-[#CBD5E1]"
                          >
                            Course Study Location <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="courseLocation"
                            value={data.courseLocation}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                              update("courseLocation", e.target.value)
                            }
                            className="w-full border border-[#C8D4E1] bg-[#F8FAFC] px-4 py-3 text-sm font-medium text-[#1F2937] outline-none transition focus:border-[#1769D2] focus:ring-1 focus:ring-[#1769D2] dark:border-[#344457] dark:bg-[#0B1118] dark:text-[#F1F5F9]"
                          >
                            <option value="">Select study location</option>
                            <option value="india">In India (Cap: ₹25,00,000)</option>
                            <option value="abroad">Abroad / International (Cap: ₹40,00,000)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid gap-6 md:grid-cols-2">
                        <div>
                          <label
                            htmlFor="courseCost"
                            className="mb-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-[#334155] dark:text-[#CBD5E1]"
                          >
                            Estimated Course Fee / Loan Amount <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#64748B] dark:text-[#94A3B8]">
                              ₹
                            </span>
                            <input
                              id="courseCost"
                              type="number"
                              min="0"
                              value={data.projectCost}
                              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                update("projectCost", e.target.value)
                              }
                              placeholder="e.g. 800000"
                              className="w-full border border-[#C8D4E1] bg-[#F8FAFC] py-3 pl-9 pr-4 text-sm font-medium text-[#1F2937] outline-none transition focus:border-[#1769D2] focus:ring-1 focus:ring-[#1769D2] dark:border-[#344457] dark:bg-[#0B1118] dark:text-[#F1F5F9] dark:placeholder:text-[#64748B]"
                            />
                          </div>
                          <p className="mt-1.5 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                            NSFDC Educational Loan finances up to 90% of total fees.
                          </p>
                        </div>

                        <div>
                          <label
                            htmlFor="annualIncomeEdu"
                            className="mb-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-[#334155] dark:text-[#CBD5E1]"
                          >
                            Annual Family Income <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#64748B] dark:text-[#94A3B8]">
                              ₹
                            </span>
                            <input
                              id="annualIncomeEdu"
                              type="number"
                              min="0"
                              value={data.annualIncome}
                              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                update("annualIncome", e.target.value)
                              }
                              placeholder="e.g. 350000"
                              className="w-full border border-[#C8D4E1] bg-[#F8FAFC] py-3 pl-9 pr-4 text-sm font-medium text-[#1F2937] outline-none transition focus:border-[#1769D2] focus:ring-1 focus:ring-[#1769D2] dark:border-[#344457] dark:bg-[#0B1118] dark:text-[#F1F5F9] dark:placeholder:text-[#64748B]"
                            />
                          </div>
                          <p className="mt-1.5 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                            Eligibility ceiling is ₹8,00,000/year for NSFDC educational loans.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* =====================================================
                    INFORMATION NOTICE
                    ===================================================== */}
                <div className="border border-[#E9B36A] bg-[#FFF8EC] px-5 py-4 dark:border-[#8A5A1E] dark:bg-[#2A1D0D]">
                  <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#A65A00] dark:text-[#F5B45B]">
                    Smart Matching Information
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[#76511F] dark:text-[#E5C58F]">
                    NIRVAAN AI evaluates your selected category, project/course cost, and income against official Government of India loan schemes (NSFDC, NSKFDC, Stand-Up India, MUDRA) to determine the highest eligible subsidy and lowest interest rates.
                  </p>
                </div>

                {error ? (
                  <div className="border border-[#D68A8A] bg-[#FFF1F1] px-5 py-4 dark:border-[#743737] dark:bg-[#2A1515]">
                    <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#A32929] dark:text-[#F28B8B]">
                      Unable to continue
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[#713333] dark:text-[#E7B1B1]">
                      {error}
                    </p>
                  </div>
                ) : null}

                {/* =====================================================
                    STEP CONTROL
                    ===================================================== */}
                <div className="flex flex-col gap-3 border-t border-[#DCE4EC] bg-[#F8FAFC] px-5 py-5 dark:border-[#263445] dark:bg-[#17212D] sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={previousStep}
                    className="border border-[#B8C6D6] bg-[#F8FAFC] px-5 py-3 text-xs font-extrabold uppercase tracking-[0.08em] text-[#334155] transition hover:bg-[#EAF0F6] dark:border-[#344457] dark:bg-[#0F1722] dark:text-[#CBD5E1] dark:hover:bg-[#1A2633]"
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={onSubmit}
                    disabled={submitting}
                    className="border border-[#1769D2] bg-[#1769D2] px-6 py-3 text-xs font-extrabold uppercase tracking-[0.08em] text-white transition hover:bg-[#0F5DBD] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting
                      ? "Generating Recommendation..."
                      : "Generate Scheme Recommendation"}
                  </button>
                </div>

              </div>
            </div>
          ) : null}

          {/* =====================================================
              JOURNEY COMPLETION / LOADING
              ===================================================== */}

          {submitting ? (
            <div className="border-t border-[#DCE4EC] bg-[#F8FAFC] px-5 py-8 dark:border-[#263445] dark:bg-[#0F1722]">
              <div className="mx-auto max-w-xl text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center border-2 border-[#1769D2] border-t-transparent">
                  <span className="h-5 w-5 animate-spin border-2 border-[#1769D2] border-t-transparent" />
                </div>

                <h3 className="mt-5 text-lg font-black text-[#102A43] dark:text-white">
                  Preparing your recommendation
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#64748B] dark:text-[#A8B5C5]">
                  We are processing your verified information
                  and preparing suitable scheme options.
                </p>

              </div>
            </div>
                    ) : null}

        </div>
        </div>
      </section>
              {/* =====================================================
          FIVE JOURNEY HIGHLIGHTS
          ===================================================== */}
      <section className="border-t border-[#DCE4EC] bg-white dark:border-[#263445] dark:bg-[#0F1722]">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">

          <div className="mb-6">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#1769D2]">
              Your Journey
            </p>

            <h2 className="mt-2 text-2xl font-black text-[#102A43] dark:text-white sm:text-3xl">
              Four Journey Highlights
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#64748B] dark:text-[#A8B5C5]">
              NIRVAAN follows a structured journey from
              verification through scheme discovery and
              financial planning to partner assistance.
            </p>
          </div>

          <div className="grid gap-px border border-[#DCE4EC] bg-[#DCE4EC] dark:border-[#344457] dark:bg-[#344457] md:grid-cols-4">

            {STEPS.map((item) => (
              <div
                key={item.number}
                className="bg-white p-5 dark:bg-[#111923]"
              >
                <span className="text-[11px] font-black text-[#1769D2]">
                  {item.number}
                </span>

                <h3 className="mt-3 text-sm font-black text-[#102A43] dark:text-white">
                  {item.title}
                </h3>

                <p className="mt-2 text-xs leading-5 text-[#64748B] dark:text-[#A8B5C5]">
                  {item.description}
                </p>
              </div>
            ))}

          </div>

          {/* =====================================================
              INDEPENDENT PARTNER ACCESS NOTICE
              ===================================================== */}
          <div className="mt-6 border border-[#CBD5E1] bg-[#F8FAFC] p-5 dark:border-[#344457] dark:bg-[#17212D]">

            <div className="border border-[#DCE4EC] bg-white p-5 dark:border-[#344457] dark:bg-[#111923]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#1769D2]">
                    Independent Access
                  </p>

                  <p className="mt-2 max-w-3xl text-sm leading-6 text-[#64748B] dark:text-[#A8B5C5]">
                    Partner institution locations and routes
                    can be explored independently at any time.
                    Loan assistance through NIRVAAN follows
                    the five-stage journey in sequence.
                  </p>
                </div>

                <a
                  href="/partner-location"
                  className="inline-flex flex-none items-center justify-center border border-[#0E2A4A] bg-[#0E2A4A] px-5 py-3 text-xs font-extrabold uppercase tracking-[0.08em] text-white transition hover:bg-[#16395F]"
                >
                  Explore Partners
                </a>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =====================================================
          FOOTER
          ===================================================== */}
      <footer className="border-t border-[#DCE4EC] bg-[#F8FAFC] dark:border-[#263445] dark:bg-[#0B1118]">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">

          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <p className="text-lg font-black tracking-tight text-[#102A43] dark:text-white">
                N<span className="text-[#1769D2]">I</span>RVAAN
              </p>

              <p className="mt-2 max-w-md text-xs leading-5 text-[#64748B] dark:text-[#94A3B8]">
                India&apos;s Official Loan Assistance Platform.
              </p>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#334155] dark:text-[#CBD5E1]">
                Contact
              </p>

              <p className="mt-2 text-xs text-[#64748B] dark:text-[#94A3B8]">
                +91 9373542405
              </p>

              <p className="mt-1 text-xs text-[#64748B] dark:text-[#94A3B8]">
                nirvaanscheme@gmail.com
              </p>
            </div>

          </div>

          <div className="mt-7 border-t border-[#DCE4EC] pt-5 dark:border-[#263445]">
            <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#7A8797] dark:text-[#64748B]">
              © {new Date().getFullYear()} NIRVAAN. All rights reserved.
            </p>
          </div>

        </div>
      </footer>

      {/* =====================================================
          NIRVAAN AI
          ===================================================== */}
      <div className="pointer-events-none">
        {/* Nirvaan AI is rendered globally through the layout. */}
      </div>

    </main>
  );
      }
                        
