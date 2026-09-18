import { describe, expect, it, vi, beforeEach } from "vitest";
import { isQuotaError, analyzeQuotaError } from "@/lib/analysis/quota";
import { getActiveModel, switchModelOnQuotaError } from "@/lib/analysis/model-state";
import {
  DEFAULT_PRIMARY_MODEL,
  DEFAULT_FALLBACK_MODEL,
  formatModelDisplayName,
} from "@/lib/analysis/models";
import { ApiError } from "@google/genai";

// Mock prisma for isolated model state testing
const {
  aiModelStateFindUniqueMock,
  aiModelStateUpsertMock,
  aiModelStateUpdateMock,
  aiModelStateUpdateManyMock,
  aiModelSwitchEventCreateMock,
} = vi.hoisted(() => ({
  aiModelStateFindUniqueMock: vi.fn(),
  aiModelStateUpsertMock: vi.fn(),
  aiModelStateUpdateMock: vi.fn(),
  aiModelStateUpdateManyMock: vi.fn(),
  aiModelSwitchEventCreateMock: vi.fn(),
}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    aiModelState: {
      findUnique: aiModelStateFindUniqueMock,
      upsert: aiModelStateUpsertMock,
      update: aiModelStateUpdateMock,
      updateMany: aiModelStateUpdateManyMock,
    },
    aiModelSwitchEvent: {
      create: aiModelSwitchEventCreateMock,
    },
  },
}));

