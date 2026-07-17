import { ApiError } from "../utils/ApiError.js";

/**
 * Must run after verifyAuth. Restricts a route to a single role.
 * Usage: router.post("/properties", verifyAuth, isOwner, addProperty)
 */
export const isOwner = (req, res, next) => {
  if (req.role !== "owner") {
    throw new ApiError(403, "Forbidden: owner access only");
  }
  next();
};

export const isUser = (req, res, next) => {
  if (req.role !== "user") {
    throw new ApiError(403, "Forbidden: user access only");
  }
  next();
};
