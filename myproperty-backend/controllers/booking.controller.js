import Booking from "../models/booking.model.js";
import Property from "../models/property.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { successResponse } from "../utils/apiResponse.js";
import { sendEmail } from "../utils/sendEmail.js";

/**
 * @route POST /api/bookings
 * User only.
 */
export const createBooking = asyncHandler(async (req, res) => {
  const { propertyId, fullName, email, phone, checkIn, checkOut } = req.body;

  if (!propertyId || !fullName || !email || !phone || !checkIn || !checkOut) {
    throw new ApiError(400, "All booking fields are required");
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (checkInDate < today) {
    throw new ApiError(400, "Check-in date cannot be in the past");
  }
  if (checkOutDate <= checkInDate) {
    throw new ApiError(400, "Check-out date must be after check-in date");
  }

  const property = await Property.findById(propertyId);
  if (!property) throw new ApiError(404, "Property not found");
  if (!property.isAvailable) {
    throw new ApiError(400, "This property is not currently available");
  }

  // Prevent double-booking: reject if any active booking overlaps the requested range
  const overlapping = await Booking.findOne({
    property: propertyId,
    bookingStatus: { $in: ["Pending", "Confirmed"] },
    checkIn: { $lt: checkOutDate },
    checkOut: { $gt: checkInDate },
  });

  if (overlapping) {
    throw new ApiError(409, "Property is already booked for the selected dates");
  }

  // Prevent the same user from creating a duplicate pending request for the same dates
  const duplicate = await Booking.findOne({
    user: req.account._id,
    property: propertyId,
    checkIn: checkInDate,
    checkOut: checkOutDate,
    bookingStatus: { $in: ["Pending", "Confirmed"] },
  });
  if (duplicate) {
    throw new ApiError(409, "You already have a booking request for these dates");
  }

  const nights = Math.ceil(
    (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
  );
  const totalPrice = nights * property.price;

  const booking = await Booking.create({
    user: req.account._id,
    property: propertyId,
    owner: property.owner,
    fullName,
    email,
    phone,
    checkIn: checkInDate,
    checkOut: checkOutDate,
    totalPrice,
  });

  await User.findByIdAndUpdate(req.account._id, {
    $push: { bookedProperties: booking._id },
  });

  // Notify the owner in-app
  const ownerNotification = await Notification.create({
    recipient: property.owner,
    recipientModel: "Owner",
    title: "New Booking Request",
    message: `${fullName} requested to book "${property.title}"`,
    type: "NEW_BOOKING",
    relatedBooking: booking._id,
  });

  // Email confirmation to the user (best-effort — booking still succeeds if email fails)
  try {
    await sendEmail({
      to: email,
      subject: "Booking Request Received - MyProperty",
      html: `<p>Hi ${fullName},</p>
             <p>Your booking request for <strong>${property.title}</strong>
             (${checkInDate.toDateString()} - ${checkOutDate.toDateString()})
             has been received and is pending confirmation.</p>
             <p>Total: ₹${totalPrice}</p>`,
    });
  } catch (err) {
    console.error("Booking confirmation email failed:", err.message);
  }

  return successResponse(res, 201, "Booking request created successfully", {
    booking,
    ownerNotification,
  });
});

/**
 * @route PATCH /api/bookings/:id/cancel
 * User can cancel their own booking, or the owning owner can cancel it.
 */
export const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate("property");
  if (!booking) throw new ApiError(404, "Booking not found");

  const isOwningUser =
    req.role === "user" && booking.user.toString() === req.account._id.toString();
  const isOwningOwner =
    req.role === "owner" && booking.owner.toString() === req.account._id.toString();

  if (!isOwningUser && !isOwningOwner) {
    throw new ApiError(403, "You are not authorized to cancel this booking");
  }

  if (booking.bookingStatus === "Cancelled") {
    throw new ApiError(400, "Booking is already cancelled");
  }

  booking.bookingStatus = "Cancelled";
  await booking.save();

  // Notify whichever side didn't perform the cancellation
  if (isOwningUser) {
    await Notification.create({
      recipient: booking.owner,
      recipientModel: "Owner",
      title: "Booking Cancelled",
      message: `${booking.fullName} cancelled their booking for "${booking.property.title}"`,
      type: "BOOKING_CANCELLED",
      relatedBooking: booking._id,
    });
  } else {
    await Notification.create({
      recipient: booking.user,
      recipientModel: "User",
      title: "Booking Cancelled",
      message: `Your booking for "${booking.property.title}" was cancelled by the owner`,
      type: "BOOKING_CANCELLED",
      relatedBooking: booking._id,
    });
  }

  try {
    await sendEmail({
      to: booking.email,
      subject: "Booking Cancelled - MyProperty",
      html: `<p>Hi ${booking.fullName},</p>
             <p>Your booking for <strong>${booking.property.title}</strong> has been cancelled.</p>`,
    });
  } catch (err) {
    console.error("Cancellation email failed:", err.message);
  }

  return successResponse(res, 200, "Booking cancelled successfully", { booking });
});

/**
 * @route GET /api/user/bookings
 */
export const getUserBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.account._id })
    .populate("property", "title propertyImages city state price")
    .sort({ createdAt: -1 });

  return successResponse(res, 200, "Bookings fetched successfully", { bookings });
});

/**
 * @route GET /api/owner/bookings
 */
export const getOwnerBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ owner: req.account._id })
    .populate("property", "title propertyImages city state price")
    .populate("user", "fullName email mobile")
    .sort({ createdAt: -1 });

  return successResponse(res, 200, "Bookings fetched successfully", { bookings });
});
