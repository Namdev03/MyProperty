import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    profileImage: {
      publicId: String,
      url: String,
    },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true },

    bookedProperties: [
      {
        type: Schema.Types.ObjectId,
        ref: "Booking",
      },
    ],
    recentlyViewed: [
      {
        property: { type: Schema.Types.ObjectId, ref: "Property" },
        viewedAt: { type: Date, default: Date.now },
      },
    ],
    wishlist: [
      {
        type: Schema.Types.ObjectId,
        ref: "Property",
      },
    ],
    notifications: [
      {
        type: Schema.Types.ObjectId,
        ref: "Notification",
      },
    ],

    role: {
      type: String,
      default: "user",
      immutable: true, // never changeable after creation
    },

    isMobileVerified: {
      type: Boolean,
      default: false,
    },

    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

const User = model("User", userSchema);
export default User;
