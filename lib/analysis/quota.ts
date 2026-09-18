import { ApiError } from "@google/genai";

export interface QuotaViolation {
  quotaMetric?: string;
  quotaId?: string;
  quotaDimensions?: Record<string, string>;
  quotaValue?: string | number;
}

export interface RetryInfo {
  retryDelay?: string;
}

export interface GoogleRpcDetail {
  "@type"?: string;
  violations?: QuotaViolation[];
  retryDelay?: string;
}

export interface GoogleRpcErrorPayload {
  error?: {
    code?: number;
    status?: string;
    message?: string;
    details?: GoogleRpcDetail[];
  };
}

export interface QuotaAnalysis {
  isQuota: boolean;
  category: "daily" | "short-window";
  retryDelaySeconds: number | null;
  cooldownSeconds: number;
  cooldownExpiresAt: Date;
  reason: string;
}

function parseJsonSafely(input: string): GoogleRpcErrorPayload | null {
  try {
    const parsed: unknown = JSON.parse(input);
    if (typeof parsed === "object" && parsed !== null && "error" in parsed) {
      return parsed as GoogleRpcErrorPayload;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Type guard to safely check if an unknown error represents a Google Gemini
 * quota or rate limit error (HTTP 429 / RESOURCE_EXHAUSTED).
 * Uses strict structural and instanceof checks with zero `any` casts.
 */
export function isQuotaError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  // 1. Direct ApiError check from @google/genai SDK
  if (error instanceof ApiError) {
    if (error.status === 429) {
      return true;
    }
  }

  // 2. Structural status code check
  if ("status" in error) {
    const statusVal = (error as { status: unknown }).status;
    if (statusVal === 429 || statusVal === "RESOURCE_EXHAUSTED") {
      return true;
    }
  }

  // 3. Structural code check
  if ("code" in error) {
    const codeVal = (error as { code: unknown }).code;
    if (codeVal === 429 || codeVal === "RESOURCE_EXHAUSTED") {
      return true;
    }
  }

  // 4. Inspect message content if it is an Error instance
  if (error instanceof Error) {
    const message = error.message;

    // Check if message itself is JSON containing code 429 or RESOURCE_EXHAUSTED
    const jsonStart = message.indexOf("{");
    if (jsonStart !== -1) {
      const jsonCandidate = message.slice(jsonStart);
      const parsed = parseJsonSafely(jsonCandidate);
      if (parsed?.error) {
        if (
          parsed.error.code === 429 ||
          parsed.error.status === "RESOURCE_EXHAUSTED"
        ) {
          return true;
        }
      }
    }

    const lower = message.toLowerCase();
    if (
      lower.includes("resource_exhausted") ||
      lower.includes("quota exceeded") ||
      lower.includes("exceeded your current quota") ||
      (lower.includes("rate limit") && lower.includes("429"))
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Calculates the next UTC day boundary (00:00:00 UTC tomorrow).
 * If the time until midnight UTC is less than 6 hours, adds another 12 hours
 * to ensure a conservative, safe cooldown period.
 */
export function getNextUtcMidnightCooldown(now: Date = new Date()): Date {
  const nextMidnightUtc = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0),
  );

  const diffMs = nextMidnightUtc.getTime() - now.getTime();
  const sixHoursMs = 6 * 60 * 60 * 1000;

  if (diffMs < sixHoursMs) {
    // Extend by 12 hours if within 6 hours of UTC boundary to prevent premature reset
    return new Date(nextMidnightUtc.getTime() + 12 * 60 * 60 * 1000);
  }

  return nextMidnightUtc;
}

/**
 * Analyzes a quota error to classify it into daily vs short-window,
 * calculate appropriate cooldown time, and generate a descriptive audit reason.
 */
export function analyzeQuotaError(
  error: unknown,
  modelName: string,
  now: Date = new Date(),
): QuotaAnalysis {
  if (!isQuotaError(error)) {
    return {
      isQuota: false,
      category: "short-window",
      retryDelaySeconds: null,
      cooldownSeconds: 0,
      cooldownExpiresAt: now,
      reason: "Not a quota error",
    };
  }

  const rawMessage = error instanceof Error ? error.message : String(error);
  let parsedPayload: GoogleRpcErrorPayload | null = null;

  const jsonStart = rawMessage.indexOf("{");
  if (jsonStart !== -1) {
    parsedPayload = parseJsonSafely(rawMessage.slice(jsonStart));
  }

  let isDaily = false;
  let retryDelaySeconds: number | null = null;
  let violationIdentifier: string | null = null;

  if (parsedPayload?.error?.details) {
    for (const detail of parsedPayload.error.details) {
      // Check violations
      if (detail.violations && Array.isArray(detail.violations)) {
        for (const v of detail.violations) {
          const quotaId = v.quotaId ?? "";
          const quotaMetric = v.quotaMetric ?? "";

          if (
            quotaId.toLowerCase().includes("perday") ||
            quotaMetric.toLowerCase().includes("perday")
          ) {
            isDaily = true;
            violationIdentifier = quotaId || quotaMetric;
            break;
          }
        }
      }

      // Check RetryInfo
      if (detail.retryDelay) {
        const match = detail.retryDelay.match(/^([\d.]+)s?$/i);
        if (match) {
          retryDelaySeconds = Math.ceil(parseFloat(match[1]));
        }
      }
    }
  }

  // If not identified in structured details, inspect raw message text
  if (!isDaily) {
    const lower = rawMessage.toLowerCase();
    if (lower.includes("perday") || lower.includes("per day") || lower.includes("daily")) {
      isDaily = true;
    }
  }

  // If retryDelay not found in details, try matching from message string
  if (retryDelaySeconds === null) {
    const retryMatch = rawMessage.match(/retry in ([\d.]+)s/i);
    if (retryMatch) {
      retryDelaySeconds = Math.ceil(parseFloat(retryMatch[1]));
    }
  }

  if (isDaily) {
    const cooldownExpiresAt = getNextUtcMidnightCooldown(now);
    const cooldownSeconds = Math.max(
      60,
      Math.ceil((cooldownExpiresAt.getTime() - now.getTime()) / 1000),
    );
    const reason = `Quota exceeded [daily] for ${modelName}${
      violationIdentifier ? ` (${violationIdentifier})` : ""
    }. Cooldown until ${cooldownExpiresAt.toISOString()}`;

    return {
      isQuota: true,
      category: "daily",
      retryDelaySeconds,
      cooldownSeconds,
      cooldownExpiresAt,
      reason,
    };
  }

  // Short-window quota (per-minute/per-second)
  // Use retryDelay with a minimum floor of 30 seconds
  const floorSeconds = 30;
  const cooldownSeconds = Math.max(floorSeconds, retryDelaySeconds ?? floorSeconds);
  const cooldownExpiresAt = new Date(now.getTime() + cooldownSeconds * 1000);
  const reason = `Rate limit [short-window] for ${modelName}. Cooldown of ${cooldownSeconds}s applied (retryDelay: ${
    retryDelaySeconds != null ? `${retryDelaySeconds}s` : "none"
  }, minimum floor: ${floorSeconds}s)`;

  return {
    isQuota: true,
    category: "short-window",
    retryDelaySeconds,
    cooldownSeconds,
    cooldownExpiresAt,
    reason,
  };
}
