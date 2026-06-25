import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
  json,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const adminRoleEnum = pgEnum("admin_role", ["superadmin", "admin", "teacher"]);
export const registrationStatusEnum = pgEnum("registration_status", ["pending", "contacted", "enrolled", "rejected"]);
export const genderEnum = pgEnum("gender", ["male", "female"]);
export const certificateStatusEnum = pgEnum("certificate_status", ["pending", "processing", "completed", "rejected"]);

export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: userRoleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// جدول المديرين (مصادقة مستقلة بـ username/password)
export const adminUsers = pgTable("admin_users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  username: varchar("username", { length: 64 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  role: adminRoleEnum("role").default("admin").notNull(),
  isSuperAdmin: integer("isSuperAdmin").default(0).notNull(), // 1 for the main account
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = typeof adminUsers.$inferInsert;

// جدول طلبات التسجيل في العروض
export const registrations = pgTable("registrations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  offerIndex: integer("offerIndex").notNull(),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  email: varchar("email", { length: 320 }),
  notes: text("notes"),
  status: registrationStatusEnum("status")
    .default("pending")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Registration = typeof registrations.$inferSelect;
export type InsertRegistration = typeof registrations.$inferInsert;

// جدول طلبات الشهادات
export const certificateRequests = pgTable("certificate_requests", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  courseName: varchar("courseName", { length: 255 }).notNull(),
  fullNameAr: varchar("fullNameAr", { length: 255 }).notNull(),
  fullNameEn: varchar("fullNameEn", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  birthPlace: varchar("birthPlace", { length: 255 }).notNull(),
  birthDate: varchar("birthDate", { length: 50 }).notNull(),
  gender: genderEnum("gender").notNull(),
  idCardUrl: varchar("idCardUrl", { length: 500 }),
  // حقل الدرجات بتنسيق JSON لتخزين درجات كل دورة بشكل مرن
  grades: json("grades"),
  // حقل التقدير النهائي والمعدل
  finalGrade: varchar("finalGrade", { length: 50 }),
  average: varchar("average", { length: 50 }),
  total: varchar("total", { length: 50 }),
  status: certificateStatusEnum("status")
    .default("pending")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type CertificateRequest = typeof certificateRequests.$inferSelect;
export type InsertCertificateRequest = typeof certificateRequests.$inferInsert;
