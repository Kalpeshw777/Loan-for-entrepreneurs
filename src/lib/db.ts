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

function readStore(): UserRecord[] {
  if (memoryStore && memoryStore.length > 0) {
    return memoryStore;
  }

  ensureDataDir();
  try {
    if (fs.existsSync(JSON_FILE)) {
      const raw = fs.readFileSync(JSON_FILE, "utf-8");
      const parsed = JSON.parse(raw || "[]");
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryStore = parsed;
        return parsed;
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
  memoryStore = records;
  ensureDataDir();
  try {
    fs.writeFileSync(JSON_FILE, JSON.stringify(records, null, 2), "utf-8");
  } catch (err) {
    // In read-only serverless lambdas, memoryStore retains the data
    console.warn("Serverless disk write notice (handled via memoryStore):", err);
  }
}

export async function getAllUsers(): Promise<UserRecord[]> {
  return readStore();
}

export async function insertUser(user: Partial<UserRecord>): Promise<UserRecord> {
  const newUser: UserRecord = {
    id: user.id || `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    full_name: user.full_name || "Applicant",
    contact_no: user.contact_no || "",
    email: user.email || "",
    dob: user.dob || "",
    aadhaar: user.aadhaar ? user.aadhaar.replace(/.(?=.{4})/g, "X") : "",
    pan: user.pan || "",
    state: user.state || "",
    district: user.district || "",
    category: user.category || "General",
    purpose: user.purpose || "business",
    business_name: user.business_name || "",
    business_type: user.business_type || "",
    business_location: user.business_location || "",
    udyam_no: user.udyam_no || "",
    gstin_no: user.gstin_no || "",
    ownership_type: user.ownership_type || "individual",
    project_cost: Number(user.project_cost || 0),
    status: user.status || "VERIFIED",
    created_at: new Date().toISOString(),
  };

  const current = readStore();
  const existingIndex = current.findIndex((u) => u.id === newUser.id);
  if (existingIndex >= 0) {
    current[existingIndex] = newUser;
  } else {
    current.unshift(newUser);
  }

  writeStore(current);
  return newUser;
}
