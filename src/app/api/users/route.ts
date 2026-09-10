import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

const LOCAL_USERS_FILE = path.join(process.cwd(), "src", "data", "users.json");

function readLocalUsers(): any[] {
  try {
    if (fs.existsSync(LOCAL_USERS_FILE)) {
      const data = fs.readFileSync(LOCAL_USERS_FILE, "utf-8");
      return JSON.parse(data || "[]");
    }
  } catch (err) {
    console.error("Failed to read local users:", err);
  }
  return [];
}

function writeLocalUsers(users: any[]) {
  try {
    fs.writeFileSync(LOCAL_USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write local users:", err);
  }
}

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
          count: data.length,
          users: data,
        });
      }
    }

    // Fallback to local storage
    const localUsers = readLocalUsers();
    return NextResponse.json({
      database: "local-fallback",
      count: localUsers.length,
      users: localUsers,
    });
  } catch (error: any) {
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

    const newUser = {
      id: body.id || `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      full_name: body.fullName || body.full_name || "Applicant",
      contact_no: body.contactNo || body.contact_no || "",
      email: body.email || "",
      dob: body.dob || "",
      aadhaar: body.aadhaar ? body.aadhaar.replace(/.(?=.{4})/g, "X") : "", // mask Aadhaar for privacy
      pan: body.pan || "",
      state: body.state || "",
      district: body.district || "",
      category: body.category || "",
      purpose: body.purpose || "business",
      business_name: body.businessName || body.business_name || "",
      business_type: body.businessType || body.business_type || "",
      business_location: body.businessLocation || body.business_location || "",
      udyam_no: body.udyamNo || body.udyam_no || "",
      gstin_no: body.gstinNo || body.gstin_no || "",
      ownership_type: body.ownershipType || body.ownership_type || "individual",
      project_cost: Number(body.projectCost || body.project_cost || 0),
      created_at: new Date().toISOString(),
    };

    // If Supabase is connected, insert into Supabase PostgreSQL
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("users").insert([newUser]).select();

      if (!error) {
        return NextResponse.json({
          success: true,
          database: "supabase",
          user: data ? data[0] : newUser,
        });
      }
      console.warn("Supabase insert error, saving to local fallback:", error.message);
    }

    // Fallback: save to local json file
    const localUsers = readLocalUsers();
    // Update if exists, or append
    const existingIndex = localUsers.findIndex(
      (u) => u.contact_no && u.contact_no === newUser.contact_no
    );
    if (existingIndex >= 0) {
      localUsers[existingIndex] = { ...localUsers[existingIndex], ...newUser };
    } else {
      localUsers.unshift(newUser);
    }
    writeLocalUsers(localUsers);

    return NextResponse.json({
      success: true,
      database: isSupabaseConfigured ? "supabase-failed-local-saved" : "local-fallback",
      user: newUser,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to save user" },
      { status: 500 }
    );
  }
}
