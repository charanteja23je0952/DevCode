# Full Stack — Task Drag & Reorder

Complete the end-to-end task drag-and-reorder implementation.

Backend: Implement task reordering in `backend/controllers/taskController.js`.
Frontend: Complete the drag-end flow in `frontend/src/components/TaskBoard.jsx`.

The implementation must:
- Backend: read task changes from the request body,
- Backend: persist the requested task status/order changes through `reorderTasks` using Mongoose,
- Backend: not silently report success when any requested persistence operation fails,
- Backend: return a successful response when all requested changes are persisted,
- Backend: return an appropriate error response for malformed input or persistence failures,
- Frontend: ignore drops without a destination,
- Frontend: correctly identify the dragged task from its source column and index,
- Frontend: map the destination column to the task status,
- Frontend: call the existing task reorder endpoint with the resulting change,
- Frontend: preserve the existing authentication and error behavior.

Do not change unrelated task operations.
