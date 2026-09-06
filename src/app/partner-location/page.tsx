"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Partner = {
  id: number;
  name: string;
  type: string;
  city: string;
  state: string;
  address: string;
};

const PARTNERS: Partner[] = [
  {
    id: 1,
    name: "Partner Institution 01",
    type: "Financial Assistance Partner",
    city: "Mumbai",
    state: "Maharashtra",
    address: "Mumbai, Maharashtra",
  },
  {
    id: 2,
    name: "Partner Institution 02",
    type: "Financial Assistance Partner",
    city: "Pune",
    state: "Maharashtra",
    address: "Pune, Maharashtra",
  },
  {
    id: 3,
    name: "Partner Institution 03",
    type: "Financial Assistance Partner",
    city: "New Delhi",
    state: "Delhi",
    address: "New Delhi, Delhi",
  },
  {
    id: 4,
    name: "Partner Institution 04",
    type: "Financial Assistance Partner",
    city: "Bengaluru",
    state: "Karnataka",
    address: "Bengaluru, Karnataka",
  },
  {
    id: 5,
    name: "Partner Institution 05",
    type: "Financial Assistance Partner",
    city: "Hyderabad",
    state: "Telangana",
    address: "Hyderabad, Telangana",
  },
];

const STATES = [
  "All States",
  ...Array.from(new Set(PARTNERS.map((partner) => partner.state))),
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
      className="h-7 w-7"
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

function RouteIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      className="h-7 w-7"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <circle cx="7" cy="24" r="3" />
      <circle cx="25" cy="8" r="3" />
      <path d="M9.5 22.5c4-2 3.5-8 7-10.5 2-1.4 4.5-1.5 6-2" />
    </svg>
  );
}

