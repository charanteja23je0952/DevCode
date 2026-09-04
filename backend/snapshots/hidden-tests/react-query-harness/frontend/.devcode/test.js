import { createServer } from "node:http";
import React from "react";
import ReactTestRenderer, { act } from "react-test-renderer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createTask,
  getTasks,
  useCreateTask,
  useGetTasks,
} from "../src/helper.js";

const results = [];

function check(name, condition, detail = "") {
  results.push({ name, pass: !!condition, detail });
}

async function waitFor(
  conditionFn,
  { timeout = 2000, interval = 25 } = {}
) {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    if (conditionFn()) return true;

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, interval));
    });
  }

  return conditionFn();
}

function createMockBackend() {
  let tasks = [
    { _id: "task-1", title: "Read helper", status: "To Do" },
    { _id: "task-2", title: "Write test", status: "Done" },
  ];

  let failPosts = false;
  const requestLog = [];

  const server = createServer((req, res) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      requestLog.push({
        method: req.method,
        url: req.url,
      });

      res.setHeader("Content-Type", "application/json");

      if (req.method === "GET" && req.url === "/api/v1/tasks") {
        res.writeHead(200);
        res.end(JSON.stringify(tasks));
        return;
      }

      if (req.method === "POST" && req.url === "/api/v1/tasks") {
        if (failPosts) {
          res.writeHead(500);
          res.end(JSON.stringify({ message: "create failed" }));
          return;
        }

        const parsed = body ? JSON.parse(body) : {};
        const created = {
          _id: "task-created",
          ...parsed,
        };

        tasks = [...tasks, created];

        res.writeHead(201);
        res.end(JSON.stringify(created));
        return;
      }

      res.writeHead(404);
      res.end(JSON.stringify({ message: "not found" }));
    });
  });

  return {
    requestLog,

    setTasks(nextTasks) {
      tasks = nextTasks;
    },

    setFailPosts(value) {
      failPosts = value;
    },

    start() {
      return new Promise((resolve, reject) => {
        server.once("error", reject);
        server.listen(3000, "127.0.0.1", resolve);
      });
    },

    stop() {
      if (!server.listening) {
        return Promise.resolve();
      }

      return new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
    },
  };
}

