import fs from "node:fs";

const results = [];
function check(name, condition, detail = "") {
  results.push({ name, pass: !!condition, detail });
}

function extractLogicBlock() {
  const source = fs.readFileSync(
    new URL("./src/components/TaskBoard.jsx", import.meta.url),
    "utf8"
  );

  const startMarker = "const filteredTasks";
  const endMarker = "return (";
  const startIdx = source.indexOf(startMarker);
  const endIdx = source.indexOf(endMarker, startIdx);

  if (startIdx === -1) {
    throw new Error("Could not find `const filteredTasks` in TaskBoard.jsx.");
  }
  if (endIdx === -1) {
    throw new Error("Could not find the component JSX return after the filtering/sorting block.");
  }

  return source.slice(startIdx, endIdx);
}

function runBlock(blockSource, { tasks, searchTerm, sortBy, columns }) {
  const fn = new Function(
    "tasks",
    "searchTerm",
    "sortBy",
    "columns",
    `${blockSource}\nreturn { filteredTasks, sortedTasks, filteredColumns };`
  );

  return fn(tasks, searchTerm, sortBy, columns);
}

function buildColumns(tasks) {
  return {
    todo: {
      id: "todo",
      title: "TODO",
      tasks: tasks.filter((task) => task.status === "To Do"),
      extra: "preserve me",
    },
    inProgress: {
      id: "inProgress",
      title: "IN PROGRESS",
      tasks: tasks.filter((task) => task.status === "In Progress"),
    },
    done: {
      id: "done",
      title: "DONE",
      tasks: tasks.filter((task) => task.status === "Done"),
    },
  };
}

const sampleTasks = [
  {
    _id: "1",
    title: "Write report",
    description: "Quarterly summary",
    status: "To Do",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    _id: "2",
    title: "Fix bug",
    description: "Crash on login involving REPORT export",
    status: "In Progress",
    createdAt: "2026-01-03T00:00:00.000Z",
  },
  {
    _id: "3",
    title: "Buy groceries",
    description: "Milk, eggs, bread",
    status: "Done",
    createdAt: "2026-01-02T00:00:00.000Z",
  },
  {
    _id: "4",
    title: "Archive old tickets",
    description: "Cleanup backlog",
    status: "To Do",
  },
];

function run() {
  const blockSource = extractLogicBlock();

  // --- Search: title OR description, case-insensitive ---
  {
    const result = runBlock(blockSource, {
      tasks: sampleTasks,
      searchTerm: "REPORT",
      sortBy: "recent",
      columns: buildColumns(sampleTasks),
    });
    const ids = result.filteredTasks.map((task) => task._id).sort();
    check(
      "search matches title OR description case-insensitively",
      JSON.stringify(ids) === JSON.stringify(["1", "2"]),
      `expected ["1","2"], got ${JSON.stringify(ids)}`
    );
  }

  // --- Search: empty search returns everything ---
  {
    const result = runBlock(blockSource, {
      tasks: sampleTasks,
      searchTerm: "",
      sortBy: "recent",
      columns: buildColumns(sampleTasks),
    });
    check(
      "empty search term returns all tasks",
      result.filteredTasks.length === sampleTasks.length,
      `expected ${sampleTasks.length}, got ${result.filteredTasks.length}`
    );
  }

  // --- Sort: recent, newest first, missing createdAt last ---
  {
    const result = runBlock(blockSource, {
      tasks: sampleTasks,
      searchTerm: "",
      sortBy: "recent",
      columns: buildColumns(sampleTasks),
    });
    const order = result.sortedTasks.map((task) => task._id);
    check(
      "recent sort orders by createdAt descending and treats missing createdAt as oldest",
      JSON.stringify(order) === JSON.stringify(["2", "3", "1", "4"]),
      `expected ["2","3","1","4"], got ${JSON.stringify(order)}`
    );
  }

  // --- Sort: alphabetical ---
  {
    const result = runBlock(blockSource, {
      tasks: sampleTasks,
      searchTerm: "",
      sortBy: "alphabetical",
      columns: buildColumns(sampleTasks),
    });
    const order = result.sortedTasks.map((task) => task.title);
    const expected = [...sampleTasks.map((task) => task.title)].sort((a, b) =>
      a.localeCompare(b)
    );
    check(
      "alphabetical sort orders tasks by title",
      JSON.stringify(order) === JSON.stringify(expected),
      `expected ${JSON.stringify(expected)}, got ${JSON.stringify(order)}`
    );
  }

  // --- Column projection: filtered/sorted tasks only, metadata preserved ---
  {
    const result = runBlock(blockSource, {
      tasks: sampleTasks,
      searchTerm: "report",
      sortBy: "recent",
      columns: buildColumns(sampleTasks),
    });

    const todoIds = result.filteredColumns.todo.tasks.map((task) => task._id);
    const inProgressIds = result.filteredColumns.inProgress.tasks.map((task) => task._id);
    const doneIds = result.filteredColumns.done.tasks.map((task) => task._id);

    check(
      "filteredColumns contains only tasks matching the active search",
      JSON.stringify(todoIds) === JSON.stringify(["1"]) &&
        JSON.stringify(inProgressIds) === JSON.stringify(["2"]) &&
        JSON.stringify(doneIds) === JSON.stringify([]),
      `got todo=${JSON.stringify(todoIds)}, inProgress=${JSON.stringify(inProgressIds)}, done=${JSON.stringify(doneIds)}`
    );
    check(
      "filteredColumns preserves existing column metadata",
      result.filteredColumns.todo.id === "todo" &&
        result.filteredColumns.todo.title === "TODO" &&
        result.filteredColumns.todo.extra === "preserve me" &&
        result.filteredColumns.inProgress.id === "inProgress" &&
        result.filteredColumns.done.title === "DONE",
      `got ${JSON.stringify(result.filteredColumns)}`
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
}

run();
