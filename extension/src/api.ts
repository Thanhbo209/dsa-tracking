import type { CapturedSubmission, SubmissionImportResult } from "./types";

const DEFAULT_SERVER_ORIGIN = "https://dsa-tracking-six.vercel.app";

async function getServerOrigin(): Promise<string> {
  try {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      const data = await chrome.storage.local.get(["serverOrigin"]);
      return data.serverOrigin || DEFAULT_SERVER_ORIGIN;
    }
  } catch {
    // Ignore storage errors and use default
  }
  return DEFAULT_SERVER_ORIGIN;
}

export async function sendSubmission(
  submission: CapturedSubmission,
): Promise<SubmissionImportResult> {
  // Prefer background service worker to circumvent third-party cookie restrictions
  if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { type: "IMPORT_SUBMISSION", payload: submission },
        (response) => {
          if (chrome.runtime.lastError) {
            console.warn(
              "[DSA Tracker] Background messaging failed, falling back to direct fetch:",
              chrome.runtime.lastError.message,
            );
            directFetch(submission).then(resolve).catch(reject);
            return;
          }

          if (!response || !response.success) {
            reject(
              new Error(
                response?.message || response?.error || "Import failed",
              ),
            );
            return;
          }

          resolve(response.data);
        },
      );
    });
  }

  return directFetch(submission);
}

async function directFetch(submission: CapturedSubmission) {
  const origin = await getServerOrigin();
  const response = await fetch(`${origin}/api/submissions/import`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(submission),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Submission import failed: ${response.status}`,
    );
  }

  return response.json();
}

