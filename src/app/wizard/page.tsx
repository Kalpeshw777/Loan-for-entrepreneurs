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
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
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
      const income = Number(
        data.annualIncome
      );

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

    const amount = Number(
      data.amountNeeded
    );

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
      category:
        data.category as Profile["category"],
      age: Number(data.age),
      purpose:
        (data.earningStatus === "non-earning"
          ? getPurposeFromAssessment(
              data.assessmentPurpose
            )
          : data.purpose) as Profile["purpose"],
      activityType: data.activityType,
      projectCost:
        Number(data.projectCost) || 0,
      annualIncome:
        data.earningStatus === "earning"
          ? Number(data.annualIncome)
          : 0,
      educationLevel:
        data.educationLevel as Profile["educationLevel"],
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
    <main className="min-h-screen bg-[#F7F9FC] text-[#111827] dark:bg-[#0B1118] dark:text-[#F1F5F9]">

      {/* =====================================================
          PAGE HEADER
          ===================================================== */}
      <section className="border-b border-[#DCE4EC] bg-white dark:border-[#263445] dark:bg-[#0F1722]">
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
      <section className="border-b border-[#DCE4EC] bg-white dark:border-[#263445] dark:bg-[#0F1722]">
        <div className="mx-auto max-w-7xl px-5 py-5 sm:px-8 lg:px-10">

          <div className="grid gap-px border border-[#D5DEE8] bg-[#D5DEE8] dark:border-[#263445] dark:bg-[#263445] md:grid-cols-5">

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
      <section className="px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        <div className="mx-auto max-w-7xl">

          <div className="border border-[#CBD5E1] bg-white dark:border-[#263445] dark:bg-[#111923]">

            {/* =====================================================
                STEP 01: VERIFICATION
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
                      Verification
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-[#64748B] dark:text-[#A8B5C5]">
                      Verify your identity and establish the
                      basic information required to begin your
                      assistance journey.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-7 p-5 sm:p-7">

                {/* =====================================================
                    IDENTITY VERIFICATION
                    ===================================================== */}
                <div className="border border-[#CBD5E1] dark:border-[#344457]">

                  <div className="border-b border-[#DCE4EC] bg-[#F8FAFC] px-5 py-4 dark:border-[#263445] dark:bg-[#17212D]">
                    <h3 className="text-sm font-black uppercase tracking-[0.08em] text-[#102A43] dark:text-white">
                      Identity Verification
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-[#64748B] dark:text-[#A8B5C5]">
                      Choose a verification method and enter
                      the required details.
                    </p>
                  </div>

                  <div className="space-y-6 p-5">

                    <div>
                      <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-[#334155] dark:text-[#CBD5E1]">
                        Verification Method
                      </label>

                      <div className="grid gap-3 sm:grid-cols-2">

                        <button
                          type="button"
                          onClick={() => {
                            setData((current) => ({
                              ...current,
                              verificationMethod:
                                "aadhaar",
                              verificationValue: "",
                              otp: "",
                              otpSent: false,
                              verificationComplete:
                                false,
                            }));

                            resetMessages();
                          }}
                          className={`border px-4 py-4 text-left transition ${
                            data.verificationMethod ===
                            "aadhaar"
                              ? "border-[#1769D2] bg-[#F0F7FF] dark:border-[#1769D2] dark:bg-[#132033]"
                              : "border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] dark:border-[#344457] dark:bg-[#0F1722] dark:hover:bg-[#17212D]"
                          }`}
                        >
                          <p className="text-sm font-extrabold text-[#102A43] dark:text-white">
                            Aadhaar
                          </p>

                          <p className="mt-1 text-xs text-[#64748B] dark:text-[#A8B5C5]">
                            Verify using your Aadhaar
                            number.
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setData((current) => ({
                              ...current,
                              verificationMethod:
                                "pan",
                              verificationValue: "",
                              otp: "",
                              otpSent: false,
                              verificationComplete:
                                false,
                            }));

                            resetMessages();
                          }}
                          className={`border px-4 py-4 text-left transition ${
                            data.verificationMethod ===
                            "pan"
                              ? "border-[#1769D2] bg-[#F0F7FF] dark:border-[#1769D2] dark:bg-[#132033]"
                              : "border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] dark:border-[#344457] dark:bg-[#0F1722] dark:hover:bg-[#17212D]"
                          }`}
                        >
                          <p className="text-sm font-extrabold text-[#102A43] dark:text-white">
                            PAN
                          </p>

                          <p className="mt-1 text-xs text-[#64748B] dark:text-[#A8B5C5]">
                            Verify using your PAN
                            details.
                          </p>
                        </button>

                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="verificationValue"
                        className="mb-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-[#334155] dark:text-[#CBD5E1]"
                      >
                        {data.verificationMethod ===
                        "aadhaar"
                          ? "Aadhaar Number"
                          : "PAN Number"}
                      </label>

                      <input
                        id="verificationValue"
                        type="text"
                        value={
                          data.verificationValue
                        }
                        onChange={(
                          event: ChangeEvent<HTMLInputElement>
                        ) =>
                          setData((current) => ({
                            ...current,
                            verificationValue:
                              event.target.value,
                            verificationComplete:
                              false,
                            otpSent: false,
                          }))
                        }
                        placeholder={
                          data.verificationMethod ===
                          "aadhaar"
                            ? "Enter 12-digit Aadhaar number"
                            : "Enter PAN number"
                        }
                        disabled={
                          data.verificationComplete
                        }
                        className="w-full border border-[#C8D4E1] bg-white px-4 py-3 text-sm font-medium text-[#1F2937] outline-none transition focus:border-[#1769D2] focus:ring-1 focus:ring-[#1769D2] disabled:bg-[#F1F5F9] dark:border-[#344457] dark:bg-[#0B1118] dark:text-[#F1F5F9] dark:placeholder:text-[#64748B] dark:disabled:bg-[#17212D]"
                      />

                      <p className="mt-2 text-[11px] leading-5 text-[#64748B] dark:text-[#94A3B8]">
                        Your verification information is
                        used only to establish your basic
                        profile for the assistance journey.
                      </p>
                    </div>

                    {!data.verificationComplete ? (
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

                        <button
                          type="button"
                          onClick={sendOtp}
                          disabled={
                            sendingOtp ||
                            !data.verificationValue.trim()
                          }
                          className="border border-[#1769D2] bg-[#1769D2] px-5 py-3 text-xs font-extrabold uppercase tracking-[0.08em] text-white transition hover:bg-[#0F5DBD] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {sendingOtp
                            ? "Sending..."
                            : data.otpSent
                              ? "Resend OTP"
                              : "Send OTP"}
                        </button>

                        {data.otpSent ? (
                          <span className="text-xs font-medium text-[#64748B] dark:text-[#A8B5C5]">
                            OTP sent. Enter the
                            verification code below.
                          </span>
                        ) : null}

                      </div>
                    ) : null}

                    {data.otpSent &&
                    !data.verificationComplete ? (
                      <div>
                        <label
                          htmlFor="otp"
                          className="mb-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-[#334155] dark:text-[#CBD5E1]"
                        >
                          OTP
                        </label>

                        <div className="flex flex-col gap-3 sm:flex-row">
                          <input
                            id="otp"
                            type="text"
                            inputMode="numeric"
                            value={data.otp}
                            onChange={(
                              event: ChangeEvent<HTMLInputElement>
                            ) =>
                              setData((current) => ({
                                ...current,
                                otp: event.target.value,
                              }))
                            }
                            placeholder="Enter OTP"
                            className="w-full border border-[#C8D4E1] bg-white px-4 py-3 text-sm font-medium text-[#1F2937] outline-none transition focus:border-[#1769D2] focus:ring-1 focus:ring-[#1769D2] dark:border-[#344457] dark:bg-[#0B1118] dark:text-[#F1F5F9] dark:placeholder:text-[#64748B]"
                          />

                          <button
                            type="button"
                            onClick={verifyOtp}
                            disabled={
                              verifyingOtp ||
                              !data.otp.trim()
                            }
                            className="border border-[#0E2A4A] bg-[#0E2A4A] px-5 py-3 text-xs font-extrabold uppercase tracking-[0.08em] text-white transition hover:bg-[#16395F] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {verifyingOtp
                              ? "Verifying..."
                              : "Verify"}
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {data.verificationComplete ? (
                      <div className="border border-[#86B99A] bg-[#ECF8F0] px-4 py-4 dark:border-[#28633C] dark:bg-[#10271A]">
                        <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#176B37] dark:text-[#7BE2A0]">
                          Verification Complete
                        </p>

                        <p className="mt-1 text-sm text-[#315B42] dark:text-[#B7E5C6]">
                          Your identity verification has
                          been completed successfully.
                        </p>
                      </div>
                    ) : null}

                  </div>
                </div>

                {/* =====================================================
                    BASIC DETAILS
                    ===================================================== */}
                <div className="border border-[#CBD5E1] dark:border-[#344457]">

                  <div className="border-b border-[#DCE4EC] bg-[#F8FAFC] px-5 py-4 dark:border-[#263445] dark:bg-[#17212D]">
                    <h3 className="text-sm font-black uppercase tracking-[0.08em] text-[#102A43] dark:text-white">
                      Basic Details
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-[#64748B] dark:text-[#A8B5C5]">
                      Provide your location, category and
                      age information.
                    </p>
                  </div>

                  <div className="grid gap-6 p-5 md:grid-cols-2">

                    <div>
                      <label
                        htmlFor="state"
                        className="mb-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-[#334155] dark:text-[#CBD5E1]"
                      >
                        State
                      </label>

                      <select
                        id="state"
                        value={data.state}
                        onChange={(
                          event: ChangeEvent<HTMLSelectElement>
                        ) =>
                          setData((current) => ({
                            ...current,
                            state: event.target.value,
                            district: "",
                          }))
                        }
                        className="w-full border border-[#C8D4E1] bg-white px-4 py-3 text-sm font-medium text-[#1F2937] outline-none focus:border-[#1769D2] focus:ring-1 focus:ring-[#1769D2] dark:border-[#344457] dark:bg-[#0B1118] dark:text-[#F1F5F9]"
                      >
                        <option value="">
                          Select state
                        </option>

                        {LOCATIONS.map(
                          (location) => (
                            <option
                              key={location.state}
                              value={location.state}
                            >
                              {location.state}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="district"
                        className="mb-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-[#334155] dark:text-[#CBD5E1]"
                      >
                        District
                      </label>

                      <select
                        id="district"
                        value={data.district}
                        disabled={!data.state}
                        onChange={(
                          event: ChangeEvent<HTMLSelectElement>
                        ) =>
                          setData((current) => ({
                            ...current,
                            district:
                              event.target.value,
                          }))
                        }
                        className="w-full border border-[#C8D4E1] bg-white px-4 py-3 text-sm font-medium text-[#1F2937] outline-none focus:border-[#1769D2] focus:ring-1 focus:ring-[#1769D2] disabled:bg-[#F1F5F9] dark:border-[#344457] dark:bg-[#0B1118] dark:text-[#F1F5F9] dark:disabled:bg-[#17212D]"
                      >
                        <option value="">
                          {data.state
                            ? "Select district"
                            : "Select state first"}
                        </option>

                        {(
                          LOCATIONS.find(
                            (location) =>
                              location.state ===
                              data.state
                          )?.districts || []
                        ).map((district) => (
                          <option
                            key={district}
                            value={district}
                          >
                            {district}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="category"
                        className="mb-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-[#334155] dark:text-[#CBD5E1]"
                      >
                        Category
                      </label>

                      <select
                        id="category"
                        value={data.category}
                        onChange={(
                          event: ChangeEvent<HTMLSelectElement>
                        ) =>
                          setData((current) => ({
                            ...current,
                            category:
                              event.target
                                .value as FormData["category"],
                          }))
                        }
                        className="w-full border border-[#C8D4E1] bg-white px-4 py-3 text-sm font-medium text-[#1F2937] outline-none focus:border-[#1769D2] focus:ring-1 focus:ring-[#1769D2] dark:border-[#344457] dark:bg-[#0B1118] dark:text-[#F1F5F9]"
                      >
                        <option value="">
                          Select category
                        </option>

                        {CATEGORY_OPTIONS.map(
                          (category) => (
                            <option
                              key={category.value}
                              value={category.value}
                            >
                              {category.label}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="age"
                        className="mb-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-[#334155] dark:text-[#CBD5E1]"
                      >
                        Age
                      </label>

                      <input
                        id="age"
                        type="number"
                        min="1"
                        max="100"
                        value={data.age}
                        onChange={(
                          event: ChangeEvent<HTMLInputElement>
                        ) =>
                          setData((current) => ({
                            ...current,
                            age: event.target.value,
                          }))
                        }
                        placeholder="Enter your age"
                        className="w-full border border-[#C8D4E1] bg-white px-4 py-3 text-sm font-medium text-[#1F2937] outline-none transition focus:border-[#1769D2] focus:ring-1 focus:ring-[#1769D2] dark:border-[#344457] dark:bg-[#0B1118] dark:text-[#F1F5F9] dark:placeholder:text-[#64748B]"
                      />
                    </div>

                  </div>
                </div>

                {/* =====================================================
                    INFORMATION NOTICE
                    ===================================================== */}
                <div className="border border-[#E9B36A] bg-[#FFF8EC] px-5 py-4 dark:border-[#8A5A1E] dark:bg-[#2A1D0D]">
                  <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#A65A00] dark:text-[#F5B45B]">
                    Important
                  </p>

                  <p className="mt-1 text-sm leading-6 text-[#76511F] dark:text-[#E5C58F]">
                    Please ensure that the information
                    provided above is accurate. It will be
                    used to determine the appropriate
                    assistance journey and scheme options.
                  </p>
                </div>

                {/* =====================================================
                    STEP CONTROL
                    ===================================================== */}
                <div className="flex flex-col gap-3 border-t border-[#DCE4EC] bg-[#F8FAFC] px-5 py-5 dark:border-[#263445] dark:bg-[#17212D] sm:flex-row sm:items-center sm:justify-between">

                  <button
                    type="button"
                    onClick={previousStep}
                    disabled={step === 0}
                    className="border border-[#CBD5E1] bg-white px-5 py-3 text-xs font-extrabold uppercase tracking-[0.08em] text-[#334155] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#344457] dark:bg-[#0F1722] dark:text-[#CBD5E1] dark:hover:bg-[#1A2633]"
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={nextStep}
                    className="border border-[#1769D2] bg-[#1769D2] px-6 py-3 text-xs font-extrabold uppercase tracking-[0.08em] text-white transition hover:bg-[#0F5DBD]"
                  >
                    Continue to Earning Status
                  </button>

                </div>

              </div>
            </div>
          ) : null}

          {/* =====================================================
              STEP 02: EARNING STATUS
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
                      Earning Status
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-[#64748B] dark:text-[#A8B5C5]">
                      Establish whether you are earning or
                      non-earning and complete the relevant
                      assessment route.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-7 p-5 sm:p-7">

                {/* =====================================================
                    EARNING STATUS
                    ===================================================== */}
                <div className="border border-[#CBD5E1] dark:border-[#344457]">

                  <div className="border-b border-[#DCE4EC] bg-[#F8FAFC] px-5 py-4 dark:border-[#263445] dark:bg-[#17212D]">
                    <h3 className="text-sm font-black uppercase tracking-[0.08em] text-[#102A43] dark:text-white">
                      Current Earning Status
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-[#64748B] dark:text-[#A8B5C5]">
                      Select the option that best describes
                      your current financial situation.
                    </p>
                  </div>

                  <div className="grid gap-4 p-5 sm:grid-cols-2">

                    <button
                      type="button"
                      onClick={() =>
                        setData((current) => ({
                          ...current,
                          earningStatus:
                            "earning",
                          assessmentPurpose:
                            "",
                          purpose: undefined,
                        }))
                      }
                      className={`border px-5 py-5 text-left transition ${
                        data.earningStatus ===
                        "earning"
                          ? "border-[#1769D2] bg-[#F0F7FF] dark:border-[#1769D2] dark:bg-[#132033]"
                          : "border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] dark:border-[#344457] dark:bg-[#0F1722] dark:hover:bg-[#17212D]"
                      }`}
                    >
                      <p className="text-sm font-black text-[#102A43] dark:text-white">
                        Earning
                      </p>

                      <p className="mt-1 text-xs leading-5 text-[#64748B] dark:text-[#A8B5C5]">
                        I currently have an income or
                        earning source.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setData((current) => ({
                          ...current,
                          earningStatus:
                            "non-earning",
                          annualIncome: "",
                        }))
                      }
                      className={`border px-5 py-5 text-left transition ${
                        data.earningStatus ===
                        "non-earning"
                          ? "border-[#1769D2] bg-[#F0F7FF] dark:border-[#1769D2] dark:bg-[#132033]"
                          : "border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] dark:border-[#344457] dark:bg-[#0F1722] dark:hover:bg-[#17212D]"
                      }`}
                    >
                      <p className="text-sm font-black text-[#102A43] dark:text-white">
                        Non-Earning
                      </p>

                      <p className="mt-1 text-xs leading-5 text-[#64748B] dark:text-[#A8B5C5]">
                        I currently do not have an
                        earning source.
                      </p>
                    </button>

                  </div>
                </div>

                {/* =====================================================
                    EARNING ROUTE
                    ===================================================== */}
                {data.earningStatus ===
                "earning" ? (
                  <div className="border border-[#CBD5E1] dark:border-[#344457]">

                    <div className="border-b border-[#DCE4EC] bg-[#F8FAFC] px-5 py-4 dark:border-[#263445] dark:bg-[#17212D]">
                      <h3 className="text-sm font-black uppercase tracking-[0.08em] text-[#102A43] dark:text-white">
                        Income Details
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-[#64748B] dark:text-[#A8B5C5]">
                        Provide your annual income and
                        relevant financial information.
                      </p>
                    </div>

                    <div className="space-y-6 p-5">

                      <div>
                        <label
                          htmlFor="annualIncome"
                          className="mb-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-[#334155] dark:text-[#CBD5E1]"
                        >
                          Annual Income
                        </label>

                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#64748B] dark:text-[#94A3B8]">
                            ₹
                          </span>

                          <input
                            id="annualIncome"
                            type="number"
                            min="0"
                            value={
                              data.annualIncome
                            }
                            onChange={(
                              event: ChangeEvent<HTMLInputElement>
                            ) =>
                              setData(
                                (current) => ({
                                  ...current,
                                  annualIncome:
                                    event.target
                                      .value,
                                })
                              )
                            }
                            placeholder="Enter annual income"
                            className="w-full border border-[#C8D4E1] bg-white py-3 pl-9 pr-4 text-sm font-medium text-[#1F2937] outline-none transition focus:border-[#1769D2] focus:ring-1 focus:ring-[#1769D2] dark:border-[#344457] dark:bg-[#0B1118] dark:text-[#F1F5F9] dark:placeholder:text-[#64748B]"
                          />
                        </div>

                        <p className="mt-2 text-[11px] leading-5 text-[#64748B] dark:text-[#94A3B8]">
                          Enter your approximate total
                          annual income in Indian Rupees.
                        </p>
                      </div>

                      <div>
                        <label
                          htmlFor="incomeProof"
                          className="mb-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-[#334155] dark:text-[#CBD5E1]"
                        >
                          Income Proof
                        </label>

                        <input
                          id="incomeProof"
                          type="file"
                          onChange={(
                            event: ChangeEvent<HTMLInputElement>
                          ) =>
                            setData(
                              (current) => ({
                                ...current,
                                incomeProof:
                                  event.target
                                    .files?.[0] ||
                                  null,
                              })
                            )
                          }
                          className="block w-full border border-[#C8D4E1] bg-white px-4 py-3 text-sm font-medium text-[#1F2937] file:mr-4 file:border-0 file:bg-[#0E2A4A] file:px-4 file:py-2 file:text-xs file:font-extrabold file:text-white dark:border-[#344457] dark:bg-[#0B1118] dark:text-[#F1F5F9]"
                        />

                        <p className="mt-2 text-[11px] leading-5 text-[#64748B] dark:text-[#94A3B8]">
                          Upload supporting income
                          documentation where applicable.
                        </p>
                      </div>

                      <div>
                        <label
                          htmlFor="purpose"
                          className="mb-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-[#334155] dark:text-[#CBD5E1]"
                        >
                          Assistance Purpose
                        </label>

                        <select
                          id="purpose"
                          value={
                            data.purpose || ""
                          }
                          onChange={(
                            event: ChangeEvent<HTMLSelectElement>
                          ) =>
                            setData(
                              (current) => ({
                                ...current,
                                purpose:
                                  event.target
                                    .value as FormData["purpose"],
                              })
                            )
                          }
                          className="w-full border border-[#C8D4E1] bg-white px-4 py-3 text-sm font-medium text-[#1F2937] outline-none focus:border-[#1769D2] focus:ring-1 focus:ring-[#1769D2] dark:border-[#344457] dark:bg-[#0B1118] dark:text-[#F1F5F9]"
                        >
                          <option value="">
                            Select purpose
                          </option>

                          {PURPOSE_OPTIONS.map(
                            (purpose) => (
                              <option
                                key={purpose.value}
                                value={purpose.value}
                              >
                                {purpose.label}
                              </option>
                            )
                          )}
                        </select>
                      </div>

                    </div>
                  </div>
                ) : null}

                {/* =====================================================
                    NON-EARNING ROUTE
                    ===================================================== */}
                {data.earningStatus ===
                "non-earning" ? (
                  <div className="border border-[#CBD5E1] dark:border-[#344457]">

                    <div className="border-b border-[#DCE4EC] bg-[#F8FAFC] px-5 py-4 dark:border-[#263445] dark:bg-[#17212D]">
                      <h3 className="text-sm font-black uppercase tracking-[0.08em] text-[#102A43] dark:text-white">
                        Assessment Route
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-[#64748B] dark:text-[#A8B5C5]">
                        Select the purpose for which you
                        are seeking financial assistance.
                      </p>
                    </div>

                    <div className="space-y-5 p-5">

                      <div className="grid gap-4 sm:grid-cols-2">

                        <button
                          type="button"
                          onClick={() =>
                            setData(
                              (current) => ({
                                ...current,
                                assessmentPurpose:
                                  "education",
                                purpose:
                                  "education",
                                activityType:
                                  "",
                              })
                            )
                          }
                          className={`border px-5 py-5 text-left transition ${
                            data.assessmentPurpose ===
                            "education"
                              ? "border-[#1769D2] bg-[#F0F7FF] dark:border-[#1769D2] dark:bg-[#132033]"
                              : "border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] dark:border-[#344457] dark:bg-[#0F1722] dark:hover:bg-[#17212D]"
                          }`}
                        >
                          <p className="text-sm font-black text-[#102A43] dark:text-white">
                            Education
                          </p>

                          <p className="mt-1 text-xs leading-5 text-[#64748B] dark:text-[#A8B5C5]">
                            Explore assistance related
                            to education and training.
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setData(
                              (current) => ({
                                ...current,
                                assessmentPurpose:
                                  "small-project",
                                purpose:
                                  "small-project",
                                activityType:
                                  "",
                              })
                            )
                          }
                          className={`border px-5 py-5 text-left transition ${
                            data.assessmentPurpose ===
                            "small-project"
                              ? "border-[#1769D2] bg-[#F0F7FF] dark:border-[#1769D2] dark:bg-[#132033]"
                              : "border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] dark:border-[#344457] dark:bg-[#0F1722] dark:hover:bg-[#17212D]"
                          }`}
                        >
                          <p className="text-sm font-black text-[#102A43] dark:text-white">
                            Small Project
                          </p>

                          <p className="mt-1 text-xs leading-5 text-[#64748B] dark:text-[#A8B5C5]">
                            Explore support for a
                            small project or activity.
                          </p>
                        </button>

                      </div>

                      {data.assessmentPurpose ===
                      "education" ? (
                        <div>
                          <label
                            htmlFor="educationLevel"
                            className="mb-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-[#334155] dark:text-[#CBD5E1]"
                          >
                            Education Level
                          </label>

                          <select
                            id="educationLevel"
                            value={
                              data.educationLevel
                            }
                            onChange={(
                              event: ChangeEvent<HTMLSelectElement>
                            ) =>
                              setData(
                                (current) => ({
                                  ...current,
                                  educationLevel:
                                    event.target
                                      .value,
                                })
                              )
                            }
                            className="w-full border border-[#C8D4E1] bg-white px-4 py-3 text-sm font-medium text-[#1F2937] outline-none focus:border-[#1769D2] focus:ring-1 focus:ring-[#1769D2] dark:border-[#344457] dark:bg-[#0B1118] dark:text-[#F1F5F9]"
                          >
                            <option value="">
                              Select education level
                            </option>

                            {EDUCATION_OPTIONS.map(
                              (education) => (
                                <option
                                  key={education}
                                  value={education}
                                >
                                  {education}
                                </option>
                              )
                            )}
                          </select>
                        </div>
                      ) : null}

                      {data.assessmentPurpose ===
                      "education" ? (
                        <div>
                          <label
                            htmlFor="courseLocation"
                            className="mb-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-[#334155] dark:text-[#CBD5E1]"
                          >
                            Course Location
                          </label>

                          <input
                            id="courseLocation"
                            type="text"
                            value={
                              data.courseLocation
                            }
                            onChange={(
                              event: ChangeEvent<HTMLInputElement>
                            ) =>
                              setData(
                                (current) => ({
                                  ...current,
                                  courseLocation:
                                    event.target
                                      .value,
                                })
                              )
                            }
                            placeholder="Enter city or institution location"
                            className="w-full border border-[#C8D4E1] bg-white px-4 py-3 text-sm font-medium text-[#1F2937] outline-none transition focus:border-[#1769D2] focus:ring-1 focus:ring-[#1769D2] dark:border-[#344457] dark:bg-[#0B1118] dark:text-[#F1F5F9] dark:placeholder:text-[#64748B]"
                          />
                        </div>
                      ) : null}

                    </div>
                  </div>
                ) : null}

                {/* =====================================================
                    PROJECT DETAILS
                    ===================================================== */}
                {data.assessmentPurpose ===
                "small-project" ||
                (data.earningStatus ===
                  "earning" &&
                  data.purpose ===
                    "small-project") ? (
                  <div className="border border-[#CBD5E1] dark:border-[#344457]">

                    <div className="border-b border-[#DCE4EC] bg-[#F8FAFC] px-5 py-4 dark:border-[#263445] dark:bg-[#17212D]">
                      <h3 className="text-sm font-black uppercase tracking-[0.08em] text-[#102A43] dark:text-white">
                        Project Details
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-[#64748B] dark:text-[#A8B5C5]">
                        Provide details about the activity
                        or project requiring assistance.
                      </p>
                    </div>

                    <div className="grid gap-6 p-5 md:grid-cols-2">

                      <div>
                        <label
                          htmlFor="activityType"
                          className="mb-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-[#334155] dark:text-[#CBD5E1]"
                        >
                          Activity Type
                        </label>

                        <select
                          id="activityType"
                          value={
                            data.activityType
                          }
                          onChange={(
                            event: ChangeEvent<HTMLSelectElement>
                          ) =>
                            setData(
                              (current) => ({
                                ...current,
                                activityType:
                                  event.target
                                    .value,
                              })
                            )
                          }
                          className="w-full border border-[#C8D4E1] bg-white px-4 py-3 text-sm font-medium text-[#1F2937] outline-none focus:border-[#1769D2] focus:ring-1 focus:ring-[#1769D2] dark:border-[#344457] dark:bg-[#0B1118] dark:text-[#F1F5F9]"
                        >
                          <option value="">
                            Select activity
                          </option>

                          {(
                            getActivityForPurpose(
                              data.purpose
                            ) || []
                          ).map((activity) => (
                            <option
                              key={activity}
                              value={activity}
                            >
                              {activity}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="projectCost"
                          className="mb-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-[#334155] dark:text-[#CBD5E1]"
                        >
                          Project Cost
                        </label>

                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#64748B] dark:text-[#94A3B8]">
                            ₹
                          </span>

                          <input
                            id="projectCost"
                            type="number"
                            min="0"
                            value={
                              data.projectCost
                            }
                            onChange={(
                              event: ChangeEvent<HTMLInputElement>
                            ) =>
                              setData(
                                (current) => ({
                                  ...current,
                                  projectCost:
                                    event.target
                                      .value,
                                })
                              )
                            }
                            placeholder="Enter project cost"
                            className="w-full border border-[#C8D4E1] bg-white py-3 pl-9 pr-4 text-sm font-medium text-[#1F2937] outline-none transition focus:border-[#1769D2] focus:ring-1 focus:ring-[#1769D2] dark:border-[#344457] dark:bg-[#0B1118] dark:text-[#F1F5F9] dark:placeholder:text-[#64748B]"
                          />
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
                    Assessment Information
                  </p>

                  <p className="mt-1 text-sm leading-6 text-[#76511F] dark:text-[#E5C58F]">
                    Your earning status helps NIRVAAN
                    determine which assessment route and
                    financial assistance options are
                    relevant to your profile.
                  </p>
                </div>

                {/* =====================================================
                    STEP CONTROL
                    ===================================================== */}
                <div className="flex flex-col gap-3 border-t border-[#DCE4EC] bg-[#F8FAFC] px-5 py-5 dark:border-[#263445] dark:bg-[#17212D] sm:flex-row sm:items-center sm:justify-between">

                  <button
                    type="button"
                    onClick={previousStep}
                    className="border border-[#CBD5E1] bg-white px-5 py-3 text-xs font-extrabold uppercase tracking-[0.08em] text-[#334155] transition hover:bg-[#F8FAFC] dark:border-[#344457] dark:bg-[#0F1722] dark:text-[#CBD5E1] dark:hover:bg-[#1A2633]"
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
              STEP 03: SMART SCHEME RECOMMENDER
              ===================================================== */}
                      {step === 2 ? (
            <div>
              <div className="border-b border-[#DCE4EC] px-5 py-5 sm:px-7 dark:border-[#263445]">
                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 flex-none items-center justify-center bg-[#1769D2] text-xs font-black text-white">
                    03
                  </span>

                  <div>
                    <h2 className="text-xl font-black text-[#102A43] dark:text-white">
                      Smart Scheme Recommender
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-[#64748B] dark:text-[#A8B5C5]">
                      Use your verified information to identify
                      suitable government loan schemes and
                      understand the available support.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-7 p-5 sm:p-7">

                <div className="border border-[#CBD5E1] dark:border-[#344457]">
                  <div className="border-b border-[#DCE4EC] bg-[#F8FAFC] px-5 py-4 dark:border-[#263445] dark:bg-[#17212D]">
                    <h3 className="text-sm font-black uppercase tracking-[0.08em] text-[#102A43] dark:text-white">
                      Recommendation Inputs
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-[#64748B] dark:text-[#A8B5C5]">
                      Review the information that will be
                      used to generate your scheme
                      recommendation.
                    </p>
                  </div>

                  <div className="grid gap-5 p-5 md:grid-cols-2">

                    <div className="border border-[#DCE4EC] bg-[#F8FAFC] p-4 dark:border-[#344457] dark:bg-[#17212D]">
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#7A8797] dark:text-[#94A3B8]">
                        Location
                      </p>

                      <p className="mt-2 text-sm font-extrabold text-[#102A43] dark:text-white">
                        {data.district
                          ? `${data.district}, ${data.state}`
                          : data.state || "Not provided"}
                      </p>
                    </div>

                    <div className="border border-[#DCE4EC] bg-[#F8FAFC] p-4 dark:border-[#344457] dark:bg-[#17212D]">
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#7A8797] dark:text-[#94A3B8]">
                        Category
                      </p>

                      <p className="mt-2 text-sm font-extrabold text-[#102A43] dark:text-white">
                        {data.category
                          ? data.category.toUpperCase()
                          : "Not provided"}
                      </p>
                    </div>

                    <div className="border border-[#DCE4EC] bg-[#F8FAFC] p-4 dark:border-[#344457] dark:bg-[#17212D]">
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#7A8797] dark:text-[#94A3B8]">
                        Earning Status
                      </p>

                      <p className="mt-2 text-sm font-extrabold text-[#102A43] dark:text-white">
                        {data.earningStatus ===
                        "earning"
                          ? "Earning"
                          : data.earningStatus ===
                              "non-earning"
                            ? "Non-Earning"
                            : "Not provided"}
                      </p>
                    </div>

                    <div className="border border-[#DCE4EC] bg-[#F8FAFC] p-4 dark:border-[#344457] dark:bg-[#17212D]">
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#7A8797] dark:text-[#94A3B8]">
                        Assistance Purpose
                      </p>

                      <p className="mt-2 text-sm font-extrabold text-[#102A43] dark:text-white">
                        {data.purpose ||
                          data.assessmentPurpose ||
                          "Not provided"}
                      </p>
                    </div>

                  </div>
                </div>

                <div className="border border-[#E9B36A] bg-[#FFF8EC] px-5 py-4 dark:border-[#8A5A1E] dark:bg-[#2A1D0D]">
                  <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#A65A00] dark:text-[#F5B45B]">
                    Smart Matching
                  </p>

                  <p className="mt-1 text-sm leading-6 text-[#76511F] dark:text-[#E5C58F]">
                    NIRVAAN will compare your verified
                    profile and assessment details with
                    suitable scheme criteria before
                    presenting a recommendation.
                  </p>
                </div>

                <div className="border border-[#CBD5E1] bg-[#F8FAFC] p-5 dark:border-[#344457] dark:bg-[#17212D]">
                  <div className="flex items-start gap-4">
                    <span className="flex h-9 w-9 flex-none items-center justify-center bg-[#0E2A4A] text-xs font-black text-white">
                      03
                    </span>

                    <div>
                      <p className="text-sm font-black text-[#102A43] dark:text-white">
                        Recommendation Ready
                      </p>

                      <p className="mt-1 text-xs leading-5 text-[#64748B] dark:text-[#A8B5C5]">
                        Continue to generate your personalized
                        scheme recommendation.
                      </p>
                    </div>
                  </div>
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

                <div className="flex flex-col gap-3 border-t border-[#DCE4EC] bg-[#F8FAFC] px-5 py-5 dark:border-[#263445] dark:bg-[#17212D] sm:flex-row sm:items-center sm:justify-between">

                  <button
                    type="button"
                    onClick={previousStep}
                    className="border border-[#CBD5E1] bg-white px-5 py-3 text-xs font-extrabold uppercase tracking-[0.08em] text-[#334155] transition hover:bg-[#F8FAFC] dark:border-[#344457] dark:bg-[#0F1722] dark:text-[#CBD5E1] dark:hover:bg-[#1A2633]"
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
              Five Journey Highlights
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#64748B] dark:text-[#A8B5C5]">
              NIRVAAN follows a structured journey from
              verification through scheme discovery and
              financial planning to partner assistance.
            </p>
          </div>

          <div className="grid gap-px border border-[#DCE4EC] bg-[#DCE4EC] dark:border-[#344457] dark:bg-[#344457] md:grid-cols-5">

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
                        
