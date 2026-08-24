# Frontend — Redux Task Slice

Complete the Redux task slice implementation in `frontend/src/redux/features/task/taskSlice.js`.

The slice is already integrated with components. Keep the challenge slice-only.

The implementation must:
- setTasks: replace the current task collection and clear loading/error state,
- addTask: add the newly-created task without removing existing tasks,
- updateTask: replace the matching task using its _id; leave other tasks unchanged,
- removeTask: remove only the task whose _id matches the action payload,
- setLoading: update the loading flag,
- setError: store the error and stop the loading state.

Preserve the existing state shape and action names because other components already depend on this slice.
