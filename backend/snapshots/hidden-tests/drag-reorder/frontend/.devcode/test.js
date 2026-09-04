import fs from "node:fs";
import { getDragUpdate } from "../src/utils/dragDropLogic.js";
import taskReducer, {
  setTasks,
  addTask,
  updateTask,
  removeTask,
} from "../src/redux/features/task/taskSlice.js";

const results = [];

function check(name, condition, detail = "") {
  results.push({ name, pass: !!condition, detail });
}

function extractOnDragEnd() {
  const source = fs.readFileSync(
    new URL("../src/components/TaskBoard.jsx", import.meta.url),
    "utf8"
  );

  const startMarker = "const onDragEnd = async (result) => {";
  const endMarker = "};";

  const startIdx = source.indexOf(startMarker);
  const endIdx = source.indexOf(endMarker, startIdx);

  if (startIdx === -1) {
    throw new Error("Could not find onDragEnd function in TaskBoard.jsx");
  }

  if (endIdx === -1) {
    throw new Error("Could not find the end of onDragEnd function");
  }

  return source.slice(startIdx + startMarker.length, endIdx);
}

const baseTasks = [
  { _id: "todo-1", title: "Plan test", status: "To Do" },
  { _id: "progress-1", title: "Build utility", status: "In Progress" },
  { _id: "done-1", title: "Ship change", status: "Done" },
];

const mockAxios = {
  put: () => {
    return Promise.resolve({
      data: {
        _id: "todo-1",
        status: "In Progress",
      },
    });
  },
};

const mockDispatch = () => {};
const mockLogout = () => {};
const mockNavigate = () => {};
const mockSetError = () => {};

async function runOnDragEnd(result, overrides = {}) {
  const {
    tasks = baseTasks,
    axios = mockAxios,
    API_URL = "",
    dispatch = mockDispatch,
    logout = mockLogout,
    navigate = mockNavigate,
    setError = mockSetError,
    getDragUpdateFn = getDragUpdate,
    setTasksFn = setTasks,
    addTaskFn = addTask,
    updateTaskFn = updateTask,
    removeTaskFn = removeTask,
  } = overrides;

  const onDragEndBody = extractOnDragEnd();

  const fn = new Function(
    "result",
    "tasks",
    "axios",
    "API_URL",
    "dispatch",
    "logout",
    "navigate",
    "setError",
    "getDragUpdate",
    "setTasks",
    "addTask",
    "updateTask",
    "removeTask",
    `
      return (async () => {
        ${onDragEndBody}
      })();
    `
  );

  return fn(
    result,
    tasks,
    axios,
    API_URL,
    dispatch,
    logout,
    navigate,
    setError,
    getDragUpdateFn,
    setTasksFn,
    addTaskFn,
    updateTaskFn,
    removeTaskFn
  );
}

async function run() {
  // Test 1: No destination - should do nothing
  {
    const axiosCalls = [];
    const dispatchCalls = [];
    const navigateCalls = [];

    await runOnDragEnd(
      {
        source: { droppableId: "todo", index: 0 },
        destination: null,
      },
      {
        axios: {
          put: (url, data) => {
            axiosCalls.push({ url, data });
            return Promise.resolve({
              data: {
                _id: "todo-1",
                status: "In Progress",
              },
            });
          },
        },
        dispatch: (action) => dispatchCalls.push(action),
        navigate: (path) => navigateCalls.push(path),
      }
    );

    check(
      "ignores a drop with no destination",
      axiosCalls.length === 0 &&
        dispatchCalls.length === 0 &&
        navigateCalls.length === 0,
      `axios calls: ${axiosCalls.length}, dispatch calls: ${dispatchCalls.length}, navigate calls: ${navigateCalls.length}`
    );
  }

  // Test 2: Valid drag - should call API and update Redux
  {
    const axiosCalls = [];
    const navigateCalls = [];
    let reduxState = {
      tasks: baseTasks,
      loading: false,
      error: null,
    };
    const dispatchCalls = [];

    const dispatch = (action) => {
      dispatchCalls.push(action);
      reduxState = taskReducer(reduxState, action);
    };

    await runOnDragEnd(
      {
        source: { droppableId: "todo", index: 0 },
        destination: {
          droppableId: "inProgress",
          index: 1,
        },
      },
      {
        axios: {
          put: (url, data) => {
            axiosCalls.push({ url, data });

            return Promise.resolve({
              data: {
                _id: "todo-1",
                status: "In Progress",
              },
            });
          },
        },
        dispatch,
        navigate: (path) => navigateCalls.push(path),
      }
    );

    check(
      "sends the reordered task to the reorder endpoint",
      axiosCalls.length === 1 &&
        axiosCalls[0].url === "/api/v1/tasks/reorder" &&
        axiosCalls[0].data?.tasks?.length === 1 &&
        axiosCalls[0].data.tasks[0].id === "todo-1" &&
        axiosCalls[0].data.tasks[0].status === "In Progress",
      `got ${JSON.stringify(axiosCalls)}`
    );

    check(
      "updates Redux after a successful reorder",
      reduxState.tasks.some(
        (task) =>
          task._id === "todo-1" &&
          task.status === "In Progress"
      ),
      `state: ${JSON.stringify(reduxState)}`
    );

    check(
      "does not navigate away after a successful reorder",
      navigateCalls.length === 0,
      `navigate calls: ${JSON.stringify(navigateCalls)}`
    );
  }

  // Test 3: 401 error - should logout and navigate to login
  {
    const logoutCalls = [];
    const navigateCalls = [];
    let setErrorCalled = false;

    await runOnDragEnd(
      {
        source: { droppableId: "todo", index: 0 },
        destination: {
          droppableId: "inProgress",
          index: 1,
        },
      },
      {
        axios: {
          put: () => {
            const error = new Error("Unauthorized");
            error.response = { status: 401 };
            return Promise.reject(error);
          },
        },
        logout: () => logoutCalls.push(true),
        navigate: (path) => navigateCalls.push(path),
        setError: () => {
          setErrorCalled = true;
        },
      }
    );

    check(
      "logs out and navigates on 401",
      logoutCalls.length > 0 &&
        navigateCalls.includes("/login") &&
        !setErrorCalled,
      `logout calls: ${logoutCalls.length}, navigate calls: ${JSON.stringify(
        navigateCalls
      )}, setError called: ${setErrorCalled}`
    );
  }

  // Test 4: Other API error - should set error
  {
    const logoutCalls = [];
    const navigateCalls = [];
    let setErrorCalled = false;

    await runOnDragEnd(
      {
        source: { droppableId: "todo", index: 0 },
        destination: {
          droppableId: "inProgress",
          index: 1,
        },
      },
      {
        axios: {
          put: () => {
            const error = new Error("Server error");
            error.response = { status: 500 };
            return Promise.reject(error);
          },
        },
        logout: () => logoutCalls.push(true),
        navigate: (path) => navigateCalls.push(path),
        setError: () => {
          setErrorCalled = true;
        },
      }
    );

    check(
      "surfaces other API errors",
      setErrorCalled &&
        logoutCalls.length === 0 &&
        navigateCalls.length === 0,
      `setError called: ${setErrorCalled}, logout calls: ${logoutCalls.length}, navigate calls: ${JSON.stringify(
        navigateCalls
      )}`
    );
  }

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

run().catch((error) => {
  console.error("Test run crashed:", error);
  process.exit(1);
});