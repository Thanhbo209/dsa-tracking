import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockCode, mockSolution } = vi.hoisted(() => ({
  mockCode: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  mockSolution: {
    findFirst: vi.fn(),
  },
}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    code: mockCode,
    solution: mockSolution,
  },
}));

import {
  createCode,
  getCodes,
  getCode,
  updateCode,
  deleteCode,
} from "@/lib/codes/service";

describe("code service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createCode", () => {
    it("validates input before creating a code", async () => {
      const code = {
        id: "code-1",
        solutionId: "solution-1",
        language: "Python",
        code: "print('hello')",
        notes: null,
      };

      mockSolution.findFirst.mockResolvedValue({ id: "solution-1" });
      mockCode.create.mockResolvedValue(code);

      const result = await createCode("user-1", {
        solutionId: "solution-1",
        language: "Python",
        code: "print('hello')",
      });

      expect(mockSolution.findFirst).toHaveBeenCalledWith({
        where: {
          id: "solution-1",
          approach: {
            userId: "user-1",
          },
        },
      });

      expect(mockCode.create).toHaveBeenCalledWith({
        data: {
          solutionId: "solution-1",
          language: "Python",
          code: "print('hello')",
        },
      });

      expect(result).toEqual(code);
    });

    it("rejects invalid input before calling Prisma", async () => {
      await expect(
        createCode("user-1", {
          solutionId: "solution-1",
          language: "",
          code: "print('hello')",
        }),
      ).rejects.toThrow();

      expect(mockCode.create).not.toHaveBeenCalled();
    });
  });

  describe("getCodes", () => {
    it("returns codes for a solution", async () => {
      const codes = [
        {
          id: "code-1",
          solutionId: "solution-1",
          language: "Python",
          code: "print('hello')",
        },
        {
          id: "code-2",
          solutionId: "solution-1",
          language: "TypeScript",
          code: "console.log('hello')",
        },
      ];

      mockSolution.findFirst.mockResolvedValue({ id: "solution-1" });
      mockCode.findMany.mockResolvedValue(codes);

      const result = await getCodes("user-1", "solution-1");

      expect(mockSolution.findFirst).toHaveBeenCalledWith({
        where: {
          id: "solution-1",
          approach: {
            userId: "user-1",
          },
        },
      });

      expect(mockCode.findMany).toHaveBeenCalledWith({
        where: {
          solutionId: "solution-1",
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      expect(result).toEqual(codes);
    });
  });

  describe("getCode", () => {
    it("returns a code by id", async () => {
      const code = {
        id: "code-1",
        solutionId: "solution-1",
        language: "Python",
        code: "print('hello')",
      };

      mockCode.findFirst.mockResolvedValue(code);

      const result = await getCode("user-1", "code-1");

      expect(mockCode.findFirst).toHaveBeenCalledWith({
        where: {
          id: "code-1",
          solution: {
            approach: {
              userId: "user-1",
            },
          },
        },
      });

      expect(result).toEqual(code);
    });
  });

  describe("updateCode", () => {
    it("validates input before updating", async () => {
      const code = {
        id: "code-1",
        solutionId: "solution-1",
        language: "TypeScript",
        code: "console.log('hello')",
      };

      mockCode.findFirst.mockResolvedValue(code);
      mockCode.update.mockResolvedValue(code);

      const result = await updateCode("user-1", "code-1", {
        language: "TypeScript",
      });

      expect(mockCode.update).toHaveBeenCalledWith({
        where: {
          id: "code-1",
        },
        data: {
          language: "TypeScript",
        },
      });

      expect(result).toEqual(code);
    });

    it("rejects invalid input before calling Prisma", async () => {
      await expect(
        updateCode("user-1", "code-1", {
          language: "   ",
        }),
      ).rejects.toThrow();

      expect(mockCode.update).not.toHaveBeenCalled();
    });
  });

  describe("deleteCode", () => {
    it("deletes a code by id", async () => {
      const code = {
        id: "code-1",
        solutionId: "solution-1",
        language: "Python",
        code: "print('hello')",
      };

      mockCode.findFirst.mockResolvedValue(code);
      mockCode.delete.mockResolvedValue(code);

      const result = await deleteCode("user-1", "code-1");

      expect(mockCode.delete).toHaveBeenCalledWith({
        where: {
          id: "code-1",
        },
      });

      expect(result).toEqual(code);
    });
  });
});
