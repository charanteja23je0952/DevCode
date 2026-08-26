# Frontend — Drag-and-Drop Handler

Restore the `onDragEnd` implementation in `frontend/src/utils/dragDropLogic.js`.

The backend is already functional. Keep the challenge frontend-only.

The implementation must:
- ignore invalid drops,
- identify the dragged task,
- map destination columns to the task's status,
- persist the status change through the existing API,
- update Redux from the successful server response,
- handle authentication failures consistently,
- expose other request errors through the component's existing error state.

Do not change unrelated task operations.
