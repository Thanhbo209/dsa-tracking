# DSA Tracker

<p align="center">
  <img src="public/logo.png" alt="DSA Tracker Logo" width="80" height="80" />
</p>

<p align="center">
  <strong>Personal algorithmic knowledge base, LeetCode companion, and AI-assisted DSA coaching platform.</strong>
</p>

<p align="center">
  <a href="https://dsa-tracking-six.vercel.app"><strong>🌐 Live Demo: dsa-tracking-six.vercel.app</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Build-Passing-22c55e?style=flat-square" alt="Build Status" />
  <img src="https://img.shields.io/badge/Next.js-16.3-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Prisma-7.10-5a67d8?style=flat-square&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwindcss" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/Gemini-3.6%20%2F%203.5--Lite%20Dual--Model-d946ef?style=flat-square&logo=google" alt="Gemini Dual-Model" />
  <img src="https://img.shields.io/badge/Manifest-V3-4285f4?style=flat-square&logo=googlechrome" alt="Chrome Extension Manifest V3" />
  <img src="https://img.shields.io/badge/Tests-34%20suites%20%7C%20284%20passed-22c55e?style=flat-square&logo=vitest" alt="Vitest 284 Passed" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License: MIT" />
</p>

---

## 💡 Overview & Problem Statement

Grinding algorithms often creates diminishing returns due to three core friction points:
* **The Retention Gap**: Intuitions, edge cases, and trade-offs fade weeks after solving a problem.
* **Unstructured Code**: Submissions capture raw code without context, alternatives, or asymptotic trade-offs.
* **Fragmented Documentation**: Personal notes in Notion, Obsidian, or Docs quickly disconnect from actual submissions.

**DSA Tracker** resolves this by closing the loop:
1. **Passive Ingestion**: As you solve problems on LeetCode, a companion Chrome MV3 extension captures code, runtime, and memory metrics in the background.
2. **AI Diagnostic Review**: An automated review engine audits algorithmic complexity, identifies anti-patterns, tests edge cases, and drafts structured takeaways.
3. **Evergreen Knowledge Vault**: Insights are codified into a permanent 3-tier hierarchy (**Approach ➔ Solution ➔ Code**), transforming one-off attempts into a searchable, shareable personal playbook.

---

## ⚡ Core Engineering Highlights

### 1. Resilient Dual-Model AI Failover Engine
Production LLM integrations face aggressive rate limits and sudden quota exhaustions. DSA Tracker implements a self-healing model routing and circuit-breaker architecture:
* **Dual-Model Pairing**: Uses **`gemini-3.6-flash`** as the high-intelligence primary model and dynamically fails over to **`gemini-3.5-flash-lite`** upon quota exhaustion.
* **Concurrency-Safe Atomic State**: Active model state is persisted in a database singleton (`AiModelState`). Model failover transitions execute via atomic SQL conditional updates (`updateMany ... WHERE activeModel = expected`), ensuring concurrent serverless requests never trigger duplicate switch events.
* **Categorized Cooldown Derivation**:
  * *Daily Quota Exceeded (`PerDay`)*: Sets a conservative cooldown until the next UTC midnight boundary (minimum 6–12 hours), avoiding premature retry loops.
  * *Short-Window Rate Limit*: Enforces a strict minimum 30-second cooldown floor, deriving duration from API retry headers when available.
* **Graceful Circuit Breaker**: If both models are simultaneously in cooldown, execution terminates cleanly without infinite loops, surfacing an informative retry ETA.
* **Immediate Retry**: When a quota error occurs on an incoming analysis request, the system atomically switches models and retries the request against the fallback model in the same user turn.

### 2. Chrome Extension (Manifest V3) Ingestion Pipeline
* **Official GraphQL Polling**: Unlike fragile DOM or Monaco/CodeMirror scraping, the extension monitors LeetCode submission completion and queries LeetCode's official `submissionDetails` GraphQL API for verified source code, execution runtime, and memory metrics.
* **Shared Cookie Session Authentication**: The background service worker sends imported submissions directly to `/api/submissions/import` using session cookies shared with the configured host, requiring no manual API token management.
* **In-Page LeetCode HUD**: Injects a lightweight notification banner into the active LeetCode tab confirming capture and sync status.
* **Web Bridge**: Injected on DSA Tracker domains to register web origins and fetch code snippets on demand.

### 3. 3-Tier Knowledge Vault
* **Hierarchical Organization**: Separates concepts into **Approach** (algorithmic paradigm, e.g. *Two Pointers*), **Solution** (concrete implementation and complexity trade-offs), and **Code** (multi-language implementations).
* **One-Click AI Promotion**: Turn AI diagnostic reviews directly into structured approach and solution drafts with a single click.

