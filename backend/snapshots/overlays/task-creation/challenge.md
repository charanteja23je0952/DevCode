# Full Stack — Task Creation

Complete the end-to-end task creation implementation.

Backend: Implement the task creation in `backend/controllers/taskController.js`
Frontend: Complete the task creation flow in `frontend/src/components/TaskBoard.jsx`

The implementation must:
- Backend: create a task from the request body using the existing Mongoose model,
- Backend: persist it to MongoDB,
- Backend: return the newly-created document with HTTP 201,
- Backend: return an appropriate error response if persistence fails,
- Frontend: build the task payload expected by the backend,
- Frontend: send it to the existing task creation endpoint,
- Frontend: use the server response when updating Redux,
- Frontend: preserve the existing authentication/error behavior.

Do not change unrelated task operations.
