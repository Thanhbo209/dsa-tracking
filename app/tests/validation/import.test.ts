import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db/prisma";
import { importSubmission } from "@/lib/submissions/import";

describe("importSubmission", () => {
  beforeEach(async () => {
    await prisma.submission.deleteMany();
    await prisma.problemTopic.deleteMany();
    await prisma.topic.deleteMany();
    await prisma.problem.deleteMany();

    await prisma.user.upsert({
      where: { id: "test-user-import" },
      update: {},
      create: {
        id: "test-user-import",
        name: "Test User",
        email: "test-import@example.com",
        username: "testimport",
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await prisma.problem.create({
      data: {
        leetcodeId: 1,
        slug: "two-sum",
        title: "Two Sum",
        difficulty: "EASY",
        url: "https://leetcode.com/problems/two-sum/",
      },
    });
  });

  it("creates a submission for an existing problem", async () => {
    const result = await importSubmission("test-user-import", {
      externalId: "submission-001",
      problemSlug: "two-sum",
      status: "ACCEPTED",
      language: "python3",
      code: "print('hello')",
      runtimeMs: 42,
      memoryBytes: 123456,
    });

    expect(result.created).toBe(true);

    const submission = await prisma.submission.findUnique({
      where: {
        id: result.submissionId,
      },
    });

    expect(submission).not.toBeNull();
    expect(submission?.externalId).toBe("submission-001");
    expect(submission?.status).toBe("ACCEPTED");
    expect(submission?.language).toBe("python3");
  });

  it("does not create a duplicate submission", async () => {
    const input = {
      externalId: "submission-002",
      problemSlug: "two-sum",
      status: "ACCEPTED" as const,
      language: "python3",
    };

    const first = await importSubmission("test-user-import", input);
    const second = await importSubmission("test-user-import", input);

    expect(first.created).toBe(true);
    expect(second.created).toBe(false);
    expect(second.submissionId).toBe(first.submissionId);

    const count = await prisma.submission.count({
      where: {
        externalId: "submission-002",
      },
    });

    expect(count).toBe(1);
  });

  it("rejects a submission for an unknown problem", async () => {
    await expect(
      importSubmission("test-user-import", {
        externalId: "submission-003",
        problemSlug: "does-not-exist",
        status: "ACCEPTED",
        language: "python3",
      }),
    ).rejects.toThrow("LeetCode problem not found");
  });
});