### 4. Admin AI Usage & Quota Audit Dashboard (`/admin/ai-usage`)
* Real-time monitoring of the active Gemini model and failover status.
* Live cooldown expiry countdown and analyses count by model.
* Historical switch audit table backed by `AiModelSwitchEvent`, recording model transitions, exact violation reasons, and quota categories.
* Access control secured via `ADMIN_EMAILS` with fallback authenticated access.

---

## 🖥️ Visual Tour

### Dashboard & Problem Explorer
<img width="900" alt="Problems Explorer Catalog" src="https://github.com/user-attachments/assets/db3e1aa3-6935-478d-ab28-ed131b5cd8cf" />
<p align="center"><em>Filter problems by text, topic tags, and difficulty status.</em></p>

<img width="900" alt="Practice Analytics and Streaks" src="https://github.com/user-attachments/assets/0002c57d-188f-4f4e-8dfc-1bd72d11a5a9" />
<p align="center"><em>Practice analytics dashboard showing difficulty breakdown and commit-style activity streak heatmap.</em></p>

### Problem Learning Workspace
<img width="900" alt="Problem Learning Workspace" src="https://github.com/user-attachments/assets/5f554f89-fade-4c13-916b-514459e9bf4c" />
<p align="center"><em>Workspace displaying submission history, decimal MB memory metrics, and side-by-side solution tabs.</em></p>

### AI Diagnostic Review & Knowledge Generation
<img width="900" alt="AI Diagnostic Review Overview" src="https://github.com/user-attachments/assets/2398b546-c695-4163-a2f1-165b39a6e4b0" />
<p align="center"><em>AI diagnostic summary with model indicator badge, time/space audit, and architectural assessment.</em></p>

<img width="900" alt="AI Complexity Audit & Anti-patterns" src="https://github.com/user-attachments/assets/ceb59c71-045e-489d-9a1a-92441bef27ab" />
<p align="center"><em>Deep algorithmic review highlighting subtle anti-patterns and missing edge cases.</em></p>

<img width="900" alt="Knowledge Draft Generation" src="https://github.com/user-attachments/assets/5ea698e5-c880-4b81-8f2c-87fcb2eb3efc" />
<p align="center"><em>Automated knowledge draft creation ready for instant promotion into the 3-tier Knowledge Vault.</em></p>

### Public Portfolio Playbook
<img width="900" alt="Public Profile Playbook" src="https://github.com/user-attachments/assets/59f1cade-c034-4608-ba62-f5bf973571b4" />
<p align="center"><em>Shareable public profile (<code>/u/[username]</code>) featuring interactive problem search, topic filtering, and grid/table views.</em></p>

### Chrome Extension (Manifest V3)
<img width="900" alt="Chrome Extension Popup Interface" src="https://github.com/user-attachments/assets/6d695b4d-7c73-4b7e-a511-ec93324f8c4c" />
<p align="center"><em>Extension popup displaying active host endpoint, authenticated user status, and recent submission syncs.</em></p>

<img width="900" alt="LeetCode In-Page HUD Toast" src="https://github.com/user-attachments/assets/6a863e3c-53cf-4307-a748-07ea227a812b" />
<p align="center"><em>In-page notification toast injected into LeetCode immediately after solving a problem.</em></p>

---

## 🏗️ System Architecture

