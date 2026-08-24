# Backend — Task Reordering

Implement the task reordering functionality in `backend/controllers/taskController.js`.

The implementation must:
- read the task updates from req.body.tasks,
- handle that each item contains the task id and its destination status,
- persist every task's new status using the task model,
- return HTTP 200 with a success message when all updates succeed,
- handle malformed input or database errors with an appropriate 4xx response,
- not report success if any required update fails.

Do not change unrelated task operations.
