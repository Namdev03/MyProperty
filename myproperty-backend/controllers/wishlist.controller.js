import User from "../models/user.model.js";
import Property from "../models/property.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { successResponse } from "../utils/apiResponse.js";

/**
 * @route POST /api/user/wishlist/:propertyId
 */
export const addToWishlist = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;

  const property = await Property.findById(propertyId);
  if (!property) throw new ApiError(404, "Property not found");

  const user = await User.findById(req.account._id);

  if (user.wishlist.some((id) => id.toString() === propertyId)) {
    throw new ApiError(409, "Property already in wishlist");
  }

  user.wishlist.push(propertyId);
  await user.save();

  return successResponse(res, 200, "Added to wishlist", { wishlist: user.wishlist });
});

/**
 * @route DELETE /api/user/wishlist/:propertyId
 */
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;

  const user = await User.findById(req.account._id);
  user.wishlist = user.wishlist.filter((id) => id.toString() !== propertyId);
  await user.save();

  return successResponse(res, 200, "Removed from wishlist", { wishlist: user.wishlist });
});

/**
 * @route GET /api/user/wishlist
 */
export const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.account._id).populate("wishlist");
  return successResponse(res, 200, "Wishlist fetched successfully", {
    wishlist: user.wishlist,
  });
});
