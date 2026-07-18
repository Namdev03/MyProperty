import mongoose from "mongoose";

const { Schema, model } = mongoose;

const imageSchema = new Schema(
  {
    publicId: String,
    url: String,
    trim:true
  },
  { _id: false }
);

const propertySchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "Owner",
      required: true,
    },

    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },

    propertyType: {
      type: String,
      enum: [
        "Apartment",
        "Hotel",
        "Villa",
        "House",
        "PG",
        "Office",
        "Shop",
        "Land",
        "Farm House",
      ],
      required: true,
    },

    purpose: {
      type: String,
      enum: ["Rent", "Sale"],
      default: "Rent",
    },

    price: { type: Number, required: true },
    securityDeposit: { type: Number, default: 0 },

    bedrooms: Number,
    bathrooms: Number,
    balconies: Number,
    kitchens: Number,

    area: {
      value: Number,
      unit: { type: String, default: "sq.ft" },
    },

    furnished: {
      type: String,
      enum: ["Fully Furnished", "Semi Furnished", "Unfurnished"],
      default: "Unfurnished",
    },

    parking: {
      bike: { type: Boolean, default: false },
      car: { type: Boolean, default: false },
    },

    petsAllowed: { type: Boolean, default: false },

    amenities: [String],

    propertyImages: [imageSchema],
    roomImages: [imageSchema],
    kitchenImages: [imageSchema],
    bathroomImages: [imageSchema],
    hallImages: [imageSchema],

    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    pincode: { type: String, trim: true },

    latitude: Number,
    longitude: Number,

    isAvailable: { type: Boolean, default: true },

    bookedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    ratings: { type: Number, default: 0 },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    reviewsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Enables geo queries later (e.g. "properties near me")
propertySchema.index({ latitude: 1, longitude: 1 });
// Speeds up the most common filter/search combinations
propertySchema.index({ city: 1, propertyType: 1, purpose: 1 });
propertySchema.index({ title: "text", city: "text", state: "text" });

const Property = model("Property", propertySchema);
export default Property;
