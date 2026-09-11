import type { CapturedSubmission, AuthState, ExtensionMessage } from "./types";

const SERVER_URL = "http://localhost:3000";

// DOM Elements
const elStatusDot = document.getElementById("status-dot") as HTMLElement;
const elStatusText = document.getElementById("status-text") as HTMLElement;
const elUserBar = document.getElementById("user-bar") as HTMLElement;
const elUserBarName = document.getElementById("user-bar-name") as HTMLElement;
const elBtnLogout = document.getElementById("btn-logout") as HTMLButtonElement;

const viewLoading = document.getElementById("view-loading") as HTMLElement;
const viewLogin = document.getElementById("view-login") as HTMLElement;
const viewEmpty = document.getElementById("view-empty") as HTMLElement;
const viewSubmissions = document.getElementById("view-submissions") as HTMLElement;

// Login elements
const formLogin = document.getElementById("login-form") as HTMLFormElement;
const inputEmail = document.getElementById("login-email") as HTMLInputElement;
const inputPassword = document.getElementById("login-password") as HTMLInputElement;
const btnLoginSubmit = document.getElementById("btn-login-submit") as HTMLButtonElement;
const elLoginError = document.getElementById("login-error") as HTMLElement;
const linkSignup = document.getElementById("link-signup") as HTMLElement;

// Empty state elements
const btnOpenLeetCode = document.getElementById("btn-open-leetcode") as HTMLButtonElement;
const btnOpenDsaEmpty = document.getElementById("btn-open-dsa-empty") as HTMLButtonElement;

// Submissions elements
const btnClearHistory = document.getElementById("btn-clear-history") as HTMLButtonElement;
const elFeaturedStatus = document.getElementById("featured-status") as HTMLElement;
const elFeaturedTime = document.getElementById("featured-time") as HTMLElement;
const elFeaturedTitle = document.getElementById("featured-title") as HTMLElement;
const elFeaturedLang = document.getElementById("featured-lang") as HTMLElement;
const elFeaturedRuntime = document.getElementById("featured-runtime") as HTMLElement;
const elFeaturedMemory = document.getElementById("featured-memory") as HTMLElement;
const btnToggleCode = document.getElementById("btn-toggle-code") as HTMLButtonElement;
const codeArrow = document.getElementById("code-arrow") as HTMLElement;
const elFeaturedCode = document.getElementById("featured-code") as HTMLElement;
const btnOpenProblem = document.getElementById("btn-open-problem") as HTMLButtonElement;
const btnImportSync = document.getElementById("btn-import-sync") as HTMLButtonElement;
const historySection = document.getElementById("history-section") as HTMLElement;
const historyList = document.getElementById("history-list") as HTMLElement;

function showView(viewId: "loading" | "login" | "empty" | "submissions") {
  [viewLoading, viewLogin, viewEmpty, viewSubmissions].forEach((v) => {
    v.classList.remove("active");
  });

  if (viewId === "loading") viewLoading.classList.add("active");
  if (viewId === "login") viewLogin.classList.add("active");
  if (viewId === "empty") viewEmpty.classList.add("active");
  if (viewId === "submissions") viewSubmissions.classList.add("active");
}

function updateConnectionStatus(isOnline: boolean, label: string) {
  elStatusDot.className = `status-dot ${isOnline ? "online" : "offline"}`;
  elStatusText.textContent = label;
}

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return "Recently";
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (diffSec < 60) return "Just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return d.toLocaleDateString();
  } catch {
    return "Recently";
  }
}

function getStatusClass(status: string): string {
  switch (status) {
    case "ACCEPTED":
      return "accepted";
    case "WRONG_ANSWER":
    case "RUNTIME_ERROR":
    case "COMPILE_ERROR":
      return "wrong";
    default:
      return "warning";
  }
}

async function sendMessage<T = any>(msg: ExtensionMessage): Promise<T> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(msg, (response) => {
      resolve(response);
    });
  });
}