export default function PartnerLocationPage() {
  const [selectedState, setSelectedState] = useState("All States");
  const [search, setSearch] = useState("");

  const filteredPartners = useMemo(() => {
    const query = search.trim().toLowerCase();

    return PARTNERS.filter((partner) => {
      const matchesState =
        selectedState === "All States" || partner.state === selectedState;

      const matchesSearch =
        !query ||
        partner.name.toLowerCase().includes(query) ||
        partner.city.toLowerCase().includes(query) ||
        partner.state.toLowerCase().includes(query);

      return matchesState && matchesSearch;
    });
  }, [selectedState, search]);

  return (
    <main className="nirvaan-page min-h-screen">
      {/* -------------------------------------------------
          HERO
      ------------------------------------------------- */}

      <section className="border-b border-[var(--nirvaan-border)]">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
          <div className="max-w-[820px]">
            <div className="mb-5 flex items-center gap-3">
              <span className="h-[2px] w-8 bg-[var(--nirvaan-orange)]" />

              <span className="text-[10px] font-bold tracking-[2px] text-[var(--nirvaan-blue)]">
                FIND PARTNER LOCATIONS
              </span>
            </div>

            <h1 className="nirvaan-text-strong text-[36px] font-extrabold leading-[1.05] tracking-[-1px] sm:text-[52px] lg:text-[64px]">
              Partner Location
              <br />
              <span className="nirvaan-blue">&amp; Route</span>
            </h1>

            <p className="nirvaan-muted mt-6 max-w-[680px] text-[13px] font-medium leading-7 sm:text-[15px]">
              Find partner institutions across India, explore available
              locations and identify the appropriate route to your selected
              partner.
            </p>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------
          SEARCH
      ------------------------------------------------- */}

      <section className="border-b border-[var(--nirvaan-border)]">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
          <div className="mb-6">
            <p className="text-[10px] font-bold tracking-[2px] text-[var(--nirvaan-orange)]">
              LOCATE A PARTNER
            </p>

            <h2 className="nirvaan-text-strong mt-2 text-[25px] font-extrabold sm:text-[32px]">
              Search partner institutions
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_260px_auto]">
            {/* Search */}
            <div>
              <label
                htmlFor="partner-search"
                className="mb-2 block text-[10px] font-bold uppercase tracking-[1px] text-[var(--nirvaan-text)]"
              >
                Search by city or partner
              </label>

              <input
                id="partner-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Enter city or partner name"
                className="h-12 w-full border border-[var(--nirvaan-border)] bg-[var(--nirvaan-surface)] px-4 text-sm text-[var(--nirvaan-text)] outline-none placeholder:text-[var(--nirvaan-muted)] focus:border-[var(--nirvaan-blue)]"
              />
            </div>

            {/* State */}
            <div>
              <label
                htmlFor="partner-state"
                className="mb-2 block text-[10px] font-bold uppercase tracking-[1px] text-[var(--nirvaan-text)]"
              >
                State
              </label>

              <select
                id="partner-state"
                value={selectedState}
                onChange={(event) => setSelectedState(event.target.value)}
                className="h-12 w-full border border-[var(--nirvaan-border)] bg-[var(--nirvaan-surface)] px-4 text-sm text-[var(--nirvaan-text)] outline-none focus:border-[var(--nirvaan-blue)]"
              >
                {STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            {/* Nearby */}
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedState("All States");
              }}
              className="h-12 self-end border border-[var(--nirvaan-blue)] bg-[var(--nirvaan-blue)] px-6 text-[10px] font-bold tracking-[1px] text-white transition hover:opacity-90"
            >
              RESET SEARCH
            </button>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------
          PARTNER RESULTS
      ------------------------------------------------- */}

      <section className="border-b border-[var(--nirvaan-border)]">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] font-bold tracking-[2px] text-[var(--nirvaan-orange)]">
                PARTNER NETWORK
              </p>

              <h2 className="nirvaan-text-strong mt-2 text-[25px] font-extrabold sm:text-[32px]">
                Available partner institutions
              </h2>
            </div>

            <p className="nirvaan-muted text-[11px] font-semibold">
              {filteredPartners.length} partner
              {filteredPartners.length === 1 ? "" : "s"} found
            </p>
          </div>

          <div className="mt-8 space-y-3">
            {filteredPartners.length > 0 ? (
              filteredPartners.map((partner) => (
                <article
                  key={partner.id}
                  className="border border-[var(--nirvaan-border)] bg-[var(--nirvaan-surface-2)]"
                >
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto]">
                    <div className="flex gap-4 p-5 sm:p-6">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-[var(--nirvaan-blue)] bg-[var(--nirvaan-surface)] text-[var(--nirvaan-blue)]">
                        <LocationIcon />
                      </div>

                      <div className="min-w-0">
                        <h3 className="nirvaan-text-strong text-[15px] font-extrabold sm:text-[17px]">
                          {partner.name}
                        </h3>

                        <p className="nirvaan-muted mt-1 text-[10px] font-semibold uppercase tracking-[0.5px]">
                          {partner.type}
                        </p>

                        <p className="nirvaan-muted mt-3 text-[11px] leading-5">
                          {partner.address}
                        </p>
                      </div>
                    </div>

                    <div className="flex border-t border-[var(--nirvaan-border)] p-4 md:border-l md:border-t-0 md:p-5">
                      <button
                        type="button"
                        onClick={() => {
                          const destination = encodeURIComponent(
                            partner.address
                          );

                          window.open(
                            `https://www.google.com/maps/search/?api=1&query=${destination}`,
                            "_blank",
                            "noopener,noreferrer"
                          );
                        }}
                        className="flex w-full items-center justify-center gap-3 border border-[var(--nirvaan-blue)] px-5 py-3 text-[10px] font-bold tracking-[1px] text-[var(--nirvaan-blue)] transition hover:bg-[var(--nirvaan-blue)] hover:text-white md:w-auto"
                      >
                        VIEW ROUTE
                        <RouteIcon />
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="border border-[var(--nirvaan-border)] bg-[var(--nirvaan-surface-2)] px-5 py-10 text-center">
                <p className="nirvaan-text-strong text-sm font-bold">
                  No partner institutions found.
                </p>

                <p className="nirvaan-muted mt-2 text-xs">
                  Try another city, state or partner name.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------
          INDEPENDENT ACCESS NOTICE
      ------------------------------------------------- */}

      <section className="border-b border-[var(--nirvaan-border)]">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-8 sm:px-8 lg:px-10">
          <div className="border-l-2 border-[var(--nirvaan-orange)] bg-[var(--nirvaan-surface-2)] px-5 py-5 sm:px-6">
            <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-[var(--nirvaan-orange)]">
              INFORMATION ONLY
            </p>

            <p className="nirvaan-muted mt-3 max-w-[900px] text-[11px] font-medium leading-6 sm:text-[12px]">
              Partner locations and routes can be explored independently. To
              proceed with loan assistance, you must complete the required
              stages of the NIRVAAN journey.
            </p>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------
          RETURN TO JOURNEY
      ------------------------------------------------- */}

      <section>
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <div>
            <p className="nirvaan-text-strong text-[12px] font-bold">
              Ready to begin your assistance journey?
            </p>

            <p className="nirvaan-muted mt-1 text-[10px]">
              Start with verification and complete each required stage in
              order.
            </p>
          </div>

          <Link
            href="/wizard"
            className="nirvaan-primary w-full justify-center text-[10px] sm:w-auto"
          >
            START YOUR JOURNEY
            <span className="ml-3">
              <ArrowIcon />
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}
