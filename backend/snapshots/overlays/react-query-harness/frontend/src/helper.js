// React Query helpers used by the query harness.

import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const baseURL =
  import.meta.env?.VITE_BACKEND_BASE_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: `${baseURL}/api/v1`,
  withCredentials: true,
});

export const getTasks = (client = api) => {
  // TODO: Fetch and return tasks through the existing API client.
  return Promise.resolve([]);
};

export const createTask = (task, client = api) => {
  // TODO: Create a task through the existing API client and return it.
  return Promise.resolve({});
};

export const useGetTasks = () => {
  // TODO: Implement the task query.
  //
  // Requirements:
  // - Use React Query.
  // - Fetch tasks using getTasks().
  // - Use the "tasks" query key.
  // - Expose the normal query state to the harness.
  return {
    data: [],
    isLoading: false,
    isError: false,
    error: null,
    refetch: () => {},
  };
};

export const useCreateTask = () => {
  // TODO: Implement the task creation mutation.
  //
  // Requirements:
  // - Use React Query.
  // - Use createTask() as the mutation function.
  // - Make the newly-created task observable through the "tasks" query.
  // - Preserve useful mutation state such as isPending and isError.
  //
  // The surrounding harness is intentionally complete; only this hook
  // implementation is missing.
  return {
    mutate: () => {},
    isPending: false,
    isError: false,
    error: null,
  };
};
