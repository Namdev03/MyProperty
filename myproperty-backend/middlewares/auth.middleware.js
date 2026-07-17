import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Owner from "../models/owner.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * Verifies the JWT cookie and attaches the authenticated account to req.account,
 * along with req.role ("user" | "owner"). Works for both roles since both
 * store { id, role } in the token payload.
 */
export const verifyAuth = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    throw new ApiError(401, "Unauthorized: no token provided");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new ApiError(401, "Unauthorized: invalid or expired token");
  }

  const Model = decoded.role === "owner" ? Owner : User;
  const account = await Model.findById(decoded.id);

  if (!account) {
    throw new ApiError(401, "Unauthorized: account no longer exists");
  }

  req.account = account;
  req.role = decoded.role;
  next();
});
