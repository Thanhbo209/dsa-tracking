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
        title
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

  const details = result.data?.submissionDetails;

  if (!details) {
    throw new Error(`Submission details not found: ${submissionId}`);
  }

  return details;
}
