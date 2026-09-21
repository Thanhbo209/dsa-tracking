import type {
  CapturedSubmission,
  AuthState,
  ExtensionMessage,
} from "./types";
import { fetchLeetCodeSyncData } from "./leetcode";
import { getSubmissionDetails } from "./submission-details";
import { resolveAuthSignInRequest } from "./auth";

const DEFAULT_SERVER_ORIGIN = "https://dsa-tracking-six.vercel.app";
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

// Retrieve Better Auth session token directly from extension cookies or local storage fallback
async function getSessionToken(): Promise<string | null> {
  try {
    const origin = await getServerOrigin();
    const isHttps = origin.startsWith("https://");
    const cookieNames = isHttps
      ? ["__Secure-better-auth.session_token", "better-auth.session_token"]
      : ["better-auth.session_token", "__Secure-better-auth.session_token"];

    for (const name of cookieNames) {
      try {
        const cookie = await chrome.cookies.get({
          url: origin,
          name,
        });
        if (cookie?.value) {
          return cookie.value;
        }
      } catch {
        // continue
      }
    }

    // Storage fallback for environments where third-party cookies or cross-origin cookie sync is blocked
    const stored = await chrome.storage.local.get(["sessionToken"]);
    return (stored?.sessionToken as string) || null;
  } catch (error) {
    console.error("[DSA Tracker Background] Failed to get session cookie:", error);
    try {
      const stored = await chrome.storage.local.get(["sessionToken"]);
      return (stored?.sessionToken as string) || null;
    } catch {
      return null;
    }
  }
}

// Check if user is authenticated
async function checkAuth(): Promise<AuthState> {
  const token = await getSessionToken();

  try {
    const origin = await getServerOrigin();
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${origin}/api/auth/get-session`, {
      headers,
      credentials: "include",
    });

    if (!res.ok) {
      return { isAuthenticated: false, user: null };
    }

    const data = await res.json();
    if (data && data.user) {
      // If server returned a session token, persist it
      if (data.session?.token) {
        await chrome.storage.local.set({ sessionToken: data.session.token });
      }
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

// Handle login from popup (supports both email and username)
async function handleLogin(identifier: string, password: string) {
  try {
    const origin = await getServerOrigin();
    const { endpoint, body } = resolveAuthSignInRequest(identifier, password);
    const res = await fetch(`${origin}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      credentials: "include",
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.message || "Failed to sign in. Please check your credentials.",
      };
    }

    // Persist session token to chrome.storage.local and browser cookies
    if (data.token) {
      await chrome.storage.local.set({ sessionToken: data.token });
      const isHttps = origin.startsWith("https://");
      const cookieName = isHttps
        ? "__Secure-better-auth.session_token"
        : "better-auth.session_token";
      try {
        await chrome.cookies.set({
          url: origin,
          name: cookieName,
          value: data.token,
          path: "/",
          secure: isHttps,
          sameSite: "lax",
        });
      } catch (cookieErr) {
        console.warn("[DSA Tracker Background] Could not set session cookie:", cookieErr);
      }
    }

    return {
      success: true,
      user: data.user,
    };
  } catch (error: unknown) {
    console.error("[DSA Tracker Background] Login error:", error);
    const origin = await getServerOrigin();
    const message =
      error instanceof Error
        ? error.message
        : `Network error. Is DSA Tracker running at ${origin}?`;
    return {
      success: false,
      error: message,
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
        credentials: "include",
      }).catch(() => {});
    }

    await chrome.cookies.remove({
      url: origin,
      name: "__Secure-better-auth.session_token",
    }).catch(() => {});
    await chrome.cookies.remove({
      url: origin,
      name: "better-auth.session_token",
    }).catch(() => {});
    await chrome.storage.local.remove(["sessionToken"]);

    return { success: true };
  } catch (error) {
    console.error("[DSA Tracker Background] Logout error:", error);
    await chrome.storage.local.remove(["sessionToken"]).catch(() => {});
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
  } catch (error: unknown) {
    console.error("[DSA Tracker Background] Import fetch error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to reach DSA Tracker server.";
    return {
      success: false,
      error: "NETWORK_ERROR",
      message,
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
  } catch (error: unknown) {
    console.error("[DSA Tracker Background] Sync error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to sync LeetCode data.";
    return {
      success: false,
      error: "SYNC_ERROR",
      message,
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
    const identifier =
      ("identifier" in message.payload && message.payload.identifier) ||
      ("email" in message.payload && message.payload.email) ||
      "";
    handleLogin(identifier, message.payload.password).then((result) => {
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

  if (message.type === "REGISTER_WEB_APP_ORIGIN" || message.type === "SET_SERVER_ORIGIN") {
    let origin = message.origin ? message.origin.trim().replace(/\/+$/, "") : "";
    if (origin && !origin.startsWith("http://") && !origin.startsWith("https://")) {
      const isLocal = origin.startsWith("localhost") || origin.startsWith("127.0.0.1");
      origin = `${isLocal ? "http://" : "https://"}${origin}`;
    }
    if (origin && (origin.startsWith("http://") || origin.startsWith("https://"))) {
      chrome.storage.local.set({ serverOrigin: origin }).then(() => {
        sendResponse({ success: true, origin });
      });
      return true;
    }
    sendResponse({ success: false, error: "Invalid origin" });
    return false;
  }

  return false;
});