```mermaid
flowchart TD

subgraph EXTERNAL["🌐 External Services & Users"]
    direction TB
    LC["LeetCode GraphQL API<br/>submissionDetails query"]
    DEV["Developer / User"]
end

subgraph EXT["🧩 Chrome Extension (Manifest V3)"]
    direction TB
    CONTENT["Content Script<br/>Watches & polls submission status"]
    TOAST["In-Page HUD Toast<br/>Instant sync confirmation"]
    WORKER["Background Service Worker<br/>Cookie-based auth & payload relay"]
    POPUP["Popup Interface<br/>Endpoint selector & login status"]
end

subgraph APP["🚀 DSA Tracker Platform (Next.js 16)"]
    direction TB
    IMPORT["Import API<br/><code>POST /api/submissions/import</code>"]
    REVIEW["AI Review Engine<br/><code>/api/submissions/[id]/analyze</code>"]
    VAULT_API["Knowledge Vault API<br/><code>/api/approaches</code>"]
    ADMIN_PAGE["Admin Dashboard<br/><code>/admin/ai-usage</code>"]
end

subgraph AI_ROUTER["🤖 AI Resilient Routing & Quota Fallback"]
    direction TB
    CIRCUIT["Circuit Breaker & Cooldown Manager<br/>Daily quota vs short-window classification"]
    PRIMARY["Primary Engine<br/>gemini-3.6-flash"]
    FALLBACK["Fallback Engine<br/>gemini-3.5-flash-lite"]
end

subgraph DB_LAYER["🗄️ PostgreSQL Database (Prisma ORM 7)"]
    direction TB
    DB_CORE[("Core Storage<br/>Problems • Submissions • Vault")]
    DB_STATE[("AiModelState<br/>Atomic singleton state & cooldowns")]
    DB_EVENTS[("AiModelSwitchEvent<br/>Failover history & switch audit")]
end

%% Ingestion Pipeline
LC -->|"① Submission data"| CONTENT
CONTENT -->|"Displays feedback"| TOAST
CONTENT -->|"chrome.runtime.sendMessage"| WORKER
POPUP -.->|"Configure endpoint"| WORKER
WORKER -->|"② Authenticated POST (cookies)"| IMPORT
IMPORT -->|"③ Persist submission"| DB_CORE

%% Learning & AI Review
DEV -->|"Trigger analysis"| REVIEW
REVIEW -->|"Check active model"| DB_STATE
REVIEW -->|"Request review"| PRIMARY
PRIMARY -.->|"429 / Quota Error"| CIRCUIT
CIRCUIT -->|"Atomic switch"| DB_STATE
CIRCUIT -->|"Log switch event"| DB_EVENTS
CIRCUIT -->|"Immediate retry"| FALLBACK
FALLBACK -.->|"Both exhausted"| CIRCUIT

%% Promotion to Vault
REVIEW -->|"Generate draft"| DB_CORE
DEV -->|"Promote draft"| VAULT_API
VAULT_API -->|"Save approach & solution"| DB_CORE

%% Admin Monitoring
ADMIN_PAGE -->|"Read state & audit log"| DB_STATE
ADMIN_PAGE -->|"Read switch metrics"| DB_EVENTS
```

---

### 🧪 Testing Account

For testing the deployed application, you can use the following demo account:

| Field | Value |
|---|---|
| **Username** | `thanhcow` |
| **Password** | `123123123` |

> **Note:** This account is intended for demonstration and testing purposes only. Do not use these credentials for sensitive data or production accounts.

## 🛠️ Tech Stack

