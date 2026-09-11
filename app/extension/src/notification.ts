import type { CapturedSubmission } from "./types";
import { sendSubmission } from "./api";

let currentNotification: HTMLDivElement | null = null;
let currentStyle: HTMLStyleElement | null = null;

export function showSubmissionNotification(submission: CapturedSubmission) {
  currentNotification?.remove();
  currentStyle?.remove();

  const logoUrl =
    typeof chrome !== "undefined" && chrome.runtime?.getURL
      ? chrome.runtime.getURL("icons/logo.png")
      : "";

  const isAccepted = submission.status === "ACCEPTED";
  const statusClass = isAccepted ? "accepted" : "other";
  const statusLabel = submission.status.replace(/_/g, " ");

  const problemTitle =
    submission.problemTitle ||
    submission.problemSlug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const memoryDisplay =
    submission.memoryBytes != null
      ? `${(submission.memoryBytes / 1024 / 1024).toFixed(1)} MB`
      : null;

  const style = document.createElement("style");
  style.textContent = `
    @keyframes dsaFadeSlideUp {
      from {
        opacity: 0;
        transform: translateY(16px) scale(0.98);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .dsa-toast-root {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 340px;
      z-index: 2147483647;
      background: #18181b;
      color: #f4f4f5;
      border: 1px solid #27272a;
      border-radius: 14px;
      box-shadow: 0 20px 45px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 13px;
      line-height: 1.5;
      padding: 16px;
      animation: dsaFadeSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .dsa-toast-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .dsa-toast-brand {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .dsa-toast-logo {
      height: 22px;
      width: auto;
      object-fit: contain;
    }

    .dsa-toast-brand-fallback {
      font-weight: 700;
      font-family: monospace;
      color: #10b981;
      font-size: 15px;
    }

    .dsa-toast-status-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      font-weight: 600;
      padding: 2px 7px;
      border-radius: 9999px;
      background: #27272a;
      color: #a1a1aa;
    }

    .dsa-toast-status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 6px rgba(16, 185, 129, 0.5);
    }

    .dsa-toast-close {
      background: none;
      border: none;
      color: #71717a;
      font-size: 18px;
      cursor: pointer;
      padding: 0 4px;
      line-height: 1;
      transition: color 0.15s;
    }

    .dsa-toast-close:hover {
      color: #f4f4f5;
    }

    .dsa-toast-card {
      background: #202024;
      border: 1px solid #27272a;
      border-radius: 10px;
      padding: 12px;
      margin-bottom: 12px;
    }

    .dsa-toast-badge-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;
    }

    .dsa-tag-status {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.5px;
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: uppercase;
    }

    .dsa-tag-status.accepted {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .dsa-tag-status.other {
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .dsa-toast-title {
      font-size: 14px;
      font-weight: 600;
      color: #f4f4f5;
      margin-bottom: 8px;
      line-height: 1.3;
    }

    .dsa-toast-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }

    .dsa-toast-chip {
      font-size: 11px;
      background: #27272a;
      color: #d4d4d8;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: Consolas, Monaco, monospace;
    }

    .dsa-toast-code-toggle {
      background: none;
      border: none;
      color: #a1a1aa;
      font-size: 11px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 0;
      margin-bottom: 8px;
      transition: color 0.15s;
    }

    .dsa-toast-code-toggle:hover {
      color: #f4f4f5;
    }

    .dsa-toast-code-block {
      display: none;
      background: #121214;
      border: 1px solid #27272a;
      border-radius: 6px;
      padding: 8px;
      font-family: Consolas, Monaco, monospace;
      font-size: 11px;
      color: #d4d4d8;
      max-height: 130px;
      overflow: auto;
      white-space: pre;
      margin-bottom: 10px;
    }

    .dsa-toast-code-block.open {
      display: block;
    }

    .dsa-btn-primary {
      width: 100%;
      background: #10b981;
      color: #042f2e;
      border: none;
      border-radius: 8px;
      padding: 8px 12px;
      font-weight: 600;
      font-size: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: opacity 0.15s;
    }

    .dsa-btn-primary:hover {
      opacity: 0.9;
    }

    .dsa-btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .dsa-btn-primary.success {
      background: #065f46;
      color: #a7f3d0;
      cursor: default;
    }

    .dsa-btn-secondary {
      width: 100%;
      background: #27272a;
      color: #f4f4f5;
      border: 1px solid #3f3f46;
      border-radius: 8px;
      padding: 8px 12px;
      font-weight: 500;
      font-size: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      margin-top: 8px;
      transition: background 0.15s;
    }

    .dsa-btn-secondary:hover {
      background: #3f3f46;
    }
  `;

  const container = document.createElement("div");
  container.className = "dsa-toast-root";

  container.innerHTML = `
    <div class="dsa-toast-header">
      <div class="dsa-toast-brand">
        ${
          logoUrl
            ? `<img src="${logoUrl}" alt="DSA" class="dsa-toast-logo" />`
            : `<span class="dsa-toast-brand-fallback">&lt;dsa/&gt;</span>`
        }
        <div class="dsa-toast-status-badge">
          <span class="dsa-toast-status-dot"></span>
          <span>Captured</span>
        </div>
      </div>
      <button class="dsa-toast-close" type="button" title="Dismiss">×</button>
    </div>

    <div class="dsa-toast-card">
      <div class="dsa-toast-badge-row">
        <span class="dsa-tag-status ${statusClass}">${statusLabel}</span>
        <span style="font-size: 11px; color: #71717a;">#${submission.externalId}</span>
      </div>
      <div class="dsa-toast-title">${problemTitle}</div>
      <div class="dsa-toast-chips">
        <span class="dsa-toast-chip">${submission.language}</span>
        ${
          submission.runtimeMs != null
            ? `<span class="dsa-toast-chip">${submission.runtimeMs} ms</span>`
            : ""
        }
        ${
          memoryDisplay
            ? `<span class="dsa-toast-chip">${memoryDisplay}</span>`
            : ""
        }
      </div>
    </div>

    ${
      submission.code
        ? `
      <button class="dsa-toast-code-toggle" type="button">
        <span>Show Code</span> <span class="dsa-code-arrow">▾</span>
      </button>
      <pre class="dsa-toast-code-block"></pre>
    `
        : ""
    }

    <button class="dsa-btn-primary" type="button" id="dsa-btn-add">
      Add to DSA Tracker
    </button>
  `;

  document.head.appendChild(style);
  document.body.appendChild(container);

  currentNotification = container;
  currentStyle = style;

  // Code toggle
  if (submission.code) {
    const codeBlock = container.querySelector(".dsa-toast-code-block") as HTMLElement;
    codeBlock.textContent = submission.code;
    const codeToggle = container.querySelector(".dsa-toast-code-toggle") as HTMLButtonElement;
    const arrow = container.querySelector(".dsa-code-arrow") as HTMLElement;

    codeToggle?.addEventListener("click", () => {
      const isOpen = codeBlock.classList.toggle("open");
      arrow.textContent = isOpen ? "▴" : "▾";
      codeToggle.querySelector("span")!.textContent = isOpen ? "Hide Code" : "Show Code";
    });
  }

  // Close button
  const closeBtn = container.querySelector(".dsa-toast-close");
  closeBtn?.addEventListener("click", () => {
    container.remove();
    style.remove();
    currentNotification = null;
    currentStyle = null;
  });

  // Add button handler
  const addButton = container.querySelector("#dsa-btn-add") as HTMLButtonElement | null;
  addButton?.addEventListener("click", async () => {
    if (!addButton) return;

    addButton.disabled = true;
    addButton.textContent = "Adding...";

    try {
      const result = await sendSubmission(submission);

      addButton.textContent = result?.created
        ? "✓ Added to DSA Tracker"
        : "✓ Already in DSA Tracker";
      addButton.classList.add("success");

      const openButton = document.createElement("button");
      openButton.className = "dsa-btn-secondary";
      openButton.type = "button";
      openButton.textContent = "Open in DSA Tracker";

      openButton.addEventListener("click", () => {
        window.open(
          `http://localhost:3000/problems/${submission.problemSlug}`,
          "_blank",
        );
      });

      addButton.insertAdjacentElement("afterend", openButton);
    } catch (error: any) {
      console.error("[DSA Tracker] Import failed:", error);

      const isAuthError =
        error?.message?.includes("log in") ||
        error?.message?.includes("Authentication") ||
        error?.message?.includes("401");

      if (isAuthError) {
        addButton.textContent = "Log in to DSA Tracker";
        addButton.disabled = false;
        addButton.style.background = "#f59e0b"; // amber accent
        addButton.onclick = () => {
          window.open("http://localhost:3000/login", "_blank");
        };
      } else {
        addButton.disabled = false;
        addButton.textContent = error?.message ? `Failed: ${error.message.slice(0, 20)}` : "Try again";
      }
    }
  });
}

