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

export async function getLatestSubmissionId(
  problemSlug: string,
): Promise<string | null> {
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

  const submissions = result.data?.questionSubmissionList?.submissions;

  if (!submissions?.length) {
    return null;
  }

  return submissions[0].id;
}
