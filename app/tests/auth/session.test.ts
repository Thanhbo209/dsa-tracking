import { describe, expect, it, vi } from "vitest";
import { getCurrentUser, requireCurrentUser } from "@/lib/auth/session";

const { getSessionMock, headersMock } = vi.hoisted(() => ({
  getSessionMock: vi.fn(),
  headersMock: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: headersMock,
}));

vi.mock("@/lib/auth/auth", () => ({
  auth: {
    api: {
      getSession: getSessionMock,
    },
  },
}));

describe("Current User Resolution (lib/auth/session)", () => {
  it("returns null when no active session exists", async () => {
    headersMock.mockResolvedValue(new Headers());
    getSessionMock.mockResolvedValue(null);

    const user = await getCurrentUser();
    expect(user).toBeNull();
  });

  it("returns null when session has no user", async () => {
    headersMock.mockResolvedValue(new Headers());
    getSessionMock.mockResolvedValue({ session: {} });

    const user = await getCurrentUser();
    expect(user).toBeNull();
  });

  it("resolves and normalizes authenticated current user", async () => {
    headersMock.mockResolvedValue(new Headers());
    const createdAt = new Date("2026-03-01T00:00:00Z");
    getSessionMock.mockResolvedValue({
      session: {
        id: "session-123",
        userId: "user-123",
      },
      user: {
        id: "user-123",
        name: "Thanh Cow",
        email: "thanh@example.com",
        username: "thanhcow",
        displayUsername: "thanhcow",
        bio: "Fullstack & DSA enthusiast",
        image: "https://avatar.example.com/u123.png",
        createdAt,
      },
    });

    const user = await getCurrentUser();
    expect(user).toEqual({
      id: "user-123",
      name: "Thanh Cow",
      email: "thanh@example.com",
      username: "thanhcow",
      displayUsername: "thanhcow",
      bio: "Fullstack & DSA enthusiast",
      image: "https://avatar.example.com/u123.png",
      createdAt,
    });
  });

  it("requireCurrentUser throws UNAUTHORIZED when not logged in", async () => {
    headersMock.mockResolvedValue(new Headers());
    getSessionMock.mockResolvedValue(null);

    await expect(requireCurrentUser()).rejects.toThrow("UNAUTHORIZED");
  });

  it("requireCurrentUser returns user when logged in", async () => {
    headersMock.mockResolvedValue(new Headers());
    const createdAt = new Date();
    getSessionMock.mockResolvedValue({
      session: { id: "s1" },
      user: {
        id: "u1",
        name: "User One",
        email: "u1@test.com",
        username: "u1",
        createdAt,
      },
    });

    const user = await requireCurrentUser();
    expect(user.id).toBe("u1");
  });
});
