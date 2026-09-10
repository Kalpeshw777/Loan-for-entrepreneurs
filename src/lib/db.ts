import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const DB_FILE = path.join(DATA_DIR, "loansaathi.sqlite");
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

const SEED_USERS: UserRecord[] = [
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

let sqlJsModule: any = null;
let cachedSqlDb: any = null;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJsonStore(): UserRecord[] {
  ensureDataDir();
  try {
    if (fs.existsSync(JSON_FILE)) {
      const data = fs.readFileSync(JSON_FILE, "utf-8");
      const list = JSON.parse(data || "[]");
      if (Array.isArray(list) && list.length > 0) {
        return list;
      }
    }
  } catch (err) {
    console.warn("Could not read JSON database store:", err);
  }

  // If empty, initialize with seed data
  writeJsonStore(SEED_USERS);
  return SEED_USERS;
}

function writeJsonStore(records: UserRecord[]) {
  ensureDataDir();
  try {
    fs.writeFileSync(JSON_FILE, JSON.stringify(records, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write to JSON database store:", err);
  }
}

async function tryInitSqlite(): Promise<any> {
  if (cachedSqlDb) return cachedSqlDb;

  try {
    if (!sqlJsModule) {
      // Dynamic import
      const initSql = require("sql.js");
      sqlJsModule = await initSql();
    }

    ensureDataDir();

    let db: any;
    if (fs.existsSync(DB_FILE)) {
      const fileBuffer = fs.readFileSync(DB_FILE);
      db = new sqlJsModule.Database(fileBuffer);
    } else {
      db = new sqlJsModule.Database();
    }

    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        full_name TEXT NOT NULL,
        contact_no TEXT,
        email TEXT,
        dob TEXT,
        aadhaar TEXT,
        pan TEXT,
        state TEXT,
        district TEXT,
        category TEXT,
        purpose TEXT,
        business_name TEXT,
        business_type TEXT,
        business_location TEXT,
        udyam_no TEXT,
        gstin_no TEXT,
        ownership_type TEXT,
        project_cost REAL,
        status TEXT DEFAULT 'VERIFIED',
        created_at TEXT
      );
    `);

    // Sync records into sqlite if empty
    const countRes = db.exec("SELECT COUNT(*) FROM users");
    const count = countRes[0]?.values[0]?.[0] as number;

    if (!count || count === 0) {
      const initialUsers = readJsonStore();
      for (const u of initialUsers) {
        db.run(
          `INSERT OR REPLACE INTO users (
            id, full_name, contact_no, email, dob, aadhaar, pan, state, district, category,
            purpose, business_name, business_type, business_location, udyam_no, gstin_no,
            ownership_type, project_cost, status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            u.id,
            u.full_name,
            u.contact_no,
            u.email,
            u.dob || "",
            u.aadhaar || "",
            u.pan || "",
            u.state,
            u.district,
            u.category,
            u.purpose,
            u.business_name || "",
            u.business_type || "",
            u.business_location || "",
            u.udyam_no || "",
            u.gstin_no || "",
            u.ownership_type || "individual",
            u.project_cost || 0,
            u.status || "VERIFIED",
            u.created_at,
          ]
        );
      }
      try {
        const data = db.export();
        fs.writeFileSync(DB_FILE, Buffer.from(data));
      } catch {}
    }

    cachedSqlDb = db;
    return db;
  } catch (err) {
    console.warn("SQLite engine fallback to JSON DB store:", err);
    return null;
  }
}

export async function getAllUsers(): Promise<UserRecord[]> {
  const sqlDb = await tryInitSqlite();

  if (sqlDb) {
    try {
      const res = sqlDb.exec("SELECT * FROM users ORDER BY created_at DESC");
      if (res.length > 0) {
        const columns = res[0].columns;
        return res[0].values.map((row: any[]) => {
          const obj: any = {};
          columns.forEach((col: string, idx: number) => {
            obj[col] = row[idx];
          });
          return obj as UserRecord;
        });
      }
    } catch (e) {
      console.warn("SQLite query failed, falling back to JSON store:", e);
    }
  }

  return readJsonStore();
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

  // 1. Update JSON store
  const currentRecords = readJsonStore();
  const existingIdx = currentRecords.findIndex((r) => r.id === newUser.id);
  if (existingIdx >= 0) {
    currentRecords[existingIdx] = newUser;
  } else {
    currentRecords.unshift(newUser);
  }
  writeJsonStore(currentRecords);

  // 2. Try updating SQLite DB if active
  const sqlDb = await tryInitSqlite();
  if (sqlDb) {
    try {
      sqlDb.run(
        `INSERT OR REPLACE INTO users (
          id, full_name, contact_no, email, dob, aadhaar, pan, state, district, category,
          purpose, business_name, business_type, business_location, udyam_no, gstin_no,
          ownership_type, project_cost, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newUser.id,
          newUser.full_name,
          newUser.contact_no,
          newUser.email,
          newUser.dob || "",
          newUser.aadhaar || "",
          newUser.pan || "",
          newUser.state,
          newUser.district,
          newUser.category,
          newUser.purpose,
          newUser.business_name || "",
          newUser.business_type || "",
          newUser.business_location || "",
          newUser.udyam_no || "",
          newUser.gstin_no || "",
          newUser.ownership_type || "individual",
          newUser.project_cost || 0,
          newUser.status || "VERIFIED",
          newUser.created_at,
        ]
      );
      const data = sqlDb.export();
      fs.writeFileSync(DB_FILE, Buffer.from(data));
    } catch (e) {
      console.warn("Failed to write to SQLite DB:", e);
    }
  }

  return newUser;
}
