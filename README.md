# DevCode

A browser-based practice platform for learning and testing practical software-development skills. Think of it as **LeetCode for developers**: pick a task, get a real codebase with a bug or incomplete feature, understand how the existing code works, fix it in the browser, and have hidden tests evaluate your solution.

Instead of solving isolated algorithm problems, you work with realistic frontend and backend code, debug existing behavior, implement missing logic, and deal with API contracts, state management, authentication, and unfamiliar codebases. This makes DevCode useful for building practical development skills, while also giving you experience that can help with practical coding assessments and online assessments that involve working on an existing repository.

The platform includes two types of exercises: larger **full-app debugging tasks** built on a real MERN task manager, and smaller **focused mini-challenges** that isolate specific frontend or backend concepts. The debugging and repository-based format is inspired by practical engineering assessments used by companies such as **Stripe, Retool, and Amazon**.

## How It Works

1. **Pick a task** from the question list, filtered by layer (backend / frontend / fullstack)
2. **A WebContainer boots** in your browser with the application and the task-specific bug or incomplete implementation already injected
3. **Read the challenge description** to understand the feature, reproduce the problem, and see what a correct solution must satisfy
4. **Edit the code** using the in-browser CodeMirror editor and, where applicable, verify your changes through the live application
5. **Run hidden tests** to check whether your implementation satisfies the required behavior
6. **Submit your solution** and view your result and previous submission history

### Example Challenges

- **Typeahead Highlight:** Implement case-insensitive text matching that highlights multiple occurrences while preserving the original text.
- **Meeting Scheduler:** Restore free-slot generation around overlapping meetings while respecting working hours and fixed slot intervals.
- **Drag-and-Reorder:** Fix a task-board flow so drag operations persist through the API and correctly update frontend state.

---

## Tech Stack

| Layer | Technology |
|--|--|
| Frontend | React (Vite), Tailwind CSS |
| In-browser editor | CodeMirror |
| Browser sandbox | WebContainers API (StackBlitz) |
| Backend | Node.js, Express, TypeScript |
| Backend tooling | tsx |
| Database | MongoDB (Mongoose) |
| Auth | JWT via httpOnly cookies |
| Deployment | Vercel (frontend) + Render (backend) |

--

## Interesting Technical Decisions

### Why WebContainers over server-side sandboxing

The alternative, running each user's dev environment in a Docker container on the server, would mean provisioning, managing, and tearing down a full container per session, with all the latency and infra cost that comes with it. WebContainers runs a real Node.js environment entirely inside the browser via WASM, which avoids server-side sandbox provisioning and per-session sandbox compute on the backend. The tradeoff is browser compatibility requirements (SharedArrayBuffer, COOP/COEP headers) and the constraint that you can't run a real MongoDB instance, which led directly to the in-memory adapter decision below.

### Base + overlay snapshot architecture

Storing a full copy of the bugged repo per task in MongoDB would mean megabytes of file content per question document, and would make updating the base repo (dependency bumps, bug fixes) a multi-document migration. Instead:

- One **base snapshot** per source app lives on disk (`node_modules` stripped, `.env` set to dummy values)
- Each task has a small **overlay folder**, only the files that differ from the base (the bugged or stubbed files), plus a separate hidden-test layer
- At request time, `buildFileSystemTree` reads the base, then `applyOverlay` merges the task's changed files (and the hidden test) on top
- MongoDB stores only metadata: `baseRepoSlug`, `overlaySlug`, question title, repro steps, layer tag, never file contents

This means updating a base app requires touching exactly one place on disk, and each new task's authoring surface is just the handful of files that actually change.

### The in-memory Mongoose adapter

WebContainers can't run a real MongoDB instance, there's no native binary execution in the browser sandbox. But ripping Mongoose out and replacing it with plain in-memory objects would also lose the schema validation that makes the base app behave like a real one.

The solution: a drop-in adapter that swaps the real Mongoose connection for an in-memory `Map`-backed store while keeping all schema definitions, validators, and model methods intact. The app code never knows it's not talking to a real database. This was verified end-to-end in a live browser WebContainer, signup, login, and full task CRUD all confirmed working through the adapter before any task content was authored.

