const LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql";

const SUBMISSION_DETAILS_QUERY = `
  query SubmissionDetails($submissionId: Int!) {
    submissionDetails(submissionId: $submissionId) {
      runtime
      memory
      code
      timestamp
      statusCode
      lang {
        name
        verboseName
      }
      question {
        questionId
        titleSlug
      }
    }
  }
`;

export interface SubmissionDetails {
  runtime: number;
  memory: number;
  code: string;
  timestamp: number;
  statusCode: number;
  lang: {
    name: string;
    verboseName: string;
  };
  question: {
    questionId: string;
    titleSlug: string;
    title?: string;
  };
}

export async function getSubmissionDetails(
  submissionId: string,
): Promise<SubmissionDetails> {
  const response = await fetch(LEETCODE_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      query: SUBMISSION_DETAILS_QUERY,
      variables: {
        submissionId: Number(submissionId),
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`LeetCode request failed: ${response.status}`);
  }

  const result = await response.json();

  if (result.errors && result.errors.length > 0) {
    const errorMsg = result.errors.map((e: any) => e.message).join(", ");
    throw new Error(`LeetCode GraphQL error: ${errorMsg}`);
  }

  const details = result.data?.submissionDetails;

  if (!details) {
    throw new Error(
      `Submission details not found for ID ${submissionId}. Ensure you are logged into leetcode.com with the account that created this submission.`,
    );
  }

  return details;
}
