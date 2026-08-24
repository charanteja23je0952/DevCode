import fs from "node:fs";
import { buildNewTaskPayload } from "./src/utils/taskCreationLogic.js";

const results = [];
function check(name, condition, detail = "") {
  results.push({ name, pass: !!condition, detail });
}

function assertTaskBoardContract() {
  const source = fs.readFileSync(
    new URL("./src/components/TaskBoard.jsx", import.meta.url),
    "utf8"
  );

  check(
    "TaskBoard uses the task payload builder",
    source.includes("buildNewTaskPayload()"),
    "addNewTask must build the payload through buildNewTaskPayload"
  );
  check(
    "TaskBoard posts the new task to the task endpoint",
    source.includes("axios.post(`${API_URL}/api/v1/tasks`, newTask)"),
    "addNewTask must POST the payload to /tasks"
  );
  check(
    "TaskBoard adds the server-created task to Redux",
    source.includes("dispatch(addTask(response.data))"),
    "the server response must be used when updating Redux"
  );
  check(
    "TaskBoard preserves authentication failure handling",
    source.includes("err.response.status === 401") &&
      source.includes('navigate("/login")'),
    "401 responses must preserve the existing logout and redirect behavior"
  );
  check(
    "TaskBoard exposes non-authentication errors",
    source.includes("setError(err.message)"),
    "non-401 request errors must be exposed through the existing error state"
  );
}

function run() {
  assertTaskBoardContract();

  const fixedDate = new Date("2026-01-02T15:30:00.000Z");
  const payload = buildNewTaskPayload(fixedDate);

  check(
    "payload contains the expected title",
    payload.title === "New Task",
    `got ${payload.title}`
  );
  check(
    "payload contains the expected description",
    payload.description === "New Description",
    `got ${payload.description}`
  );
  check(
    "payload defaults to To Do status",
    payload.status === "To Do",
    `got ${payload.status}`
  );
  check(
    "payload defaults to Medium priority",
    payload.priority === "Medium",
    `got ${payload.priority}`
  );
  check(
    "payload contains an ISO-derived due date",
    payload.dueDate === "2026-01-02",
    `got ${payload.dueDate}`
  );

  const failed = results.filter((result) => !result.pass);
  for (const result of results) {
    console.log(
      (result.pass ? "PASS - " : "FAIL - ") +
        result.name +
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
