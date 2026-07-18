import crypto from "crypto";
import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { successResponse } from "../utils/apiResponse.js";
import {
  generateTokenAndSetCookie,
  clearAuthCookie,
} from "../utils/generateToken.js";
import { sendOtp, verifyOtp } from "../utils/otp.js";
import { sendEmail } from "../utils/sendEmail.js";
import {
  uploadBufferToCloudinary,
  deleteFromCloudinary,
} from "../utils/uploadToCloudinary.js";

/**
 * @route POST /api/user/register
 */
export const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, mobile, password } = req.body;

  if (!fullName || !email || !mobile || !password) {
    throw new ApiError(400, "All fields are required");
  }
  if (password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }

  const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
  if (existingUser) {
    throw new ApiError(409, "An account with this email or mobile already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    fullName,
    email,
    mobile,
    password: hashedPassword,
  });

  const userObj = user.toObject();
  delete userObj.password;

  return successResponse(res, 201, "Registered successfully", { user: userObj });
});

/**
 * @route POST /api/user/login
 */
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new ApiError(404, "Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  generateTokenAndSetCookie(res, user._id, "user");

  const userObj = user.toObject();
  delete userObj.password;

  return successResponse(res, 200, `Welcome back, ${user.fullName}`, {
    user: userObj,
  });
});

/**
 * @route POST /api/user/logout
 */
export const logoutUser = asyncHandler(async (req, res) => {
  clearAuthCookie(res);
  return successResponse(res, 200, "Logged out successfully");
});

/**
 * @route POST /api/user/send-otp
 * Sends an OTP to the currently authenticated user's mobile number.
 */
export const sendMobileOtp = asyncHandler(async (req, res) => {
  const user = await User.findById(req.account._id);
  if (!user) throw new ApiError(404, "User not found");

  await sendOtp(user.mobile);
  return successResponse(res, 200, "OTP sent successfully");
});

/**
 * @route POST /api/user/verify-otp
 */
export const verifyMobileOtp = asyncHandler(async (req, res) => {
  const { code } = req.body;
  if (!code) throw new ApiError(400, "OTP code is required");

  const user = await User.findById(req.account._id);
  const isValid = await verifyOtp(user.mobile, code);

  if (!isValid) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  user.isMobileVerified = true;
  await user.save();

  return successResponse(res, 200, "Mobile number verified successfully");
});

/**
 * @route POST /api/user/forgot-password
 * Generates a reset token, emails a reset link to the user.
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, "Email is required");

  const user = await User.findOne({ email });
  if (!user) {
    // Do not reveal whether the email exists — respond the same either way
    return successResponse(
      res,
      200,
      "If an account exists with this email, a reset link has been sent"
    );
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  await sendEmail({
    to: user.email,
    subject: "Password Reset - MyProperty",
    html: `<p>Hello ${user.fullName},</p>
           <p>Click below to reset your password. This link expires in 15 minutes.</p>
           <a href="${resetUrl}">${resetUrl}</a>`,
  });

  return successResponse(
    res,
    200,
    "If an account exists with this email, a reset link has been sent"
  );
});

/**
 * @route POST /api/user/reset-password/:token
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Reset link is invalid or has expired");
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  return successResponse(res, 200, "Password reset successfully");
});

/**
 * @route PATCH /api/user/change-password
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Current and new password are required");
  }
  if (newPassword.length < 6) {
    throw new ApiError(400, "New password must be at least 6 characters");
  }

  const user = await User.findById(req.account._id).select("+password");

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new ApiError(401, "Current password is incorrect");
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return successResponse(res, 200, "Password changed successfully");
});

/**
 * @route GET /api/user/profile
 */
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.account._id)
    .populate("wishlist")
    .populate("recentlyViewed.property");

  return successResponse(res, 200, "Profile fetched successfully", { user });
});

/**
 * @route PATCH /api/user/profile
 */
export const updateUserProfile = asyncHandler(async (req, res) => {
  const { fullName, address, city, state, country } = req.body;

  const user = await User.findById(req.account._id);
  if (!user) throw new ApiError(404, "User not found");

  if (fullName) user.fullName = fullName;
  if (address) user.address = address;
  if (city) user.city = city;
  if (state) user.state = state;
  if (country) user.country = country;

  await user.save();

  return successResponse(res, 200, "Profile updated successfully", { user });
});

/**
 * @route PATCH /api/user/profile-image
 * Expects a single file field named "profileImage" (multer memory storage).
 */
export const updateUserProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Profile image file is required");
  }

  const user = await User.findById(req.account._id);
  if (!user) throw new ApiError(404, "User not found");

  if (user.profileImage?.publicId) {
    await deleteFromCloudinary(user.profileImage.publicId);
  }

  const uploaded = await uploadBufferToCloudinary(
    req.file.buffer,
    "myproperty/users"
  );

  user.profileImage = { url: uploaded.url, publicId: uploaded.publicId };
  await user.save();

  return successResponse(res, 200, "Profile image updated successfully", {
    profileImage: user.profileImage,
  });
});
