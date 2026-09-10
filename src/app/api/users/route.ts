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
    const body = await request.json();

    const userData = {
      id: body.id,
      full_name: body.fullName || body.full_name || "Applicant",
      contact_no: body.contactNo || body.contact_no || "",
      email: body.email || "",
      dob: body.dob || "",
      aadhaar: body.aadhaar,
      pan: body.pan || "",
      state: body.state || "",
      district: body.district || "",
      category: body.category || "General",
      purpose: body.purpose || "business",
      business_name: body.businessName || body.business_name || "",
      business_type: body.businessType || body.business_type || "",
      business_location: body.businessLocation || body.business_location || "",
      udyam_no: body.udyamNo || body.udyam_no || "",
      gstin_no: body.gstinNo || body.gstin_no || "",
      ownership_type: body.ownershipType || body.ownership_type || "individual",
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
