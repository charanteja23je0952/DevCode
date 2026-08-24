import assert from "node:assert";
import jwt from "jsonwebtoken";
import authMiddleware from "./middlewares/authMiddleware.js";

function mockReq() {
  return {
    cookies: {},
    signedCookies: {},
  };
}

function mockRes() {
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      res.statusCode = code;
      return res;
    },
    json(payload) {
      res.body = payload;
      return res;
    },
  };
  return res;
}

const results = [];
function check(name, condition, detail = "") {
  results.push({ name, pass: !!condition, detail });
}

async function run() {
  process.env.JWT_SECRET = "test-secret-key";

  // Test 1: Request without token should be rejected
  const reqWithoutToken = mockReq();
  const resWithoutToken = mockRes();
  let nextCalled = false;
  const nextWithoutToken = () => { nextCalled = true; };

  await authMiddleware(reqWithoutToken, resWithoutToken, nextWithoutToken);

  check(
    "authMiddleware rejects request without token with 401",
    resWithoutToken.statusCode === 401,
    `got status ${resWithoutToken.statusCode}`
  );
  check(
    "authMiddleware does not call next() when token is missing",
    !nextCalled,
    "next() was called"
  );

  // Test 2: Request with invalid token should be rejected
  const reqWithInvalidToken = mockReq();
  reqWithInvalidToken.cookies = { jwt: "invalid-token" };
  const resWithInvalidToken = mockRes();
  let nextCalledInvalid = false;
  const nextInvalid = () => { nextCalledInvalid = true; };

  await authMiddleware(reqWithInvalidToken, resWithInvalidToken, nextInvalid);

  check(
    "authMiddleware rejects request with invalid token with 401",
    resWithInvalidToken.statusCode === 401,
    `got status ${resWithInvalidToken.statusCode}`
  );
  check(
    "authMiddleware does not call next() when token is invalid",
    !nextCalledInvalid,
    "next() was called"
  );

  // Test 3: Request with valid token should succeed
  const testUserId = "507f1f77bcf86cd799439011";
  const validToken = jwt.sign({ userId: testUserId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  const reqWithValidToken = mockReq();
  reqWithValidToken.cookies = { jwt: validToken };
  const resWithValidToken = mockRes();
  let nextCalledValid = false;
  const nextValid = () => { nextCalledValid = true; };

  await authMiddleware(reqWithValidToken, resWithValidToken, nextValid);

  check(
    "authMiddleware calls next() when token is valid",
    nextCalledValid,
    "next() was not called"
  );
  check(
    "authMiddleware attaches userId to req.user",
    reqWithValidToken.user === testUserId,
    `got ${JSON.stringify(reqWithValidToken.user)}`
  );
  check(
    "authMiddleware does not set status when token is valid",
    resWithValidToken.statusCode === null,
    `got status ${resWithValidToken.statusCode}`
  );

  // Test 4: Request with expired token should be rejected
  const expiredToken = jwt.sign({ userId: testUserId }, process.env.JWT_SECRET, {
    expiresIn: "-1d",
  });

  const reqWithExpiredToken = mockReq();
  reqWithExpiredToken.cookies = { jwt: expiredToken };
  const resWithExpiredToken = mockRes();
  let nextCalledExpired = false;
  const nextExpired = () => { nextCalledExpired = true; };

  await authMiddleware(reqWithExpiredToken, resWithExpiredToken, nextExpired);

  check(
    "authMiddleware rejects request with expired token with 401",
    resWithExpiredToken.statusCode === 401,
    `got status ${resWithExpiredToken.statusCode}`
  );
  check(
    "authMiddleware does not call next() when token is expired",
    !nextCalledExpired,
    "next() was called"
  );

  const failed = results.filter((r) => !r.pass);
  for (const r of results) {
    console.log((r.pass ? "PASS - " : "FAIL - ") + r.name + (r.pass ? "" : ` (${r.detail})`));
  }
  if (failed.length > 0) {
    console.log(`\n${failed.length} test(s) failed.`);
    process.exit(1);
  } else {
    console.log("\nAll tests passed.");
    process.exit(0);
  }
}

run();
