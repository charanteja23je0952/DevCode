import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tasks: [],
  loading: false,
  error: null,
};

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    // TODO: Replace the incomplete reducer implementations below.
    //
    // Requirements:
    // - setTasks: replace the current task collection and clear loading/error state.
    // - addTask: add the newly-created task without removing existing tasks.
    // - updateTask: replace the matching task using its _id; leave other tasks unchanged.
    // - removeTask: remove only the task whose _id matches the action payload.
    // - setLoading: update the loading flag.
    // - setError: store the error and stop the loading state.
    //
    // Preserve the existing state shape and action names because other
    // components already depend on this slice.

    setTasks: (state, action) => {
      // TODO: implement
    },
    addTask: (state, action) => {
      // TODO: implement
    },
    updateTask: (state, action) => {
      // TODO: implement
    },
    removeTask: (state, action) => {
      // TODO: implement
    },
    setLoading: (state, action) => {
      // TODO: implement
    },
    setError: (state, action) => {
      // TODO: implement
    },
  },
});

export const {
  setTasks,
  addTask,
  updateTask,
  removeTask,
  setLoading,
  setError,
} = taskSlice.actions;

export default taskSlice.reducer;
