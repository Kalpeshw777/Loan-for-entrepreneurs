import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const JSON_FILE = path.join(DATA_DIR, "users.json");

export interface UserRecord {
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

export const SEED_USERS: UserRecord[] = [
  {
    id: "usr_seed_101",
    full_name: "Rajesh V. Sharma",
    contact_no: "9820144512",
    email: "rajesh.sharma@sharmaagro.in",
    dob: "1992-05-14",
    aadhaar: "XXXXXXXX4892",
    pan: "ABCPS1284K",
    state: "Maharashtra",
    district: "Pune",
    category: "OBC",
    purpose: "business",
    business_name: "Sharma Agro Precision Tools",
    business_type: "Manufacturing",
    business_location: "Bhosari MIDC, Pune",
    udyam_no: "UDYAM-MH-26-003412",
    gstin_no: "27ABCPS1284K1Z5",
    ownership_type: "individual",
    project_cost: 2500000,
    status: "VERIFIED",
    created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
  },
  {
    id: "usr_seed_102",
    full_name: "Pooja Patel",
    contact_no: "9426711890",
    email: "pooja.patel@greentech.org",
    dob: "1996-11-20",
    aadhaar: "XXXXXXXX7321",
    pan: "BLAPP4412R",
    state: "Gujarat",
    district: "Ahmedabad",
    category: "General",
    purpose: "business",
    business_name: "GreenSpark Solar Solutions",
    business_type: "Solar Power & Renewable Energy",
    business_location: "Sanand Industrial Park",
    udyam_no: "UDYAM-GJ-01-008922",
    gstin_no: "24BLAPP4412R1ZA",
    ownership_type: "partner",
    project_cost: 4500000,
    status: "VERIFIED",
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: "usr_seed_103",
    full_name: "Amitabh Meena",
    contact_no: "9711082345",
    email: "amitabh.meena@delhitech.edu",
    dob: "2001-03-10",
    aadhaar: "XXXXXXXX9014",
    pan: "CXMPM9123T",
    state: "Delhi",
    district: "New Delhi",
    category: "ST",
    purpose: "education",
    business_name: "B.Tech Computer Science & AI",
    business_type: "Undergraduate Degree",
    business_location: "Delhi Technological University",
    udyam_no: "",
    gstin_no: "",
    ownership_type: "individual",
    project_cost: 850000,
    status: "VERIFIED",
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];

// In-memory cache for serverless runtimes
let memoryStore: UserRecord[] | null = null;

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch {}
}

function isValidUser(u: any): boolean {
  if (!u || typeof u !== "object") return false;
  const name = String(u.full_name || "").trim().toLowerCase();
  if (!name || name.length < 2) return false;
  if (
    name === "applicant" ||
    name === "eg.xyz" ||
    name === "test" ||
    name === "demo" ||
    name === "null" ||
    name === "undefined"
  ) {
    return false;
  }
  const contact = String(u.contact_no || "").replace(/\D/g, "");
  if (!contact || contact.length < 10) return false;
  if (/^(\d)\1{9}$/.test(contact) || contact === "1234567890") return false;
  return true;
}

function readStore(): UserRecord[] {
  if (memoryStore && memoryStore.length > 0) {
    return memoryStore.filter(isValidUser);
  }

  ensureDataDir();
  try {
    if (fs.existsSync(JSON_FILE)) {
      const raw = fs.readFileSync(JSON_FILE, "utf-8");
      const parsed = JSON.parse(raw || "[]");
      if (Array.isArray(parsed) && parsed.length > 0) {
        const clean = parsed.filter(isValidUser);
        memoryStore = clean;
        return clean;
      }
    }
  } catch (err) {
    console.warn("Could not read persistent database file:", err);
  }

  // If file doesn't exist or is empty, use seed users
  memoryStore = [...SEED_USERS];
  writeStore(memoryStore);
  return memoryStore;
}

function writeStore(records: UserRecord[]) {
  const clean = records.filter(isValidUser);
  memoryStore = clean;
  ensureDataDir();
  try {
    fs.writeFileSync(JSON_FILE, JSON.stringify(clean, null, 2), "utf-8");
  } catch (err) {
    // In read-only serverless lambdas, memoryStore retains the data
    console.warn("Serverless disk write notice (handled via memoryStore):", err);
  }
}

export async function getAllUsers(): Promise<UserRecord[]> {
  return readStore();
}

export async function insertUser(user: Partial<UserRecord>): Promise<UserRecord> {
  const current = readStore();

  const cleanDigits = (user.contact_no || "").replace(/\D/g, "").slice(-10);
  const cleanEmail = (user.email || "").trim().toLowerCase();

  // Deduplicate: Find existing record by ID, phone, or email
  const existingIndex = current.findIndex((u) => {
    if (user.id && u.id === user.id) return true;
    if (cleanDigits && u.contact_no && u.contact_no.replace(/\D/g, "").slice(-10) === cleanDigits) return true;
    if (cleanEmail && u.email && u.email.trim().toLowerCase() === cleanEmail) return true;
    return false;
  });

  const existing = existingIndex >= 0 ? current[existingIndex] : null;

  const resolvedRecord: UserRecord = {
    id: existing?.id || user.id || `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    full_name: user.full_name || existing?.full_name || "Applicant",
    contact_no: cleanDigits || existing?.contact_no || "",
    email: user.email || existing?.email || "",
    dob: user.dob || existing?.dob || "",
    aadhaar: user.aadhaar ? user.aadhaar.replace(/.(?=.{4})/g, "X") : existing?.aadhaar || "",
    pan: user.pan || existing?.pan || "",
    state: user.state || existing?.state || "",
    district: user.district || existing?.district || "",
    category: user.category || existing?.category || "General",
    purpose: user.purpose || existing?.purpose || "business",
    business_name: user.business_name || existing?.business_name || "",
    business_type: user.business_type || existing?.business_type || "",
    business_location: user.business_location || existing?.business_location || "",
    udyam_no: user.udyam_no || existing?.udyam_no || "",
    gstin_no: user.gstin_no || existing?.gstin_no || "",
    ownership_type: user.ownership_type || existing?.ownership_type || "individual",
    project_cost: Number(user.project_cost || existing?.project_cost || 0),
    status: user.status || existing?.status || "VERIFIED",
    created_at: existing?.created_at || new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    current[existingIndex] = resolvedRecord;
  } else {
    current.unshift(resolvedRecord);
  }

  writeStore(current);
  return resolvedRecord;
}
