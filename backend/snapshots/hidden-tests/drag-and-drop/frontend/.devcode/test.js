import assert from "node:assert/strict";
import { getDragUpdate } from "../src/utils/dragDropLogic.js";

function test(name, fn) {
  try {
    fn();
    console.log(`PASS - ${name}`);
  } catch (error) {
    console.error(`FAIL - ${name}`);
    console.error(`  ${error.message}`);
    process.exitCode = 1;
  }
}

const tasks = [
  { _id: "todo-1", title: "Plan test", status: "To Do" },
  { _id: "progress-1", title: "Build utility", status: "In Progress" },
  { _id: "done-1", title: "Ship change", status: "Done" },
];

test("returns null when a drop has no destination", () => {
  assert.equal(
    getDragUpdate(
      { source: { droppableId: "todo", index: 0 }, destination: null },
      tasks
    ),
    null
  );
});

test("finds the dragged task from its source column and index", () => {
  const result = getDragUpdate(
    {
      source: { droppableId: "todo", index: 0 },
      destination: { droppableId: "inProgress", index: 1 },
    },
    tasks
  );

  assert.equal(result?._id, "todo-1");
  assert.equal(result?.title, "Plan test");
});

test("maps inProgress to In Progress", () => {
  const result = getDragUpdate(
    {
      source: { droppableId: "todo", index: 0 },
      destination: { droppableId: "inProgress", index: 0 },
    },
    tasks
  );

  assert.equal(result?.status, "In Progress");
});

test("maps done to Done", () => {
  const result = getDragUpdate(
    {
      source: { droppableId: "inProgress", index: 0 },
      destination: { droppableId: "done", index: 0 },
    },
    tasks
  );

  assert.equal(result?._id, "progress-1");
  assert.equal(result?.status, "Done");
});

test("maps todo to To Do", () => {
  const result = getDragUpdate(
    {
      source: { droppableId: "done", index: 0 },
      destination: { droppableId: "todo", index: 0 },
    },
    tasks
  );

  assert.equal(result?._id, "done-1");
  assert.equal(result?.status, "To Do");
});

test("returns null for an invalid task reference", () => {
  assert.equal(
    getDragUpdate(
      {
        source: { droppableId: "todo", index: 10 },
        destination: { droppableId: "done", index: 0 },
      },
      tasks
    ),
    null
  );
});

test("returns null for an invalid column reference", () => {
  assert.equal(
    getDragUpdate(
      {
        source: { droppableId: "unknown", index: 0 },
        destination: { droppableId: "done", index: 0 },
      },
      tasks
    ),
    null
  );
});

test("does not mutate the source task or task array", () => {
  const original = JSON.parse(JSON.stringify(tasks));

  const result = getDragUpdate(
    {
      source: { droppableId: "todo", index: 0 },
      destination: { droppableId: "done", index: 0 },
    },
    tasks
  );

  assert.notEqual(result, tasks[0]);
  assert.deepEqual(tasks, original);
});

if (process.exitCode) process.exit(1);
console.log("\nAll tests passed.");
