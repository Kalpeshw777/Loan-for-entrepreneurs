"use client";

import { useEffect, useState } from "react";
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
  project_cost?: number;
  created_at: string;
}

export default function AdminDatabasePage() {
  const [records, setRecords] = useState<ApplicantRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbType, setDbType] = useState<string>("detecting...");
  const [message, setMessage] = useState<string>("");

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setRecords(data.users || []);
      setDbType(data.database || "local");
    } catch (err: any) {
      setMessage("Error loading records: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleAddTestUser = async () => {
    setMessage("Adding demo user to database...");
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: "Rajesh Sharma",
          contactNo: "9876543210",
          email: "rajesh.sharma@example.com",
          dob: "1994-08-15",
          aadhaar: "234567891234",
          pan: "ABCDE1234F",
          state: "Maharashtra",
          district: "Pune",
          category: "obc",
          purpose: "business",
          businessName: "Sharma Agro Tools & Fabrication",
          businessType: "Manufacturing",
          projectCost: 1500000,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setMessage("Demo user added successfully!");
        fetchRecords();
      } else {
        setMessage("Failed to add user: " + (json.error || "Unknown error"));
      }
    } catch (err: any) {
      setMessage("Error: " + err.message);
    }
  };

  return (
    <main className="nirvaan-page min-h-screen px-4 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-[var(--nirvaan-border)] pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-[2px] w-6 bg-[var(--nirvaan-orange)]" />
              <span className="text-[10px] font-bold tracking-widest text-[var(--nirvaan-blue)] uppercase">
                DATABASE RECORDS
              </span>
            </div>
            <h1 className="nirvaan-text-strong mt-2 text-2xl font-extrabold sm:text-3xl">
              Applicant &amp; User Database
            </h1>
            <p className="nirvaan-muted mt-1 text-xs sm:text-sm">
              View and audit verified DigiLocker loan applicants and scheme recommendations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Database Status Badge */}
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                dbType === "supabase"
                  ? "border border-emerald-300 bg-emerald-50 text-emerald-700"
                  : "border border-amber-300 bg-amber-50 text-amber-800"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  dbType === "supabase" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                }`}
              />
              {dbType === "supabase" ? "Supabase PostgreSQL Live" : "Local Storage DB"}
            </span>

            <button
              type="button"
              onClick={fetchRecords}
              className="rounded border border-[var(--nirvaan-border)] bg-[var(--nirvaan-surface)] px-3 py-1.5 text-xs font-bold text-[var(--nirvaan-text)] transition hover:bg-[var(--nirvaan-surface-2)]"
            >
              🔄 Refresh
            </button>

            <button
              type="button"
              onClick={handleAddTestUser}
              className="rounded bg-[var(--nirvaan-blue)] px-3 py-1.5 text-xs font-bold text-white transition hover:opacity-90"
            >
              + Add Demo Record
            </button>

            <Link
              href="/wizard"
              className="rounded border border-[var(--nirvaan-orange)] bg-[var(--nirvaan-orange)] px-3 py-1.5 text-xs font-bold text-white"
            >
              Go to Wizard →
            </Link>
          </div>
        </div>

        {message && (
          <div className="mt-4 rounded border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-800">
            {message}
          </div>
        )}

        {/* Supabase Quick Connection Guide Card */}
        {dbType !== "supabase" && (
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50/70 p-4 text-amber-900">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-800">
              ⚡ How to connect Supabase Cloud PostgreSQL in 2 Steps:
            </h3>
            <ol className="mt-2 list-inside list-decimal space-y-1 text-xs text-amber-900/90">
              <li>
                Create a free project at{" "}
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold underline"
                >
                  supabase.com
                </a>{" "}
                and copy your <b>Project URL</b> and <b>Anon Public Key</b>.
              </li>
              <li>
                Add them into your <code className="bg-white/80 px-1 rounded">.env.local</code> as:
                <pre className="mt-1.5 rounded bg-slate-900 p-2 text-[11px] text-emerald-400 font-mono overflow-x-auto">
                  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co{"\n"}
                  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
                </pre>
              </li>
            </ol>
          </div>
        )}

        {/* Database Records Table */}
        <div className="mt-6 overflow-hidden rounded-lg border border-[var(--nirvaan-border)] bg-[var(--nirvaan-surface)] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[var(--nirvaan-border)] bg-[var(--nirvaan-surface-2)] text-[10px] font-bold uppercase tracking-wider text-[var(--nirvaan-muted)]">
                <tr>
                  <th className="px-4 py-3">Applicant Name</th>
                  <th className="px-4 py-3">Contact Details</th>
                  <th className="px-4 py-3">Aadhaar / PAN</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Business / Enterprise</th>
                  <th className="px-4 py-3">Project Cost</th>
                  <th className="px-4 py-3">Registered At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--nirvaan-border)] text-[var(--nirvaan-text)]">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-xs font-semibold text-[var(--nirvaan-muted)]">
                      Loading database records...
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-xs font-semibold text-[var(--nirvaan-muted)]">
                      No applicant records in database yet.
                      <br />
                      <button
                        type="button"
                        onClick={handleAddTestUser}
                        className="mt-3 rounded bg-[var(--nirvaan-blue)] px-4 py-1.5 text-xs font-bold text-white"
                      >
                        Insert Demo Applicant Record
                      </button>
                    </td>
                  </tr>
                ) : (
                  records.map((user) => (
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
                        {user.state || "N/A"}
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
                      <td className="px-4 py-3 text-[10px] text-[var(--nirvaan-muted)]">
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Just now"}
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
