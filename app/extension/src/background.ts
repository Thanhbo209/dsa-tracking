import type {
  CapturedSubmission,
  AuthState,
  ExtensionMessage,
} from "./types";
import { fetchLeetCodeSyncData } from "./leetcode";
import { getSubmissionDetails } from "./submission-details";

const DEFAULT_SERVER_ORIGIN = "http://localhost:3000";
const MAX_STORED_SUBMISSIONS = 20;

// Resolve active server origin (supports any localhost port or deployed Vercel/custom domain)
async function getServerOrigin(): Promise<string> {
  try {
    const data = await chrome.storage.local.get(["serverOrigin"]);
    return data.serverOrigin || DEFAULT_SERVER_ORIGIN;
  } catch {
    return DEFAULT_SERVER_ORIGIN;
  }
}

// Retrieve Better Auth session token directly from extension cookies
async function getSessionToken(): Promise<string | null> {
  try {
    const origin = await getServerOrigin();
    const cookie = await chrome.cookies.get({
      url: origin,
      name: "better-auth.session_token",
    });
    return cookie?.value ?? null;
  } catch (error) {
    console.error("[DSA Tracker Background] Failed to get session cookie:", error);
    return null;
  }
}

// Check if user is authenticated
async function checkAuth(): Promise<AuthState> {
  const token = await getSessionToken();
  if (!token) {
    return { isAuthenticated: false, user: null };
  }

  try {
    const origin = await getServerOrigin();
    const res = await fetch(`${origin}/api/auth/get-session`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      return { isAuthenticated: false, user: null };
    }

    const data = await res.json();
    if (data && data.user) {
      return {
        isAuthenticated: true,
        user: {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          username: data.user.username ?? null,
        },
      };
    }

    return { isAuthenticated: false, user: null };
  } catch (error) {
    console.error("[DSA Tracker Background] Auth check error:", error);
    return { isAuthenticated: false, user: null };
  }
}

// Handle login from popup
async function handleLogin(email: string, password: string) {
  try {
    const origin = await getServerOrigin();
    const res = await fetch(`${origin}/api/auth/sign-in/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.message || "Failed to sign in. Please check your credentials.",
      };
    }

    return {
      success: true,
      user: data.user,
    };
  } catch (error: any) {
    console.error("[DSA Tracker Background] Login error:", error);
    const origin = await getServerOrigin();
    return {
      success: false,
      error: error.message || `Network error. Is DSA Tracker running at ${origin}?`,
    };
  }
}

// Handle logout
async function handleLogout() {
  try {
    const origin = await getServerOrigin();
    const token = await getSessionToken();
    if (token) {
      await fetch(`${origin}/api/auth/sign-out`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      await chrome.cookies.remove({
        url: origin,
        name: "better-auth.session_token",
      });
    }
    return { success: true };
  } catch (error) {
    console.error("[DSA Tracker Background] Logout error:", error);
    return { success: false };
  }
}

// Store captured submission in chrome.storage.local
async function saveCapturedSubmission(submission: CapturedSubmission) {
  try {
    const data = await chrome.storage.local.get(["capturedSubmissions"]);
    const existing: CapturedSubmission[] = data.capturedSubmissions || [];

    // Filter out if exact externalId already exists to avoid duplicates
    const filtered = existing.filter((s) => s.externalId !== submission.externalId);
    const updated = [submission, ...filtered].slice(0, MAX_STORED_SUBMISSIONS);

    await chrome.storage.local.set({
      capturedSubmissions: updated,
      latestSubmission: submission,
    });

    // Show badge to indicate newly captured submission
    await chrome.action.setBadgeText({ text: "✓" });
    await chrome.action.setBadgeBackgroundColor({ color: "#10b981" });

    // Clear badge after 5 seconds
    setTimeout(() => {
      chrome.action.setBadgeText({ text: "" }).catch(() => {});
    }, 5000);
  } catch (error) {
    console.error("[DSA Tracker Background] Failed to save submission:", error);
  }
}

// Import submission to DSA Tracker API
async function importSubmission(submission: CapturedSubmission) {
  const token = await getSessionToken();
  if (!token) {
    return {
      success: false,
      error: "NOT_LOGGED_IN",
      message: "Please log in to DSA Tracker before importing.",
    };
  }

  try {
    const origin = await getServerOrigin();
    const res = await fetch(`${origin}/api/submissions/import`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(submission),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: "API_ERROR",
        message: data.error || `Server responded with ${res.status}`,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error("[DSA Tracker Background] Import fetch error:", error);
    return {
      success: false,
      error: "NETWORK_ERROR",
      message: error.message || "Failed to reach DSA Tracker server.",
    };
  }
}

// Sync full LeetCode history and activity to DSA Tracker
async function syncLeetCodeToDashboard() {
  const token = await getSessionToken();
  if (!token) {
    return {
      success: false,
      error: "NOT_LOGGED_IN",
      message: "Please log in to DSA Tracker before syncing.",
    };
  }

  try {
    const payload = await fetchLeetCodeSyncData();

    const origin = await getServerOrigin();
    const res = await fetch(`${origin}/api/leetcode/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: "API_ERROR",
        message: data.error || `Server responded with ${res.status}`,
      };
    }

    await chrome.storage.local.set({
      lastSyncedAt: new Date().toISOString(),
      leetcodeUsername: payload.leetcodeUsername,
    });

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error("[DSA Tracker Background] Sync error:", error);
    return {
      success: false,
      error: "SYNC_ERROR",
      message: error.message || "Failed to sync LeetCode data.",
    };
  }
}

