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
  const firstTask = await new taskModel({
    title: "Move this task first",
    status: "To Do",
  }).save();
  const secondTask = await new taskModel({
    title: "Move this task second",
    status: "In Progress",
  }).save();

  const reorderRes = mockRes();
  await reorderTasks(
    {
      body: {
        tasks: [
          { id: firstTask._id.toString(), status: "Done" },
          { id: secondTask._id.toString(), status: "To Do" },
        ],
      },
    },
    reorderRes
  );

  check(
    "reorderTasks returns 200 after every task is updated",
    reorderRes.statusCode === 200,
    `got status ${reorderRes.statusCode}`
  );
  check(
    "reorderTasks returns a success message",
    reorderRes.statusCode === 200 &&
      typeof reorderRes.body?.message === "string" &&
      reorderRes.body.message.length > 0,
    `got body ${JSON.stringify(reorderRes.body)}`
  );

  const persistedFirst = await taskModel.findById(firstTask._id.toString());
  const persistedSecond = await taskModel.findById(secondTask._id.toString());
  check(
    "first task status is persisted",
    persistedFirst?.status === "Done",
    `got ${persistedFirst?.status}`
  );
  check(
    "second task status is persisted",
    persistedSecond?.status === "To Do",
    `got ${persistedSecond?.status}`
  );

  const missingRes = mockRes();
  await reorderTasks(
    {
      body: {
        tasks: [{ id: "000000000000000000000000", status: "Done" }],
      },
    },
    missingRes
  );
  check(
    "reorderTasks returns 404 when a requested task does not exist",
    missingRes.statusCode === 404,
    `got status ${missingRes.statusCode}`
  );

  const malformedRes = mockRes();
  await reorderTasks({ body: {} }, malformedRes);
  check(
    "reorderTasks rejects malformed input with a 4xx status",
    malformedRes.statusCode >= 400 && malformedRes.statusCode < 500,
    `got status ${malformedRes.statusCode}`
  );

  const partialFailureRes = mockRes();
  await reorderTasks(
    {
      body: {
        tasks: [
          { id: firstTask._id.toString(), status: "Done" },
          { id: "000000000000000000000000", status: "In Progress" },
        ],
      },
    },
    partialFailureRes
  );
  check(
    "reorderTasks does not report success when any requested update fails",
    partialFailureRes.statusCode >= 400 && partialFailureRes.statusCode < 500,
    `got status ${partialFailureRes.statusCode}`
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
