const LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql";

const QUESTION_SUBMISSION_LIST_QUERY = `
  query QuestionSubmissionList(
    $questionSlug: String!
    $offset: Int!
    $limit: Int!
  ) {
    questionSubmissionList(
      questionSlug: $questionSlug
      offset: $offset
      limit: $limit
    ) {
      lastKey
      hasNext
      submissions {
        id
        title
        titleSlug
        status
        statusDisplay
        lang
        langName
        runtime
        timestamp
        memory
        isPending
      }
    }
  }
`;

export interface LatestSubmission {
  id: string;
  isPending: "Pending" | "Not Pending";
}

export async function getLatestSubmission(
  problemSlug: string,
): Promise<LatestSubmission | null> {
  const response = await fetch(LEETCODE_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: QUESTION_SUBMISSION_LIST_QUERY,
      variables: {
        questionSlug: problemSlug,
        offset: 0,
        limit: 1,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`LeetCode request failed: ${response.status}`);
  }

  const result = await response.json();

  const submission = result.data?.questionSubmissionList?.submissions?.[0];

  if (!submission) {
    return null;
  }

  return {
    id: submission.id,
    isPending: submission.isPending,
  };
}
