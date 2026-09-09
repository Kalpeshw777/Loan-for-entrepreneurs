"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import staticPartners from "@/data/partners.json";
import { haversineKm } from "@/lib/geo";
import type { Partner, SchemeId } from "@/lib/types";

// Dynamically import Leaflet Map to avoid SSR window issues
const PartnerMap = dynamic(() => import("@/components/PartnerMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[480px] w-full items-center justify-center rounded-md border border-[var(--nirvaan-border)] bg-[var(--nirvaan-surface-2)] text-xs font-bold text-[var(--nirvaan-blue)]">
      <div className="flex flex-col items-center gap-2">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-[var(--nirvaan-blue)] border-t-transparent" />
        <span>Loading Interactive Partner Map...</span>
      </div>
    </div>
  ),
});

const ALL_PARTNERS = staticPartners as Partner[];

const STATES = [
  "All States",
  ...Array.from(new Set(ALL_PARTNERS.map((p) => p.state))).sort(),
];

const SCHEMES: { id: SchemeId | "all"; label: string }[] = [
  { id: "all", label: "All Schemes" },
  { id: "micro-finance", label: "Micro Finance" },
  { id: "term-loan", label: "Term Loan" },
  { id: "education-loan", label: "Education Loan" },
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
      className="h-6 w-6"
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
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <circle cx="7" cy="24" r="3" />
      <circle cx="25" cy="8" r="3" />
      <path d="M9.5 22.5c4-2 3.5-8 7-10.5 2-1.4 4.5-1.5 6-2" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function GpsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
    </svg>
  );
}

