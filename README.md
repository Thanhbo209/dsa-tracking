# DSA Tracker

<p align="center">
  <img src="public/logo.png" alt="DSA Tracker Logo" width="80" height="80" />
</p>

<p align="center">
  <strong>Personal algorithmic knowledge base, LeetCode companion, and AI-assisted DSA coaching platform.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Build-Passing-22c55e?style=flat-square" alt="Build Status" />
  <img src="https://img.shields.io/badge/Next.js-16.3-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Prisma-7.10-5a67d8?style=flat-square&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=flat-square&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178c6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Manifest-V3-4285f4?style=flat-square&logo=googlechrome" alt="Chrome Extension Manifest V3" />
</p>

---

## 💡 Introduction & Motivation

### Why DSA Tracker?

Grinding data structures and algorithms is often an exercise in diminishing returns:
- **The Amnesia Problem**: You solve 300 problems, but two months later, the exact intuition and edge cases for a problem solved in week 2 are completely gone.
- **Unstructured Submissions**: Platforms like LeetCode store raw source code submissions, but raw code is poor documentation. It lacks your conceptual thought process, time/space trade-offs, and structural comparison across alternative solutions.
- **Fragmented Notes**: Developers often keep scattered Notion pages, Markdown files, or Google Docs that quickly become disconnected from actual LeetCode submissions.

**DSA Tracker** fixes this by closing the loop between problem solving and knowledge retention:
1. **Passive Capture**: As you solve problems on LeetCode, a companion Chrome extension automatically captures your code, language, status, and execution metrics without disrupting your flow.
2. **AI-Assisted Synthesis**: An integrated Google Gemini analysis engine evaluates your code, uncovers subtle anti-patterns, audits algorithmic complexity, and proposes structured knowledge drafts.
3. **The Knowledge Vault**: Your solutions are organized into a permanent 3-tier hierarchy (**Approach ➔ Solution ➔ Code**), transforming disposable solutions into an evergreen playbook.
4. **Public Portfolio**: Showcase your verified algorithmic expertise with a shareable public profile and interactive problem playbook.

---

## 🖥️ UI Showcase

### Problems Explorer

> _Problem library with multi-criteria search, topic filtering, difficulty distribution, and practice streak analytics._

<!-- Screenshot: add `docs/screenshots/problems-explorer.png` here later -->

<!--
<p align="center">
  <img src="./docs/screenshots/problems-explorer.png" alt="Problems Explorer" width="900" />
</p>
-->

### Problem Learning Workspace

> _Split-view workspace with problem description, historical submissions, code viewer, and learning modes._

<!-- Screenshot: add `docs/screenshots/problem-workspace.png` here later -->

<!--
<p align="center">
  <img src="./docs/screenshots/problem-workspace.png" alt="Problem Learning Workspace" width="900" />
</p>
-->

### AI Submission Analysis

> _Automated submission evaluation powered by Google Gemini, analyzing time/space complexity, concept gaps, and drafting knowledge entries._

<!-- Screenshot: add `docs/screenshots/ai-analysis.png` here later -->

<!--
<p align="center">
  <img src="./docs/screenshots/ai-analysis.png" alt="AI Submission Analysis" width="900" />
</p>
-->

### Knowledge Vault

> _Permanent algorithmic playbook organizing solutions into high-level approaches, concrete techniques, and multi-language implementations._

<!-- Screenshot: add `docs/screenshots/knowledge-vault.png` here later -->

<!--
<p align="center">
  <img src="./docs/screenshots/knowledge-vault.png" alt="Knowledge Vault" width="900" />
</p>
-->

### Public Profile

> _Shareable public portfolio showcasing solved problems, difficulty statistics, and curated solution playbooks._

<!-- Screenshot: add `docs/screenshots/public-profile.png` here later -->

<!--
<p align="center">
  <img src="./docs/screenshots/public-profile.png" alt="Public Profile" width="900" />
</p>
-->

### Chrome Extension

> _Companion browser extension for automatic submission capture on LeetCode, code extraction, and background sync._

<!-- Screenshot: add `docs/screenshots/chrome-extension.png` here later -->

<!--
<p align="center">
  <img src="./docs/screenshots/chrome-extension.png" alt="Chrome Extension" width="900" />
</p>
-->