// Render Submissions UI
function renderSubmissions(submissions: CapturedSubmission[]) {
  if (!submissions || submissions.length === 0) {
    showView("empty");
    return;
  }

  showView("submissions");

  const latest = submissions[0];

  // Set status
  elFeaturedStatus.textContent = latest.status.replace(/_/g, " ");
  elFeaturedStatus.className = `tag-status ${getStatusClass(latest.status)}`;

  // Set time
  elFeaturedTime.textContent = formatRelativeTime(latest.submittedAt);

  // Set title
  elFeaturedTitle.textContent = latest.problemTitle || latest.problemSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  // Chips
  elFeaturedLang.textContent = latest.language || "Unknown";
  elFeaturedRuntime.textContent = latest.runtimeMs != null ? `${latest.runtimeMs} ms` : "N/A ms";
  elFeaturedMemory.textContent = latest.memoryBytes != null
    ? `${(latest.memoryBytes / 1024 / 1024).toFixed(1)} MB`
    : "N/A MB";

  // Code block
  if (latest.code) {
    elFeaturedCode.textContent = latest.code;
    btnToggleCode.style.display = "flex";
  } else {
    btnToggleCode.style.display = "none";
    elFeaturedCode.classList.remove("open");
  }

  // Open problem in workspace
  btnOpenProblem.onclick = () => {
    window.open(`${SERVER_URL}/problems/${latest.problemSlug}`, "_blank");
  };

  // Sync button
  btnImportSync.onclick = async () => {
    btnImportSync.textContent = "Syncing...";
    btnImportSync.disabled = true;

    try {
      const res = await sendMessage({
        type: "IMPORT_SUBMISSION",
        payload: latest,
      });

      if (res && res.success) {
        btnImportSync.textContent = res.data?.created ? "✓ Added to DSA Tracker" : "✓ Already in DSA Tracker";
      } else {
        btnImportSync.textContent = res?.message || "Sync Failed";
      }
    } catch {
      btnImportSync.textContent = "Sync Failed";
    } finally {
      btnImportSync.disabled = false;
    }
  };

  // History list (if more than 1)
  if (submissions.length > 1) {
    historySection.style.display = "block";
    historyList.innerHTML = "";

    submissions.slice(1, 6).forEach((sub) => {
      const item = document.createElement("div");
      item.className = "history-item";

      const title = sub.problemTitle || sub.problemSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      const statusLabel = sub.status.replace(/_/g, " ");

      item.innerHTML = `
        <div class="history-left">
          <div class="history-title">${title}</div>
          <div class="history-meta">${sub.language} · ${formatRelativeTime(sub.submittedAt)}</div>
        </div>
        <span class="tag-status ${getStatusClass(sub.status)}" style="font-size: 10px; padding: 2px 6px;">
          ${statusLabel}
        </span>
      `;

      item.onclick = () => {
        window.open(`${SERVER_URL}/problems/${sub.problemSlug}`, "_blank");
      };

      historyList.appendChild(item);
    });
  } else {
    historySection.style.display = "none";
  }
}

// Check Authentication & Load state
async function init() {
  showView("loading");
  updateConnectionStatus(false, "Connecting...");

  const authState: AuthState = await sendMessage({ type: "CHECK_AUTH" });

  if (!authState || !authState.isAuthenticated) {
    updateConnectionStatus(false, "Not Logged In");
    elUserBar.style.display = "none";
    showView("login");
    return;
  }

  // Authenticated
  updateConnectionStatus(true, "Connected");
  elUserBar.style.display = "flex";
  elUserBarName.textContent = authState.user?.username
    ? `@${authState.user.username}`
    : authState.user?.name || authState.user?.email || "User";

  // Fetch captured submissions
  const data = await sendMessage({ type: "GET_SUBMISSIONS" });
  renderSubmissions(data?.submissions || []);
}

// Event Listeners
linkSignup.onclick = (e) => {
  e.preventDefault();
  window.open(`${SERVER_URL}/signup`, "_blank");
};

btnOpenLeetCode.onclick = () => {
  window.open("https://leetcode.com/problemset/", "_blank");
};

btnOpenDsaEmpty.onclick = () => {
  window.open(`${SERVER_URL}/problems`, "_blank");
};

btnToggleCode.onclick = () => {
  const isOpen = elFeaturedCode.classList.toggle("open");
  codeArrow.textContent = isOpen ? "▴" : "▾";
  btnToggleCode.querySelector("span")!.textContent = isOpen ? "Hide Code" : "Show Code";
};

btnClearHistory.onclick = async () => {
  if (confirm("Clear captured submissions history?")) {
    await sendMessage({ type: "CLEAR_SUBMISSIONS" });
    showView("empty");
  }
};

elBtnLogout.onclick = async () => {
  await sendMessage({ type: "LOGOUT" });
  await init();
};

formLogin.onsubmit = async (e) => {
  e.preventDefault();
  elLoginError.style.display = "none";
  btnLoginSubmit.disabled = true;
  btnLoginSubmit.innerHTML = `<span class="spinner" style="width: 14px; height: 14px; border-width: 2px; margin: 0 6px 0 0; display: inline-block; vertical-align: middle;"></span> Signing in...`;

  const email = inputEmail.value.trim();
  const password = inputPassword.value;

  const result = await sendMessage({
    type: "LOGIN",
    payload: { email, password },
  });

  btnLoginSubmit.disabled = false;
  btnLoginSubmit.innerHTML = `<span>Sign In to DSA Tracker</span>`;

  if (result && result.success) {
    await init();
  } else {
    elLoginError.textContent = result?.error || "Failed to sign in. Please verify email and password.";
    elLoginError.style.display = "block";
  }
};

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", () => {
  init().catch((err) => {
    console.error("[DSA Tracker Popup] Init error:", err);
    showView("login");
  });
});
