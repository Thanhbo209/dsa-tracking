// Client helper for requesting historical submission code from the DSA Tracker browser extension

export interface FetchedSubmissionDetails {
  code: string;
  runtimeMs?: number;
  memoryBytes?: number;
  language?: string;
}

export async function fetchSubmissionCodeViaExtension(
  externalId: string,
): Promise<FetchedSubmissionDetails> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      return reject(
        new Error("Cannot communicate with extension from server side."),
      );
    }

    const isInstalled =
      document.documentElement.dataset.dsaTrackerInstalled === "true" ||
      Boolean((window as any).__DSA_TRACKER_EXTENSION_INSTALLED__);

    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    let hasResponded = false;

    // Timeout if extension bridge doesn't respond
    const timeout = setTimeout(() => {
      window.removeEventListener("message", messageHandler);
      if (!hasResponded) {
        if (!isInstalled) {
          reject(
            new Error(
              "Install/open the DSA Tracker extension to fetch full submission code.",
            ),
          );
        } else {
          reject(
            new Error(
              "LeetCode request timed out. Please ensure you are logged into leetcode.com.",
            ),
          );
        }
      }
    }, 4500);

    const messageHandler = (event: MessageEvent) => {
      if (
        event.data &&
        event.data.type === "DSA_SUBMISSION_CODE_RESULT" &&
        event.data.requestId === requestId
      ) {
        hasResponded = true;
        clearTimeout(timeout);
        window.removeEventListener("message", messageHandler);

        if (event.data.success && event.data.data) {
          resolve(event.data.data);
        } else {
          reject(
            new Error(
              event.data.error ||
                "Failed to fetch submission code from LeetCode. Make sure you are logged in to leetcode.com.",
            ),
          );
        }
      }
    };

    window.addEventListener("message", messageHandler);
    window.postMessage(
      {
        type: "DSA_FETCH_SUBMISSION_CODE",
        requestId,
        externalId,
      },
      "*",
    );
  });
}
