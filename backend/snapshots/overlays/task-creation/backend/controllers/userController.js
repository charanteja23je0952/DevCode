import userModel from "../models/User.js";
import bcrypt from "bcryptjs";
import asyncHandler from "../middlewares/asyncHandler.js";
import generateToken from "../utils/generateToken.js";

// TODO: Implement signupUser and loginUser.
//
// Requirements:
// - validate that email and password are provided and return HTTP 400 when either is missing,
// - trim and lowercase the email before lookup,
// - generate the existing JWT cookie only after successful operation.
//
// signupUser specific:
// - reject duplicate normalized emails with HTTP 400,
// - hash the password with bcrypt before persistence,
// - save the new user,
// - return HTTP 201 with success, _id, and the normalized email.
//
// loginUser specific:
// - reject non-existent users with HTTP 404,
// - validate the password against the stored bcrypt hash,
// - reject invalid passwords with HTTP 401,
// - return HTTP 200 with _id and email on success.
//
// Keep the existing response shape, JWT helper, and unrelated auth flows intact.
const signupUser = asyncHandler(async (req, res) => {
  // TODO
  throw new Error("Not implemented");
});

const loginUser = asyncHandler(async (req, res) => {
  // TODO
  throw new Error("Not implemented");
});

const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: "Logged out successfully" });
});

export { signupUser, loginUser, logoutUser };
