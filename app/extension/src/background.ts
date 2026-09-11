import type {
  CapturedSubmission,
  AuthState,
  ExtensionMessage,
} from "./types";

const SERVER_ORIGIN = "http://localhost:3000";
const MAX_STORED_SUBMISSIONS = 20;

// Retrieve Better Auth session token directly from extension cookies
async function getSessionToken(): Promise<string | null> {
  try {
    const cookie = await chrome.cookies.get({
      url: SERVER_ORIGIN,
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
    const res = await fetch(`${SERVER_ORIGIN}/api/auth/get-session`, {
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
    const res = await fetch(`${SERVER_ORIGIN}/api/auth/sign-in/email`, {
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
    return {
      success: false,
      error: error.message || "Network error. Is DSA Tracker running at http://localhost:3000?",
    };
  }
}

// Handle logout
async function handleLogout() {
  try {
    const token = await getSessionToken();
    if (token) {
      await fetch(`${SERVER_ORIGIN}/api/auth/sign-out`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      await chrome.cookies.remove({
        url: SERVER_ORIGIN,
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
    const res = await fetch(`${SERVER_ORIGIN}/api/submissions/import`, {
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

// Message Router
chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
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

  return false;
});
