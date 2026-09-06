"use client";

import {
  ChangeEvent,
  FormEvent,
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

type WizardStep =
  | "verification"
  | "earning"
  | "recommendation";

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

type FormData = {
  state: string;
  district: string;
category: "sc" | "st" | "obc" | "general" | "";
  age: string;

  verificationMethod: VerificationMethod;
  verificationValue: string;
  otp: string;
  otpSent: boolean;
  verificationComplete: boolean;

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
};

const STEPS = [
  {
    number: "01",
    title: "Verification",
    description:
      "Verify your identity before beginning the assistance journey.",
  },
  {
    number: "02",
    title: "Earning Status",
    description:
      "Tell us whether you currently earn or need an assessment route.",
  },
  {
    number: "03",
    title: "Smart Scheme Recommender",
    description:
      "AI matches your verified profile with suitable schemes.",
  },
  {
    number: "04",
    title: "Financial Calculator",
    description:
      "Select an amount and understand your repayment plan.",
  },
  {
    number: "05",
    title: "Geo-Spatial Partner Locator & Router",
    description:
      "Find a suitable partner location and plan your visit.",
  },
];

const INITIAL_DATA: FormData = {
  state: "",
  district: "",
  category: "",
  age: "",

  verificationMethod: "aadhaar",
  verificationValue: "",
  otp: "",
  otpSent: false,
  verificationComplete: false,

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
};

const CATEGORY_OPTIONS = [
  {
    value: "sc",
    label: "Scheduled Caste (SC)",
  },
];

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

export default function WizardPage() {
  const router = useRouter();
  const { profile, setJourney } = useJourney();

  const [step, setStep] = useState(0);
  const [data, setData] =
    useState<FormData>(INITIAL_DATA);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] =
    useState(false);

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

  const sendOtp = () => {
    resetMessages();

    if (!data.verificationValue.trim()) {
      setError(
        `Enter your ${
          data.verificationMethod === "aadhaar"
            ? "Aadhaar number"
            : "PAN"
        } to request an OTP.`
      );
      return;
    }

    update("otpSent", true);

    setNotice(
      "A verification OTP has been requested. Enter the OTP to continue."
    );
  };

  const verifyOtp = () => {
    resetMessages();

    if (!data.otp.trim()) {
      setError("Enter the OTP to continue.");
      return;
    }

    if (data.otp.trim().length < 4) {
      setError("Enter a valid OTP.");
      return;
    }

    update("verificationComplete", true);

    setNotice(
      "Identity verification completed for this journey."
    );
  };

  const onFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    resetMessages();

    const file = event.target.files?.[0] ?? null;

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
    if (!data.verificationComplete) {
      setError(
        "Complete identity verification before continuing."
      );
      return false;
    }

    if (!data.state) {
      setError("Please select your state.");
      return false;
    }

    if (!data.district) {
      setError("Please select your district.");
      return false;
    }

    if (!data.category) {
      setError("Please select your category.");
      return false;
    }

    if (!data.age) {
      setError("Please enter your age.");
      return false;
    }

    const age = Number(data.age);

    if (!Number.isFinite(age) || age < 18) {
      setError(
        "Please enter a valid age of 18 or above."
      );
      return false;
    }

    return true;
  };

  const validateEarning = () => {
    if (!data.earningStatus) {
      setError(
        "Select whether you are currently earning or non-earning."
      );
      return false;
    }

    if (data.earningStatus === "earning") {
      const income = Number(data.annualIncome);

      if (
        !data.annualIncome ||
        !Number.isFinite(income) ||
        income < 0
      ) {
        setError(
          "Enter your annual family income."
        );
        return false;
      }

      if (!data.incomeProof) {
        setError(
          "Upload your bank income proof PDF."
        );
        return false;
      }

      return true;
    }

    if (!data.assessmentPurpose) {
      setError(
        "Select the purpose for your assessment."
      );
      return false;
    }

    if (!data.amountNeeded) {
      setError(
        "Enter the amount you currently need."
      );
      return false;
    }

    const amount = Number(data.amountNeeded);

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setError(
        "Enter a valid amount greater than zero."
      );
      return false;
    }

    if (!data.repaymentPlan.trim()) {
      setError(
        "Explain how you plan to repay the amount."
      );
      return false;
    }

    if (!data.guarantor.trim()) {
      setError(
        "Provide the guarantor information."
      );
      return false;
    }

    if (!data.securityDetails.trim()) {
      setError(
        "Provide the available security or legal guarantee details."
      );
      return false;
    }

    if (!data.videoRequested) {
      setError(
        "Request a video assessment with the NIRVAAN team."
      );
      return false;
    }

    if (!data.teamVerificationAccepted) {
      setError(
        "Confirm that the NIRVAAN team must verify the assessment information and guarantor/security details."
      );
      return false;
    }

    return true;
  };

  const nextStep = () => {
    resetMessages();

    if (step === 0) {
      if (!validateVerification()) {
        return;
      }

      setStep(1);
      return;
    }

    if (step === 1) {
      if (!validateEarning()) {
        return;
      }

      setStep(2);
      return;
    }
  };

  const previousStep = () => {
    resetMessages();

    setStep((current) =>
      Math.max(current - 1, 0)
    );
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

    if (!validateEarning()) {
      setStep(1);
      return;
    }

    setSubmitting(true);

    const finalProfile: Profile = {
      state: data.state,
      district: data.district,
      category: data.category as Profile["category"],
      age: Number(data.age),
      purpose:
  (data.earningStatus === "non-earning"
    ? getPurposeFromAssessment(data.assessmentPurpose)
    : data.purpose) as Profile["purpose"],
activityType: data.activityType,
      projectCost: Number(data.projectCost) || 0,
      annualIncome:
        data.earningStatus === "earning"
          ? Number(data.annualIncome)
          : 0,
      educationLevel: data.educationLevel as Profile["educationLevel"],
      courseLocation:
  data.assessmentPurpose === "education"
    ? (data.courseLocation as Profile["courseLocation"])
    : undefined,
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
            guarantor: data.guarantor,
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

      const json = await response.json();

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
    <main className="min-h-screen bg-[#F7F9FC] text-[#111827]">
      {/* =====================================================
          PAGE HEADER
          ===================================================== */}
      <section className="border-b border-[#DCE4EC] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#1769D2]">
                NIRVAAN
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight text-[#102A43] sm:text-4xl">
                Start My Journey
              </h1>

              <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-[#607086]">
                Complete verification and provide your
                financial or assessment details so NIRVAAN
                can guide you toward suitable government
                scheme options.
              </p>
            </div>

            <div className="border-l-2 border-[#F47B20] pl-4">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#7A8797]">
                Current stage
              </p>

              <p className="mt-1 text-sm font-extrabold text-[#102A43]">
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
      <section className="border-b border-[#DCE4EC] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-5 sm:px-8 lg:px-10">
          <div className="grid gap-px border border-[#D5DEE8] bg-[#D5DEE8] md:grid-cols-5">
            {STEPS.map((item, index) => {
              const active = index === step;
              const completed = index < step;

              return (
                <div
                  key={item.number}
                  className={`relative bg-white px-4 py-4 ${
                    active
                      ? "bg-[#F8FBFF]"
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
                            : "border-[#C9D5E1] bg-white text-[#708095]"
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
                            : "text-[#334A61]"
                        }`}
                      >
                        {item.title}
                      </p>

                      <p className="mt-1 hidden text-[10px] font-medium leading-4 text-[#7A8797] lg:block">
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
<section className="px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
  <div className="mx-auto max-w-7xl">
    <div className="border border-[#CBD5E1] bg-white">
      {/* =====================================================
          STEP 01: VERIFICATION
          ===================================================== */}
      {step === 0 ? (
                <div>
                  <div className="border-b border-[#DCE4EC] px-5 py-5 sm:px-7">
                    <div className="flex items-start gap-4">
                      <span className="flex h-10 w-10 flex-none items-center justify-center bg-[#1769D2] text-xs font-black text-white">
                        01
                      </span>

                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#1769D2]">
                          Verification
                        </p>

                        <h2 className="mt-1 text-xl font-black text-[#102A43]">
                          Verify your identity
                        </h2>

                        <p className="mt-1 text-xs font-medium leading-5 text-[#64748B]">
                          Complete DigiLocker OTP verification and
                          link either Aadhaar or PAN for identity
                          verification.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-7 p-5 sm:p-7">
                    {/* DigiLocker */}
                    <div className="border border-[#CBD5E1]">
                      <div className="border-b border-[#CBD5E1] bg-[#F8FAFC] px-5 py-4">
                        <p className="text-xs font-extrabold text-[#102A43]">
                          DigiLocker OTP
                        </p>

                        <p className="mt-1 text-[11px] font-medium leading-5 text-[#64748B]">
                          Use the OTP verification step to confirm
                          access to your identity information.
                        </p>
                      </div>

                      <div className="p-5">
                        <div className="grid gap-5 md:grid-cols-2">
                          <div>
                            <label
                              htmlFor="verification-method"
                              className="mb-2 block text-xs font-bold text-[#334155]"
                            >
                              Verification document
                            </label>

                            <select
                              id="verification-method"
                              value={data.verificationMethod}
                              onChange={(event) =>
                                update(
                                  "verificationMethod",
                                  event.target.value as VerificationMethod
                                )
                              }
                              className="min-h-12 w-full border border-[#C8D4E1] bg-white px-3 text-sm text-[#1F2937] outline-none focus:border-[#1769D2]"
                            >
                              <option value="aadhaar">
                                Aadhaar
                              </option>
                              <option value="pan">
                                PAN
                              </option>
                            </select>
                          </div>

                          <div>
                            <label
                              htmlFor="verification-value"
                              className="mb-2 block text-xs font-bold text-[#334155]"
                            >
                              {data.verificationMethod ===
                              "aadhaar"
                                ? "Aadhaar number"
                                : "PAN number"}
                            </label>

                            <input
                              id="verification-value"
                              type="text"
                              inputMode={
                                data.verificationMethod ===
                                "aadhaar"
                                  ? "numeric"
                                  : "text"
                              }
                              value={data.verificationValue}
                              onChange={(event) =>
                                update(
                                  "verificationValue",
                                  event.target.value
                                )
                              }
                              placeholder={
                                data.verificationMethod ===
                                "aadhaar"
                                  ? "Enter Aadhaar number"
                                  : "Enter PAN number"
                              }
                              className="min-h-12 w-full border border-[#C8D4E1] bg-white px-3 text-sm uppercase text-[#1F2937] outline-none placeholder:normal-case placeholder:text-[#94A3B8] focus:border-[#1769D2]"
                            />
                          </div>
                        </div>

                        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
                          <div className="flex-1">
                            <label
                              htmlFor="otp"
                              className="mb-2 block text-xs font-bold text-[#334155]"
                            >
                              OTP
                            </label>

                            <input
                              id="otp"
                              type="text"
                              inputMode="numeric"
                              maxLength={6}
                              value={data.otp}
                              onChange={(event) =>
                                update(
                                  "otp",
                                  event.target.value.replace(
                                    /\D/g,
                                    ""
                                  )
                                )
                              }
                              placeholder="Enter OTP"
                              disabled={!data.otpSent}
                              className="min-h-12 w-full border border-[#C8D4E1] bg-white px-3 text-sm text-[#1F2937] outline-none placeholder:text-[#94A3B8] focus:border-[#1769D2] disabled:bg-[#F1F5F9]"
                            />
                          </div>

                          {!data.otpSent ? (
                            <button
                              type="button"
                              onClick={sendOtp}
                              className="min-h-12 border border-[#1769D2] bg-[#1769D2] px-6 text-xs font-extrabold text-white transition-colors hover:bg-[#0F56AE]"
                            >
                              Request OTP
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={verifyOtp}
                              disabled={
                                data.verificationComplete
                              }
                              className="min-h-12 border border-[#0E2A4A] bg-[#0E2A4A] px-6 text-xs font-extrabold text-white transition-colors hover:bg-[#173A5A] disabled:cursor-not-allowed disabled:bg-[#64748B]"
                            >
                              {data.verificationComplete
                                ? "Verified"
                                : "Verify OTP"}
                            </button>
                          )}
                        </div>

                        {data.verificationComplete ? (
                          <div className="mt-4 border-l-2 border-[#16804A] bg-[#F0FDF4] px-4 py-3">
                            <p className="text-xs font-bold text-[#166534]">
                              Identity verification completed.
                            </p>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {/* Basic Details */}
                    <div>
                      <div className="mb-4">
                        <p className="text-sm font-extrabold text-[#102A43]">
                          Basic details
                        </p>

                        <p className="mt-1 text-xs font-medium text-[#718096]">
                          These details help establish your
                          assistance profile.
                        </p>
                      </div>

                      <div className="grid gap-5 md:grid-cols-2">
                        <div>
                          <label
                            htmlFor="state"
                            className="mb-2 block text-xs font-bold text-[#334155]"
                          >
                            State
                          </label>

                          <select
                            id="state"
                            value={data.state}
                            onChange={(event) => {
                              update(
                                "state",
                                event.target.value
                              );
                              update("district", "");
                            }}
                            className="min-h-12 w-full border border-[#C8D4E1] bg-white px-3 text-sm text-[#1F2937] outline-none focus:border-[#1769D2]"
                          >
                            <option value="">
                              Select state
                            </option>

                            {stateList.map((state) => (
                              <option
                                key={state}
                                value={state}
                              >
                                {state}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label
                            htmlFor="district"
                            className="mb-2 block text-xs font-bold text-[#334155]"
                          >
                            District
                          </label>

                          <select
                            id="district"
                            value={data.district}
                            onChange={(event) =>
                              update(
                                "district",
                                event.target.value
                              )
                            }
                            disabled={!data.state}
                            className="min-h-12 w-full border border-[#C8D4E1] bg-white px-3 text-sm text-[#1F2937] outline-none focus:border-[#1769D2] disabled:bg-[#F1F5F9]"
                          >
                            <option value="">
                              {data.state
                                ? "Select district"
                                : "Select state first"}
                            </option>

                            {districtList.map(
                              (district) => (
                                <option
                                  key={district}
                                  value={district}
                                >
                                  {district}
                                </option>
                              )
                            )}
                          </select>
                        </div>

                        <div>
                          <label
                            htmlFor="category"
                            className="mb-2 block text-xs font-bold text-[#334155]"
                          >
                            Category
                          </label>

                          <select
                            id="category"
                            value={data.category}
                            onChange={(event) =>
                              update(
  "category",
  event.target.value as FormData["category"]
)
                            }
                            className="min-h-12 w-full border border-[#C8D4E1] bg-white px-3 text-sm text-[#1F2937] outline-none focus:border-[#1769D2]"
                          >
                            <option value="">
                              Select category
                            </option>

                            {CATEGORY_OPTIONS.map(
                              (option) => (
                                <option
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </option>
                              )
                            )}
                          </select>
                        </div>

                        <div>
                          <label
                            htmlFor="age"
                            className="mb-2 block text-xs font-bold text-[#334155]"
                          >
                            Age
                          </label>

                          <input
                            id="age"
                            type="number"
                            min="18"
                            max="100"
                            value={data.age}
                            onChange={(event) =>
                              update(
                                "age",
                                event.target.value
                              )
                            }
                            placeholder="Enter your age"
                            className="min-h-12 w-full border border-[#C8D4E1] bg-white px-3 text-sm text-[#1F2937] outline-none placeholder:text-[#94A3B8] focus:border-[#1769D2]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Information Notice */}
                    <div className="border-l-2 border-[#F47B20] bg-[#FFF7ED] px-4 py-4">
                      <p className="text-xs font-extrabold text-[#9A4D08]">
                        Verification is the first step.
                      </p>

                      <p className="mt-1 text-[11px] font-medium leading-5 text-[#7C5A32]">
                        Your verified details are used to
                        establish the profile that will be
                        passed to the scheme matching stage.
                      </p>
                    </div>
                  </div>

                  {/* Step controls */}
                  <div className="flex justify-end border-t border-[#DCE4EC] bg-[#F8FAFC] px-5 py-4 sm:px-7">
                    <button
                      type="button"
                      onClick={nextStep}
                      className="min-h-12 border border-[#0758C7] bg-[#0758C7] px-7 text-xs font-extrabold text-white transition-colors hover:bg-[#064CA9]"
                    >
                      Continue to Earning Status
                      <span className="ml-3">
                        →
                      </span>
                    </button>
                  </div>
                </div>
              ) : null}

              {/* =====================================================
                  STEP 02: EARNING STATUS
                  ===================================================== */}
              {step === 1 ? (
                <div>
                  <div className="border-b border-[#DCE4EC] px-5 py-5 sm:px-7">
                    <div className="flex items-start gap-4">
                      <span className="flex h-10 w-10 flex-none items-center justify-center bg-[#1769D2] text-xs font-black text-white">
                        02
                      </span>

                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#1769D2]">
                          Earning Status
                        </p>

                        <h2 className="mt-1 text-xl font-black text-[#102A43]">
                          Tell us about your current earning status
                        </h2>

                        <p className="mt-1 text-xs font-medium leading-5 text-[#64748B]">
                          Choose the route that best describes
                          your current situation.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-7 p-5 sm:p-7">
                    {/* Status selection */}
                    <div>
                      <p className="mb-3 text-xs font-extrabold text-[#334155]">
                        Current status
                      </p>

                      <div className="grid gap-4 md:grid-cols-2">
                        <button
                          type="button"
                          onClick={() =>
                            selectEarningStatus(
                              "earning"
                            )
                          }
                          className={`border p-5 text-left transition-colors ${
                            data.earningStatus ===
                            "earning"
                              ? "border-[#1769D2] bg-[#F3F8FF]"
                              : "border-[#CBD5E1] bg-white hover:border-[#8EA9C4]"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-sm font-extrabold text-[#102A43]">
                                Earning
                              </p>

                              <p className="mt-2 text-xs font-medium leading-5 text-[#64748B]">
                                I currently earn income and
                                can provide bank income proof.
                              </p>
                            </div>

                            <span
                              className={`h-4 w-4 border ${
                                data.earningStatus ===
                                "earning"
                                  ? "border-[#1769D2] bg-[#1769D2]"
                                  : "border-[#B8C6D4] bg-white"
                              }`}
                            />
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            selectEarningStatus(
                              "non-earning"
                            )
                          }
                          className={`border p-5 text-left transition-colors ${
                            data.earningStatus ===
                            "non-earning"
                              ? "border-[#F47B20] bg-[#FFF9F3]"
                              : "border-[#CBD5E1] bg-white hover:border-[#8EA9C4]"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-sm font-extrabold text-[#102A43]">
                                Non-Earning
                              </p>

                              <p className="mt-2 text-xs font-medium leading-5 text-[#64748B]">
                                I currently do not earn and
                                need an assessment route.
                              </p>
                            </div>

                            <span
                              className={`h-4 w-4 border ${
                                data.earningStatus ===
                                "non-earning"
                                  ? "border-[#F47B20] bg-[#F47B20]"
                                  : "border-[#B8C6D4] bg-white"
                              }`}
                            />
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Earning route */}
                    {data.earningStatus ===
                    "earning" ? (
                      <div className="border border-[#CBD5E1]">
                        <div className="border-b border-[#CBD5E1] bg-[#F8FAFC] px-5 py-4">
                          <p className="text-sm font-extrabold text-[#102A43]">
                            Income verification
                          </p>

                          <p className="mt-1 text-xs font-medium leading-5 text-[#64748B]">
                            Enter your annual family income and
                            upload bank income proof in PDF format.
                          </p>
                        </div>

                        <div className="space-y-5 p-5">
                          <div>
                            <label
                              htmlFor="annual-income"
                              className="mb-2 block text-xs font-bold text-[#334155]"
                            >
                              Annual family income
                            </label>

                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#64748B]">
                                ₹
                              </span>

                              <input
                                id="annual-income"
                                type="number"
                                min="0"
                                value={
                                  data.annualIncome
                                }
                                onChange={(event) =>
                                  update(
                                    "annualIncome",
                                    event.target.value
                                  )
                                }
                                placeholder="Enter annual family income"
                                className="min-h-12 w-full border border-[#C8D4E1] bg-white pl-8 pr-3 text-sm text-[#1F2937] outline-none placeholder:text-[#94A3B8] focus:border-[#1769D2]"
                              />
                            </div>

                            {data.annualIncome ? (
                              <p className="mt-2 text-[11px] font-semibold text-[#526579]">
                                {formatINR(
                                  Number(
                                    data.annualIncome
                                  )
                                )}
                              </p>
                            ) : null}
                          </div>

                          <div>
                            <label
                              htmlFor="income-proof"
                              className="mb-2 block text-xs font-bold text-[#334155]"
                            >
                              Bank income proof
                            </label>

                            <input
                              id="income-proof"
                              type="file"
                              accept="application/pdf,.pdf"
                              onChange={onFileChange}
                              className="block min-h-12 w-full border border-[#C8D4E1] bg-white px-3 py-3 text-xs text-[#475569] file:mr-4 file:border-0 file:bg-[#EFF6FF] file:px-3 file:py-2 file:text-xs file:font-bold file:text-[#1769D2]"
                            />

                            <p className="mt-2 text-[10px] font-medium leading-4 text-[#7A8797]">
                              PDF only. Keep the document clear
                              and readable.
                            </p>

                            {data.incomeProof ? (
                              <div className="mt-3 border-l-2 border-[#16804A] bg-[#F0FDF4] px-3 py-2">
                                <p className="text-[11px] font-bold text-[#166534]">
                                  {data.incomeProof.name}
                                </p>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {/* Non-earning route */}
                    {data.earningStatus ===
                    "non-earning" ? (
                      <div className="border border-[#CBD5E1]">
                        <div className="border-b border-[#CBD5E1] bg-[#FFF9F3] px-5 py-4">
                          <p className="text-sm font-extrabold text-[#102A43]">
                            Assessment route
                          </p>

                          <p className="mt-1 text-xs font-medium leading-5 text-[#64748B]">
                            A NIRVAAN team assessment is required
                            before a non-earning applicant can
                            proceed to scheme matching.
                          </p>
                        </div>

                        <div className="space-y-6 p-5">
                          <div>
                            <p className="mb-3 text-xs font-extrabold text-[#334155]">
                              Why do you need the funds?
                            </p>

                            <div className="grid gap-3 md:grid-cols-2">
                              {PURPOSE_OPTIONS.map(
                                (option) => {
                                  const selected =
                                    data.assessmentPurpose ===
                                    option.value;

                                  return (
                                    <button
                                      type="button"
                                      key={option.value}
                                      onClick={() =>
                                        selectAssessmentPurpose(
                                          option.value as AssessmentPurpose
                                        )
                                      }
                                      className={`border p-4 text-left transition-colors ${
                                        selected
                                          ? "border-[#1769D2] bg-[#F3F8FF]"
                                          : "border-[#CBD5E1] bg-white hover:border-[#8EA9C4]"
                                      }`}
                                    >
                                      <div className="flex items-start justify-between gap-3">
                                        <div>
                                          <p className="text-xs font-extrabold text-[#102A43]">
                                            {
                                              option.label
                                            }
                                          </p>

                                          <p className="mt-1 text-[11px] font-medium leading-5 text-[#64748B]">
                                            {
                                              option.description
                                            }
                                          </p>
                                        </div>

                                        <span
                                          className={`h-4 w-4 flex-none border ${
                                            selected
                                              ? "border-[#1769D2] bg-[#1769D2]"
                                              : "border-[#B8C6D4] bg-white"
                                          }`}
                                        />
                                      </div>
                                    </button>
                                  );
                                }
                              )}
                            </div>
                          </div>

                          <div className="grid gap-5 md:grid-cols-2">
                            <div>
                              <label
                                htmlFor="amount-needed"
                                className="mb-2 block text-xs font-bold text-[#334155]"
                              >
                                Amount needed
                              </label>

                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#64748B]">
                                  ₹
                                </span>

                                <input
                                  id="amount-needed"
                                  type="number"
                                  min="1"
                                  value={
                                    data.amountNeeded
                                  }
                                  onChange={(event) =>
                                    update(
                                      "amountNeeded",
                                      event.target.value
                                    )
                                  }
                                  placeholder="Enter required amount"
                                  className="min-h-12 w-full border border-[#C8D4E1] bg-white pl-8 pr-3 text-sm text-[#1F2937] outline-none placeholder:text-[#94A3B8] focus:border-[#1769D2]"
                                />
                              </div>
                            </div>

                            <div>
                              <label
                                htmlFor="project-cost"
                                className="mb-2 block text-xs font-bold text-[#334155]"
                              >
                                Estimated project / requirement cost
                              </label>

                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#64748B]">
                                  ₹
                                </span>

                                <input
                                  id="project-cost"
                                  type="number"
                                  min="0"
                                  value={
                                    data.projectCost
                                  }
                                  onChange={(event) =>
                                    update(
                                      "projectCost",
                                      event.target.value
                                    )
                                  }
                                  className="min-h-12 w-full border border-[#C8D4E1] bg-white pl-8 pr-3 text-sm text-[#1F2937] outline-none focus:border-[#1769D2]"
                                />
                              </div>
                            </div>
                          </div>

                          {data.assessmentPurpose ===
                          "education" ? (
                            <div className="grid gap-5 md:grid-cols-2">
                              <div>
                                <label
                                  htmlFor="education-level"
                                  className="mb-2 block text-xs font-bold text-[#334155]"
                                >
                                  Education level
                                </label>

                                <select
                                  id="education-level"
                                  value={
                                    data.educationLevel
                                  }
                                  onChange={(event) =>
                                    update(
                                      "educationLevel",
                                      event.target.value
                                    )
                                  }
                                  className="min-h-12 w-full border border-[#C8D4E1] bg-white px-3 text-sm text-[#1F2937] outline-none focus:border-[#1769D2]"
                                >
                                  <option value="">
                                    Select level
                                  </option>

                                  {EDUCATION_OPTIONS.map(
                                    (level) => (
                                      <option
                                        key={level}
                                        value={level}
                                      >
                                        {level}
                                      </option>
                                    )
                                  )}
                                </select>
                              </div>

                              <div>
                                <label
                                  htmlFor="course-location"
                                  className="mb-2 block text-xs font-bold text-[#334155]"
                                >
                                  Course / institution location
                                </label>

                                <input
                                  id="course-location"
                                  type="text"
                                  value={
                                    data.courseLocation
                                  }
                                  onChange={(event) =>
                                    update(
                                      "courseLocation",
                                      event.target.value
                                    )
                                  }
                                  placeholder="Enter location"
                                  className="min-h-12 w-full border border-[#C8D4E1] bg-white px-3 text-sm text-[#1F2937] outline-none placeholder:text-[#94A3B8] focus:border-[#1769D2]"
                                />
                              </div>
                            </div>
                          ) : null}

                          <div>
                            <label
                              htmlFor="repayment-plan"
                              className="mb-2 block text-xs font-bold text-[#334155]"
                            >
                              How do you plan to repay?
                            </label>

                            <textarea
                              id="repayment-plan"
                              rows={4}
                              value={
                                data.repaymentPlan
                              }
                              onChange={(event) =>
                                update(
                                  "repaymentPlan",
                                  event.target.value
                                )
                              }
                              placeholder="Explain your expected source of repayment and plan."
                              className="w-full resize-none border border-[#C8D4E1] bg-white px-3 py-3 text-sm text-[#1F2937] outline-none placeholder:text-[#94A3B8] focus:border-[#1769D2]"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="guarantor"
                              className="mb-2 block text-xs font-bold text-[#334155]"
                            >
                              Guarantor
                            </label>

                            <textarea
                              id="guarantor"
                              rows={3}
                              value={data.guarantor}
                              onChange={(event) =>
                                update(
                                  "guarantor",
                                  event.target.value
                                )
                              }
                              placeholder="Provide the guarantor details and relationship."
                              className="w-full resize-none border border-[#C8D4E1] bg-white px-3 py-3 text-sm text-[#1F2937] outline-none placeholder:text-[#94A3B8] focus:border-[#1769D2]"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="security-details"
                              className="mb-2 block text-xs font-bold text-[#334155]"
                            >
                              Security / legal guarantee details
                            </label>

                            <textarea
                              id="security-details"
                              rows={3}
                              value={
                                data.securityDetails
                              }
                              onChange={(event) =>
                                update(
                                  "securityDetails",
                                  event.target.value
                                )
                              }
                              placeholder="Describe any available security, guarantee or relevant legal arrangement."
                              className="w-full resize-none border border-[#C8D4E1] bg-white px-3 py-3 text-sm text-[#1F2937] outline-none placeholder:text-[#94A3B8] focus:border-[#1769D2]"
                            />
                          </div>

                          <div className="border border-[#D7DEE8] bg-[#F8FAFC] p-4">
                            <p className="text-xs font-extrabold text-[#102A43]">
                              NIRVAAN team video assessment
                            </p>

                            <p className="mt-1 text-[11px] font-medium leading-5 text-[#64748B]">
                              The team will ask why the funds
                              are needed, your plan, repayment
                              approach, requested amount and
                              guarantor details. Claims and
                              supporting information may then be
                              verified.
                            </p>

                            <button
                              type="button"
                              onClick={() =>
                                update(
                                  "videoRequested",
                                  !data.videoRequested
                                )
                              }
                              className={`mt-4 flex min-h-11 w-full items-center justify-between border px-4 text-left transition-colors ${
                                data.videoRequested
                                  ? "border-[#16804A] bg-[#F0FDF4]"
                                  : "border-[#C8D4E1] bg-white hover:border-[#1769D2]"
                              }`}
                            >
                              <span className="text-xs font-bold text-[#334155]">
                                {data.videoRequested
                                  ? "Video assessment requested"
                                  : "Request video assessment"}
                              </span>

                              <span
                                className={`flex h-5 w-5 items-center justify-center border text-[10px] font-black ${
                                  data.videoRequested
                                    ? "border-[#16804A] bg-[#16804A] text-white"
                                    : "border-[#B8C6D4] bg-white text-transparent"
                                }`}
                              >
                                ✓
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                update(
                                  "teamVerificationAccepted",
                                  !data.teamVerificationAccepted
                                )
                              }
                              className="mt-3 flex w-full items-start gap-3 text-left"
                            >
                              <span
                                className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center border text-[10px] font-black ${
                                  data.teamVerificationAccepted
                                    ? "border-[#1769D2] bg-[#1769D2] text-white"
                                    : "border-[#B8C6D4] bg-white text-transparent"
                                }`}
                              >
                                ✓
                              </span>

                              <span className="text-[11px] font-medium leading-5 text-[#526579]">
                                I understand that the NIRVAAN team
                                must verify the assessment information,
                                guarantor and security details before
                                this route can proceed.
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {/* Route information */}
                    {data.earningStatus ? (
                      <div className="border-l-2 border-[#1769D2] bg-[#F3F8FF] px-4 py-4">
                        <p className="text-xs font-extrabold text-[#174A7A]">
                          What happens next?
                        </p>

                        <p className="mt-1 text-[11px] font-medium leading-5 text-[#526579]">
                          After this stage, successful applicants
                          move to the Smart Scheme Recommender.
                          The same recommendation portal is used
                          for both earning and approved
                          non-earning routes.
                        </p>
                      </div>
                    ) : null}

                    {/* Errors */}
                    {error ? (
                      <div
                        role="alert"
                        className="border-l-2 border-[#C62828] bg-[#FEF2F2] px-4 py-3"
                      >
                        <p className="text-xs font-bold text-[#991B1B]">
                          {error}
                        </p>
                      </div>
                    ) : null}

                    {notice ? (
                      <div
                        role="status"
                        className="border-l-2 border-[#1769D2] bg-[#EFF6FF] px-4 py-3"
                      >
                        <p className="text-xs font-bold text-[#174A7A]">
                          {notice}
                        </p>
                      </div>
                    ) : null}
                  </div>

                  {/* Step controls */}
                  <div className="flex flex-col-reverse gap-3 border-t border-[#DCE4EC] bg-[#F8FAFC] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                    <button
                      type="button"
                      onClick={previousStep}
                      className="min-h-12 border border-[#C8D4E1] bg-white px-6 text-xs font-extrabold text-[#526579] transition-colors hover:border-[#1769D2] hover:text-[#1769D2]"
                    >
                      ← Back
                    </button>

                    <button
                      type="button"
                      onClick={nextStep}
                      className="min-h-12 border border-[#0758C7] bg-[#0758C7] px-7 text-xs font-extrabold text-white transition-colors hover:bg-[#064CA9]"
                    >
                      Continue to Smart Scheme Recommender
                      <span className="ml-3">
                        →
                      </span>
                    </button>
                  </div>
                </div>
              ) : null}

              {/* =====================================================
                  STEP 03 START
                  ===================================================== */}
              {step === 2 ? (
                <div>
                  <div className="border-b border-[#DCE4EC] px-5 py-5 sm:px-7">
                    <div className="flex items-start gap-4">
                      <span className="flex h-10 w-10 flex-none items-center justify-center bg-[#1769D2] text-xs font-black text-white">
                        03
                      </span>

                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#1769D2]">
                          Smart Scheme Recommender
                        </p>

                        <h2 className="mt-1 text-xl font-black text-[#102A43]">
                          Find a suitable scheme
                        </h2>

                        <p className="mt-1 text-xs font-medium leading-5 text-[#64748B]">
                          NIRVAAN AI will use your verified
                          journey information to identify suitable
                          government scheme options and their
                          maximum financing amount.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 p-5 sm:p-7">
                    <div className="grid gap-px border border-[#CBD5E1] bg-[#CBD5E1] md:grid-cols-3">
                      <div className="bg-white p-5">
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#7A8797]">
                          Location
                        </p>

                        <p className="mt-2 text-sm font-extrabold text-[#102A43]">
                          {data.district},{" "}
                          {data.state}
                        </p>
                      </div>

                      <div className="bg-white p-5">
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#7A8797]">
                          Applicant route
                        </p>

                        <p className="mt-2 text-sm font-extrabold text-[#102A43]">
                          {data.earningStatus ===
                          "earning"
                            ? "Earning"
                            : "Non-Earning Assessment"}
                        </p>
                      </div>

                      <div className="bg-white p-5">
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#7A8797]">
                          AI matching
                        </p>

                        <p className="mt-2 text-sm font-extrabold text-[#102A43]">
                          Ready
                        </p>
                      </div>
                    </div>

                    <div className="border border-[#CBD5E1] bg-[#F8FAFC] p-5 sm:p-6">
                      <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#F47B20]">
                        Before matching
                      </p>

                      <h3 className="mt-2 text-lg font-black text-[#102A43]">
                        Your information is ready for AI
                        scheme matching.
                      </h3>

                      <p className="mt-2 max-w-2xl text-xs font-medium leading-5 text-[#64748B]">
                        The recommendation stage is shared by
                        both applicant routes. Your verified
                        profile and relevant assessment context
                        will be sent to the recommendation service.
                      </p>
                    </div>

                    {error ? (
                      <div
                        role="alert"
                        className="border-l-2 border-[#C62828] bg-[#FEF2F2] px-4 py-3"
                      >
                        <p className="text-xs font-bold text-[#991B1B]">
                          {error}
                        </p>
                      </div>
                    ) : null}

                    {notice ? (
                      <div
                        role="status"
                        className="border-l-2 border-[#1769D2] bg-[#EFF6FF] px-4 py-3"
                      >
                        <p className="text-xs font-bold text-[#174A7A]">
                          {notice}
                        </p>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex flex-col-reverse gap-3 border-t border-[#DCE4EC] bg-[#F8FAFC] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                    <button
                      type="button"
                      onClick={previousStep}
                      disabled={submitting}
                      className="min-h-12 border border-[#C8D4E1] bg-white px-6 text-xs font-extrabold text-[#526579] transition-colors hover:border-[#1769D2] hover:text-[#1769D2] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      ← Back
                    </button>

                    <button
                      type="button"
                      onClick={() => void onSubmit()}
                      disabled={submitting}
                      className="min-h-12 border border-[#0758C7] bg-[#0758C7] px-7 text-xs font-extrabold text-white transition-colors hover:bg-[#064CA9] disabled:cursor-not-allowed disabled:bg-[#64748B]"
                    >
                      {submitting
                        ? "Generating recommendation..."
                        : "Run Smart Scheme Recommender →"}
                    </button>
                  </div>
                                              ) : null}
    </div>
  </div>
</section>

      {/* =====================================================
          FIVE JOURNEY HIGHLIGHTS
          ===================================================== */}
      <section className="border-t border-[#DCE4EC] bg-[#F7F9FC]">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

            {/* 01 */}
            <div className="border border-[#CBD5E1] bg-white p-5">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#1769D2]">
                01 · Verify
              </p>
              <h3 className="mt-2 text-sm font-extrabold text-[#102A43]">
                Identity first
              </h3>
              <p className="mt-2 text-xs font-medium leading-5 text-[#64748B]">
                DigiLocker OTP verification and Aadhaar or PAN
                verification establish your identity.
              </p>
            </div>

            {/* 02 */}
            <div className="border border-[#CBD5E1] bg-white p-5">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#F47B20]">
                02 · Assess
              </p>
              <h3 className="mt-2 text-sm font-extrabold text-[#102A43]">
                Understand your route
              </h3>
              <p className="mt-2 text-xs font-medium leading-5 text-[#64748B]">
                Tell us whether you earn or need an assessment
                route.
              </p>
            </div>

            {/* 03 */}
            <div className="border border-[#CBD5E1] bg-white p-5">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#1769D2]">
                03 · Match
              </p>
              <h3 className="mt-2 text-sm font-extrabold text-[#102A43]">
                Let AI recommend
              </h3>
              <p className="mt-2 text-xs font-medium leading-5 text-[#64748B]">
                Your verified information is used by the Smart
                Scheme Recommender to identify suitable options.
              </p>
            </div>

            {/* 04 */}
            <div className="border border-[#CBD5E1] bg-white p-5">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#F47B20]">
                04 · Plan
              </p>
              <h3 className="mt-2 text-sm font-extrabold text-[#102A43]">
                Check your repayment
              </h3>
              <p className="mt-2 text-xs font-medium leading-5 text-[#64748B]">
                Select an amount and understand your expected
                repayment plan.
              </p>
            </div>

            {/* 05 */}
            <div className="border border-[#CBD5E1] bg-white p-5">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#1769D2]">
                05 · Locate
              </p>
              <h3 className="mt-2 text-sm font-extrabold text-[#102A43]">
                Find your partner
              </h3>
              <p className="mt-2 text-xs font-medium leading-5 text-[#64748B]">
                Get location options and routes to the appropriate
                partner institution.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          INDEPENDENT PLATFORM NOTICE
          ===================================================== */}
      <section className="border-t border-[#DCE4EC] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8 lg:px-10">
          <div className="border-l-2 border-[#F47B20] bg-[#FFF9F3] px-5 py-4">
            <p className="text-xs font-extrabold text-[#8A4B0F]">
              Important information
            </p>

            <p className="mt-1 text-[11px] font-medium leading-5 text-[#725A43]">
              NIRVAAN is an independent platform for discovering
              government schemes, understanding financing options
              and preparing applications. NIRVAAN does not make
              final eligibility, sanction, approval or disbursement
              decisions.
            </p>
          </div>
        </div>
            </section>
    </main>
  );
        }
