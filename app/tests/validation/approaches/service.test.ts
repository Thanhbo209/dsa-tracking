import { describe, expect, it, vi } from "vitest";

import { createApproach, updateApproach } from "@/lib/approaches/service";

const { createMock, updateMock } = vi.hoisted(() => ({
  createMock: vi.fn(),
  updateMock: vi.fn(),
}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    approach: {
      create: createMock,
      update: updateMock,
    },
  },
}));

describe("createApproach", () => {
  it("validates input before creating an approach", async () => {
    createMock.mockResolvedValue({
      id: "approach-1",
      name: "Hash Map",
    });

    const result = await createApproach({
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
      },
    });

    expect(result).toEqual({
      id: "approach-1",
      name: "Hash Map",
    });
  });

  it("rejects invalid input before creating an approach", async () => {
    await expect(
      createApproach({
        problemId: "problem-1",
        name: "   ",
      }),
    ).rejects.toThrow();

    expect(createMock).not.toHaveBeenCalled();
  });
});

describe("updateApproach", () => {
  it("validates input before updating an approach", async () => {
    updateMock.mockResolvedValue({
      id: "approach-1",
      name: "Optimized Hash Map",
    });

    const result = await updateApproach("approach-1", {
      name: "Optimized Hash Map",
      timeComplexity: "O(n)",
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
      updateApproach("approach-1", {
        name: "   ",
      }),
    ).rejects.toThrow();

    expect(updateMock).not.toHaveBeenCalled();
  });
});