// Message Router
chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
  if (message.type === "FETCH_SUBMISSION_DETAILS") {
    getSubmissionDetails(message.externalId)
      .then((details) => {
        sendResponse({
          success: true,
          data: {
            code: details.code,
            runtimeMs: details.runtime,
            memoryBytes: details.memory,
            language: details.lang?.name || details.lang?.verboseName || "unknown",
          },
        });
      })
      .catch((err) => {
        sendResponse({
          success: false,
          error: err.message || "Failed to fetch submission details from LeetCode",
        });
      });
    return true;
  }

  if (message.type === "SYNC_LEETCODE") {
    syncLeetCodeToDashboard().then((result) => {
      sendResponse(result);
    });
    return true;
  }

  if (message.type === "SUBMISSION_CAPTURED") {
    saveCapturedSubmission(message.payload).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === "CHECK_AUTH") {
    checkAuth().then((auth) => {
      sendResponse(auth);
    });
    return true;
  }

  if (message.type === "LOGIN") {
    handleLogin(message.payload.email, message.payload.password).then((result) => {
      sendResponse(result);
    });
    return true;
  }

  if (message.type === "LOGOUT") {
    handleLogout().then((result) => {
      sendResponse(result);
    });
    return true;
  }

  if (message.type === "IMPORT_SUBMISSION") {
    importSubmission(message.payload).then((result) => {
      sendResponse(result);
    });
    return true;
  }

  if (message.type === "GET_SUBMISSIONS") {
    chrome.storage.local.get(["capturedSubmissions", "latestSubmission"]).then((data) => {
      sendResponse({
        submissions: data.capturedSubmissions || [],
        latest: data.latestSubmission || null,
      });
    });
    return true;
  }

  if (message.type === "CLEAR_SUBMISSIONS") {
    chrome.storage.local.remove(["capturedSubmissions", "latestSubmission"]).then(() => {
      chrome.action.setBadgeText({ text: "" });
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === "REGISTER_WEB_APP_ORIGIN") {
    if (
      message.origin &&
      (message.origin.startsWith("http://") || message.origin.startsWith("https://"))
    ) {
      chrome.storage.local.set({ serverOrigin: message.origin }).then(() => {
        sendResponse({ success: true, origin: message.origin });
      });
      return true;
    }
    sendResponse({ success: false, error: "Invalid origin" });
    return false;
  }

  return false;
});
