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

async function startSubmissionWatcher(problemSlug: string) {
  const initialSubmission = await getLatestSubmission(problemSlug);

  let lastSubmissionId = initialSubmission?.id ?? null;
  let pendingSubmissionId =
    initialSubmission?.isPending === "Pending" ? initialSubmission.id : null;
  let isPolling = false;

  console.log(
    "[DSA Tracker] Watching:",
    problemSlug,
    "latest:",
    initialSubmission,
  );

  const intervalId = setInterval(async () => {
    if (isPolling) {
      return;
    }

    isPolling = true;
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
    } finally {
      isPolling = false;
    }
  }, POLL_INTERVAL_MS);

  return () => {
    clearInterval(intervalId);
  };
}

// eslint-disable-next-line prefer-const
let currentProblemSlug = getProblemSlug();
let stopWatcher: (() => void) | null = null;

async function restartWatcherIfNeeded() {
  const nextProblemSlug = getProblemSlug();

  if (!nextProblemSlug || nextProblemSlug === currentProblemSlug) {
    return;
  }

  console.log(
    "[DSA Tracker] Problem changed:",
    currentProblemSlug,
    "→",
    nextProblemSlug,
  );

  stopWatcher?.();

  currentProblemSlug = nextProblemSlug;

  stopWatcher = await startSubmissionWatcher(currentProblemSlug);
}

if (currentProblemSlug) {
  startSubmissionWatcher(currentProblemSlug)
    .then((stop) => {
      stopWatcher = stop;
    })
    .catch((error) => {
      console.error("[DSA Tracker] Failed to start watcher:", error);
    });
}

setInterval(() => {
  restartWatcherIfNeeded().catch((error) => {
    console.error("[DSA Tracker] Failed to restart watcher:", error);
  });
}, 1000);
