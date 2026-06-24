import { describe, it, expect } from "vitest";

describe("email configuration", () => {
  it("GMAIL_USER env variable should be set", () => {
    const user = process.env.GMAIL_USER;
    // نتحقق فقط من وجود المتغير، لا نرسل بريداً حقيقياً في الاختبارات
    expect(typeof user).toBe("string");
    expect(user?.length).toBeGreaterThan(0);
  });

  it("GMAIL_APP_PASSWORD env variable should be set", () => {
    const pass = process.env.GMAIL_APP_PASSWORD;
    expect(typeof pass).toBe("string");
    expect(pass?.length).toBeGreaterThan(0);
  });

  it("email module should export sendRegistrationNotification function", async () => {
    const { sendRegistrationNotification } = await import("./email");
    expect(typeof sendRegistrationNotification).toBe("function");
  });
});
