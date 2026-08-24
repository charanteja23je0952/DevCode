// this file I have added, will make use of it to modify task related calls with react query further

import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const baseURL =
  import.meta.env?.VITE_BACKEND_BASE_URL || "http://localhost:3000";

// Axios instance
const api = axios.create({
  baseURL: `${baseURL}/api/v1`,
  withCredentials: true,
});

// API calls
export const getTasks = (client = api) =>
  client.get("/tasks").then((response) => response.data);
export const createTask = (task, client = api) =>
  client.post("/tasks", task).then((response) => response.data);

// React Query hooks
export const useGetTasks = () => {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: getTasks,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onMutate: async (newTask) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousTasks = queryClient.getQueryData(["tasks"]);
      const optimisticTask = {
        ...newTask,
        id: Date.now().toString(),
        isNew: true,
      };
      queryClient.setQueryData(["tasks"], (old) => [
        ...(old || []),
        optimisticTask,
      ]);
      return { previousTasks };
    },
    onError: (err, newTask, context) => {
      queryClient.setQueryData(["tasks"], context.previousTasks);
    },

    // onSuccess context variable
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["tasks"], (old) =>
        old.map((task) =>
          task.isNew && task.title === variables.title
            ? { ...data, isNew: false }
            : task
        )
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};