async function run() {
  // ------------------------------------------------------------
  // Direct helper checks
  // ------------------------------------------------------------

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

  const created = {
    _id: "task-3",
    ...newTask,
  };

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
    await getTasks({
      get: async () => {
        throw requestError;
      },
    });
  } catch (error) {
    getRejected = error === requestError;
  }

  check(
    "getTasks exposes request failures to its caller",
    getRejected
  );

  let createRejected = false;

  try {
    await createTask(newTask, {
      post: async () => {
        throw requestError;
      },
    });
  } catch (error) {
    createRejected = error === requestError;
  }

  check(
    "createTask exposes request failures to its caller",
    createRejected
  );

  // ------------------------------------------------------------
  // Real hook checks
  // ------------------------------------------------------------

  const backend = createMockBackend();
  await backend.start();

  let renderer;
  let errorRenderer;

  try {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    });

    let latestGet = null;
    let latestCreate = null;

    function Harness() {
      latestGet = useGetTasks();
      latestCreate = useCreateTask();
      return null;
    }

    await act(async () => {
      renderer = ReactTestRenderer.create(
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          React.createElement(Harness)
        )
      );
    });

    await waitFor(
      () => latestGet && latestGet.isLoading === false
    );

    check(
      "useGetTasks fetches and exposes the tasks list",
      Array.isArray(latestGet?.data) &&
        latestGet.data.length === 2 &&
        latestGet.data.some((t) => t._id === "task-1") &&
        backend.requestLog.some(
          (r) => r.method === "GET" && r.url === "/api/v1/tasks"
        ),
      `got data ${JSON.stringify(latestGet?.data)}, requests ${JSON.stringify(
        backend.requestLog
      )}`
    );

    check(
      "useGetTasks exposes real query state",
      typeof latestGet?.isLoading === "boolean" &&
        latestGet?.isError === false,
      `got isLoading=${latestGet?.isLoading}, isError=${latestGet?.isError}`
    );

    // ----------------------------------------------------------
    // Refetch behavior
    // ----------------------------------------------------------

    backend.setTasks([
      ...tasks,
      {
        _id: "task-3",
        title: "Added externally",
        status: "To Do",
      },
    ]);

    await act(async () => {
      await latestGet.refetch();
    });

    await waitFor(
      () =>
        Array.isArray(latestGet?.data) &&
        latestGet.data.some(
          (task) => task._id === "task-3"
        )
    );

    check(
      "useGetTasks refetches the tasks query",
      Array.isArray(latestGet?.data) &&
        latestGet.data.some(
          (task) => task._id === "task-3"
        ),
      `got data ${JSON.stringify(latestGet?.data)}`
    );

    // ----------------------------------------------------------
    // Successful mutation
    // ----------------------------------------------------------

    backend.requestLog.length = 0;

    await act(async () => {
      latestCreate.mutate({
        title: "Created via hook",
        description: "test",
        status: "To Do",
        priority: "Medium",
      });
    });

    await waitFor(
      () => latestCreate && latestCreate.isPending === false
    );

    check(
      "useCreateTask posts to the tasks endpoint",
      backend.requestLog.some(
        (request) =>
          request.method === "POST" &&
          request.url === "/api/v1/tasks"
      ),
      `got requests ${JSON.stringify(backend.requestLog)}`
    );

    check(
      "useCreateTask exposes settled mutation state",
      latestCreate?.isPending === false &&
        latestCreate?.isError === false,
      `got isPending=${latestCreate?.isPending}, isError=${latestCreate?.isError}`
    );

    await waitFor(
      () =>
        Array.isArray(latestGet?.data) &&
        latestGet.data.some(
          (task) => task.title === "Created via hook"
        )
    );

    check(
      "a created task becomes observable through the tasks query without a manual refresh",
      Array.isArray(latestGet?.data) &&
        latestGet.data.some(
          (task) => task.title === "Created via hook"
        ),
      `got data ${JSON.stringify(latestGet?.data)}`
    );

    // ----------------------------------------------------------
    // Mutation error behavior
    // ----------------------------------------------------------

    backend.setFailPosts(true);

    await act(async () => {
      latestCreate.mutate({
        title: "This should fail",
        description: "test",
        status: "To Do",
        priority: "Medium",
      });
    });

    await waitFor(
      () =>
        latestCreate &&
        latestCreate.isPending === false &&
        latestCreate.isError === true
    );

    check(
      "useCreateTask exposes request failures through mutation error state",
      latestCreate?.isPending === false &&
        latestCreate?.isError === true &&
        !!latestCreate?.error,
      `got isPending=${latestCreate?.isPending}, isError=${latestCreate?.isError}, error=${latestCreate?.error}`
    );

    // ----------------------------------------------------------
    // Query error behavior
    // ----------------------------------------------------------

    await backend.stop();

    const errorQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    });

    let latestErrorGet = null;

    function ErrorHarness() {
      latestErrorGet = useGetTasks();
      return null;
    }

    await act(async () => {
      errorRenderer = ReactTestRenderer.create(
        React.createElement(
          QueryClientProvider,
          { client: errorQueryClient },
          React.createElement(ErrorHarness)
        )
      );
    });

    await waitFor(
      () =>
        latestErrorGet &&
        latestErrorGet.isLoading === false,
      { timeout: 3000 }
    );

    check(
      "useGetTasks surfaces request failures through isError/error",
      latestErrorGet?.isError === true &&
        !!latestErrorGet?.error,
      `got isError=${latestErrorGet?.isError}, error=${latestErrorGet?.error}`
    );
  } finally {
    await act(async () => {
      renderer?.unmount();
      errorRenderer?.unmount();
    });

    await backend.stop().catch(() => {});
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