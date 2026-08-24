// TODO: Implement authentication middleware.
//
// Requirements:
// 1. Read the JWT from the authentication cookie set by generateToken.js.
// 2. Reject requests that do not contain a token with HTTP 401.
// 3. Verify the JWT using process.env.JWT_SECRET.
// 4. Extract the authenticated user's ID from the decoded token.
// 5. Attach the authenticated user ID to req.user.
// 6. Call next() only when authentication succeeds.
// 7. Return HTTP 401 for invalid or expired tokens.
// 8. Do not allow protected requests to continue after an authentication failure.
//
// Keep the middleware as an Express middleware: (req, res, next) => { ... }.

const authMiddleware = async (req, res, next) => {
  // incomplete
  next()
};

export default authMiddleware;
