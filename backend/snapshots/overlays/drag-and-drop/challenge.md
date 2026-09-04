# Frontend — Drag-and-Drop Logic

Restore the missing drag-and-drop task update logic in `frontend/src/utils/dragDropLogic.js`.

The function receives a drag result and the current task list. It should return the dragged task with its destination status, or `null` when the drop is invalid.

The implementation must:
- ignore drops without a destination,
- identify the dragged task using the source column and index,
- map `todo`, `inProgress`, and `done` to the existing task statuses,
- return a new task object without mutating the existing task list,
- return `null` for invalid task or column references.

Do not change the existing TaskBoard UI, API calls, Redux wiring, or unrelated task operations.

Live Preview: You can use any dummy email and password to create an account. No real credentials are required.
