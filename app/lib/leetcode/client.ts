import { GET_PROBLEM_BY_SLUG } from "./queries";
import { LeetCodeRateLimitError, type LeetCodeProblemResponse } from "./types";

const LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql";
const MAX_RETRIES = 3;
const RETRY_DELAYS = [500, 1000, 2000];

// In-memory circuit breaker: when LeetCode 429s, prevent further requests for the cooldown duration
let rateLimitedUntil = 0;

export function isLeetCodeRateLimited(): boolean {
  return Date.now() < rateLimitedUntil;
}

export function getRateLimitRemainingSeconds(): number {
  return Math.max(0, Math.ceil((rateLimitedUntil - Date.now()) / 1000));
}

export function setLeetCodeRateLimited(durationMs: number = 60000) {
  rateLimitedUntil = Date.now() + durationMs;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getProblemBySlug(
  slug: string,
): Promise<LeetCodeProblemResponse> {
  // Short-circuit immediately if circuit breaker is tripped
  if (Date.now() < rateLimitedUntil) {
    const remainingSec = getRateLimitRemainingSeconds();
    throw new LeetCodeRateLimitError(
      `LeetCode is currently rate-limited. Cool-down active (${remainingSec}s remaining).`,
      rateLimitedUntil - Date.now(),
    );
  }

  let lastError: unknown = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(LEETCODE_GRAPHQL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: GET_PROBLEM_BY_SLUG,
          variables: {
            titleSlug: slug,
          },
        }),
      });

      if (response.status === 429) {
        const retryAfterHeader = response.headers.get("Retry-After");
        const retryAfterMs = retryAfterHeader ? parseInt(retryAfterHeader, 10) * 1000 : 60000;
        rateLimitedUntil = Date.now() + retryAfterMs;
        throw new LeetCodeRateLimitError(
          "LeetCode rate-limited. Please wait a moment before trying again.",
          retryAfterMs,
        );
      }

      if (!response.ok) {
        if (response.status >= 500 && attempt < MAX_RETRIES - 1) {
          await sleep(RETRY_DELAYS[attempt]);
          continue;
        }
        throw new Error(
          `LeetCode GraphQL request failed: ${response.status} ${response.statusText}`,
        );
      }

      const result = (await response.json()) as {
        data?: LeetCodeProblemResponse;
        errors?: Array<{ message: string }>;
      };

      if (result.errors?.length) {
        const errorMsg = result.errors.map((error) => error.message).join(", ");
        if (errorMsg.toLowerCase().includes("rate limit") || errorMsg.toLowerCase().includes("too many requests")) {
          rateLimitedUntil = Date.now() + 60000;
          throw new LeetCodeRateLimitError(`LeetCode rate-limited: ${errorMsg}`, 60000);
        }
        throw new Error(`LeetCode GraphQL error: ${errorMsg}`);
      }

      if (!result.data) {
        throw new Error("LeetCode GraphQL returned no data");
      }

      return result.data;
    } catch (error: any) {
      if (error instanceof LeetCodeRateLimitError) {
        throw error;
      }
      lastError = error;
      if (attempt < MAX_RETRIES - 1) {
        await sleep(RETRY_DELAYS[attempt]);
      }
    }
  }

  throw lastError || new Error("Failed to fetch problem from LeetCode after multiple attempts");
}

