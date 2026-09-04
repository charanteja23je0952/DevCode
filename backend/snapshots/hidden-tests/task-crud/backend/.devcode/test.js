import taskModel from "../models/Task.js";
import { createTask, deleteTask } from "../controllers/taskController.js";

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
  const createReq = {
    body: {
      title: "Write the hidden test",
      description: "Testing createTask",
      status: "To Do",
      priority: "Medium",
    },
  };
  const createRes = mockRes();
  await createTask(createReq, createRes);

  check(
    "createTask returns 201 on success",
    createRes.statusCode === 201,
    `got status ${createRes.statusCode}`
  );
  check(
    "createTask response body has the submitted title",
    createRes.body?.title === "Write the hidden test",
    `got body ${JSON.stringify(createRes.body)}`
  );
  check(
    "createTask response includes a generated _id",
    !!createRes.body?._id,
    `got body ${JSON.stringify(createRes.body)}`
  );

  const allTasks = await taskModel.find();
  const persisted = allTasks.find((t) => t.title === "Write the hidden test");
  check(
    "created task is actually persisted in the store",
    !!persisted,
    `store has ${allTasks.length} task(s)`
  );

  const badCreateReq = { body: { title: "ab" } };
  const badCreateRes = mockRes();
  await createTask(badCreateReq, badCreateRes);
  check(
    "createTask rejects invalid data with a non-2xx status",
    badCreateRes.statusCode >= 400 && badCreateRes.statusCode < 500,
    `got status ${badCreateRes.statusCode}`
  );

  {
    const originalSave = taskModel.prototype.save;
    const res = mockRes();
    taskModel.prototype.save = async function () {
      throw new Error("simulated persistence failure");
    };

    try {
      await createTask(
        { body: { title: "Database failure task" } },
        res
      );
    } finally {
      taskModel.prototype.save = originalSave;
    }

    check(
      "createTask returns an error when database persistence fails",
      res.statusCode >= 400 && res.statusCode < 500,
      `got status ${res.statusCode}, body ${JSON.stringify(res.body)}`
    );
  }

  const toDelete = new taskModel({ title: "Task to be deleted" });
  await toDelete.save();

  const deleteReq = { params: { id: toDelete._id.toString() } };
  const deleteRes = mockRes();
  await deleteTask(deleteReq, deleteRes);

  check(
    "deleteTask returns 200 on success",
    deleteRes.statusCode === 200,
    `got status ${deleteRes.statusCode}`
  );

  const afterDelete = await taskModel.findById(toDelete._id.toString());
  check(
    "deleted task is actually removed from the store",
    afterDelete === null,
    `findById returned ${JSON.stringify(afterDelete)}`
  );

  const missingReq = { params: { id: "000000000000000000000000" } };
  const missingRes = mockRes();
  await deleteTask(missingReq, missingRes);
  check(
    "deleteTask returns 404 for a task that doesn't exist",
    missingRes.statusCode === 404,
    `got status ${missingRes.statusCode}`
  );

  {
    const originalDelete = taskModel.findByIdAndDelete;
    const res = mockRes();
    taskModel.findByIdAndDelete = async () => {
      throw new Error("simulated persistence failure");
    };

    try {
      await deleteTask(
        { params: { id: "507f1f77bcf86cd799439011" } },
        res
      );
    } finally {
      taskModel.findByIdAndDelete = originalDelete;
    }

    check(
      "deleteTask returns an error when database deletion fails",
      res.statusCode >= 400 && res.statusCode < 500,
      `got status ${res.statusCode}, body ${JSON.stringify(res.body)}`
    );
  }

  const failed = results.filter((r) => !r.pass);
  for (const r of results) {
    console.log(
      (r.pass ? "PASS - " : "FAIL - ") +
        r.name +
        (r.pass ? "" : ` (${r.detail})`)
    );
  }

  if (failed.length > 0) {
    console.log(`\n${failed.length} test(s) failed.`);
    process.exit(1);
  }

  console.log("\nAll tests passed.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
