import { describe, expect, it, vi } from "vitest";

import { createSolution, updateSolution } from "@/lib/solutions/service";

const { createMock, updateMock } = vi.hoisted(() => ({
  createMock: vi.fn(),
  updateMock: vi.fn(),
}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    solution: {
      create: createMock,
      update: updateMock,
    },
  },
}));

describe("createSolution", () => {
  it("validates input before creating a solution", async () => {
    createMock.mockResolvedValue({
      id: "solution-1",
      name: "One-pass complement lookup",
    });

    const result = await createSolution({
      approachId: "approach-1",
      name: "One-pass complement lookup",
      description: "Use a hash map for complement lookup.",
    });

    expect(createMock).toHaveBeenCalledWith({
      data: {
        approachId: "approach-1",
        name: "One-pass complement lookup",
        description: "Use a hash map for complement lookup.",
      },
    });

    expect(result).toEqual({
      id: "solution-1",
      name: "One-pass complement lookup",
    });
  });

  it("rejects invalid input before creating", async () => {
    await expect(
      createSolution({
        approachId: "approach-1",
        name: "   ",
      }),
    ).rejects.toThrow();

    expect(createMock).not.toHaveBeenCalled();
  });
});

describe("updateSolution", () => {
  it("validates input before updating", async () => {
    updateMock.mockResolvedValue({
      id: "solution-1",
      name: "Optimized complement lookup",
    });

    const result = await updateSolution("solution-1", {
      name: "Optimized complement lookup",
    });

    expect(updateMock).toHaveBeenCalledWith({
      where: {
        id: "solution-1",
      },
      data: {
        name: "Optimized complement lookup",
      },
    });

    expect(result).toEqual({
      id: "solution-1",
      name: "Optimized complement lookup",
    });
  });

  it("rejects an empty name before updating", async () => {
    await expect(
      updateSolution("solution-1", {
        name: "   ",
      }),
    ).rejects.toThrow();

    expect(updateMock).not.toHaveBeenCalled();
  });
});
