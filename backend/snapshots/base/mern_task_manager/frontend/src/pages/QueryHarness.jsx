import { useState } from "react";
import { useCreateTask, useGetTasks } from "../helper";

const QueryHarness = () => {
  const [errorMessage, setErrorMessage] = useState("");

  const {
    data: tasks = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetTasks();

  const createTaskMutation = useCreateTask();

  const handleCreate = () => {
    setErrorMessage("");

    createTaskMutation.mutate(
      {
        title: `Harness Task ${Date.now()}`,
        description: "Created from the React Query harness",
        status: "To Do",
        priority: "Medium",
        dueDate: new Date().toISOString().split("T")[0],
      },
      {
        onError: (err) => {
          setErrorMessage(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to create task"
          );
        },
      }
    );
  };

  if (isLoading) {
    return <div className="p-6">Loading tasks...</div>;
  }

  if (isError) {
    return (
      <div className="p-6">
        <p className="text-red-600">
          Failed to load tasks: {error?.message || "Unknown error"}
        </p>

        <button
          onClick={() => refetch()}
          className="mt-4 rounded bg-blue-500 px-4 py-2 text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold">React Query Harness</h1>

      <button
        onClick={handleCreate}
        disabled={createTaskMutation.isPending}
        className="mb-6 rounded bg-blue-500 px-4 py-2 text-white disabled:opacity-50"
      >
        {createTaskMutation.isPending ? "Creating..." : "Create Task"}
      </button>

      {errorMessage && (
        <p className="mb-4 text-red-600">{errorMessage}</p>
      )}

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <p>No tasks found.</p>
        ) : (
          tasks.map((task) => (
            <div key={task._id || task.id} className="rounded border p-4">
              <p className="font-semibold">{task.title}</p>
              <p className="text-sm text-gray-600">{task.description}</p>
              <p className="text-sm">
                Status: {task.status}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default QueryHarness;