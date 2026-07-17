import Property from "../models/property.model.js";
import Booking from "../models/booking.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";

/**
 * @route GET /api/owner/dashboard/stats
 * Returns totals used on the owner dashboard cards.
 */
export const getOwnerDashboardStats = asyncHandler(async (req, res) => {
  const ownerId = req.account._id;

  const [totalProperties, activeListings, bookings] = await Promise.all([
    Property.countDocuments({ owner: ownerId }),
    Property.countDocuments({ owner: ownerId, isAvailable: true }),
    Booking.find({ owner: ownerId }),
  ]);

  const totalBookings = bookings.length;

  const revenue = bookings
    .filter((b) => b.paymentStatus === "Paid")
    .reduce((sum, b) => sum + b.totalPrice, 0);

  return successResponse(res, 200, "Dashboard stats fetched successfully", {
    totalProperties,
    activeListings,
    totalBookings,
    revenue,
  });
});
