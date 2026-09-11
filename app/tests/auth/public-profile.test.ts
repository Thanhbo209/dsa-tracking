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

  it("returns public user data and knowledge playbook, strictly isolating private data", async () => {
    userFindFirstMock.mockResolvedValue({
      id: "user-1",
      name: "Thanh Pham",
      username: "thanhcow",
      displayUsername: "thanhcow",
      bio: "Learning DSA algorithms",
      image: null,
      createdAt: new Date("2026-03-01T00:00:00Z"),
    });

    approachFindManyMock.mockResolvedValue([
      {
        id: "app-1",
        name: "Two Pointers",
        coreIdea: "Opposite ends meet",
        whyItWorks: "Sorted array guarantees monotonic sum",
        whenToUse: "Target sum in sorted array",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        pros: "Fast",
        cons: "Requires sorted",
        notes: null,
        mistakes: null,
        createdAt: new Date("2026-03-02T00:00:00Z"),
        problem: {
          slug: "two-sum-ii",
          title: "Two Sum II",
          leetcodeId: 167,
          difficulty: "MEDIUM",
          topics: [{ topic: { name: "Array" } }, { topic: { name: "Two Pointers" } }],
        },
        solutions: [
          {
            id: "sol-1",
            name: "Left & Right pointer",
            description: "Move left or right depending on sum",
            algorithm: "left = 0, right = n - 1",
            notes: null,
            codes: [
              {
                id: "code-1",
                language: "python3",
                code: "def twoSum(numbers, target): pass",
                notes: null,
              },
            ],
          },
        ],
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

    // Verify public knowledge
    expect(profile.approaches[0].name).toBe("Two Pointers");
    expect(profile.approaches[0].problem.title).toBe("Two Sum II");
    expect(profile.approaches[0].solutions[0].name).toBe("Left & Right pointer");
    expect(profile.approaches[0].solutions[0].codes[0].language).toBe("python3");

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