describe("Model Switching & Quota Architecture", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("1. Quota Detection (isQuotaError)", () => {
    it("identifies ApiError with status 429 as quota error", () => {
      const apiErr = new ApiError({
        message: "Resource exhausted",
        status: 429,
      } as unknown as ConstructorParameters<typeof ApiError>[0]);
      expect(isQuotaError(apiErr)).toBe(true);
    });

    it("identifies structural object with status 429 as quota error", () => {
      expect(isQuotaError({ status: 429, message: "Too Many Requests" })).toBe(true);
    });

    it("identifies error message containing RESOURCE_EXHAUSTED or quota exceeded", () => {
      const err = new Error(
        'Gemini API error: {"error":{"code":429,"message":"Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 20","status":"RESOURCE_EXHAUSTED"}}'
      );
      expect(isQuotaError(err)).toBe(true);
    });

    it("returns false for non-quota errors (503, 404, 400, syntax error)", () => {
      expect(isQuotaError(new Error("503 Service Unavailable: high demand"))).toBe(false);
      expect(isQuotaError(new Error("404 Model not found"))).toBe(false);
      expect(isQuotaError(new Error("400 Bad Request: Invalid JSON payload"))).toBe(false);
      expect(isQuotaError(new TypeError("Cannot read properties of undefined"))).toBe(false);
      expect(isQuotaError(null)).toBe(false);
      expect(isQuotaError("arbitrary string")).toBe(false);
    });
  });

  describe("2. Quota Categorization & Cooldown (Daily vs Short-window)", () => {
    it("detects 'PerDay' violation and applies long daily window, ignoring short retryDelay", () => {
      const fixedNow = new Date("2026-09-18T10:00:00.000Z");

      const perDayError = new Error(
        JSON.stringify({
          error: {
            code: 429,
            status: "RESOURCE_EXHAUSTED",
            message: "Quota exceeded for model gemini-3.6-flash. Please retry in 36s.",
            details: [
              {
                "@type": "type.googleapis.com/google.rpc.QuotaFailure",
                violations: [
                  {
                    quotaMetric: "generativelanguage.googleapis.com/generate_content_free_tier_requests",
                    quotaId: "GenerateRequestsPerDayPerProjectPerModel-FreeTier",
                    quotaValue: "20",
                  },
                ],
              },
              {
                "@type": "type.googleapis.com/google.rpc.RetryInfo",
                retryDelay: "36s",
              },
            ],
          },
        })
      );

      const analysis = analyzeQuotaError(perDayError, "gemini-3.6-flash", fixedNow);

      expect(analysis.isQuota).toBe(true);
      expect(analysis.category).toBe("daily");
      expect(analysis.retryDelaySeconds).toBe(36);
      // Cooldown must be until the next UTC day boundary (at least 14 hours away from 10:00 UTC)
      // and NOT the 36-second retryDelay!
      expect(analysis.cooldownSeconds).toBeGreaterThan(3600); // Definitely > 1 hour
      expect(analysis.cooldownExpiresAt.toISOString()).toBe("2026-09-19T00:00:00.000Z");
      expect(analysis.reason).toContain("[daily]");
      expect(analysis.reason).toContain("GenerateRequestsPerDayPerProjectPerModel-FreeTier");
    });

    it("detects short-window rate limit and uses retryDelay with 30s minimum floor", () => {
      const fixedNow = new Date("2026-09-18T10:00:00.000Z");

      const shortWindowError = new Error(
        JSON.stringify({
          error: {
            code: 429,
            status: "RESOURCE_EXHAUSTED",
            message: "Rate limit exceeded. Please retry in 45s.",
            details: [
              {
                "@type": "type.googleapis.com/google.rpc.QuotaFailure",
                violations: [
                  {
                    quotaMetric: "generativelanguage.googleapis.com/generate_content_requests_per_minute",
                    quotaId: "GenerateRequestsPerMinutePerProject",
                  },
                ],
              },
              {
                "@type": "type.googleapis.com/google.rpc.RetryInfo",
                retryDelay: "45s",
              },
            ],
          },
        })
      );

      const analysis = analyzeQuotaError(shortWindowError, "gemini-3.6-flash", fixedNow);

      expect(analysis.isQuota).toBe(true);
      expect(analysis.category).toBe("short-window");
      expect(analysis.retryDelaySeconds).toBe(45);
      expect(analysis.cooldownSeconds).toBe(45);
      expect(analysis.cooldownExpiresAt.toISOString()).toBe("2026-09-18T10:00:45.000Z");
      expect(analysis.reason).toContain("[short-window]");
    });

    it("applies 30s minimum floor when retryDelay is unrealistically short or missing", () => {
      const fixedNow = new Date("2026-09-18T10:00:00.000Z");

      const fastRetryError = new Error(
        JSON.stringify({
          error: {
            code: 429,
            status: "RESOURCE_EXHAUSTED",
            message: "Rate limit exceeded. Please retry in 5s.",
            details: [
              {
                "@type": "type.googleapis.com/google.rpc.RetryInfo",
                retryDelay: "5s",
              },
            ],
          },
        })
      );

      const analysis = analyzeQuotaError(fastRetryError, "gemini-3.6-flash", fixedNow);

      expect(analysis.isQuota).toBe(true);
      expect(analysis.category).toBe("short-window");
      expect(analysis.retryDelaySeconds).toBe(5);
      // Floor must enforce 30 seconds
      expect(analysis.cooldownSeconds).toBe(30);
      expect(analysis.cooldownExpiresAt.toISOString()).toBe("2026-09-18T10:00:30.000Z");
    });
  });

  describe("3. Model State Resolution & Post-Cooldown Policy", () => {
    it("initializes activeModel to primaryModel on first call", async () => {
      aiModelStateFindUniqueMock.mockResolvedValue(null);
      aiModelStateUpsertMock.mockResolvedValue({
        id: "default",
        activeModel: DEFAULT_PRIMARY_MODEL,
        primaryModel: DEFAULT_PRIMARY_MODEL,
        fallbackModel: DEFAULT_FALLBACK_MODEL,
        inCooldown: false,
      });

      const active = await getActiveModel();
      expect(active).toBe(DEFAULT_PRIMARY_MODEL);
    });

    it("stays on current activeModel even after cooldown expires (post-cooldown policy)", async () => {
      const pastTime = new Date(Date.now() - 10000); // 10 seconds ago
      aiModelStateFindUniqueMock.mockResolvedValue({
        id: "default",
        activeModel: DEFAULT_FALLBACK_MODEL, // Currently running on fallback!
        primaryModel: DEFAULT_PRIMARY_MODEL,
        fallbackModel: DEFAULT_FALLBACK_MODEL,
        inCooldown: true,
        cooldownExpiresAt: pastTime,
      });

      aiModelStateUpdateMock.mockResolvedValue({
        id: "default",
        activeModel: DEFAULT_FALLBACK_MODEL,
        inCooldown: false,
        cooldownExpiresAt: null,
      });

      const active = await getActiveModel();

      // Verified: must stay on DEFAULT_FALLBACK_MODEL, NOT switch back to primary
      expect(active).toBe(DEFAULT_FALLBACK_MODEL);
      expect(aiModelStateUpdateMock).toHaveBeenCalledWith({
        where: { id: "default" },
        data: {
          inCooldown: false,
          cooldownExpiresAt: null,
        },
      });
    });
  });

  describe("4. Concurrency-Safe Model Switching", () => {
    it("switches model and logs event when winning the race (count > 0)", async () => {
      aiModelStateUpdateManyMock.mockResolvedValue({ count: 1 });
      aiModelSwitchEventCreateMock.mockResolvedValue({ id: "event-1" });

      const quotaErr = new Error("RESOURCE_EXHAUSTED: 429 quota exceeded");
      const result = await switchModelOnQuotaError(DEFAULT_PRIMARY_MODEL, quotaErr);

      expect(result.switched).toBe(true);
      expect(result.newModel).toBe(DEFAULT_FALLBACK_MODEL);
      expect(aiModelStateUpdateManyMock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: "default",
            activeModel: DEFAULT_PRIMARY_MODEL,
          },
          data: expect.objectContaining({
            activeModel: DEFAULT_FALLBACK_MODEL,
            inCooldown: true,
          }),
        })
      );
      expect(aiModelSwitchEventCreateMock).toHaveBeenCalledTimes(1);
    });

    it("handles concurrent switch safely without duplicate switch events when count === 0", async () => {
      // Another request already flipped the model from DEFAULT_PRIMARY_MODEL to DEFAULT_FALLBACK_MODEL
      aiModelStateUpdateManyMock.mockResolvedValue({ count: 0 });
      aiModelStateFindUniqueMock.mockResolvedValue({
        id: "default",
        activeModel: DEFAULT_FALLBACK_MODEL,
      });

      const quotaErr = new Error("RESOURCE_EXHAUSTED: 429 quota exceeded");
      const result = await switchModelOnQuotaError(DEFAULT_PRIMARY_MODEL, quotaErr);

      expect(result.switched).toBe(false);
      expect(result.newModel).toBe(DEFAULT_FALLBACK_MODEL);
      // Confirmed: does NOT create a duplicate event
      expect(aiModelSwitchEventCreateMock).not.toHaveBeenCalled();
    });
  });

  describe("5. Model Name Formatting (formatModelDisplayName)", () => {
    it("formats known model identifiers into clean display names", () => {
      expect(formatModelDisplayName("gemini-2.5-flash")).toBe("Gemini 2.5 Flash");
      expect(formatModelDisplayName("gemini-3.6-flash")).toBe("Gemini 3.6 Flash");
      expect(formatModelDisplayName("models/gemini-2.5-flash")).toBe("Gemini 2.5 Flash");
      expect(formatModelDisplayName("models/gemini-3.6-flash")).toBe("Gemini 3.6 Flash");
    });

    it("falls back to capitalizing hyphenated words for custom models", () => {
      expect(formatModelDisplayName("gemini-3.7-flash")).toBe("Gemini 3.7 Flash");
      expect(formatModelDisplayName("custom-fine-tuned-model")).toBe("Custom Fine Tuned Model");
    });

    it("returns null gracefully for missing or null model names", () => {
      expect(formatModelDisplayName(null)).toBeNull();
      expect(formatModelDisplayName(undefined)).toBeNull();
      expect(formatModelDisplayName("")).toBeNull();
      expect(formatModelDisplayName("   ")).toBeNull();
    });
  });
});
