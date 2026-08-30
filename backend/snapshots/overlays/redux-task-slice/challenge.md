# Frontend — TaskBoard Search & Sorting

Complete the filtering, sorting, and column-grouping logic in `frontend/src/components/TaskBoard.jsx`.

The surrounding TaskBoard UI, API calls, Redux wiring, and drag-and-drop flow are already functional. Keep the challenge focused on the inline task-list transformation logic.

The implementation must:
- filter tasks by title or description using case-insensitive matching,
- return all tasks when the search term is empty,
- support the existing `recent` sort with newest `createdAt` first and missing dates treated as oldest,
- support the existing `alphabetical` sort by task title,
- project the resulting task list into the existing TODO / IN PROGRESS / DONE columns,
- preserve the existing column metadata and current component behavior.

Do not change unrelated TaskBoard functionality.

Live Preview: You can use any dummy email and password to create an account. No real credentials are required.