---

## ✨ Key Features

### 🧩 Chrome Extension (Manifest V3)
- **Automatic Submission Capture**: Listens to LeetCode submission lifecycle events directly inside the browser.
- **On-Screen LeetCode Notifications**: Injects unobtrusive status toasts directly into the LeetCode UI upon capture.
- **Monaco / CodeMirror Extraction**: Extracts the active editor code and language accurately across different LeetCode UI revisions.
- **Dynamic Endpoint Configuration**: Seamlessly switch between Localhost (`http://localhost:3000`) and Production (`https://dsa-tracking-six.vercel.app`) with full origin permission requesting.

### 📊 Problems Explorer & Analytics Dashboard
- **Comprehensive Problem Catalog**: Filter problems by title, problem number, difficulty (`EASY`, `MEDIUM`, `HARD`), and dynamic topic tags.
- **Practice Analytics**: Visual difficulty distribution donut chart, solved totals, and a GitHub-style practice streak heatmap.

### 🤖 AI Submission Analysis
- **Gemini-Powered Code Review**: Analyzes submissions using Google Gemini (`gemini-2.5-flash`) for time and space complexity, strengths, vulnerabilities, and missing edge cases.
- **One-Click Vault Promotion**: Automatically drafts structural approach and solution entities from the AI review, allowing instant promotion into your Knowledge Vault.

### 🏛️ The Knowledge Vault
- **Structured 3-Tier Hierarchy**:
  - **Approach**: High-level algorithmic paradigm (e.g., *Two Pointers*, *Monotonic Stack*, *Prefix Sum + Hash Map*).
  - **Solution**: Concrete implementation strategy and trade-offs.
  - **Code**: Multi-language code snippets with syntax highlighting and explanation.
- **Continuous Knowledge Accumulation**: Retain and compare multiple approaches per problem rather than keeping just one ad-hoc snippet.

### 🌐 Public Knowledge Profiles
- **Shareable Playbook (`/u/[username]`)**: Public portfolio of solved problems with real-time text search, difficulty filters, dynamic topic tags, and grid/table views.
- **Problem Deep Dive (`/u/[username]/[problemSlug]`)**: Public view of your approaches, trade-offs, and multi-language code for individual problems.

---

## 🏗️ Architecture & Workflows

### Data Flows & System Overview

```mermaid
flowchart TD
    subgraph LeetCode["LeetCode (Browser)"]
        LC_DOM[LeetCode Editor / Page] -->|DOM Mutation / Intercept| CS[Content Script]
        CS -->|Window PostMessage Bridge| BR[DOM Bridge Script]
    end

    subgraph Extension["Chrome Extension (MV3)"]
        CS -->|chrome.runtime.sendMessage| BG[Background Service Worker]
        POP[Extension Popup] -->|Switch Endpoint / Status| BG
    end

    subgraph Backend["DSA Tracker (Next.js 16 + Node)"]
        BG -->|POST /api/submissions/import| API_IMP[Submission Import API]
        API_IMP --> DB[(PostgreSQL Database)]
        API_IMP --> STREAK[Streak & Activity Engine]
        
        DASH[Web Dashboard & Workspace] -->|Request Review| AI_ROUTE[/api/submissions/[id]/analyze]
        AI_ROUTE --> GEMINI[Google Gemini 2.5]
        GEMINI -->|Structured Review| AI_ROUTE
        AI_ROUTE -->|Draft Knowledge| DB
        
        VAULT[Knowledge Vault] -->|Promote Draft| APP_ROUTE[/api/approaches]
        APP_ROUTE --> DB
    end
```

### Extension DOM Bridge Workflow

