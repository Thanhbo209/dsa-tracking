import { describe, expect, it } from "vitest";
import { auth } from "@/lib/auth/auth";

describe("Better Auth Trusted Origins Configuration", () => {
  it("includes chrome-extension wildcard in trustedOrigins", () => {
    const trustedOrigins = (auth.options.trustedOrigins as string[]) || [];
    expect(trustedOrigins).toContain("chrome-extension://*");
  });

  it("includes production domain and vercel wildcard", () => {
    const trustedOrigins = (auth.options.trustedOrigins as string[]) || [];
    expect(trustedOrigins).toContain("https://dsa-tracking-six.vercel.app");
    expect(trustedOrigins).toContain("https://*.vercel.app");
  });

  it(
    "does not reject chrome-extension origin with 403 INVALID_ORIGIN",
    async () => {
      const req = new Request("http://localhost:3000/api/auth/sign-in/email", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          origin: "chrome-extension://gckmfdffhmncbpckgajbbjafpccnjjlk",
        },
        body: JSON.stringify({
          email: "nonexistent@example.com",
          password: "randompassword",
        }),
      });

      const res = await auth.handler(req);
      // Should NOT be 403 Forbidden with Invalid origin
      expect(res.status).not.toBe(403);
      const data = await res.json();
      expect(data.code).not.toBe("INVALID_ORIGIN");
      expect(data.message).not.toBe("Invalid origin");
    },
    15000
  );

  it(
    "does not reject vercel preview deployment origin with 403 INVALID_ORIGIN",
    async () => {
      const req = new Request("http://localhost:3000/api/auth/sign-in/email", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          origin: "https://dsa-tracking-git-preview-thanhbo209.vercel.app",
        },
        body: JSON.stringify({
          email: "nonexistent@example.com",
          password: "randompassword",
        }),
      });

      const res = await auth.handler(req);
      // Should NOT be 403 Forbidden with Invalid origin
      expect(res.status).not.toBe(403);
      const data = await res.json();
      expect(data.code).not.toBe("INVALID_ORIGIN");
      expect(data.message).not.toBe("Invalid origin");
    },
    15000
  );
});
