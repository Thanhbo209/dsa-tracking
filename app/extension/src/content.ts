import { getLatestSubmissionId } from "./leetcode";
import { getSubmissionDetails } from "./submission-details";
import { mapSubmissionStatus } from "./status";
import { sendSubmission } from "./api";

async function testLeetCodeApi() {
  const submissionId = await getLatestSubmissionId("two-sum");

  console.log("[DSA Tracker] Latest submission:", submissionId);

  if (!submissionId) {
    return;
  }

  const details = await getSubmissionDetails(submissionId);

  console.log(
    "[DSA Tracker] Submission details:",
    JSON.stringify(details, null, 2),
    {
      id: submissionId,
      problemSlug: details.question.titleSlug,
      statusCode: mapSubmissionStatus(details.statusCode),
      language: details.lang.name,
      runtime: details.runtime,
      memory: details.memory,
      code: details.code,
    },
  );

  const submission = {
    externalId: submissionId,
    problemSlug: details.question.titleSlug,
    status: mapSubmissionStatus(details.statusCode),
    language: details.lang.name,
    code: details.code,
    runtimeMs: details.runtime,
    memoryBytes: details.memory,
    submittedAt: new Date(details.timestamp * 1000).toISOString(),
  };
  console.log("[DSA Tracker] Sending submission:", submission);

  const result = await sendSubmission(submission);

  console.log("[DSA Tracker] Import result:", result);
}

testLeetCodeApi().catch((error) => {
  console.error("[DSA Tracker] Test failed:", error);
});
