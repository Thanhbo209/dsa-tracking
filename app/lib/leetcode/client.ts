import { GET_PROBLEM_BY_SLUG } from "./queries";
import type { LeetCodeProblemResponse } from "./types";

const LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql";

export async function getProblemBySlug(
  slug: string,
): Promise<LeetCodeProblemResponse> {
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

  if (!response.ok) {
    throw new Error(
      `LeetCode GraphQL request failed: ${response.status} ${response.statusText}`,
    );
  }

  const result = (await response.json()) as {
    data?: LeetCodeProblemResponse;
    errors?: Array<{ message: string }>;
  };

  if (result.errors?.length) {
    throw new Error(
      `LeetCode GraphQL error: ${result.errors
        .map((error) => error.message)
        .join(", ")}`,
    );
  }

  if (!result.data) {
    throw new Error("LeetCode GraphQL returned no data");
  }

  return result.data;
}
