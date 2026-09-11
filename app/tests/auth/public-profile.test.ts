import { describe, expect, it, vi } from "vitest";
import { getPublicUserProfile } from "@/lib/profile/service";

const { userFindFirstMock, approachFindManyMock } = vi.hoisted(() => ({
  userFindFirstMock: vi.fn(),
  approachFindManyMock: vi.fn(),
}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    user: {
      findFirst: userFindFirstMock,
    },
    approach: {
      findMany: approachFindManyMock,
    },
  },
}));

describe("Public Profile Privacy & Knowledge Isolation (lib/profile/service)", () => {
  it("returns null when username does not exist", async () => {
    userFindFirstMock.mockResolvedValue(null);

    const profile = await getPublicUserProfile("nonexistent");
    expect(profile).toBeNull();
  });

  it("returns public user data and lean problem list, strictly isolating private data", async () => {
    userFindFirstMock.mockResolvedValue({
      id: "user-1",
      name: "Thanh Pham",
      username: "thanhcow",
      displayUsername: "thanhcow",
      bio: "Learning DSA algorithms",
      image: null,
      createdAt: new Date("2026-03-01T00:00:00Z"),
    });

    // The lean query only selects id, solutions (id + codes.id), and problem
    // metadata — no approach name/coreIdea/etc. needed for the list page.
    approachFindManyMock.mockResolvedValue([
      {
        id: "app-1",
        solutions: [
          {
            id: "sol-1",
            codes: [{ id: "code-1" }],
          },
        ],
        problem: {
          slug: "two-sum-ii",
          title: "Two Sum II",
          leetcodeId: 167,
          difficulty: "MEDIUM",
          topics: [{ topic: { name: "Array" } }, { topic: { name: "Two Pointers" } }],
        },
      },
    ]);

    const profile = await getPublicUserProfile("thanhcow");
    expect(profile).not.toBeNull();
    if (!profile) return;

    // Verify public profile info
    expect(profile.user.name).toBe("Thanh Pham");
    expect(profile.user.username).toBe("thanhcow");
    expect(profile.user.bio).toBe("Learning DSA algorithms");
    expect(profile.stats.approachCount).toBe(1);
    expect(profile.stats.solutionCount).toBe(1);
    expect(profile.stats.codeCount).toBe(1);
    expect(profile.stats.problemCount).toBe(1);

    // Verify lean problem list (no approach/solution/code nested data)
    expect(profile.problems).toHaveLength(1);
    expect(profile.problems[0].slug).toBe("two-sum-ii");
    expect(profile.problems[0].title).toBe("Two Sum II");
    expect(profile.problems[0].difficulty).toBe("MEDIUM");
    expect(profile.problems[0].topics).toEqual(["Array", "Two Pointers"]);
    expect(profile.problems[0].approachCount).toBe(1);

    // Verify no approach/solution/code nested objects leak out of the list profile
    expect((profile as any).approaches).toBeUndefined();

    // CRITICAL: Ensure no private fields exist anywhere in the serialized output
    const serialized = JSON.stringify(profile);
    expect(serialized).not.toContain("submissionAnalysis");
    expect(serialized).not.toContain("review");
    expect(serialized).not.toContain("runtimeMs");
    expect(serialized).not.toContain("memoryBytes");
    expect(serialized).not.toContain("conceptGaps");
    expect(serialized).not.toContain("REJECTED");
  });
});
