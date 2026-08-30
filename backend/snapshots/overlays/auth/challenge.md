# Backend — Authentication Middleware

Implement the authentication middleware in `backend/middlewares/authMiddleware.js`.

The middleware must:
- read the JWT from the authentication cookie set by generateToken.js,
- reject requests that do not contain a token with HTTP 401,
- verify the JWT using process.env.JWT_SECRET,
- extract the authenticated user's ID from the decoded token,
- attach the authenticated user ID to req.user,
- call next() only when authentication succeeds,
- return HTTP 401 for invalid or expired tokens,
- not allow protected requests to continue after an authentication failure.

Keep the middleware as an Express middleware: (req, res, next) => { ... }.

Live Preview: You can use any dummy email and password to create an account. No real credentials are required.