1. **Submission Trigger**: When a solution is submitted on `leetcode.com`, the content script detects the submission response or DOM state change.
2. **Code Extraction**: The extension reads the active code from the Monaco/CodeMirror editor DOM or GraphQL submission payload.
3. **Session Verification**: The background service worker accesses the authenticated session cookie shared with the configured DSA Tracker host.
4. **Ingestion & Streak Update**: The payload is dispatched to `/api/submissions/import`. The backend creates problem records, persists the submission, and recalculates the user's activity streak.
5. **Instant Toast**: The extension displays an in-page floating toast on LeetCode confirming synchronization.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack), [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [Lucide React](https://lucide.dev/), [Base UI](https://base-ui.com/) |
| **Backend** | Next.js Route Handlers, [Better Auth](https://better-auth.com/) (session authentication) |
| **Database & ORM** | [PostgreSQL](https://www.postgresql.org/) (Supabase / Neon), [Prisma ORM 7](https://www.prisma.io/) (`@prisma/client`, `@prisma/adapter-pg`) |
| **AI Engine** | [Google Gemini](https://ai.google.dev/) (`@google/genai`, Gemini 2.5 Flash) |
| **Browser Extension** | Chrome Manifest V3, TypeScript, [esbuild](https://esbuild.github.io/) |
| **Testing & Tooling** | [Vitest](https://vitest.dev/), ESLint 9, TypeScript 5, pnpm |

---

## 🚀 Getting Started / Local Development

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: Version `22.0.0+` (recommended: Node `22.22+`)
- **pnpm**: Version `9.0.0+` (`corepack enable pnpm` or `npm install -g pnpm`)
- **PostgreSQL**: A running instance locally or a cloud database (e.g. Supabase, Neon)
- **Google Gemini API Key**: Obtainable from [Google AI Studio](https://aistudio.google.com/)

### Environment Variables Setup (`.env`)

Create a `.env` file in the root directory:

```env
# Database connection string (PostgreSQL)
DATABASE_URL="postgresql://username:password@localhost:5432/dsa_tracker?schema=public"

# Google Gemini API configuration
GEMINI_API_KEY="your_gemini_api_key_here"
GEMINI_MODEL="gemini-2.5-flash"

# Better Auth configuration
BETTER_AUTH_SECRET="generate_a_secure_random_32_byte_secret"
BETTER_AUTH_URL="http://localhost:3000"
```

> [!TIP]
> You can generate a secure 32-byte secret for `BETTER_AUTH_SECRET` by running:
> ```bash
> node -e "console.log(crypto.randomBytes(32).toString('hex'))"
> ```

### Database Setup

Initialize Prisma client and sync the schema to your PostgreSQL database:

```bash
# Generate Prisma Client
pnpm prisma generate

# Push database schema without creating migration files (development)
pnpm prisma db push
```

### Running the Web Application

Start the Next.js development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Register a new user account to get started.

### Building and Loading the Chrome Extension

1. Build the extension bundle using esbuild:
   ```bash
   pnpm extension:build
   ```
2. Open Google Chrome and navigate to `chrome://extensions`.
3. Toggle **Developer mode** in the top right corner.
4. Click **Load unpacked** and select the `extension/` directory inside this project repository.
5. Click the extension icon in your Chrome toolbar:
   - Ensure the Web App URL is set to `http://localhost:3000` (default for local development).
   - Verify that your authentication status displays as logged in.

### Testing

Run the test suite with Vitest:

```bash
# Run all tests once
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run a specific test suite
pnpm test run tests/profile/filtering.test.ts
```

---

## 🚢 Deployment

### Vercel Deployment Guide

1. Push your repository to GitHub.
2. Import the repository into [Vercel](https://vercel.com/new).
3. Configure the **Build & Development Settings**:
   - **Framework Preset**: Next.js
   - **Build Command**: `prisma generate && next build` (or `pnpm build`)
   - **Install Command**: `pnpm install`
4. Add the following **Environment Variables** in your Vercel Project Settings:
   - `DATABASE_URL`: Production PostgreSQL connection string (pooler recommended).
   - `BETTER_AUTH_SECRET`: Production secret string.
   - `BETTER_AUTH_URL`: Your production URL (e.g., `https://dsa-tracking-six.vercel.app`).
   - `GEMINI_API_KEY`: Your Google Gemini API Key.
   - `GEMINI_MODEL`: `gemini-2.5-flash`.
5. Deploy!

### Chrome Extension Production Configuration

When using the live deployed site:
1. Open the Chrome extension popup by clicking its icon in the browser toolbar.
2. Select **Production Vercel** (or input your production URL, e.g. `https://dsa-tracking-six.vercel.app`).
3. Click **Save & Connect**. When prompted by Chrome, approve the origin permission request.
4. Alternatively, click the **"Add Extension"** button inside the web app at `/problems` to view preconfigured setup instructions.
