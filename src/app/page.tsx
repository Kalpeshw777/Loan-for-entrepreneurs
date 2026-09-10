"use client";

import Link from "next/link";

const JOURNEY_STEPS = [
  {
    number: "01",
    title: "Verification",
    description:
      "Verify your identity and establish the basic information required to begin your assistance journey.",
    icon: (
      <svg
        viewBox="0 0 32 32"
        className="h-7 w-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <rect x="6" y="4" width="20" height="24" />
        <path d="M11 10h10" />
        <path d="M11 15h10" />
        <path d="M11 20h6" />
        <path d="m20 20 2 2 4-5" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Earning Status",
    description:
      "Establish whether you are earning or non-earning and complete the relevant assessment route.",
    icon: (
      <svg
        viewBox="0 0 32 32"
        className="h-7 w-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <rect x="4" y="8" width="24" height="18" />
        <path d="M11 8V5h10v3" />
        <path d="M4 14h24" />
        <path d="M13 14v4h6v-4" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Smart Scheme Recommender",
    description:
      "Use verified information to identify suitable government loan schemes and understand the available support.",
    icon: (
      <svg
        viewBox="0 0 32 32"
        className="h-7 w-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <circle cx="16" cy="16" r="10" />
        <path d="M16 10v6l4 3" />
        <path d="M8 8 6 6" />
        <path d="m24 8 2-2" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Financial Calculator",
    description:
      "Select an eligible loan amount and explore repayment planning based on your recommended financial option.",
    icon: (
      <svg
        viewBox="0 0 32 32"
        className="h-7 w-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <rect x="6" y="4" width="20" height="24" />
        <rect x="10" y="8" width="12" height="5" />
        <path d="M10 17h3" />
        <path d="M16 17h3" />
        <path d="M22 17h0" />
        <path d="M10 22h3" />
        <path d="M16 22h3" />
        <path d="M22 22h0" />
      </svg>
    ),
  },
  {
    number: "05",
    title: "Geo-Spatial Partner Locator & Router",
    description:
      "Locate available partner institutions across India and route your application journey to the appropriate partner.",
    icon: (
      <svg
        viewBox="0 0 32 32"
        className="h-7 w-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <path d="M16 27s8-8.2 8-14a8 8 0 1 0-16 0c0 5.8 8 14 8 14Z" />
        <circle cx="16" cy="13" r="2.5" />
        <path d="M7 25h5" />
        <path d="M20 25h5" />
      </svg>
    ),
  },
];

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M5 12h13" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      className="h-8 w-8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <path d="M16 27s8-8.2 8-14a8 8 0 1 0-16 0c0 5.8 8 14 8 14Z" />
      <circle cx="16" cy="13" r="2.5" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <div className="nirvaan-page">
      {/* -------------------------------------------------
          HERO
      ------------------------------------------------- */}

      <section className="relative overflow-hidden border-b border-[var(--nirvaan-border)]">
        <div className="nirvaan-hero absolute inset-0 z-0" />

        <div className="nirvaan-fabric-background" aria-hidden="true">
          <img src="/nirvaan-fabric.jpg" alt="" />
        </div>

        <div className="relative z-10 mx-auto grid min-h-[620px] w-full max-w-[1440px] grid-cols-1 items-center px-5 py-14 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-10 lg:py-16">
          <div className="relative z-20 max-w-[640px]">
            <div className="mb-6 flex items-center gap-3">
              <span className="h-[2px] w-10 bg-[var(--nirvaan-orange)]" />

              <span className="text-[10px] font-bold tracking-[2px] text-[var(--nirvaan-blue)]">
                FINANCIAL SUPPORT ASSISTANCE
              </span>
            </div>

            <h1 className="nirvaan-text-strong max-w-[680px] text-[44px] font-extrabold leading-[1.05] tracking-[-1.5px] sm:text-[58px] lg:text-[70px]">
              Find the right scheme.
              <br />
              <span className="nirvaan-blue">
                Get your financial support.
              </span>
            </h1>

            <p className="nirvaan-muted mt-7 max-w-[560px] text-[14px] font-medium leading-7 sm:text-[15px]">
              Follow a structured assistance journey designed to help you
              verify your information, understand your eligibility, identify
              suitable loan schemes, plan repayment and reach the appropriate
              partner.
            </p>

            <div className="mt-9">
              <Link
                href="/wizard"
                className="nirvaan-primary text-[11px]"
              >
                START YOUR JOURNEY
                <span className="ml-3">
                  <ArrowIcon />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------
          PARTNER LOCATIONS & ROUTES
      ------------------------------------------------- */}

      <section className="border-b border-[var(--nirvaan-border)]">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="overflow-hidden border border-[var(--nirvaan-border)] bg-[var(--nirvaan-surface-2)]">
            <div className="grid grid-cols-[1fr_105px] sm:grid-cols-[1fr_150px] lg:grid-cols-[1fr_190px]">
              
              {/* CONTENT */}
              <div className="min-w-0 p-5 sm:p-7 lg:p-8">
                <p className="text-[9px] font-bold tracking-[2px] text-[var(--nirvaan-orange)] sm:text-[10px]">
                  FIND PARTNER LOCATIONS
                </p>

                <h2 className="nirvaan-text-strong mt-2 max-w-[520px] text-[20px] font-extrabold leading-[1.08] sm:text-[26px]">
                  OUR PARTNERS&apos;
                  <br />
                  <span className="nirvaan-blue">
                    LOCATIONS &amp; ROUTES
                  </span>
                </h2>

                <p className="nirvaan-muted mt-4 max-w-[560px] text-[11px] font-medium leading-5 sm:text-[13px] sm:leading-6">
                  Find our partner institutions across India, explore nearby
                  partners, and view routes.
                </p>

                <div className="mt-4 hidden flex-wrap gap-x-5 gap-y-2 sm:flex">
                  <span className="nirvaan-muted text-[10px] font-semibold">
                    Partner institutions across India
                  </span>

                  <span className="nirvaan-muted text-[10px] font-semibold">
                    Explore nearby partners
                  </span>

                  <span className="nirvaan-muted text-[10px] font-semibold">
                    View routes
                  </span>
                </div>

                <div className="mt-5">
                  <Link
                    href="/partner-location"
                    className="nirvaan-primary w-full justify-center text-[10px] sm:w-auto"
                  >
                    EXPLORE PARTNERS
                    <span className="ml-3">
                      <ArrowIcon />
                    </span>
                  </Link>
                </div>
              </div>

              {/* LOCATION PANEL */}
              <div className="flex min-h-full flex-col items-center justify-center border-l border-[var(--nirvaan-border)] bg-[var(--nirvaan-surface-2)] px-2">
                <div className="flex h-12 w-12 items-center justify-center border border-[var(--nirvaan-blue)] bg-[var(--nirvaan-surface)] text-[var(--nirvaan-blue)] sm:h-16 sm:w-16">
                  <LocationIcon />
                </div>

                <p className="mt-3 text-center text-[8px] font-bold uppercase leading-4 tracking-[0.06em] text-[var(--nirvaan-text)] sm:text-[10px] sm:leading-5">
                  Across India
                  <br />
                  Near You
                </p>
              </div>
            </div>

            {/* INFORMATION NOTE */}
            <div className="border-t border-[var(--nirvaan-border)] px-5 py-3 sm:px-6">
              <p className="nirvaan-muted text-[9px] font-semibold leading-5 sm:text-[10px]">
                <span className="text-[var(--nirvaan-orange)]">
                  INFORMATION ONLY:
                </span>{" "}
                Partner locations and routes can be explored independently. To
                proceed with loan assistance, you must complete the required
                stages of the NIRVAAN journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------
          FIVE STEP JOURNEY
      ------------------------------------------------- */}

      <section
        id="journey"
        className="border-b border-[var(--nirvaan-border)]"
      >
        <div className="mx-auto w-full max-w-[1100px] px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
          {/* Section Heading */}
          <div className="max-w-[760px]">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-[2px] w-8 bg-[var(--nirvaan-orange)]" />

              <span className="text-[10px] font-bold tracking-[2px] text-[var(--nirvaan-blue)]">
                FIVE-STEP JOURNEY
              </span>
            </div>

            <h2 className="nirvaan-text-strong text-[32px] font-extrabold leading-tight sm:text-[42px]">
              One journey.
              <br />
              <span className="nirvaan-blue">
                Everything in order.
              </span>
            </h2>

            <p className="nirvaan-muted mt-5 max-w-[700px] text-[13px] font-medium leading-6">
              Your assistance journey follows a fixed sequence. Each stage
              builds on the information completed in the previous stage.
            </p>
          </div>

          {/* Vertical Journey */}
          <div className="relative mt-12">
            {/* Connecting Line */}
            <div className="absolute bottom-8 left-[24px] top-8 w-px bg-[var(--nirvaan-blue)] opacity-30 sm:left-[30px]" />

            <div className="space-y-5 sm:space-y-6">
              {JOURNEY_STEPS.map((step) => (
                <article
                  key={step.number}
                  className="relative flex items-stretch gap-4 sm:gap-6"
                >
                  {/* Number */}
                  <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center border border-[var(--nirvaan-blue)] bg-[var(--nirvaan-surface)] sm:h-[60px] sm:w-[60px]">
                    <span className="text-[17px] font-extrabold tracking-[-0.5px] text-[var(--nirvaan-blue)] sm:text-[20px]">
                      {step.number}
                    </span>
                  </div>

                  {/* Step Card */}
                  <div className="nirvaan-step flex min-w-0 flex-1 items-start justify-between gap-4 p-5 sm:p-6">
                    <div className="min-w-0">
                      <h3 className="nirvaan-text-strong text-[16px] font-extrabold leading-6 sm:text-[18px]">
                        {step.title}
                      </h3>

                      <p className="nirvaan-muted mt-3 max-w-[720px] text-[11px] font-medium leading-5 sm:text-[12px] sm:leading-6">
                        {step.description}
                      </p>
                    </div>

                    <span className="nirvaan-step-icon shrink-0">
                      {step.icon}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Sequential Notice */}
          <div className="mt-8 border-l-2 border-[var(--nirvaan-orange)] bg-[var(--nirvaan-surface-2)] px-5 py-4">
            <p className="nirvaan-muted text-[11px] font-semibold leading-5">
              <span className="nirvaan-text-strong">
                The journey is sequential.
              </span>{" "}
              Later stages become available only after the required previous
              stage has been completed.{" "}
              <span className="nirvaan-blue">
                Partner locations and routes can be accessed independently at
                any time.
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------
          CONTACT
      ------------------------------------------------- */}

      <section
        id="contact"
        className="border-b border-[var(--nirvaan-border)]"
      >
        <div className="mx-auto w-full max-w-[1440px] px-5 py-3 sm:px-8 lg:px-10">
          <span className="text-[9px] font-bold tracking-[2px] text-[var(--nirvaan-blue)]">
            CONTACT US
          </span>

          <div className="mt-3 flex flex-col gap-2 text-[11px] font-medium sm:flex-row sm:gap-8">
            <span className="nirvaan-muted">
              Phone no -{" "}
              <a
                href="tel:+919373542405"
                className="nirvaan-text-strong hover:text-[var(--nirvaan-blue)]"
              >
                +91 9373542405
              </a>
            </span>

            <span className="nirvaan-muted">
              Email -{" "}
              <a
                href="mailto:nirvaanscheme@gmail.com"
                className="nirvaan-text-strong hover:text-[var(--nirvaan-blue)]"
              >
                nirvaanscheme@gmail.com
              </a>
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
