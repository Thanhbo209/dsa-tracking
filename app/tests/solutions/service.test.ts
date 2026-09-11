import { describe, expect, it, vi } from "vitest";

import { createSolution, updateSolution } from "@/lib/solutions/service";

const { createMock, updateMock, findFirstSolutionMock, findFirstApproachMock } =
  vi.hoisted(() => ({
    createMock: vi.fn(),
    updateMock: vi.fn(),
    findFirstSolutionMock: vi.fn(),
    findFirstApproachMock: vi.fn(),
  }));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    approach: {
      findFirst: findFirstApproachMock,
    },
    solution: {
      create: createMock,
      update: updateMock,
      findFirst: findFirstSolutionMock,
    },
  },
}));

describe("createSolution", () => {
  it("validates input and approach ownership before creating a solution", async () => {
    findFirstApproachMock.mockResolvedValue({
      id: "approach-1",
      userId: "user-1",
    });
    createMock.mockResolvedValue({
      id: "solution-1",
      name: "One-pass complement lookup",
    });

    const result = await createSolution("user-1", {
      approachId: "approach-1",
      name: "One-pass complement lookup",
      description: "Use a hash map for complement lookup.",
      algorithm: "Iterate elements and check map for complement.",
    });

    expect(findFirstApproachMock).toHaveBeenCalledWith({
      where: {
        id: "approach-1",
        userId: "user-1",
      },
    });

    expect(createMock).toHaveBeenCalledWith({
      data: {
        approachId: "approach-1",
        name: "One-pass complement lookup",
        description: "Use a hash map for complement lookup.",
        algorithm: "Iterate elements and check map for complement.",
      },
    });

    expect(result).toEqual({
      id: "solution-1",
      name: "One-pass complement lookup",
    });
  });

  it("rejects creation if user does not own the approach", async () => {
    findFirstApproachMock.mockResolvedValue(null);

    await expect(
      createSolution("user-2", {
        approachId: "approach-1",
        name: "One-pass complement lookup",
      }),
    ).rejects.toThrow("Approach not found or unauthorized");

    expect(createMock).not.toHaveBeenCalled();
  });

  it("rejects invalid input before creating", async () => {
    await expect(
      createSolution("user-1", {
        approachId: "approach-1",
        name: "   ",
      }),
    ).rejects.toThrow();

    expect(createMock).not.toHaveBeenCalled();
  });
});

describe("updateSolution", () => {
  it("validates input and ownership before updating", async () => {
    findFirstSolutionMock.mockResolvedValue({
      id: "solution-1",
      approach: { userId: "user-1" },
    });
    updateMock.mockResolvedValue({
      id: "solution-1",
      name: "Optimized complement lookup",
    });

    const result = await updateSolution("user-1", "solution-1", {
      name: "Optimized complement lookup",
      algorithm: "Updated steps for complement check.",
    });

    expect(findFirstSolutionMock).toHaveBeenCalledWith({
      where: {
        id: "solution-1",
        approach: {
          userId: "user-1",
        },
      },
    });

    expect(updateMock).toHaveBeenCalledWith({
      where: {
        id: "solution-1",
      },
      data: {
        name: "Optimized complement lookup",
        algorithm: "Updated steps for complement check.",
      },
    });

    expect(result).toEqual({
      id: "solution-1",
      name: "Optimized complement lookup",
    });
  });

  it("rejects update if user does not own the solution", async () => {
    findFirstSolutionMock.mockResolvedValue(null);

    await expect(
      updateSolution("user-2", "solution-1", {
        name: "Hacked Solution",
      }),
    ).rejects.toThrow("Solution not found or unauthorized");

    expect(updateMock).not.toHaveBeenCalled();
  });

  it("rejects an empty name before updating", async () => {
    await expect(
      updateSolution("user-1", "solution-1", {
        name: "   ",
      }),
    ).rejects.toThrow();

    expect(updateMock).not.toHaveBeenCalled();
  });
});
