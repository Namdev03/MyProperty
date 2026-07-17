import Review from "../models/review.model.js";
import Property from "../models/property.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { successResponse } from "../utils/apiResponse.js";

/**
 * Recalculates a property's average rating and review count.
 * Called after every add/edit/delete so the stored values never drift.
 */
const recalculateRatings = async (propertyId) => {
  const reviews = await Review.find({ property: propertyId });
  const reviewsCount = reviews.length;
  const ratings = reviewsCount
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount
    : 0;

  await Property.findByIdAndUpdate(propertyId, {
    ratings: Number(ratings.toFixed(1)),
    reviewsCount,
  });
};

/**
 * @route POST /api/properties/:propertyId/reviews
 * User only.
 */
export const addReview = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be between 1 and 5");
  }

  const property = await Property.findById(propertyId);
  if (!property) throw new ApiError(404, "Property not found");

  const existing = await Review.findOne({
    user: req.account._id,
    property: propertyId,
  });
  if (existing) {
    throw new ApiError(409, "You have already reviewed this property");
  }

  const review = await Review.create({
    user: req.account._id,
    property: propertyId,
    rating,
    comment,
  });

  await Property.findByIdAndUpdate(propertyId, { $push: { reviews: review._id } });
  await recalculateRatings(propertyId);

  return successResponse(res, 201, "Review added successfully", { review });
});

/**
 * @route PATCH /api/reviews/:id
 * User only, and only their own review.
 */
export const updateReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, "Review not found");

  if (review.user.toString() !== req.account._id.toString()) {
    throw new ApiError(403, "You can only edit your own review");
  }

  if (rating !== undefined) {
    if (rating < 1 || rating > 5) throw new ApiError(400, "Rating must be between 1 and 5");
    review.rating = rating;
  }
  if (comment !== undefined) review.comment = comment;

  await review.save();
  await recalculateRatings(review.property);

  return successResponse(res, 200, "Review updated successfully", { review });
});

/**
 * @route DELETE /api/reviews/:id
 * User only, and only their own review.
 */
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, "Review not found");

  if (review.user.toString() !== req.account._id.toString()) {
    throw new ApiError(403, "You can only delete your own review");
  }

  const propertyId = review.property;
  await review.deleteOne();

  await Property.findByIdAndUpdate(propertyId, { $pull: { reviews: review._id } });
  await recalculateRatings(propertyId);

  return successResponse(res, 200, "Review deleted successfully");
});
