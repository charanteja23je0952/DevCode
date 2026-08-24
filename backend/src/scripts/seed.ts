
import mongoose from "mongoose";
import "dotenv/config";
import Repo from "../features/models/repoModel.js";
import Question from "../features/models/quesModel.js";

const DB_URL = process.env.DB_URL ?? process.env.MONGODB_URI ?? "";
if (!DB_URL) {
  throw new Error("DB_URL (or MONGODB_URI) environment variable is not defined");
}

const repo = {
  slug: "mern_task_manager",
  description:
    "A full-stack MERN task management app. Users register and log in " +
    "via JWT stored in an httpOnly cookie, then manage tasks on a Trello-style " +
    "board with three columns (To Do / In Progress / Done). Tasks can be " +
    "created, edited, deleted, and moved between columns via drag-and-drop. " +
    "The frontend uses React with Redux Toolkit for state management, and " +
    "the backend is an Express + Mongoose API.",
};

const questions = [
  {
    title: "Task CRUD Operations",
    reproSteps:
      "Implement the task CRUD controller operations in " +
      "backend/controllers/taskController.js. createTask must create a task " +
      "from req.body and return it. deleteTask must delete the task " +
      "identified by req.params.id. Return the appropriate success status " +
      "for each operation, a useful error response when a database " +
      "operation fails, and 404 when a delete targets a task that does not " +
      "exist. Keep the existing API response shapes and route contracts intact.",
    category: "query",
    layer: "backend",
    difficulty: "easy",
    hints: [],
    baseRepoSlug: "mern_task_manager",
    overlaySlug: "task-crud",
  },
  {
    title: "Authentication Middleware",
    reproSteps:
      "Implement the authentication middleware in " +
      "backend/middlewares/authMiddleware.js. It must read the JWT from the " +
      "authentication cookie set by generateToken.js, reject requests " +
      "without a token with HTTP 401, verify the JWT using " +
      "process.env.JWT_SECRET, attach the authenticated user's ID to " +
      "req.user, call next() only when authentication succeeds, and return " +
      "401 for invalid or expired tokens.",
    category: "auth",
    layer: "backend",
    difficulty: "medium",
    hints: [],
    baseRepoSlug: "mern_task_manager",
    overlaySlug: "auth",
  },
  {
    title: "Task Reordering (Backend)",
    reproSteps:
      "Implement the task reordering functionality in " +
      "backend/controllers/taskController.js. Read the task updates from " +
      "req.body.tasks (each item has a task id and destination status), " +
      "persist every task's new status, return HTTP 200 with a success " +
      "message when all updates succeed, handle malformed input or " +
      "database errors with an appropriate 4xx response, and do not report " +
      "success if any required update fails.",
    category: "query",
    layer: "backend",
    difficulty: "medium",
    hints: [],
    baseRepoSlug: "mern_task_manager",
    overlaySlug: "task-reorder",
  },
  {
    title: "Redux Task Slice",
    reproSteps:
      "Complete the Redux task slice in " +
      "frontend/src/redux/features/task/taskSlice.js. setTasks replaces the " +
      "current task collection and clears loading/error state. addTask adds " +
      "a new task without removing existing ones. updateTask replaces the " +
      "matching task by _id, leaving others unchanged. removeTask removes " +
      "only the task whose _id matches the payload. setLoading and " +
      "setError update their respective flags. Preserve the existing state " +
      "shape and action names — other components already depend on this slice.",
    category: "state",
    layer: "frontend",
    difficulty: "easy",
    hints: [],
    baseRepoSlug: "mern_task_manager",
    overlaySlug: "redux-task-slice",
  },
  {
    title: "Drag-and-Drop Handler",
    reproSteps:
      "Restore the onDragEnd implementation in " +
      "frontend/src/components/TaskBoard .jsx. The backend is already " +
      "functional — keep this frontend-only. It must ignore invalid drops, " +
      "identify the dragged task, map the destination column to the task's " +
      "status, persist the change through the existing API, update Redux " +
      "from the successful server response, handle authentication failures " +
      "consistently, and expose other request errors through the " +
      "component's existing error state.",
    category: "state",
    layer: "frontend",
    difficulty: "medium",
    hints: [],
    baseRepoSlug: "mern_task_manager",
    overlaySlug: "drag-and-drop",
  },
  {
    title: "React Query Helper",
    reproSteps:
      "Complete the React Query helper in frontend/src/helper.js. The " +
      "harness UI is already functional — keep this helper-only. " +
      "Implement useGetTasks to fetch tasks with proper loading/error " +
      "states, and useCreateTask to create tasks with proper mutation " +
      "handling. Handle authentication failures consistently, expose " +
      "request errors through the hook's error state, and support refetch " +
      "for the tasks query.",
    category: "api-contract",
    layer: "frontend",
    difficulty: "medium",
    hints: [],
    baseRepoSlug: "mern_task_manager",
    overlaySlug: "react-query-harness",
  },
  {
    title: "Task Creation (Full Stack)",
    reproSteps:
      "Complete the end-to-end task creation flow. Backend " +
      "(backend/controllers/taskController.js): create a task from the " +
      "request body using the existing Mongoose model, persist it, return " +
      "the new document with HTTP 201, and return an appropriate error " +
      "response if persistence fails. Frontend " +
      "(frontend/src/components/TaskBoard .jsx): build the payload expected " +
      "by the backend, send it to the existing endpoint, use the server " +
      "response when updating Redux, and preserve existing " +
      "authentication/error behavior.",
    category: "api-contract",
    layer: "fullstack",
    difficulty: "hard",
    hints: [],
    baseRepoSlug: "mern_task_manager",
    overlaySlug: "task-creation",
  },
  {
    title: "Task Drag & Reorder (Full Stack)",
    reproSteps:
      "Complete the end-to-end drag-and-reorder flow. Backend " +
      "(backend/controllers/taskController.js): persist requested task " +
      "status/order changes via reorderTasks, without partially succeeding " +
      "silently on failure. Frontend " +
      "(frontend/src/components/TaskBoard .jsx): onDragEnd must correctly " +
      "identify the dragged task, map the destination to a status, and call " +
      "the reorder endpoint with the right payload.",
    category: "state",
    layer: "fullstack",
    difficulty: "hard",
    hints: [],
    baseRepoSlug: "mern_task_manager",
    overlaySlug: "drag-reorder",
  },
];

async function seed() {
  await mongoose.connect(DB_URL);
  console.log("Connected to database");

  await Repo.findOneAndUpdate({ slug: repo.slug }, repo, {
    upsert: true,
    new: true,
  });
  console.log("Repo seeded:", repo.slug);

  for (const q of questions) {
    await Question.findOneAndUpdate({ overlaySlug: q.overlaySlug }, q, {
      upsert: true,
      new: true,
    });
    console.log("Question seeded:", q.overlaySlug);
  }

  console.log("Done.");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
