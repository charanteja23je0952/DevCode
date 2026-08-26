# Backend — Task Creation, User Signup & Login

Complete the task creation, user signup, and login implementations.

Backend: Implement `createTask` in `backend/controllers/taskController.js`.
Backend: Implement `signupUser` and `loginUser` in `backend/controllers/userController.js`.

The implementation must:
- create and persist a task from the request body and return HTTP 201 on success,
- return an appropriate error response when task persistence fails,
- validate that both signup and login receive email and password,
- trim and lowercase the email before lookup for both signup and login,
- for signup: reject duplicate normalized emails with HTTP 400, hash the password with bcrypt before saving, and return HTTP 201 with success, _id, and normalized email,
- for login: reject non-existent users with HTTP 404, validate the password against the stored bcrypt hash, reject invalid passwords with HTTP 401, and return HTTP 200 with _id and email on success,
- generate the existing JWT cookie only after successful signup or login.

Keep the existing API contracts, response shapes, JWT helper, models, routes, and unrelated task operations intact.
