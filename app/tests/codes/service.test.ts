import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockCode } = vi.hoisted(() => ({
  mockCode: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    code: mockCode,
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

      mockCode.create.mockResolvedValue(code);

      const result = await createCode({
        solutionId: "solution-1",
        language: "Python",
        code: "print('hello')",
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
        createCode({
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

      mockCode.findMany.mockResolvedValue(codes);

      const result = await getCodes("solution-1");

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

      mockCode.findUnique.mockResolvedValue(code);

      const result = await getCode("code-1");

      expect(mockCode.findUnique).toHaveBeenCalledWith({
        where: {
          id: "code-1",
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

      mockCode.update.mockResolvedValue(code);

      const result = await updateCode("code-1", {
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
        updateCode("code-1", {
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

      mockCode.delete.mockResolvedValue(code);

      const result = await deleteCode("code-1");

      expect(mockCode.delete).toHaveBeenCalledWith({
        where: {
          id: "code-1",
        },
      });

      expect(result).toEqual(code);
    });
  });
});
