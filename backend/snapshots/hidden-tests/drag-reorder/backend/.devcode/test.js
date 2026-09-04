import taskModel from "../models/Task.js";
import { reorderTasks } from "../controllers/taskController.js";

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
  const first = await new taskModel({ title: "Reorder first", status: "To Do" }).save();
  const second = await new taskModel({ title: "Reorder second", status: "Done" }).save();
  const res = mockRes();
  await reorderTasks(
    {
      body: {
        tasks: [
          { id: first._id.toString(), status: "In Progress" },
          { id: second._id.toString(), status: "To Do" },
        ],
      },
    },
    res
  );
  check("reorderTasks returns success after all changes persist", res.statusCode === 200, `got ${res.statusCode}`);
  check(
    "reorderTasks persists every requested status change",
    (await taskModel.findById(first._id))?.status === "In Progress" &&
      (await taskModel.findById(second._id))?.status === "To Do",
    "persisted statuses did not match requested changes"
  );

  const missingRes = mockRes();
  await reorderTasks(
    { body: { tasks: [{ id: "000000000000000000000000", status: "Done" }] } },
    missingRes
  );
  check(
    "reorderTasks does not silently succeed when persistence misses a task",
    missingRes.statusCode >= 400 && missingRes.statusCode < 500,
    `got ${missingRes.statusCode}`
  );

  const malformedRes = mockRes();
  await reorderTasks({ body: {} }, malformedRes);
  check(
    "reorderTasks returns a 4xx response for malformed changes",
    malformedRes.statusCode >= 400 && malformedRes.statusCode < 500,
    `got ${malformedRes.statusCode}`
  );

  const partialFailureRes = mockRes();
  await reorderTasks(
    {
      body: {
        tasks: [
          { id: first._id.toString(), status: "Done" },
          { id: "000000000000000000000000", status: "In Progress" },
        ],
      },
    },
    partialFailureRes
  );
  check(
    "reorderTasks does not report success when any requested update fails",
    partialFailureRes.statusCode >= 400 && partialFailureRes.statusCode < 500,
    `got ${partialFailureRes.statusCode}`
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
