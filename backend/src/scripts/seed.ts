
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
    title: "TaskBoard Search & Sorting",
    reproSteps:
      "Repair the filtering, sorting, and column-grouping logic in " +
      "frontend/src/components/TaskBoard.jsx. Search must match the task " +
      "title or description case-insensitively, including the empty-search " +
      "case. The recent sort must order by createdAt descending, treating " +
      "missing createdAt as the oldest value, while alphabetical sorting " +
      "must order by title. The rendered columns must contain only the " +
      "filtered tasks while preserving the existing column metadata and " +
      "selected sort order. Keep the existing API calls, Redux wiring, and " +
      "drag-and-drop behavior unchanged.",
    category: "state",
    layer: "frontend",
    difficulty: "medium",
    hints: [],
    baseRepoSlug: "mern_task_manager",
    overlaySlug: "redux-task-slice",
  },
  {
    title: "Drag-and-Drop Handler",
    reproSteps:
      "Restore the onDragEnd implementation in " +
      "frontend/src/utils/dragDropLogic.js. The backend is already " +
      "functional — keep this frontend-only. It must ignore invalid drops, " +
      "identify the dragged task, map the destination column to the task's " +
      "status, persist the change through the existing API, update Redux " +
      "from the successful server response, and expose other request errors " +
      "through the component's existing error state.",
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
      "handling. Expose request errors through the hook's error state and " +
      "support refetch for the tasks query.",
    category: "api-contract",
    layer: "frontend",
    difficulty: "medium",
    hints: [],
    baseRepoSlug: "mern_task_manager",
    overlaySlug: "react-query-harness",
  },
  {
    title: "Task Creation, User Signup & Login",
    reproSteps:
      "Repair three existing backend flows. In backend/controllers/taskController.js, " +
      "implement createTask using the existing Mongoose model, persist the " +
      "request body, return the created task with HTTP 201, and return an " +
      "appropriate 4xx response for invalid data or persistence failures. In " +
      "backend/controllers/userController.js, repair signupUser and loginUser " +
      "so both validate email and password, trim and lowercase the email before " +
      "lookup, generate the existing JWT cookie only after successful operation. " +
      "For signup: reject duplicate normalized emails with HTTP 400, hash the " +
      "password with bcrypt before persistence, and return HTTP 201 with success, " +
      "_id, and normalized email. For login: reject non-existent users with HTTP 404, " +
      "validate the password against the stored bcrypt hash, reject invalid passwords " +
      "with HTTP 401, and return HTTP 200 with _id and email. Keep logoutUser, routes, " +
      "models, and unrelated task operations unchanged.",
    category: "api-contract",
    layer: "backend",
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
      "(frontend/src/components/TaskBoard.jsx): onDragEnd must correctly " +
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
