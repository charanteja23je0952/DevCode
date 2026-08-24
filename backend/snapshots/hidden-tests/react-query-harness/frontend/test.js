import fs from "node:fs";
import { createTask, getTasks } from "./src/helper.js";

const results = [];
function check(name, condition, detail = "") {
  results.push({ name, pass: !!condition, detail });
}

function assertSourceContract() {
  const source = fs.readFileSync(
    new URL("./src/helper.js", import.meta.url),
    "utf8"
  );

  check(
    "useGetTasks is implemented with React Query",
    source.includes("useQuery({") &&
      source.includes("queryKey: [\"tasks\"]") &&
      source.includes("queryFn: getTasks"),
    "useGetTasks must use the tasks query"
  );

  check(
    "useCreateTask is implemented with React Query",
    source.includes("useMutation({") && source.includes("mutationFn: createTask"),
    "useCreateTask must use createTask as its mutation function"
  );

  check(
    "task creation updates the tasks query after success",
    source.includes("invalidateQueries({ queryKey: [\"tasks\"] })"),
    "useCreateTask must make the created task observable through the tasks query"
  );

  check(
    "useGetTasks exposes the normal query result",
    /return\s+useQuery\s*\(/.test(source),
    "useGetTasks should return the React Query result directly"
  );

  check(
    "useCreateTask exposes the normal mutation result",
    /return\s+useMutation\s*\(/.test(source),
    "useCreateTask should return the React Query mutation result"
  );
}

async function run() {
  assertSourceContract();

  const tasks = [
    { _id: "task-1", title: "Read helper", status: "To Do" },
    { _id: "task-2", title: "Write test", status: "Done" },
  ];
  const getCalls = [];
  const getClient = {
    get: async (path) => {
      getCalls.push(path);
      return { data: tasks };
    },
  };

  const fetched = await getTasks(getClient);
  check(
    "getTasks requests the tasks endpoint",
    getCalls.length === 1 && getCalls[0] === "/tasks",
    `got ${JSON.stringify(getCalls)}`
  );
  check(
    "getTasks returns the API response data",
    fetched === tasks,
    `got ${JSON.stringify(fetched)}`
  );

  const newTask = {
    title: "Create through helper",
    description: "Plain Node test",
    status: "To Do",
    priority: "Medium",
  };
  const created = { _id: "task-3", ...newTask };
  const postCalls = [];
  const postClient = {
    post: async (path, body) => {
      postCalls.push({ path, body });
      return { data: created };
    },
  };

  const result = await createTask(newTask, postClient);
  check(
    "createTask posts the submitted task to the tasks endpoint",
    postCalls.length === 1 &&
      postCalls[0].path === "/tasks" &&
      postCalls[0].body === newTask,
    `got ${JSON.stringify(postCalls)}`
  );
  check(
    "createTask returns the server-created task",
    result === created && result._id === "task-3",
    `got ${JSON.stringify(result)}`
  );

  const requestError = new Error("Request failed");
  let getRejected = false;
  try {
    await getTasks({ get: async () => { throw requestError; } });
  } catch (error) {
    getRejected = error === requestError;
  }
  check("getTasks exposes request failures to its caller", getRejected);

  let createRejected = false;
  try {
    await createTask(newTask, { post: async () => { throw requestError; } });
  } catch (error) {
    createRejected = error === requestError;
  }
  check("createTask exposes request failures to its caller", createRejected);

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
