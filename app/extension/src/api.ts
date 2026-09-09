import type { CapturedSubmission } from "./types";

const API_URL = "http://localhost:3000/api/submissions/import";

export async function sendSubmission(submission: CapturedSubmission) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(submission),
  });

  if (!response.ok) {
    throw new Error(`Submission import failed: ${response.status}`);
  }

  return response.json();
}
