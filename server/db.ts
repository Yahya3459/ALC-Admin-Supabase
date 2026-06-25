import { eq, desc, like, or, and, SQL } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { InsertUser, users, registrations, adminUsers, InsertRegistration, Registration, certificateRequests, InsertCertificateRequest, CertificateRequest } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: any = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });
      
      _db = drizzle(pool);
      console.log("[Database] Initialized with PostgreSQL pool");
    } catch (error) {
      console.error("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// وظيفة لإنشاء الجداول تلقائياً في حال عدم وجودها
// Note: In PostgreSQL, we rely more on drizzle-kit for migrations, 
// but we'll keep a simplified version for bootstrap if needed.
export async function pushSchema() {
  console.log("[Database] pushSchema called. In PostgreSQL, please use 'pnpm db:push' for migrations.");
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    textFields.forEach(field => {
      const value = user[field];
      if (value !== undefined) {
        values[field] = value ?? null;
        updateSet[field] = value ?? null;
      }
    });
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    
    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet
    });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

// ─── Admin Users ──────────────────────────────────────────────────────────────

export async function getAdminByUsername(username: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(adminUsers).where(eq(adminUsers.username, username)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createAdminUser(data: { username: string, passwordHash: string, role?: "superadmin" | "admin" | "teacher", isSuperAdmin?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(adminUsers).values(data as any);
}

export async function getAllAdminUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(adminUsers).orderBy(desc(adminUsers.createdAt));
}

export async function updateAdminUser(id: number, data: { username?: string, passwordHash?: string, role?: "superadmin" | "admin" | "teacher" }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(adminUsers).set(data as any).where(eq(adminUsers.id, id));
}

export async function deleteAdminUser(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // منع حذف الحساب الرئيسي
  const admin = await db.select().from(adminUsers).where(eq(adminUsers.id, id)).limit(1);
  if (admin.length > 0 && admin[0].isSuperAdmin === 1) {
    throw new Error("لا يمكن حذف الحساب الرئيسي");
  }
  await db.delete(adminUsers).where(eq(adminUsers.id, id));
}

// ─── Registrations ────────────────────────────────────────────────────────────

export async function createRegistration(data: InsertRegistration): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(registrations).values(data).returning({ id: registrations.id });
  return result[0].id;
}

export async function getRegistrations(opts: {
  search?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return { rows: [], total: 0 };

  const conditions: SQL[] = [];
  if (opts.search && opts.search.trim() !== "") {
    const s = `%${opts.search.trim()}%`;
    conditions.push(or(like(registrations.fullName, s), like(registrations.phone, s), like(registrations.email, s)) as SQL);
  }
  if (opts.status && opts.status !== "all") {
    conditions.push(eq(registrations.status, opts.status as any));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const allRows = await db.select().from(registrations).where(whereClause).orderBy(desc(registrations.createdAt));
  
  const total = allRows.length;
  const limit = opts.limit ?? 50;
  const offset = opts.offset ?? 0;
  const rows = allRows.slice(offset, offset + limit);

  return { rows, total };
}

export async function getAllRegistrationsForExport() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(registrations).orderBy(desc(registrations.createdAt));
}

export async function updateRegistrationStatus(id: number, status: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(registrations).set({ status }).where(eq(registrations.id, id));
}

export async function deleteRegistration(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(registrations).where(eq(registrations.id, id));
}

export async function getRegistrationStats() {
  const db = await getDb();
  if (!db) return { total: 0, pending: 0, contacted: 0, enrolled: 0, rejected: 0 };
  const all = await db.select({ status: registrations.status }).from(registrations);
  const stats = { total: all.length, pending: 0, contacted: 0, enrolled: 0, rejected: 0 };
  for (const r of all) {
    if (r.status === "pending") stats.pending++;
    else if (r.status === "contacted") stats.contacted++;
    else if (r.status === "enrolled") stats.enrolled++;
    else if (r.status === "rejected") stats.rejected++;
  }
  return stats;
}

// ─── Certificate Requests ──────────────────────────────────────────────────────

export async function createCertificateRequest(data: InsertCertificateRequest) {
  const db = await getDb();
  if (!db) return;
  await db.insert(certificateRequests).values(data);
}

export async function getCertificateRequests() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(certificateRequests).orderBy(desc(certificateRequests.createdAt));
}

export async function updateCertificateStatus(id: number, status: any) {
  const db = await getDb();
  if (!db) return;
  await db.update(certificateRequests).set({ status }).where(eq(certificateRequests.id, id));
}

export async function updateCertificateGrades(id: number, data: { grades: any, finalGrade: string, average: string, total?: string }) {
  const db = await getDb();
  if (!db) return;
  await db.update(certificateRequests)
    .set({ 
      grades: data.grades,
      finalGrade: data.finalGrade,
      average: data.average,
      total: data.total,
      status: "completed"
    })
    .where(eq(certificateRequests.id, id));
}

export async function deleteCertificateRequest(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(certificateRequests).where(eq(certificateRequests.id, id));
}
