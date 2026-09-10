import { beforeEach, describe, expect, it, vi } from "vitest";

const { promoteDraftToKnowledgeMock, rejectDraftMock } = vi.hoisted(() => ({
  promoteDraftToKnowledgeMock: vi.fn(),
  rejectDraftMock: vi.fn(),
}));

vi.mock("@/lib/analysis/promotion", () => ({
  promoteDraftToKnowledge: promoteDraftToKnowledgeMock,
  rejectDraft: rejectDraftMock,
}));

import { POST as acceptHandler } from "@/app/api/submissions/[id]/analyze/[analysisId]/accept/route";
import { POST as rejectHandler } from "@/app/api/submissions/[id]/analyze/[analysisId]/reject/route";

describe("/api/submissions/[id]/analyze/[analysisId] Accept and Reject Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST .../accept", () => {
    it("returns 200 with result when promotion succeeds", async () => {
      promoteDraftToKnowledgeMock.mockResolvedValue({
        analysis: { id: "a-1", status: "ACCEPTED" },
        approach: { id: "app-1" },
        solution: { id: "sol-1" },
        code: { id: "c-1" },
      });

      const request = new Request("http://localhost/api/submissions/sub-1/analyze/a-1/accept", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const response = await acceptHandler(request, {
        params: Promise.resolve({ id: "sub-1", analysisId: "a-1" }),
      });

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.analysis.status).toBe("ACCEPTED");
      expect(promoteDraftToKnowledgeMock).toHaveBeenCalledWith("sub-1", "a-1", undefined);
    });

    it("passes editedDraft to service when provided in body", async () => {
      promoteDraftToKnowledgeMock.mockResolvedValue({
        analysis: { id: "a-1", status: "ACCEPTED" },
      });

      const customDraft = {
        approach: { name: "Custom Approach" },
      };

      const request = new Request("http://localhost/api/submissions/sub-1/analyze/a-1/accept", {
        method: "POST",
        body: JSON.stringify({ editedDraft: customDraft }),
      });

      const response = await acceptHandler(request, {
        params: Promise.resolve({ id: "sub-1", analysisId: "a-1" }),
      });

      expect(response.status).toBe(200);
      expect(promoteDraftToKnowledgeMock).toHaveBeenCalledWith("sub-1", "a-1", customDraft);
    });

    it("returns 400 when analysis cannot be accepted", async () => {
      promoteDraftToKnowledgeMock.mockRejectedValue(
        new Error("Cannot accept analysis with status REJECTED"),
      );

      const request = new Request("http://localhost/api/submissions/sub-1/analyze/a-1/accept", {
        method: "POST",
      });

      const response = await acceptHandler(request, {
        params: Promise.resolve({ id: "sub-1", analysisId: "a-1" }),
      });

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toContain("Cannot accept analysis with status REJECTED");
    });

    it("returns 404 when analysis is not found", async () => {
      promoteDraftToKnowledgeMock.mockRejectedValue(new Error("Analysis not found"));

      const request = new Request("http://localhost/api/submissions/sub-1/analyze/a-404/accept", {
        method: "POST",
      });

      const response = await acceptHandler(request, {
        params: Promise.resolve({ id: "sub-1", analysisId: "a-404" }),
      });

      expect(response.status).toBe(404);
    });
  });

  describe("POST .../reject", () => {
    it("returns 200 when rejection succeeds", async () => {
      rejectDraftMock.mockResolvedValue({
        id: "a-1",
        status: "REJECTED",
      });

      const request = new Request("http://localhost/api/submissions/sub-1/analyze/a-1/reject", {
        method: "POST",
      });

      const response = await rejectHandler(request, {
        params: Promise.resolve({ id: "sub-1", analysisId: "a-1" }),
      });

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.status).toBe("REJECTED");
      expect(rejectDraftMock).toHaveBeenCalledWith("sub-1", "a-1");
    });

    it("returns 400 when trying to reject non-DRAFT_READY analysis", async () => {
      rejectDraftMock.mockRejectedValue(
        new Error("Cannot reject analysis with status REJECTED"),
      );

      const request = new Request("http://localhost/api/submissions/sub-1/analyze/a-1/reject", {
        method: "POST",
      });

      const response = await rejectHandler(request, {
        params: Promise.resolve({ id: "sub-1", analysisId: "a-1" }),
      });

      expect(response.status).toBe(400);
    });
  });
});
