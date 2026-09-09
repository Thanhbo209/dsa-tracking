import { GET_PROBLEM_BY_SLUG } from "./queries";
import type { LeetCodeProblem } from "./types";

const LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql";

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
  }>;
}

interface ProblemResponse {
  question: {
    questionId: string;
    title: string;
    difficulty: "Easy" | "Medium" | "Hard";
    titleSlug: string;
    content: string | null;
    topicTags: Array<{
      id: string;
      name: string;
      slug: string;
    }>;
  } | null;
}

export async function getProblemBySlug(slug: string): Promise<LeetCodeProblem> {
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

  const result = (await response.json()) as GraphQLResponse<ProblemResponse>;

  if (result.errors?.length) {
    throw new Error(
      `LeetCode GraphQL error: ${result.errors
        .map((error) => error.message)
        .join(", ")}`,
    );
  }

  const question = result.data?.question;

  if (!question) {
    throw new Error(`LeetCode problem not found: ${slug}`);
  }

  return {
    leetcodeId: Number(question.questionId),
    slug: question.titleSlug,
    title: question.title,
    difficulty:
      question.difficulty.toUpperCase() as LeetCodeProblem["difficulty"],
    url: `https://leetcode.com/problems/${question.titleSlug}/`,
    description: question.content ?? undefined,
    topics: question.topicTags,
  };
}
