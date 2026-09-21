import { describe, expect, it } from "vitest";
import { resolveAuthSignInRequest } from "@/extension/src/auth";

describe("Extension Auth Identifier Resolution (extension/src/auth)", () => {
  it("routes email login to /api/auth/sign-in/email", () => {
    const result = resolveAuthSignInRequest("user@example.com", "mypassword123");
    expect(result.isEmail).toBe(true);
    expect(result.endpoint).toBe("/api/auth/sign-in/email");
    expect(result.body).toEqual({
      email: "user@example.com",
      password: "mypassword123",
    });
  });

  it("trims whitespace from email addresses", () => {
    const result = resolveAuthSignInRequest("  alice@company.org  ", "secret");
    expect(result.isEmail).toBe(true);
    expect(result.endpoint).toBe("/api/auth/sign-in/email");
    expect(result.body).toEqual({
      email: "alice@company.org",
      password: "secret",
    });
  });

  it("routes username login to /api/auth/sign-in/username with lowercased username", () => {
    const result = resolveAuthSignInRequest("ThanhCow", "mypassword123");
    expect(result.isEmail).toBe(false);
    expect(result.endpoint).toBe("/api/auth/sign-in/username");
    expect(result.body).toEqual({
      username: "thanhcow",
      password: "mypassword123",
    });
  });

  it("trims whitespace and normalizes username case", () => {
    const result = resolveAuthSignInRequest("  Admin_User_99  ", "secret");
    expect(result.isEmail).toBe(false);
    expect(result.endpoint).toBe("/api/auth/sign-in/username");
    expect(result.body).toEqual({
      username: "admin_user_99",
      password: "secret",
    });
  });
});