### Why `applyOverlay` needs to report which paths it touched

When a user submits, the grader only needs to see the files they actually edited, the overlay files, not the entire mounted tree. The naive approach of diffing the mounted tree against the base is expensive and unreliable. The cleaner fix: `applyOverlay` on the backend tracks and returns the exact set of paths it merged, so submissions are scoped to precisely those files. This came out of a real bug found during integration, submissions were sending the entire mounted file tree (dozens of files) instead of the 1-3 overlay files that actually mattered.

--

## Design Trade-offs

**Browser-based execution**  
Running development environments and tests inside WebContainers keeps the interactive workflow on the client and avoids provisioning a server-side sandbox for every session. The trade-off is that each task still has to boot and install its dependencies in the user's browser.

**Client-side grading**  
Tests run inside the same browser environment as the candidate's code, which keeps the feedback loop fast and avoids server-side test execution infrastructure. Stronger server-side verification is a natural future extension.

**Inspectability**  
The WebContainer environment is intentionally transparent for local debugging and learning. Hidden tests are not treated as a security boundary, since DevCode is a practice platform rather than a secure hiring environment.

**Per-tab resource usage**  
Each open task gets its own development environment in the browser. This gives the workspace the feel of a real development setup, but uses more memory and CPU than a typical web application.

---

## Known Limitations

These are deliberate trade-offs:

- **Server-side grade verification** is not implemented yet. The server records the result reported by the client-side test runner.
- **Hints are deferred** because the current challenge descriptions already provide detailed behavioral requirements.
- **Task ownership is not implemented** in the MERN task manager base. All authenticated users currently work with the same task data, which is kept as-is for the practice tasks.

---

## Local Development

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas URI)
- A WebContainers-compatible browser (Chrome or Edge recommended)

### Backend

```bash
cd backend
cp .env.example .env        # fill in DB_URL, ACCESS_SECRET, and any other secrets listed in .env.example
npm install
npm start                   # runs via tsx
```

### Frontend

```bash
cd frontend
cp .env.example .env        # set the API base URL to your backend origin
npm install
npm run dev
```

### Seeding questions

From the repository root:

```bash
npx tsx backend/src/scripts/seed.ts   # seeds the Repo docs and all Question docs into MongoDB
```

Base snapshots and overlay folders are expected at paths configured relative to the backend's working directory. The `snapshots/` directory is not committed to this repo, see the seed script and snapshot-builder source for how the base app and overlay structure are laid out.

--

## Project Structure

```text
DevCode/
├── frontend/
│   └── src/
│       ├── api/             # axios instance, auth.js, questions.js
│       ├── components/      # CodeEditor, FileBrowser, LivePreview
│       ├── hooks/           # useWebContainer.js
│       ├── pages/           # Login, Signup, QuestionList, QuestionDetail, Workspace, SubmissionView
│       └── store/           # Redux store and state management
├── backend/
│   └── src/
│       ├── features/
│       │   ├── auth/        # controller, routes, schema, service
│       │   ├── questions/   # controller, routes, snapshotBuilder (buildFileSystemTree, applyOverlay)
│       │   ├── submission/  # controller, routes
│       │   └── models/      # User, Question, Repo, Submission (Mongoose)
│       ├── middleware/      # JWT auth, zod validation, error handling
│       ├── scripts/         # seed.ts
│       └── utils/
└── snapshots/               # base apps + per-task overlay/hidden-test folders (not committed)
```

--

## What's Next

- **Server-side grade verification**: re-run hidden tests against submitted file snapshots on the backend to close the client-trust gap
- **Tiered hints**: especially valuable for the subtler logic-bug tasks where the challenge description doesn't fully constrain the solution
- **Real task ownership in the base practice app**: add genuine per-user scoping to the MERN task manager base, unlocking auth/ownership-flavored tasks that currently aren't possible since the underlying feature doesn't exist
