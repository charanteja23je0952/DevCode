import taskReducer, {
  addTask,
  removeTask,
  setError,
  setLoading,
  setTasks,
  updateTask,
} from "./src/redux/features/task/taskSlice.js";

const results = [];
function check(name, condition, detail = "") {
  results.push({ name, pass: !!condition, detail });
}

function run() {
  const firstTask = { _id: "task-1", title: "First", status: "To Do" };
  const secondTask = { _id: "task-2", title: "Second", status: "Done" };

  let state = taskReducer(undefined, { type: "@@INIT" });
  state = taskReducer(state, setLoading(true));
  state = taskReducer(state, setError("Previous error"));
  state = taskReducer(state, setTasks([firstTask, secondTask]));
  check(
    "setTasks replaces tasks and clears loading and error",
    state.tasks.length === 2 &&
      state.tasks[0]._id === "task-1" &&
      state.loading === false &&
      state.error === null,
    `got ${JSON.stringify(state)}`
  );

  const thirdTask = { _id: "task-3", title: "Third", status: "To Do" };
  state = taskReducer(state, addTask(thirdTask));
  check(
    "addTask retains existing tasks and appends the new task",
    state.tasks.length === 3 &&
      state.tasks[0]._id === "task-1" &&
      state.tasks[2]._id === "task-3",
    `got ${JSON.stringify(state.tasks)}`
  );

  const updatedSecond = { _id: "task-2", title: "Second revised", status: "In Progress" };
  state = taskReducer(state, updateTask(updatedSecond));
  check(
    "updateTask replaces only the matching task by _id",
    state.tasks[0] === firstTask &&
      state.tasks[1].title === "Second revised" &&
      state.tasks[1].status === "In Progress" &&
      state.tasks[2] === thirdTask,
    `got ${JSON.stringify(state.tasks)}`
  );

  const beforeUnknownUpdate = state.tasks;
  state = taskReducer(state, updateTask({ _id: "missing", title: "Ignored" }));
  check(
    "updateTask leaves tasks unchanged when _id is absent",
    state.tasks.length === 3 && state.tasks[1].title === "Second revised",
    `got ${JSON.stringify(state.tasks)}; before ${JSON.stringify(beforeUnknownUpdate)}`
  );

  state = taskReducer(state, removeTask("task-2"));
  check(
    "removeTask removes only the task matching the payload _id",
    state.tasks.length === 2 &&
      state.tasks.some((task) => task._id === "task-1") &&
      state.tasks.some((task) => task._id === "task-3") &&
      !state.tasks.some((task) => task._id === "task-2"),
    `got ${JSON.stringify(state.tasks)}`
  );

  state = taskReducer(state, setLoading(true));
  check("setLoading updates loading", state.loading === true, `got ${state.loading}`);

  state = taskReducer(state, setError("Request failed"));
  check(
    "setError stores the error and clears loading",
    state.error === "Request failed" && state.loading === false,
    `got ${JSON.stringify(state)}`
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
