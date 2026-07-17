import crypto from "crypto";
import bcrypt from "bcrypt";
import Owner from "../models/owner.model.js";
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
 * @route POST /api/owner/register
 */
export const registerOwner = asyncHandler(async (req, res) => {
  const { companyName, ownerName, email, mobile, password } = req.body;

  if (!companyName || !ownerName || !email || !mobile || !password) {
    throw new ApiError(400, "All fields are required");
  }
  if (password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }

  const existingOwner = await Owner.findOne({ $or: [{ email }, { mobile }] });
  if (existingOwner) {
    throw new ApiError(409, "An account with this email or mobile already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const owner = await Owner.create({
    companyName,
    ownerName,
    email,
    mobile,
    password: hashedPassword,
  });

  const ownerObj = owner.toObject();
  delete ownerObj.password;

  return successResponse(res, 201, "Registered successfully", { owner: ownerObj });
});

/**
 * @route POST /api/owner/login
 */
export const loginOwner = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const owner = await Owner.findOne({ email }).select("+password");
  if (!owner) {
    throw new ApiError(404, "Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, owner.password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  generateTokenAndSetCookie(res, owner._id, "owner");

  const ownerObj = owner.toObject();
  delete ownerObj.password;

  return successResponse(res, 200, `Welcome back, ${owner.ownerName}`, {
    owner: ownerObj,
  });
});

/**
 * @route POST /api/owner/logout
 */
export const logoutOwner = asyncHandler(async (req, res) => {
  clearAuthCookie(res);
  return successResponse(res, 200, "Logged out successfully");
});

/**
 * @route POST /api/owner/send-otp
 */
export const sendMobileOtp = asyncHandler(async (req, res) => {
  const owner = await Owner.findById(req.account._id);
  if (!owner) throw new ApiError(404, "Owner not found");

  await sendOtp(owner.mobile);
  return successResponse(res, 200, "OTP sent successfully");
});

/**
 * @route POST /api/owner/verify-otp
 */
export const verifyMobileOtp = asyncHandler(async (req, res) => {
  const { code } = req.body;
  if (!code) throw new ApiError(400, "OTP code is required");

  const owner = await Owner.findById(req.account._id);
  const isValid = await verifyOtp(owner.mobile, code);

  if (!isValid) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  owner.isMobileVerified = true;
  await owner.save();

  return successResponse(res, 200, "Mobile number verified successfully");
});

/**
 * @route POST /api/owner/forgot-password
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, "Email is required");

  const owner = await Owner.findOne({ email });
  if (!owner) {
    return successResponse(
      res,
      200,
      "If an account exists with this email, a reset link has been sent"
    );
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  owner.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  owner.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  await owner.save();

  const resetUrl = `${process.env.CLIENT_URL}/owner/reset-password/${resetToken}`;

  await sendEmail({
    to: owner.email,
    subject: "Password Reset - MyProperty",
    html: `<p>Hello ${owner.ownerName},</p>
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
 * @route POST /api/owner/reset-password/:token
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const owner = await Owner.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!owner) {
    throw new ApiError(400, "Reset link is invalid or has expired");
  }

  owner.password = await bcrypt.hash(password, 10);
  owner.resetPasswordToken = undefined;
  owner.resetPasswordExpire = undefined;
  await owner.save();

  return successResponse(res, 200, "Password reset successfully");
});

/**
 * @route GET /api/owner/profile
 */
export const getOwnerProfile = asyncHandler(async (req, res) => {
  const owner = await Owner.findById(req.account._id).populate("properties");
  return successResponse(res, 200, "Profile fetched successfully", { owner });
});

/**
 * @route PATCH /api/owner/profile
 */
export const updateOwnerProfile = asyncHandler(async (req, res) => {
  const { companyName, ownerName, address, city, state, country } = req.body;

  const owner = await Owner.findById(req.account._id);
  if (!owner) throw new ApiError(404, "Owner not found");

  if (companyName) owner.companyName = companyName;
  if (ownerName) owner.ownerName = ownerName;
  if (address) owner.address = address;
  if (city) owner.city = city;
  if (state) owner.state = state;
  if (country) owner.country = country;

  await owner.save();

  return successResponse(res, 200, "Profile updated successfully", { owner });
});

/**
 * @route PATCH /api/owner/company-logo
 */
export const updateCompanyLogo = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Company logo file is required");
  }

  const owner = await Owner.findById(req.account._id);
  if (!owner) throw new ApiError(404, "Owner not found");

  if (owner.companyLogo?.publicId) {
    await deleteFromCloudinary(owner.companyLogo.publicId);
  }

  const uploaded = await uploadBufferToCloudinary(
    req.file.buffer,
    "myproperty/owners"
  );

  owner.companyLogo = { url: uploaded.url, publicId: uploaded.publicId };
  await owner.save();

  return successResponse(res, 200, "Company logo updated successfully", {
    companyLogo: owner.companyLogo,
  });
});
