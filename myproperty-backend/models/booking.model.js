import mongoose from "mongoose";

const { Schema, model } = mongoose;

const bookingSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    property: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "Owner",
      required: true,
    },

    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },

    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },

    totalPrice: { type: Number, required: true },

    bookingStatus: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled", "Completed"],
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Refunded", "Failed"],
      default: "Pending",
    },

    bookingDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Speeds up "does this property already have an overlapping booking" checks
bookingSchema.index({ property: 1, checkIn: 1, checkOut: 1 });

const Booking = model("Booking", bookingSchema);
export default Booking;
