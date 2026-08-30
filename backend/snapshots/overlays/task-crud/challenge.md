# Backend — Task CRUD Operations

Implement the task CRUD controller operations in `backend/controllers/taskController.js`.

The implementation must:
- createTask: create a task from req.body and return the created task,
- deleteTask: delete the task identified by req.params.id,
- return the appropriate success status for each operation,
- return a useful error response when a database operation fails,
- return 404 when an delete targets a task that does not exist.

Keep the existing API response shapes and route contracts intact.

Live Preview: You can use any dummy email and password to create an account. No real credentials are required.
