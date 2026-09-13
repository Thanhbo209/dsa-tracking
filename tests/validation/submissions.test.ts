import { describe, expect, it } from "vitest";
import { submissionImportSchema } from "@/lib/validation/submissions";

describe("submissionImportSchema", () => {
  it("accepts a valid submission", () => {
    const result = submissionImportSchema.safeParse({
      externalId: "123456789",
      problemSlug: "two-sum",
      status: "ACCEPTED",
      language: "python3",
      code: "def twoSum(nums, target): ...",
      runtimeMs: 42,
      memoryBytes: 123456,
      submittedAt: "2026-09-09T10:00:00Z",
    });

    expect(result.success).toBe(true);
  });

  it("rejects a missing externalId", () => {
    const result = submissionImportSchema.safeParse({
      problemSlug: "two-sum",
      status: "ACCEPTED",
      language: "python3",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a missing problemSlug", () => {
    const result = submissionImportSchema.safeParse({
      externalId: "123456789",
      status: "ACCEPTED",
      language: "python3",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an invalid status", () => {
    const result = submissionImportSchema.safeParse({
      externalId: "123456789",
      problemSlug: "two-sum",
      status: "INVALID_STATUS",
      language: "python3",
    });

    expect(result.success).toBe(false);
  });

  it("rejects negative runtime", () => {
    const result = submissionImportSchema.safeParse({
      externalId: "123456789",
      problemSlug: "two-sum",
      status: "ACCEPTED",
      language: "python3",
      runtimeMs: -1,
    });

    expect(result.success).toBe(false);
  });

  it("rejects negative memory", () => {
    const result = submissionImportSchema.safeParse({
      externalId: "123456789",
      problemSlug: "two-sum",
      status: "ACCEPTED",
      language: "python3",
      memoryBytes: -1,
    });

    expect(result.success).toBe(false);
  });

  it("coerces submittedAt to a Date", () => {
    const result = submissionImportSchema.safeParse({
      externalId: "123456789",
      problemSlug: "two-sum",
      status: "ACCEPTED",
      language: "python3",
      submittedAt: "2026-09-09T10:00:00Z",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.submittedAt).toBeInstanceOf(Date);
    }
  });
});
