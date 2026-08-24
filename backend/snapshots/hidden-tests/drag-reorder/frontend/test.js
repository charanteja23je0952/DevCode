import fs from "node:fs";
import { getDragUpdate } from "./src/utils/dragDropLogic.js";

const results = [];
function check(name, condition, detail = "") {
  results.push({ name, pass: !!condition, detail });
}

function assertSourceContract() {
  const source = fs.readFileSync(
    new URL("./src/components/TaskBoard.jsx", import.meta.url),
    "utf8"
  );
  check('reorder handler exists and uses the drag utility', source.includes("const onDragEnd = async (result)") && source.includes("getDragUpdate(result, tasks)"), 'TaskBoard must implement the reorder handler');
  check('reorder handler persists the status through the reorder endpoint', source.includes("axios.put(`${API_URL}/api/v1/tasks/reorder`"), 'TaskBoard must persist the reordered task');
  check('reorder handler updates Redux after success', source.includes("dispatch(updateTask(updatedTask))"), 'TaskBoard must update Redux after a successful request');
  check('reorder handler handles authentication failures', source.includes("err.response.status === 401") && source.includes('navigate("/login")'), 'TaskBoard must preserve 401 handling');
}

function run() {
  assertSourceContract();
  const todoTask = { _id: "todo-1", title: "Plan test", status: "To Do" };
  const inProgressTask = {
    _id: "progress-1",
    title: "Build utility",
    status: "In Progress",
  };
  const doneTask = { _id: "done-1", title: "Ship change", status: "Done" };
  const tasks = [todoTask, inProgressTask, doneTask];

  const noDestination = getDragUpdate(
    { source: { droppableId: "todo", index: 0 }, destination: null },
    tasks
  );
  check(
    "frontend ignores drops without a destination",
    noDestination === null,
    `got ${JSON.stringify(noDestination)}`
  );

  const movedToProgress = getDragUpdate(
    {
      source: { droppableId: "todo", index: 0 },
      destination: { droppableId: "inProgress", index: 1 },
    },
    tasks
  );
  check(
    "frontend finds the task at the source column and index",
    movedToProgress?._id === "todo-1" && movedToProgress.title === "Plan test",
    `got ${JSON.stringify(movedToProgress)}`
  );
  check(
    "frontend maps the inProgress destination to In Progress",
    movedToProgress?.status === "In Progress",
    `got ${JSON.stringify(movedToProgress)}`
  );
  check(
    "frontend does not mutate the current task collection",
    todoTask.status === "To Do" && tasks.length === 3,
    `got ${JSON.stringify(tasks)}`
  );

  const movedToDone = getDragUpdate(
    {
      source: { droppableId: "inProgress", index: 0 },
      destination: { droppableId: "done", index: 1 },
    },
    tasks
  );
  check(
    "frontend maps the done destination to Done",
    movedToDone?._id === "progress-1" && movedToDone.status === "Done",
    `got ${JSON.stringify(movedToDone)}`
  );

  const movedToTodo = getDragUpdate(
    {
      source: { droppableId: "done", index: 0 },
      destination: { droppableId: "todo", index: 0 },
    },
    tasks
  );
  check(
    "frontend maps the todo destination to To Do",
    movedToTodo?._id === "done-1" && movedToTodo.status === "To Do",
    `got ${JSON.stringify(movedToTodo)}`
  );

  const invalidSource = getDragUpdate(
    {
      source: { droppableId: "todo", index: 4 },
      destination: { droppableId: "done", index: 0 },
    },
    tasks
  );
  check(
    "frontend ignores invalid task or column references",
    invalidSource === null,
    `got ${JSON.stringify(invalidSource)}`
  );

  const failed = results.filter((result) => !result.pass);
  for (const result of results) {
    console.log(
      (result.pass ? "PASS - " : "FAIL - ") + result.name +
        (result.pass ? "" : ` (${result.detail})`)
    );
  }
  if (failed.length > 0) {
    console.log(`\n${failed.length} test(s) failed.`);
    process.exit(1);
  }
  console.log("\nAll tests passed.");
  process.exit(0);
}

run();
