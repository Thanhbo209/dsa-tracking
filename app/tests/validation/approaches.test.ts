import { describe, expect, it } from "vitest";

import {
  createApproachSchema,
  updateApproachSchema,
} from "@/lib/validation/approaches";

describe("createApproachSchema", () => {
  it("accepts a valid approach", () => {
    const result = createApproachSchema.safeParse({
      problemId: "problem-1",
      name: "Hash Map",
      coreIdea: "Store previously seen values for constant-time lookup.",
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
    });

    expect(result.success).toBe(true);
  });

  it("requires a problemId", () => {
    const result = createApproachSchema.safeParse({
      name: "Hash Map",
    });

    expect(result.success).toBe(false);
  });

  it("requires an approach name", () => {
    const result = createApproachSchema.safeParse({
      problemId: "problem-1",
      name: "   ",
    });

    expect(result.success).toBe(false);
  });

  it("allows custom complexity expressions", () => {
    const result = createApproachSchema.safeParse({
      problemId: "problem-1",
      name: "Two Pointers",
      timeComplexity: "O(m + n)",
      spaceComplexity: "O(1)",
    });

    expect(result.success).toBe(true);
  });
});

describe("updateApproachSchema", () => {
  it("allows partial updates", () => {
    const result = updateApproachSchema.safeParse({
      timeComplexity: "O(n log n)",
    });

    expect(result.success).toBe(true);
  });

  it("does not allow an empty name", () => {
    const result = updateApproachSchema.safeParse({
      name: "   ",
    });

    expect(result.success).toBe(false);
  });
});