export default function PartnerLocationPage() {
  const [selectedState, setSelectedState] = useState("All States");
  const [selectedScheme, setSelectedScheme] = useState<SchemeId | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [showApiGuide, setShowApiGuide] = useState(false);

  // Request browser geolocation
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        alert(
          "Could not retrieve location: " +
            (err.message || "Please allow location permissions.")
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Filter & calculate distances
  const filteredPartners = useMemo(() => {
    const query = search.trim().toLowerCase();

    const matched = ALL_PARTNERS.filter((partner) => {
      const matchesState =
        selectedState === "All States" || partner.state === selectedState;

      const matchesScheme =
        selectedScheme === "all" ||
        (partner.schemes && partner.schemes.includes(selectedScheme));

      const matchesSearch =
        !query ||
        partner.name.toLowerCase().includes(query) ||
        partner.city.toLowerCase().includes(query) ||
        partner.district.toLowerCase().includes(query) ||
        partner.state.toLowerCase().includes(query) ||
        partner.address.toLowerCase().includes(query);

      return matchesState && matchesScheme && matchesSearch;
    });

    // If user has shared location, compute distance and sort by closest
    if (userLocation) {
      return matched
        .map((p) => {
          const dist = haversineKm(
            userLocation.lat,
            userLocation.lng,
            p.lat,
            p.lng
          );
          return { ...p, distanceKm: Math.round(dist * 10) / 10 };
        })
        .sort((a, b) => a.distanceKm - b.distanceKm);
    }

    return matched;
  }, [selectedState, selectedScheme, search, userLocation]);

  return (
    <main className="nirvaan-page min-h-screen">
      {/* -------------------------------------------------
          HERO
      ------------------------------------------------- */}
      <section className="border-b border-[var(--nirvaan-border)] bg-[var(--nirvaan-surface)]">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-[820px]">
              <div className="mb-4 flex items-center gap-3">
                <span className="h-[2px] w-8 bg-[var(--nirvaan-orange)]" />
                <span className="text-[10px] font-bold tracking-[2px] text-[var(--nirvaan-blue)] uppercase">
                  GEO-SPATIAL PARTNER NETWORK
                </span>
              </div>

              <h1 className="nirvaan-text-strong text-[32px] font-extrabold leading-[1.1] tracking-[-0.5px] sm:text-[48px] lg:text-[56px]">
                Partner Location <br className="hidden sm:inline" />
                <span className="nirvaan-blue">&amp; Route Navigator</span>
              </h1>

              <p className="nirvaan-muted mt-4 max-w-[680px] text-[13px] font-medium leading-6 sm:text-[15px]">
                Locate verified banking and credit assistance partners across India on an interactive map. Compare nearby institutions, check supported schemes, and compute direct routes.
              </p>
            </div>

            {/* Quick Status Pill */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                OpenStreetMap Active (Free / No Key Required)
              </span>

              <button
                type="button"
                onClick={() => setShowApiGuide(!showApiGuide)}
                className="rounded border border-[var(--nirvaan-border)] bg-[var(--nirvaan-surface-2)] px-3 py-1 text-xs font-bold text-[var(--nirvaan-blue)] hover:bg-[var(--nirvaan-surface)]"
              >
                {showApiGuide ? "✕ Close API Info" : "⚙ Custom Map API Guide"}
              </button>
            </div>
          </div>

          {/* Expandable API Setup Guide */}
          {showApiGuide && (
            <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50/80 p-5 text-slate-800">
              <h3 className="text-sm font-extrabold text-blue-900">
                🗺 How to configure Custom Map APIs (Optional)
              </h3>
              <p className="mt-1 text-xs text-slate-600">
                The map currently uses <b>OpenStreetMap</b>, which is 100% free, fully interactive, and works out-of-the-box without requiring any API keys. If you wish to enable high-resolution Mapbox Satellite or Google Maps:
              </p>
              <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded border border-blue-200 bg-white p-3">
                  <p className="text-xs font-bold text-blue-800">Option 1: Mapbox Satellite View</p>
                  <ol className="mt-1.5 list-inside list-decimal space-y-1 text-[11px] text-slate-600">
                    <li>Create a free account at <a href="https://account.mapbox.com" target="_blank" rel="noreferrer" className="text-blue-600 underline">mapbox.com</a></li>
                    <li>Copy your Public Default Token (starts with <code className="bg-slate-100 px-1">pk.ey...</code>)</li>
                    <li>Add to your <code className="bg-slate-100 px-1">.env.local</code>: <code className="font-mono text-blue-600">NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_token_here</code></li>
                    <li>Toggle the &quot;Satellite&quot; button on the map!</li>
                  </ol>
                </div>
                <div className="rounded border border-blue-200 bg-white p-3">
                  <p className="text-xs font-bold text-blue-800">Option 2: Google Maps Direct Routing</p>
                  <p className="mt-1 text-[11px] text-slate-600 leading-normal">
                    The <b>&quot;View Route / Get Directions&quot;</b> buttons already utilize Google Maps Direction API links with exact GPS coordinates (<code className="bg-slate-100 px-1">lat, lng</code>) of each bank, meaning users get turn-by-turn navigation directly on mobile and web!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* -------------------------------------------------
          SEARCH & CONTROLS
      ------------------------------------------------- */}
      <section className="border-b border-[var(--nirvaan-border)] bg-[var(--nirvaan-surface-2)]">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-6 sm:px-8 lg:px-10">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div>
              <label
                htmlFor="partner-search"
                className="mb-1.5 block text-[10px] font-bold uppercase tracking-[1px] text-[var(--nirvaan-text)]"
              >
                Search Bank / City / District
              </label>
              <input
                id="partner-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="e.g. State Bank of India, Pune, Mumbai..."
                className="h-11 w-full border border-[var(--nirvaan-border)] bg-[var(--nirvaan-surface)] px-3 text-xs text-[var(--nirvaan-text)] outline-none placeholder:text-[var(--nirvaan-muted)] focus:border-[var(--nirvaan-blue)] rounded"
              />
            </div>

            {/* State Filter */}
            <div>
              <label
                htmlFor="partner-state"
                className="mb-1.5 block text-[10px] font-bold uppercase tracking-[1px] text-[var(--nirvaan-text)]"
              >
                State
              </label>
              <select
                id="partner-state"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="h-11 w-full border border-[var(--nirvaan-border)] bg-[var(--nirvaan-surface)] px-3 text-xs text-[var(--nirvaan-text)] outline-none focus:border-[var(--nirvaan-blue)] rounded"
              >
                {STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Scheme Filter */}
            <div>
              <label
                htmlFor="partner-scheme"
                className="mb-1.5 block text-[10px] font-bold uppercase tracking-[1px] text-[var(--nirvaan-text)]"
              >
                Scheme Type
              </label>
              <select
                id="partner-scheme"
                value={selectedScheme}
                onChange={(e) => setSelectedScheme(e.target.value as any)}
                className="h-11 w-full border border-[var(--nirvaan-border)] bg-[var(--nirvaan-surface)] px-3 text-xs text-[var(--nirvaan-text)] outline-none focus:border-[var(--nirvaan-blue)] rounded"
              >
                {SCHEMES.map((sc) => (
                  <option key={sc.id} value={sc.id}>
                    {sc.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Locate Me & Reset Actions */}
            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={handleLocateMe}
                disabled={isLocating}
                className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded border border-[var(--nirvaan-blue)] bg-[var(--nirvaan-blue)] px-3 text-[11px] font-bold text-white transition hover:opacity-90 disabled:opacity-60"
              >
                <GpsIcon />
                <span>{isLocating ? "Locating..." : "Locate Me"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedState("All States");
                  setSelectedScheme("all");
                  setSelectedId(null);
                }}
                className="h-11 rounded border border-[var(--nirvaan-border)] bg-[var(--nirvaan-surface)] px-3 text-[11px] font-bold text-[var(--nirvaan-muted)] transition hover:text-[var(--nirvaan-text)]"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------
          MAIN CONTENT: MAP + RESULTS SPLIT
      ------------------------------------------------- */}
      <section className="border-b border-[var(--nirvaan-border)]">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-8 sm:px-8 lg:px-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            
            {/* LEFT COLUMN: INTERACTIVE MAP (7 Cols on desktop) */}
            <div className="lg:col-span-7">
              <div className="sticky top-24">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h2 className="nirvaan-text-strong text-lg font-extrabold sm:text-xl">
                      Interactive Geographic Map
                    </h2>
                    <p className="nirvaan-muted text-xs">
                      Click any pin to view branch details or navigate.
                    </p>
                  </div>
                  <span className="rounded bg-blue-50 px-2.5 py-1 text-xs font-bold text-[var(--nirvaan-blue)]">
                    {filteredPartners.length} Institutions Plotted
                  </span>
                </div>

                <div className="h-[460px] sm:h-[520px] lg:h-[620px] w-full">
                  <PartnerMap
                    partners={filteredPartners}
                    selectedId={selectedId}
                    userLocation={userLocation}
                    onSelectPartner={(partner) => setSelectedId(partner.id)}
                  />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: PARTNER LISTINGS (5 Cols on desktop) */}
            <div className="lg:col-span-5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="nirvaan-text-strong text-lg font-extrabold sm:text-xl">
                    Partner Branches
                  </h2>
                  <p className="nirvaan-muted text-xs">
                    {userLocation ? "Sorted by nearest distance" : "Select a branch to focus on map"}
                  </p>
                </div>
                <span className="nirvaan-muted text-[11px] font-semibold">
                  Showing {filteredPartners.length} of {ALL_PARTNERS.length}
                </span>
              </div>

              <div className="max-h-[620px] space-y-3 overflow-y-auto pr-1">
                {filteredPartners.length > 0 ? (
                  filteredPartners.map((partner) => {
                    const isSelected = partner.id === selectedId;
                    return (
                      <article
                        key={partner.id}
                        onClick={() => setSelectedId(partner.id)}
                        className={`cursor-pointer rounded-md border p-4 transition-all ${
                          isSelected
                            ? "border-[var(--nirvaan-blue)] bg-blue-50/50 shadow-md ring-1 ring-[var(--nirvaan-blue)]"
                            : "border-[var(--nirvaan-border)] bg-[var(--nirvaan-surface)] hover:border-slate-400"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex gap-3">
                            <div
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded border ${
                                isSelected
                                  ? "border-[var(--nirvaan-orange)] bg-[var(--nirvaan-orange)] text-white"
                                  : "border-[var(--nirvaan-blue)] bg-blue-50 text-[var(--nirvaan-blue)]"
                              }`}
                            >
                              <LocationIcon />
                            </div>

                            <div>
                              <h3 className="nirvaan-text-strong text-sm font-extrabold leading-tight">
                                {partner.name}
                              </h3>
                              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--nirvaan-orange)]">
                                {(partner.type || "Public Sector Bank").replace(/-/g, " ")}
                              </p>
                              <p className="nirvaan-muted mt-2 text-xs leading-relaxed">
                                {partner.address || `${partner.city}, ${partner.district}, ${partner.state}`}
                              </p>
                            </div>
                          </div>

                          {/* Distance Tag if user location active */}
                          {"distanceKm" in partner && (
                            <span className="shrink-0 rounded bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-800">
                              {(partner as any).distanceKm} km
                            </span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--nirvaan-border)] pt-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const dest = `${partner.lat},${partner.lng}`;
                              window.open(
                                `https://www.google.com/maps/dir/?api=1&destination=${dest}`,
                                "_blank",
                                "noopener,noreferrer"
                              );
                            }}
                            className="flex items-center gap-1.5 rounded bg-[var(--nirvaan-blue)] px-3 py-1.5 text-xs font-bold text-white transition hover:opacity-90"
                          >
                            <RouteIcon />
                            <span>View Route</span>
                          </button>

                          {partner.phone && (
                            <a
                              href={`tel:${partner.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1.5 rounded border border-[var(--nirvaan-border)] bg-[var(--nirvaan-surface-2)] px-3 py-1.5 text-xs font-bold text-[var(--nirvaan-text)] transition hover:bg-[var(--nirvaan-surface)]"
                            >
                              <PhoneIcon />
                              <span>{partner.phone}</span>
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedId(partner.id);
                            }}
                            className="ml-auto text-xs font-bold text-[var(--nirvaan-blue)] hover:underline"
                          >
                            Focus on Map →
                          </button>
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <div className="rounded-md border border-[var(--nirvaan-border)] bg-[var(--nirvaan-surface-2)] px-5 py-12 text-center">
                    <p className="nirvaan-text-strong text-sm font-bold">
                      No partner institutions match your filters.
                    </p>
                    <p className="nirvaan-muted mt-2 text-xs">
                      Try selecting &quot;All States&quot; or clearing your search term.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearch("");
                        setSelectedState("All States");
                        setSelectedScheme("all");
                      }}
                      className="mt-4 rounded bg-[var(--nirvaan-blue)] px-4 py-2 text-xs font-bold text-white"
                    >
                      Reset All Filters
                    </button>
                  </div>
                )}
              </div>
            </div>

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
              DIRECT INSTITUTIONAL ROUTE
            </p>
            <p className="nirvaan-muted mt-2 max-w-[900px] text-[11px] font-medium leading-6 sm:text-[12px]">
              Partner locations and routes can be explored independently for physical consultations. To obtain automated loan eligibility assessment, subsidy calculations, and AI pre-approvals, start your digital journey through our smart recommender.
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
            <p className="nirvaan-text-strong text-[13px] font-bold">
              Ready to check your government loan and subsidy eligibility?
            </p>
            <p className="nirvaan-muted mt-1 text-[11px]">
              Proceed with verified DigiLocker KYC and get instant scheme matching.
            </p>
          </div>

          <Link
            href="/wizard"
            className="nirvaan-primary flex w-full items-center justify-center gap-2 rounded px-5 py-3 text-xs font-bold sm:w-auto"
          >
            START YOUR JOURNEY
            <ArrowIcon />
          </Link>
        </div>
      </section>
    </main>
  );
}