| Layer | Technologies | Notes |
|---|---|---|
| **Frontend** | [Next.js 16.3](https://nextjs.org/) (App Router, Turbopack), [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [Base UI](https://base-ui.com/), [Lucide React](https://lucide.dev/) | Modern styling with Tailwind CSS v4, dark-theme first design |
| **Backend** | Next.js Route Handlers, [Better Auth](https://better-auth.com/) | Secure cookie session authentication, middleware protection |
| **Database & ORM** | [PostgreSQL](https://www.postgresql.org/) (Supabase / Neon), [Prisma ORM 7.10](https://www.prisma.io/) (`@prisma/client`, `@prisma/adapter-pg`) | Typed SQL adapter, Prisma 7 client generation |
| **AI Failover Engine** | [Google Gemini](https://ai.google.dev/) (`@google/genai`) | `gemini-3.6-flash` (primary) with automated fallback to `gemini-3.5-flash-lite` |
| **Browser Extension** | Chrome Manifest V3, TypeScript, [esbuild](https://esbuild.github.io/) | GraphQL submission polling, cookie authentication, DOM HUD injection |
| **Tooling & Tests** | [Vitest 5.0](https://vitest.dev/), ESLint 9, TypeScript 5, [pnpm 11.5](https://pnpm.io/) | 32 test suites, 276 unit/integration tests |

---

## 🚀 Getting Started / Local Development

### Prerequisites
* **Node.js**: `22.0.0+`
* **pnpm**: `11.5.0+` (`corepack enable pnpm` or `npm i -g pnpm`)
* **PostgreSQL**: Local PostgreSQL 15+ instance or hosted database (Supabase, Neon)
* **Google Gemini API Key**: Obtainable from [Google AI Studio](https://aistudio.google.com/)

### 1. Environment Configuration (`.env`)

Create a `.env` file in the project root:

```env
# Database connection string (PostgreSQL)
DATABASE_URL="postgresql://username:password@localhost:5432/dsa_tracker?schema=public"

# Better Auth Configuration
BETTER_AUTH_SECRET="your-secure-32-byte-secret"
BETTER_AUTH_URL="http://localhost:3000"

# Google Gemini API Configuration
GEMINI_API_KEY="your-gemini-api-key"

# AI Model Configuration (Optional overrides)
GEMINI_PRIMARY_MODEL="gemini-3.6-flash"    # Primary analysis model (default: gemini-3.6-flash)
GEMINI_FALLBACK_MODEL="gemini-3.5-flash-lite"   # Fallback model used on quota error (default: gemini-3.5-flash-lite)

# Admin Access Control (Optional)
ADMIN_EMAILS="admin@example.com"           # Comma-separated list for /admin/ai-usage access (open to auth users if empty)
```

> [!TIP]
> Generate a secure 32-byte random string for `BETTER_AUTH_SECRET` by running:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### 2. Database Initialization

```bash
# 1. Generate the Prisma Client
pnpm prisma generate

# 2. Synchronize schema with database:
# For local development / rapid prototyping:
pnpm prisma db push

# For production / migration-tracked environments:
pnpm prisma migrate deploy
```

### 3. Running the Web Application

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Create an account via `/signup` to begin tracking.

### 4. Building and Loading the Chrome Extension

1. Build the extension bundle using esbuild:
   ```bash
   pnpm extension:build
   ```
2. Open Google Chrome and navigate to `chrome://extensions`.
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** and select the `extension/` directory.
5. Click the extension icon in your toolbar:
   - Ensure the Web App URL is set to `http://localhost:3000`.
   - Confirm your login status shows **Logged in**.

**Extension Development & Troubleshooting**:
* **Origin Permissions**: When toggling endpoints between `localhost` and a custom deployed domain, Chrome will prompt for origin access. Click "Allow".
* **Cookie Permissions**: The extension reads session cookies for your configured DSA Tracker host. Ensure third-party cookie blockers are not interfering.
* **Service Worker Console**: To debug capture events, click `service worker` in `chrome://extensions` under the DSA Tracker card to open DevTools for the background script.
* **Rebuilding During Development**: To rebuild after making changes to `extension/src/`, run `pnpm extension:build` (or `node extension/build.mjs`).

---

## 🧪 Testing & Code Quality

The codebase enforces strict test coverage across model switching, quota detection, schema validation, and UI components:

```bash
# Run the complete test suite (34 test files, 284 tests)
pnpm exec vitest run

# Run tests in interactive watch mode
pnpm test:watch

# Static linting check (ESLint 9)
pnpm lint

# TypeScript strict type check
pnpm exec tsc --noEmit

# Production build verification (Prisma Client + Next.js Turbopack)
pnpm build
```

**Test Suite Coverage**:
* `tests/analysis/model-switching.test.ts`: Quota error categorization (`PerDay` vs short-window), minimum 30s floor, atomic concurrency failover, and display formatting.
* `tests/analysis/service.test.ts`: Gemini analysis integration, immediate retry on failover, and dual-model cooldown circuit breaking.
* `tests/auth/trusted-origins.test.ts`: Better Auth CORS and origin verification for Chrome extension and Vercel environments.
* `tests/extension/auth.test.ts`: Email vs username credentials resolution, case normalization, and Better Auth routing.
* `tests/validation/`: Zod schemas for submission imports, approaches, solutions, and code links.
* `tests/components/`: Learning workspace, analysis cards, model indicator badges, and button styling.
* `tests/profile/`: Playbook search, difficulty filters, and topic tag aggregations.

---

## 🚢 Production Deployment

### Vercel Deployment

1. Push the repository to GitHub.
2. Import the project into [Vercel](https://vercel.com/new).
3. Set the **Build & Development Settings**:
   - **Framework Preset**: Next.js
   - **Build Command**: `prisma generate && next build` (or `pnpm build`)
   - **Install Command**: `pnpm install`
4. Configure Production Environment Variables in Vercel:
   - `DATABASE_URL`: Production PostgreSQL connection string (Supabase / Neon connection pooler recommended).
   - `BETTER_AUTH_SECRET`: Secure 32-byte production secret.
   - `BETTER_AUTH_URL`: Canonical production domain (e.g. `https://dsa-tracking-six.vercel.app`).
   - `GEMINI_API_KEY`: Production Google Gemini API key.
   - `GEMINI_PRIMARY_MODEL`: `gemini-3.6-flash` *(do not force fallback model in production)*.
   - `GEMINI_FALLBACK_MODEL`: `gemini-3.5-flash-lite`.
   - `ADMIN_EMAILS`: Authorized admin emails for `/admin/ai-usage`.
5. Run migrations against your production database:
   ```bash
   pnpm prisma migrate deploy
   ```

### Chrome Extension Production Configuration

1. In Google Chrome, open the DSA Tracker extension popup.
2. Select **Production Vercel** or enter `https://dsa-tracking-six.vercel.app`.
3. Click **Save & Connect** and approve the browser origin permission dialog.
4. Log into your production account on the web app. The extension will automatically synchronize session credentials.

---

## 📄 License & Credits

* **License**: This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
* **Author**: Built by [Thanhbo209](https://github.com/Thanhbo209).
