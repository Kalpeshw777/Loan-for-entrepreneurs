import { NextResponse } from "next/server";
import { getAllUsers, insertUser } from "@/lib/db";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

// GET /api/users - Fetch registered users
export async function GET() {
  try {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        return NextResponse.json({
          database: "supabase",
          engine: "Supabase Cloud PostgreSQL",
          count: data.length,
          users: data,
        });
      }
    }

    // Direct SQLite Database Engine
    const users = await getAllUsers();
    return NextResponse.json({
      database: "sqlite",
      engine: "SQLite Relational Database (SQL.js / Disk-Persistent)",
      count: users.length,
      users,
    });
  } catch (error: any) {
    console.error("GET /api/users error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST /api/users - Save new user / applicant profile
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));

    const fullName = String(body.fullName || body.full_name || "").trim();
    const contactNo = String(body.contactNo || body.contact_no || "").trim();

    // Check for garbage / placeholder full_name
    const FORBIDDEN_NAMES = new Set([
      "applicant",
      "eg.xyz",
      "test",
      "testing",
      "demo",
      "null",
      "undefined",
      "none",
      "na",
      "n/a",
      "xyz",
      "abc",
      "asdf",
      "qwerty",
      "sample",
      "user",
    ]);

    const nameLower = fullName.toLowerCase();
    if (
      !fullName ||
      fullName.length < 2 ||
      FORBIDDEN_NAMES.has(nameLower) ||
      !/[a-zA-Z]/.test(fullName)
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid applicant name. Please provide a valid full name as per official government ID.",
        },
        { status: 400 }
      );
    }

    // Check for valid 10-digit contact number
    const cleanDigits = contactNo.replace(/\D/g, "");
    if (
      !cleanDigits ||
      cleanDigits.length < 10 ||
      /^(\d)\1{9}$/.test(cleanDigits) || // 0000000000, 1111111111, etc.
      cleanDigits === "1234567890" ||
      cleanDigits === "0123456789"
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid contact number. Please provide a valid 10-digit mobile number.",
        },
        { status: 400 }
      );
    }

    const userData = {
      id: body.id,
      full_name: fullName,
      contact_no: cleanDigits.slice(-10),
      email: String(body.email || "").trim(),
      dob: String(body.dob || "").trim(),
      aadhaar: body.aadhaar ? String(body.aadhaar) : undefined,
      pan: String(body.pan || "").trim().toUpperCase(),
      state: String(body.state || "").trim(),
      district: String(body.district || "").trim(),
      category: String(body.category || "General").trim(),
      purpose: String(body.purpose || "business").trim(),
      business_name: String(body.businessName || body.business_name || "").trim(),
      business_type: String(body.businessType || body.business_type || "").trim(),
      business_location: String(body.businessLocation || body.business_location || "").trim(),
      udyam_no: String(body.udyamNo || body.udyam_no || "").trim().toUpperCase(),
      gstin_no: String(body.gstinNo || body.gstin_no || "").trim().toUpperCase(),
      ownership_type: String(body.ownershipType || body.ownership_type || "individual").trim(),
      project_cost: Number(body.projectCost || body.project_cost || 0),
      status: "VERIFIED",
    };

    // Save to SQLite database
    const savedUser = await insertUser(userData);

    // If Supabase is also configured, mirror insert to Cloud Postgres
    if (isSupabaseConfigured && supabase) {
      supabase.from("users").insert([savedUser]).then(({ error }) => {
        if (error) console.warn("Supabase mirror insert failed:", error.message);
      });
    }

    return NextResponse.json({
      success: true,
      database: isSupabaseConfigured ? "supabase" : "sqlite",
      engine: isSupabaseConfigured
        ? "Supabase Cloud PostgreSQL"
        : "SQLite Relational Database",
      user: savedUser,
    });
  } catch (error: any) {
    console.error("POST /api/users error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save user" },
      { status: 500 }
    );
  }
}
