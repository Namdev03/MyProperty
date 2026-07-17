import Notification from "../models/notification.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { successResponse } from "../utils/apiResponse.js";

/**
 * @route GET /api/notifications
 * Works for both roles — recipient + recipientModel are set by req.role.
 */
export const getNotifications = asyncHandler(async (req, res) => {
  const recipientModel = req.role === "owner" ? "Owner" : "User";

  const notifications = await Notification.find({
    recipient: req.account._id,
    recipientModel,
  }).sort({ createdAt: -1 });

  return successResponse(res, 200, "Notifications fetched successfully", {
    notifications,
  });
});

/**
 * @route PATCH /api/notifications/:id/read
 */
export const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) throw new ApiError(404, "Notification not found");

  if (notification.recipient.toString() !== req.account._id.toString()) {
    throw new ApiError(403, "Not authorized to update this notification");
  }

  notification.isRead = true;
  await notification.save();

  return successResponse(res, 200, "Notification marked as read", { notification });
});

/**
 * @route PATCH /api/notifications/read-all
 */
export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  const recipientModel = req.role === "owner" ? "Owner" : "User";

  await Notification.updateMany(
    { recipient: req.account._id, recipientModel, isRead: false },
    { $set: { isRead: true } }
  );

  return successResponse(res, 200, "All notifications marked as read");
});
