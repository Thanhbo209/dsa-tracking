import { getLatestSubmission } from "./leetcode";
import { getSubmissionDetails } from "./submission-details";
import { mapSubmissionStatus } from "./status";
import { sendSubmission } from "./api";

const POLL_INTERVAL_MS = 2000;

function getProblemSlug(): string | null {
  const match = window.location.pathname.match(/^\/problems\/([^/]+)/);

  return match?.[1] ?? null;
}

async function captureSubmission(submissionId: string) {
  const details = await getSubmissionDetails(submissionId);

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

  console.log("[DSA Tracker] Captured submission:", submission);

  const result = await sendSubmission(submission);

  console.log("[DSA Tracker] Import result:", result);
}

async function startSubmissionWatcher() {
  const problemSlug = getProblemSlug();

  if (!problemSlug) {
    return;
  }

  const initialSubmission = await getLatestSubmission(problemSlug);

  let lastSubmissionId = initialSubmission?.id ?? null;
  let pendingSubmissionId =
    initialSubmission?.isPending === "Pending" ? initialSubmission.id : null;

  console.log(
    "[DSA Tracker] Watching:",
    problemSlug,
    "latest:",
    initialSubmission,
  );

  setInterval(async () => {
    try {
      const latest = await getLatestSubmission(problemSlug);

      if (!latest) {
        return;
      }

      // A submission that was previously pending has finished.
      if (latest.id === pendingSubmissionId) {
        if (latest.isPending === "Not Pending") {
          console.log("[DSA Tracker] Pending submission completed:", latest.id);

          pendingSubmissionId = null;
          await captureSubmission(latest.id);
        }

        return;
      }

      // No new submission.
      if (latest.id === lastSubmissionId) {
        return;
      }

      console.log(
        "[DSA Tracker] New submission detected:",
        latest.id,
        latest.isPending,
      );

      lastSubmissionId = latest.id;

      // Don't fetch submission details while LeetCode is still processing it.
      if (latest.isPending === "Pending") {
        pendingSubmissionId = latest.id;

        console.log("[DSA Tracker] Submission is pending, waiting:", latest.id);

        return;
      }

      await captureSubmission(latest.id);
    } catch (error) {
      console.error("[DSA Tracker] Submission watcher failed:", error);
    }
  }, POLL_INTERVAL_MS);
}

startSubmissionWatcher().catch((error) => {
  console.error("[DSA Tracker] Failed to start watcher:", error);
});
