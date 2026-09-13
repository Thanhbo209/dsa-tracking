import { describe, expect, it } from "vitest";
import { createCodeSchema, updateCodeSchema } from "@/lib/validation/codes";

describe("createCodeSchema", () => {
  it("accepts valid code data", () => {
    const result = createCodeSchema.safeParse({
      solutionId: "solution-1",
      language: "Python",
      code: "def two_sum(nums, target):\n    pass",
      notes: "Use a hash map for complement lookup.",
    });

    expect(result.success).toBe(true);
  });

  it("requires solutionId", () => {
    const result = createCodeSchema.safeParse({
      language: "Python",
      code: "print('hello')",
    });

    expect(result.success).toBe(false);
  });

  it("requires language", () => {
    const result = createCodeSchema.safeParse({
      solutionId: "solution-1",
      code: "print('hello')",
    });

    expect(result.success).toBe(false);
  });

  it("requires code", () => {
    const result = createCodeSchema.safeParse({
      solutionId: "solution-1",
      language: "Python",
    });

    expect(result.success).toBe(false);
  });

  it("accepts arbitrary language names", () => {
    const languages = ["Python", "TypeScript", "Java", "C++", "Go", "Rust"];

    for (const language of languages) {
      const result = createCodeSchema.safeParse({
        solutionId: "solution-1",
        language,
        code: "example code",
      });

      expect(result.success).toBe(true);
    }
  });

  it("rejects blank language", () => {
    const result = createCodeSchema.safeParse({
      solutionId: "solution-1",
      language: "   ",
      code: "example code",
    });

    expect(result.success).toBe(false);
  });

  it("rejects blank code", () => {
    const result = createCodeSchema.safeParse({
      solutionId: "solution-1",
      language: "Python",
      code: "",
    });

    expect(result.success).toBe(false);
  });
});

describe("updateCodeSchema", () => {
  it("accepts a partial update without solutionId", () => {
    const result = updateCodeSchema.safeParse({
      language: "TypeScript",
    });

    expect(result.success).toBe(true);
  });

  it("accepts updating only the code", () => {
    const result = updateCodeSchema.safeParse({
      code: "const result = [];",
    });

    expect(result.success).toBe(true);
  });

  it("rejects a blank language", () => {
    const result = updateCodeSchema.safeParse({
      language: "   ",
    });

    expect(result.success).toBe(false);
  });

  it("rejects blank code", () => {
    const result = updateCodeSchema.safeParse({
      code: "",
    });

    expect(result.success).toBe(false);
  });
});
