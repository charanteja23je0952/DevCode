import taskModel from "./models/Task.js";
import { createTask } from "./controllers/taskController.js";

function mockRes() {
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      res.statusCode = code;
      return res;
    },
    json(payload) {
      res.body = payload;
      return res;
    },
  };
  return res;
}

const results = [];
function check(name, condition, detail = "") {
  results.push({ name, pass: !!condition, detail });
}

async function run() {
  const payload = {
    title: "New Task",
    description: "New Description",
    status: "To Do",
    priority: "Medium",
    dueDate: "2026-08-13"
  };

  const createRes = mockRes();
  await createTask({ body: payload }, createRes);
  check(
    "backend createTask returns 201 with the created task",
    createRes.statusCode === 201 && createRes.body?._id,
    `got status ${createRes.statusCode}, body ${JSON.stringify(createRes.body)}`
  );
  check(
    "backend returns fields supplied by the frontend payload",
    createRes.body?.title === payload.title &&
      createRes.body?.status === payload.status &&
      createRes.body?.dueDate?.toISOString?.().startsWith("2026-08-13"),
    `got ${JSON.stringify(createRes.body)}`
  );

  const persisted = await taskModel.findById(createRes.body?._id);
  check(
    "backend createTask actually persists the document",
    persisted?.title === "New Task" &&
      persisted?.status === "To Do" &&
      persisted?.priority === "Medium",
    `got ${JSON.stringify(persisted)}`
  );

  const invalidRes = mockRes();
  await createTask({ body: { title: "no" } }, invalidRes);
  check(
    "backend createTask returns a 4xx response for invalid data",
    invalidRes.statusCode >= 400 && invalidRes.statusCode < 500,
    `got status ${invalidRes.statusCode}`
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
