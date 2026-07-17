import mongoose from "mongoose";

const { Schema, model } = mongoose;

const notificationSchema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "recipientModel",
    },
    recipientModel: {
      type: String,
      required: true,
      enum: ["User", "Owner"],
    },

    title: { type: String, required: true },
    message: { type: String, required: true },

    type: {
      type: String,
      enum: [
        "BOOKING_SUCCESS",
        "BOOKING_CANCELLED",
        "NEW_BOOKING",
        "GENERAL",
      ],
      default: "GENERAL",
    },

    relatedBooking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
    },

    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification = model("Notification", notificationSchema);
export default Notification;
