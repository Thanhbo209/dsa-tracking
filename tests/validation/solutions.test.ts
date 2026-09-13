import { describe, expect, it } from "vitest";

import {
  createSolutionSchema,
  updateSolutionSchema,
} from "@/lib/validation/solutions";

describe("createSolutionSchema", () => {
  it("accepts a valid solution", () => {
    const result = createSolutionSchema.safeParse({
      approachId: "approach-1",
      name: "One-pass complement lookup",
      description: "Use a hash map to find the required complement.",
      algorithm: "Scan the array once while storing previously seen values.",
    });

    expect(result.success).toBe(true);
  });

  it("requires an approachId", () => {
    const result = createSolutionSchema.safeParse({
      name: "One-pass complement lookup",
    });

    expect(result.success).toBe(false);
  });

  it("requires a solution name", () => {
    const result = createSolutionSchema.safeParse({
      approachId: "approach-1",
      name: "   ",
    });

    expect(result.success).toBe(false);
  });
});

describe("updateSolutionSchema", () => {
  it("allows partial updates", () => {
    const result = updateSolutionSchema.safeParse({
      description: "Updated explanation.",
    });

    expect(result.success).toBe(true);
  });

  it("does not allow an empty name", () => {
    const result = updateSolutionSchema.safeParse({
      name: "   ",
    });

    expect(result.success).toBe(false);
  });
});
