import type { LeetCodeProblem, LeetCodeProblemResponse } from "./types";

export function normalizeProblem(
  response: LeetCodeProblemResponse,
): LeetCodeProblem {
  const question = response.question;

  if (!question) {
    throw new Error("LeetCode problem not found");
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
