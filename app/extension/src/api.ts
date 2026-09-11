import type { CapturedSubmission } from "./types";

const API_URL = "http://localhost:3000/api/submissions/import";

export async function sendSubmission(submission: CapturedSubmission): Promise<any> {
  // Prefer background service worker to circumvent third-party cookie restrictions
  if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { type: "IMPORT_SUBMISSION", payload: submission },
        (response) => {
          if (chrome.runtime.lastError) {
            console.warn("[DSA Tracker] Background messaging failed, falling back to direct fetch:", chrome.runtime.lastError.message);
            directFetch(submission).then(resolve).catch(reject);
            return;
          }

          if (!response || !response.success) {
            reject(new Error(response?.message || response?.error || "Import failed"));
            return;
          }

          resolve(response.data);
        }
      );
    });
  }

  return directFetch(submission);
}

async function directFetch(submission: CapturedSubmission) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(submission),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Submission import failed: ${response.status}`);
  }

  return response.json();
}

