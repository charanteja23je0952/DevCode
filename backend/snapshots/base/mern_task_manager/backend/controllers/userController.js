import userModel from "../models/User.js";
import bcrypt from "bcryptjs";
import asyncHandler from "../middlewares/asyncHandler.js";
import generateToken from "../utils/generateToken.js";

const signupUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Please fill all the fields",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existUser = await userModel.findOne({ email: normalizedEmail });

  if (existUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new userModel({
    email: normalizedEmail,
    password: hashedPassword,
  });

  try {
    await newUser.save();
    generateToken(res, newUser._id);
    res.status(201).json({
      success: true,
      _id: newUser._id,
      email: newUser.email,
    });
  } catch (error) {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      message: "Please fill all the fields",
    });
  }
  const normalizedEmail = email?.trim().toLowerCase();

  const existingUser = await userModel.findOne({ email: normalizedEmail });

  if (!existingUser) {
    return res.status(404).json({ message: "User not found" });
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    existingUser.password
  );

  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid password" });
  }

  generateToken(res, existingUser._id);
  res.status(200).json({
    _id: existingUser._id,
    email: existingUser.email,
  });
});

const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: "Logged out successfully" });
});

export { signupUser, loginUser, logoutUser };
