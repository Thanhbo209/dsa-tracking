import { describe, expect, it, vi, beforeEach } from "vitest";
import { revalidatePublicProfile } from "@/lib/profile/revalidate";
import * as nextCache from "next/cache";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("revalidatePublicProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("revalidates user profile by username string", () => {
    revalidatePublicProfile("alice");

    expect(nextCache.revalidatePath).toHaveBeenCalledWith("/u/alice", "page");
  });

  it("revalidates user profile and problem detail page when problemSlug is provided", () => {
    revalidatePublicProfile("alice", "two-sum");

    expect(nextCache.revalidatePath).toHaveBeenCalledWith("/u/alice", "page");
    expect(nextCache.revalidatePath).toHaveBeenCalledWith(
      "/u/alice/two-sum",
      "page",
    );
  });

  it("revalidates both username and displayUsername when different", () => {
    revalidatePublicProfile({
      username: "alice_dev",
      displayUsername: "Alice",
    });

    expect(nextCache.revalidatePath).toHaveBeenCalledWith(
      "/u/alice_dev",
      "page",
    );
    expect(nextCache.revalidatePath).toHaveBeenCalledWith("/u/Alice", "page");
  });

  it("does not revalidate if username is null or undefined", () => {
    revalidatePublicProfile(null);
    revalidatePublicProfile(undefined);
    revalidatePublicProfile({ username: null, displayUsername: null });

    expect(nextCache.revalidatePath).not.toHaveBeenCalled();
  });

  it("handles errors thrown by revalidatePath without crashing", () => {
    vi.mocked(nextCache.revalidatePath).mockImplementationOnce(() => {
      throw new Error("Next.js cache store unavailable");
    });

    expect(() => revalidatePublicProfile("bob")).not.toThrow();
  });
});
