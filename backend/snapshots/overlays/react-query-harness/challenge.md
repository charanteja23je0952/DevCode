# Frontend — React Query Helper

Complete the React Query helper implementation in `frontend/src/helper.js`.

The harness UI is already functional. Keep the challenge helper-only.

The implementation must:
- implement useGetTasks hook to fetch tasks with proper loading/error states,
- implement useCreateTask hook to create tasks with proper mutation handling,
- expose request errors through the hook's error state,
- support refetch functionality for the tasks query,
- after a successful task creation, make the created task observable through the `tasks` query by updating or refreshing that query.

Do not change the harness UI or other components.

Live Preview: You can use any dummy email and password to create an account. No real credentials are required.
