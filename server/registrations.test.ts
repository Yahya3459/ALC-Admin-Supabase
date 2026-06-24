import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock DB and email
vi.mock("./db", () => ({
  createRegistration: vi.fn().mockResolvedValue(42),
  getRegistrations: vi.fn().mockResolvedValue({ rows: [], total: 0 }),
  getRegistrationStats: vi.fn().mockResolvedValue({ total: 0, pending: 0, contacted: 0, enrolled: 0, rejected: 0 }),
  updateRegistrationStatus: vi.fn().mockResolvedValue(undefined),
  deleteRegistration: vi.fn().mockResolvedValue(undefined),
  getAllRegistrationsForExport: vi.fn().mockResolvedValue([]),
  getAdminByUsername: vi.fn().mockResolvedValue(null),
  createAdminUser: vi.fn().mockResolvedValue(undefined),
  adminUserExists: vi.fn().mockResolvedValue(true),
}));

vi.mock("./email", () => ({
  sendRegistrationNotification: vi.fn().mockResolvedValue(true),
}));

function makeCtx(overrides: Partial<TrpcContext> = {}): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {}, cookies: {} } as TrpcContext["req"],
    res: {
      cookie: vi.fn(),
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
    ...overrides,
  };
}

describe("registration.submit", () => {
  it("should accept valid registration data and return success", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.registration.submit({
      offerIndex: 1,
      fullName: "أحمد محمد",
      phone: "967778005033",
      email: "test@example.com",
      notes: "اختبار",
    });
    expect(result.success).toBe(true);
    expect(result.id).toBe(42);
  });

  it("should reject missing required fields", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.registration.submit({
        offerIndex: 1,
        fullName: "أ", // too short
        phone: "967778005033",
      })
    ).rejects.toThrow();
  });
});

describe("admin.login", () => {
  it("should reject invalid credentials", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.admin.login({ username: "wrong", password: "wrong" })
    ).rejects.toThrow();
  });
});

describe("admin.me", () => {
  it("should return null when no admin cookie is present", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.admin.me();
    expect(result).toBeNull();
  });
});
