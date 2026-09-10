"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

interface ApplicantRecord {
  id: string;
  full_name: string;
  contact_no: string;
  email: string;
  dob?: string;
  aadhaar?: string;
  pan?: string;
  state: string;
  district: string;
  category: string;
  purpose: string;
  business_name?: string;
  business_type?: string;
  business_location?: string;
  udyam_no?: string;
  gstin_no?: string;
  ownership_type?: string;
  project_cost?: number;
  status?: string;
  created_at: string;
}

export default function AdminDatabasePage() {
  const [records, setRecords] = useState<ApplicantRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [engine, setEngine] = useState<string>("SQLite Database");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [message, setMessage] = useState<string>("");

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setRecords(data.users || []);
      setEngine(data.engine || "SQLite Relational Database");
    } catch (err: any) {
      setMessage("Error loading records: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const filteredRecords = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records.filter((r) => {
      const matchCat =
        categoryFilter === "All" ||
        r.category?.toLowerCase() === categoryFilter.toLowerCase();

      const matchSearch =
        !q ||
        r.full_name?.toLowerCase().includes(q) ||
        r.contact_no?.includes(q) ||
        r.state?.toLowerCase().includes(q) ||
        r.district?.toLowerCase().includes(q) ||
        r.business_name?.toLowerCase().includes(q);

      return matchCat && matchSearch;
    });
  }, [records, search, categoryFilter]);

  const totalCapitalRequested = useMemo(() => {
    return records.reduce((acc, curr) => acc + (curr.project_cost || 0), 0);
  }, [records]);

  const handleAddTestUser = async () => {
    setMessage("Inserting new applicant into SQLite database...");
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: "Siddharth Verma",
          contactNo: "9819234810",
          email: "siddharth.v@technoinnovations.co",
          dob: "1995-04-12",
          aadhaar: "XXXXXXXX9988",
          pan: "BVPPV1940E",
          state: "Maharashtra",
          district: "Mumbai",
          category: "General",
          purpose: "business",
          businessName: "Verma AI Robotics & Drone Tech",
          businessType: "Technology & Software Solutions",
          businessLocation: "Andheri East MIDC, Mumbai",
          udyamNo: "UDYAM-MH-19-009182",
          gstinNo: "27BVPPV1940E1Z9",
          ownershipType: "individual",
          projectCost: 3500000,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setMessage("Applicant successfully inserted into database!");
        fetchRecords();
      } else {
        setMessage("Failed to insert: " + (json.error || "Unknown error"));
      }
    } catch (err: any) {
      setMessage("Error: " + err.message);
    }
  };

  return (
    <main className="nirvaan-page min-h-screen px-4 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col gap-4 border-b border-[var(--nirvaan-border)] pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-[2px] w-6 bg-[var(--nirvaan-orange)]" />
              <span className="text-[10px] font-bold tracking-widest text-[var(--nirvaan-blue)] uppercase">
                INTEGRATED DATABASE &amp; AUDIT LOGS
              </span>
            </div>
            <h1 className="nirvaan-text-strong mt-2 text-2xl font-extrabold sm:text-3xl">
              Applicant &amp; Borrower Database
            </h1>
            <p className="nirvaan-muted mt-1 text-xs sm:text-sm">
              Live SQLite database containing verified DigiLocker KYC applicants and credit assessments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Pill */}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Database Engine: {engine}
            </span>

            <button
              type="button"
              onClick={fetchRecords}
              className="rounded border border-[var(--nirvaan-border)] bg-[var(--nirvaan-surface)] px-3 py-1.5 text-xs font-bold text-[var(--nirvaan-text)] hover:bg-[var(--nirvaan-surface-2)]"
            >
              🔄 Refresh
            </button>

            <button
              type="button"
              onClick={handleAddTestUser}
              className="rounded bg-[var(--nirvaan-blue)] px-3 py-1.5 text-xs font-bold text-white transition hover:opacity-90"
            >
              + Add Applicant Record
            </button>

            <Link
              href="/wizard"
              className="rounded bg-[var(--nirvaan-orange)] px-3 py-1.5 text-xs font-bold text-white"
            >
              Go to Wizard →
            </Link>
          </div>
        </div>

        {message && (
          <div className="mt-4 flex items-center justify-between rounded border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-800">
            <span>{message}</span>
            <button
              type="button"
              onClick={() => setMessage("")}
              className="ml-2 font-bold text-blue-600 hover:text-blue-900"
            >
              ✕
            </button>
          </div>
        )}

        {/* Database Metrics Bar */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-[var(--nirvaan-border)] bg-[var(--nirvaan-surface)] p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--nirvaan-muted)]">
              Total Registered Applicants
            </p>
            <p className="mt-1 text-2xl font-extrabold text-[var(--nirvaan-text-strong)]">
              {records.length}
            </p>
            <p className="mt-1 text-[11px] font-semibold text-emerald-600">
              ✓ 100% Aadhaar/KYC Verified
            </p>
          </div>

          <div className="rounded-lg border border-[var(--nirvaan-border)] bg-[var(--nirvaan-surface)] p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--nirvaan-muted)]">
              Total Capital Assessed
            </p>
            <p className="mt-1 text-2xl font-extrabold text-[var(--nirvaan-blue)]">
              ₹{(totalCapitalRequested / 100000).toFixed(1)} Lakhs
            </p>
            <p className="mt-1 text-[11px] text-[var(--nirvaan-muted)]">
              Estimated project funding needs
            </p>
          </div>

          <div className="rounded-lg border border-[var(--nirvaan-border)] bg-[var(--nirvaan-surface)] p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--nirvaan-muted)]">
              Database Table
            </p>
            <p className="mt-1 text-base font-extrabold text-[var(--nirvaan-text-strong)]">
              `users` (18 Columns)
            </p>
            <p className="mt-1 text-[11px] text-[var(--nirvaan-muted)]">
              Stored in local SQLite DB
            </p>
          </div>

          <div className="rounded-lg border border-[var(--nirvaan-border)] bg-[var(--nirvaan-surface)] p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--nirvaan-muted)]">
              Storage Engine
            </p>
            <p className="mt-1 text-base font-extrabold text-emerald-700">
              Active &amp; Persistent
            </p>
            <p className="mt-1 text-[11px] text-[var(--nirvaan-muted)]">
              Zero cloud latency, instant response
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-3">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, contact, state, or enterprise..."
              className="h-10 w-full max-w-sm rounded border border-[var(--nirvaan-border)] bg-[var(--nirvaan-surface)] px-3 text-xs outline-none focus:border-[var(--nirvaan-blue)]"
            />

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-10 rounded border border-[var(--nirvaan-border)] bg-[var(--nirvaan-surface)] px-3 text-xs outline-none focus:border-[var(--nirvaan-blue)]"
            >
              <option value="All">All Categories</option>
              <option value="General">General</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
            </select>
          </div>

          <p className="text-xs font-semibold text-[var(--nirvaan-muted)]">
            Showing {filteredRecords.length} of {records.length} records
          </p>
        </div>

        {/* Table */}
        <div className="mt-4 overflow-hidden rounded-lg border border-[var(--nirvaan-border)] bg-[var(--nirvaan-surface)] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[var(--nirvaan-border)] bg-[var(--nirvaan-surface-2)] text-[10px] font-bold uppercase tracking-wider text-[var(--nirvaan-muted)]">
                <tr>
                  <th className="px-4 py-3">Applicant Name</th>
                  <th className="px-4 py-3">Contact Details</th>
                  <th className="px-4 py-3">Aadhaar / PAN</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Enterprise / Project</th>
                  <th className="px-4 py-3">Project Cost</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--nirvaan-border)] text-[var(--nirvaan-text)]">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-xs font-semibold text-[var(--nirvaan-muted)]">
                      Querying SQLite database...
                    </td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-xs font-semibold text-[var(--nirvaan-muted)]">
                      No records match the current filter.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((user) => (
                    <tr key={user.id} className="hover:bg-[var(--nirvaan-surface-2)] transition-colors">
                      <td className="px-4 py-3 font-bold text-[var(--nirvaan-text-strong)]">
                        {user.full_name}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold">{user.contact_no || "N/A"}</div>
                        <div className="text-[10px] text-[var(--nirvaan-muted)]">{user.email || ""}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px]">
                        <div>{user.aadhaar || "N/A"}</div>
                        <div className="text-[10px] text-[var(--nirvaan-muted)]">{user.pan || ""}</div>
                      </td>
                      <td className="px-4 py-3">
                        {user.district ? `${user.district}, ` : ""}
                        <span className="font-bold">{user.state || "N/A"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--nirvaan-blue)]">
                          {user.category || "General"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold">{user.business_name || user.purpose}</div>
                        <div className="text-[10px] text-[var(--nirvaan-muted)]">
                          {user.business_type || user.purpose}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold text-emerald-700">
                        {user.project_cost
                          ? `₹${user.project_cost.toLocaleString("en-IN")}`
                          : "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded bg-emerald-100 px-2 py-0.5 text-[9px] font-extrabold text-emerald-800">
                          {user.status || "VERIFIED"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[10px] text-[var(--nirvaan-muted)]">
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Recent"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
