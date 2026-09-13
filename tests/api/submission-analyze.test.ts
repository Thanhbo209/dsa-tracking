import { describe, expect, it, vi, beforeEach } from "vitest";

const {
  analyzeSubmissionMock,
  getSubmissionAnalysesMock,
  getCurrentUserMock,
} = vi.hoisted(() => ({
  analyzeSubmissionMock: vi.fn(),
  getSubmissionAnalysesMock: vi.fn(),
  getCurrentUserMock: vi.fn(),
}));

vi.mock("@/lib/auth/session", () => ({
  getCurrentUser: getCurrentUserMock,
}));

vi.mock("@/lib/analysis/service", () => ({
  analyzeSubmission: analyzeSubmissionMock,
  getSubmissionAnalyses: getSubmissionAnalysesMock,
}));

import { POST, GET } from "@/app/api/submissions/[id]/analyze/route";

describe("/api/submissions/[id]/analyze Route Handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCurrentUserMock.mockResolvedValue({ id: "user-123" });
  });

  describe("POST", () => {
    it("returns 401 when unauthenticated", async () => {
      getCurrentUserMock.mockResolvedValue(null);

      const request = new Request(
        "http://localhost/api/submissions/sub-123/analyze",
        {
          method: "POST",
        },
      );

      const response = await POST(request, {
        params: Promise.resolve({ id: "sub-123" }),
      });

      expect(response.status).toBe(401);
    });

    it("analyzes a submission and returns 201 with analysis result", async () => {
      const mockAnalysis = {
        id: "analysis-123",
        submissionId: "sub-123",
        status: "DRAFT_READY",
        modelName: "gemini-2.5-flash",
        review: {
          summary: "Great hash map solution",
          isCorrect: true,
          timeComplexity: {
            value: "O(n)",
            explanation: "Single pass",
            reasoning: ["Loop runs n times", "Map lookup is O(1)"],
          },
          spaceComplexity: {
            value: "O(n)",
            explanation: "Stores n elements",
            reasoning: ["Map grows with input size"],
          },
        },
        draft: {
          approach: { name: "Hash Map", coreIdea: "Store seen numbers" },
          solution: { name: "One Pass", algorithm: "Iterate and check" },
          code: { language: "python3", code: "def twoSum(): pass" },
        },
      };

      analyzeSubmissionMock.mockResolvedValue(mockAnalysis);

      const request = new Request(
        "http://localhost/api/submissions/sub-123/analyze",
        {
          method: "POST",
        },
      );

      const response = await POST(request, {
        params: Promise.resolve({ id: "sub-123" }),
      });

      expect(response.status).toBe(201);
      const json = await response.json();
      expect(json.id).toBe("analysis-123");
      expect(json.status).toBe("DRAFT_READY");
      expect(analyzeSubmissionMock).toHaveBeenCalledWith("user-123", "sub-123");
    });

    it("returns 404 when submission is not found", async () => {
      analyzeSubmissionMock.mockRejectedValue(
        new Error("Submission not found or unauthorized"),
      );

      const request = new Request(
        "http://localhost/api/submissions/sub-404/analyze",
        {
          method: "POST",
        },
      );

      const response = await POST(request, {
        params: Promise.resolve({ id: "sub-404" }),
      });

      expect(response.status).toBe(404);
      const json = await response.json();
      expect(json.error).toBe("Submission not found or unauthorized");
    });

    it("returns 500 when analysis service fails with generic error", async () => {
      analyzeSubmissionMock.mockRejectedValue(new Error("Unexpected failure"));

      const request = new Request(
        "http://localhost/api/submissions/sub-error/analyze",
        {
          method: "POST",
        },
      );

      const response = await POST(request, {
        params: Promise.resolve({ id: "sub-error" }),
      });

      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json.error).toBe("Failed to analyze submission");
    });
  });

  describe("GET", () => {
    it("returns 401 when unauthenticated", async () => {
      getCurrentUserMock.mockResolvedValue(null);

      const request = new Request(
        "http://localhost/api/submissions/sub-123/analyze",
        {
          method: "GET",
        },
      );

      const response = await GET(request, {
        params: Promise.resolve({ id: "sub-123" }),
      });

      expect(response.status).toBe(401);
    });

    it("returns all analyses for the submission", async () => {
      const mockList = [
        { id: "analysis-2", createdAt: new Date() },
        { id: "analysis-1", createdAt: new Date() },
      ];
      getSubmissionAnalysesMock.mockResolvedValue(mockList);

      const request = new Request(
        "http://localhost/api/submissions/sub-123/analyze",
        {
          method: "GET",
        },
      );

      const response = await GET(request, {
        params: Promise.resolve({ id: "sub-123" }),
      });

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.length).toBe(2);
      expect(getSubmissionAnalysesMock).toHaveBeenCalledWith(
        "user-123",
        "sub-123",
      );
    });
  });
});
