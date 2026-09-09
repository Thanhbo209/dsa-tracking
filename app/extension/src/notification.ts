import type { CapturedSubmission } from "./types";
import { sendSubmission } from "./api";

let currentNotification: HTMLDivElement | null = null;

export function showSubmissionNotification(submission: CapturedSubmission) {
  currentNotification?.remove();

  const container = document.createElement("div");

  container.innerHTML = `
    <div class="dsa-tracker-header">
      <strong>DSA Tracker</strong>
      <button class="dsa-tracker-close" type="button">×</button>
    </div>

    <div class="dsa-tracker-success">
      <span>✓</span>
      <span>Submission captured</span>
    </div>

    <div class="dsa-tracker-problem">
      ${submission.problemSlug}
    </div>

    <div class="dsa-tracker-meta">
      ${submission.status.replaceAll("_", " ")} ·
      ${submission.language}
      ${submission.runtimeMs != null ? ` · ${submission.runtimeMs} ms` : ""}
    </div>

    <button class="dsa-tracker-add" type="button">
      Add to DSA Tracker
    </button>

    <button class="dsa-tracker-details" type="button">
      Details <span>▾</span>
    </button>

    <div class="dsa-tracker-expanded">
      <div><span>Status</span><strong>${submission.status.replaceAll("_", " ")}</strong></div>
      <div><span>Language</span><strong>${submission.language}</strong></div>
      <div><span>Runtime</span><strong>${submission.runtimeMs ?? "N/A"} ms</strong></div>
      <div><span>Memory</span><strong>${submission.memoryBytes ?? "N/A"} bytes</strong></div>
      <div><span>Submission ID</span><strong>${submission.externalId}</strong></div>
    </div>
  `;

  Object.assign(container.style, {
    position: "fixed",
    top: "24px",
    right: "24px",
    width: "320px",
    zIndex: "2147483647",
    padding: "16px",
    borderRadius: "12px",
    background: "#ffffff",
    color: "#111827",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    fontSize: "14px",
    lineHeight: "1.4",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
    border: "1px solid #e5e7eb",
  });

  const style = document.createElement("style");

  style.textContent = `
    .dsa-tracker-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .dsa-tracker-close {
      border: 0;
      background: transparent;
      font-size: 20px;
      cursor: pointer;
      color: #6b7280;
    }

    .dsa-tracker-success {
      display: flex;
      gap: 8px;
      align-items: center;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .dsa-tracker-problem {
      font-weight: 600;
      margin-bottom: 4px;
    }

    .dsa-tracker-meta {
      color: #6b7280;
      font-size: 12px;
      margin-bottom: 14px;
      text-transform: capitalize;
    }

    .dsa-tracker-add {
      width: 100%;
      border: 0;
      border-radius: 8px;
      padding: 9px 12px;
      background: #111827;
      color: white;
      font-weight: 600;
      cursor: pointer;
    }

    .dsa-tracker-add:hover {
      opacity: 0.9;
    }

    .dsa-tracker-details {
      width: 100%;
      margin-top: 8px;
      padding: 6px;
      border: 0;
      background: transparent;
      cursor: pointer;
      color: #6b7280;
    }

    .dsa-tracker-expanded {
      display: none;
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid #e5e7eb;
    }

    .dsa-tracker-expanded.open {
      display: block;
    }

    .dsa-tracker-expanded div {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 4px 0;
      font-size: 12px;
    }

    .dsa-tracker-expanded span {
      color: #6b7280;
    }

    .dsa-tracker-expanded strong {
      text-align: right;
      word-break: break-word;
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(container);

  currentNotification = container;

  const closeButton = container.querySelector(".dsa-tracker-close");

  closeButton?.addEventListener("click", () => {
    container.remove();
    style.remove();
    currentNotification = null;
  });

  const detailsButton = container.querySelector(".dsa-tracker-details");

  const expanded = container.querySelector(".dsa-tracker-expanded");

  detailsButton?.addEventListener("click", () => {
    expanded?.classList.toggle("open");

    const arrow = detailsButton.querySelector("span");

    if (arrow) {
      arrow.textContent = expanded?.classList.contains("open") ? "▴" : "▾";
    }
  });

  const addButton = container.querySelector(
    ".dsa-tracker-add",
  ) as HTMLButtonElement | null;

  addButton?.addEventListener("click", async () => {
    if (!addButton) {
      return;
    }

    addButton.disabled = true;
    addButton.textContent = "Adding...";

    try {
      const result = await sendSubmission(submission);

      addButton.textContent = result.created
        ? "✓ Added to DSA Tracker"
        : "✓ Already in DSA Tracker";
    } catch (error) {
      console.error("[DSA Tracker] Import failed:", error);

      addButton.disabled = false;
      addButton.textContent = "Try again";
    }
  });
}
