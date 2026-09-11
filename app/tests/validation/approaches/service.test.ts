import { describe, expect, it, vi } from "vitest";

import { createApproach, updateApproach } from "@/lib/approaches/service";

const { createMock, updateMock, findFirstMock } = vi.hoisted(() => ({
  createMock: vi.fn(),
  updateMock: vi.fn(),
  findFirstMock: vi.fn(),
}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    approach: {
      create: createMock,
      update: updateMock,
      findFirst: findFirstMock,
    },
  },
}));

describe("createApproach", () => {
  it("validates input before creating an approach", async () => {
    createMock.mockResolvedValue({
      id: "approach-1",
      name: "Hash Map",
    });

    const result = await createApproach("user-1", {
      problemId: "problem-1",
      name: "Hash Map",
      coreIdea: "Store previously seen values.",
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
    });

    expect(createMock).toHaveBeenCalledWith({
      data: {
        problemId: "problem-1",
        name: "Hash Map",
        coreIdea: "Store previously seen values.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        userId: "user-1",
      },
    });

    expect(result).toEqual({
      id: "approach-1",
      name: "Hash Map",
    });
  });

  it("rejects invalid input before creating an approach", async () => {
    await expect(
      createApproach("user-1", {
        problemId: "problem-1",
        name: "   ",
      }),
    ).rejects.toThrow();

    expect(createMock).not.toHaveBeenCalled();
  });
});

describe("updateApproach", () => {
  it("validates input before updating an approach", async () => {
    findFirstMock.mockResolvedValue({
      id: "approach-1",
      userId: "user-1",
      name: "Hash Map",
    });

    updateMock.mockResolvedValue({
      id: "approach-1",
      name: "Optimized Hash Map",
    });

    const result = await updateApproach("user-1", "approach-1", {
      name: "Optimized Hash Map",
      timeComplexity: "O(n)",
    });

    expect(findFirstMock).toHaveBeenCalledWith({
      where: {
        id: "approach-1",
        userId: "user-1",
      },
    });

    expect(updateMock).toHaveBeenCalledWith({
      where: {
        id: "approach-1",
      },
      data: {
        name: "Optimized Hash Map",
        timeComplexity: "O(n)",
      },
    });

    expect(result).toEqual({
      id: "approach-1",
      name: "Optimized Hash Map",
    });
  });

  it("rejects an empty name before updating", async () => {
    await expect(
      updateApproach("user-1", "approach-1", {
        name: "   ",
      }),
    ).rejects.toThrow();

    expect(updateMock).not.toHaveBeenCalled();
  });
});
