// DSA Tracker Extension Bridge
// Injected into DSA Tracker web pages to bridge in-browser requests to the extension

document.documentElement.dataset.dsaTrackerInstalled = "true";
window.postMessage({ type: "DSA_TRACKER_EXTENSION_READY" }, "*");

// Notify extension of current web app origin (supports any localhost port or deployed domain)
try {
  if (window.location && window.location.origin) {
    chrome.runtime.sendMessage({
      type: "REGISTER_WEB_APP_ORIGIN",
      origin: window.location.origin,
    });
  }
} catch {
  // Ignore if extension context is temporarily unavailable
}

window.addEventListener("message", (event) => {
  if (event.source !== window || !event.data) return;

  if (event.data.type === "DSA_FETCH_SUBMISSION_CODE") {
    const { requestId, externalId } = event.data;

    chrome.runtime.sendMessage(
      { type: "FETCH_SUBMISSION_DETAILS", externalId },
      (response) => {
        if (chrome.runtime.lastError) {
          window.postMessage(
            {
              type: "DSA_SUBMISSION_CODE_RESULT",
              requestId,
              success: false,
              error:
                chrome.runtime.lastError.message ||
                "Extension communication failed. Make sure the extension is active.",
            },
            "*",
          );
          return;
        }

        window.postMessage(
          {
            type: "DSA_SUBMISSION_CODE_RESULT",
            requestId,
            ...response,
          },
          "*",
        );
      },
    );
  }
});
