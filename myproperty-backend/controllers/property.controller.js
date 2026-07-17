import Property from "../models/property.model.js";
import Owner from "../models/owner.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { successResponse } from "../utils/apiResponse.js";
import {
  uploadMultipleToCloudinary,
  deleteFromCloudinary,
} from "../utils/uploadToCloudinary.js";

const IMAGE_FIELDS = [
  "propertyImages",
  "roomImages",
  "kitchenImages",
  "bathroomImages",
  "hallImages",
];

/**
 * @route POST /api/properties
 * Owner only. Expects multipart/form-data with fields matching IMAGE_FIELDS,
 * handled by: upload.fields(IMAGE_FIELDS.map(name => ({ name, maxCount: 10 })))
 */
export const addProperty = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    propertyType,
    purpose,
    price,
    securityDeposit,
    bedrooms,
    bathrooms,
    balconies,
    kitchens,
    area,
    furnished,
    parking,
    petsAllowed,
    amenities,
    address,
    city,
    state,
    country,
    pincode,
    latitude,
    longitude,
  } = req.body;

  if (!title || !description || !propertyType || !price || !address || !city || !state || !country) {
    throw new ApiError(400, "Missing required property fields");
  }

  // Upload each image category to its own Cloudinary folder, in parallel
  const uploadedImages = {};
  await Promise.all(
    IMAGE_FIELDS.map(async (field) => {
      const files = req.files?.[field] || [];
      uploadedImages[field] = await uploadMultipleToCloudinary(
        files,
        `myproperty/properties/${field}`
      );
    })
  );

  const property = await Property.create({
    owner: req.account._id,
    title,
    description,
    propertyType,
    purpose,
    price,
    securityDeposit,
    bedrooms,
    bathrooms,
    balconies,
    kitchens,
    area: typeof area === "string" ? JSON.parse(area) : area,
    furnished,
    parking: typeof parking === "string" ? JSON.parse(parking) : parking,
    petsAllowed,
    amenities: typeof amenities === "string" ? JSON.parse(amenities) : amenities,
    address,
    city,
    state,
    country,
    pincode,
    latitude,
    longitude,
    ...uploadedImages,
  });

  await Owner.findByIdAndUpdate(req.account._id, {
    $push: { properties: property._id },
  });

  return successResponse(res, 201, "Property added successfully", { property });
});

/**
 * @route PATCH /api/properties/:id
 * Owner only, and only the owner who created it.
 */
export const updateProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw new ApiError(404, "Property not found");

  if (property.owner.toString() !== req.account._id.toString()) {
    throw new ApiError(403, "You do not own this property");
  }

  const updatableFields = [
    "title",
    "description",
    "propertyType",
    "purpose",
    "price",
    "securityDeposit",
    "bedrooms",
    "bathrooms",
    "balconies",
    "kitchens",
    "furnished",
    "petsAllowed",
    "address",
    "city",
    "state",
    "country",
    "pincode",
    "latitude",
    "longitude",
    "isAvailable",
  ];

  updatableFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      property[field] = req.body[field];
    }
  });

  if (req.body.area) {
    property.area =
      typeof req.body.area === "string" ? JSON.parse(req.body.area) : req.body.area;
  }
  if (req.body.parking) {
    property.parking =
      typeof req.body.parking === "string"
        ? JSON.parse(req.body.parking)
        : req.body.parking;
  }
  if (req.body.amenities) {
    property.amenities =
      typeof req.body.amenities === "string"
        ? JSON.parse(req.body.amenities)
        : req.body.amenities;
  }

  // Optional: append newly uploaded images for any of the image categories
  await Promise.all(
    IMAGE_FIELDS.map(async (field) => {
      const files = req.files?.[field];
      if (files?.length) {
        const uploaded = await uploadMultipleToCloudinary(
          files,
          `myproperty/properties/${field}`
        );
        property[field].push(...uploaded);
      }
    })
  );

  await property.save();

  return successResponse(res, 200, "Property updated successfully", { property });
});

/**
 * @route DELETE /api/properties/:id
 * Owner only, and only the owner who created it.
 */
export const deleteProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw new ApiError(404, "Property not found");

  if (property.owner.toString() !== req.account._id.toString()) {
    throw new ApiError(403, "You do not own this property");
  }

  // Clean up every uploaded image from Cloudinary before deleting the doc
  const allImages = IMAGE_FIELDS.flatMap((field) => property[field] || []);
  await Promise.all(
    allImages.map((img) => deleteFromCloudinary(img.publicId))
  );

  await property.deleteOne();

  await Owner.findByIdAndUpdate(property.owner, {
    $pull: { properties: property._id },
  });

  return successResponse(res, 200, "Property deleted successfully");
});

/**
 * @route GET /api/properties/:id
 * Public. Also pushes to the viewing user's recentlyViewed if logged in.
 */
export const getPropertyById = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id)
    .populate("owner", "companyName ownerName email mobile companyLogo")
    .populate({
      path: "reviews",
      populate: { path: "user", select: "fullName profileImage" },
    });

  if (!property) throw new ApiError(404, "Property not found");

  // req.account is only set if verifyAuth ran; this route can be public,
  // so guard for its absence.
  if (req.account && req.role === "user") {
    await req.account.updateOne({
      $pull: { recentlyViewed: { property: property._id } },
    });
    await req.account.updateOne({
      $push: {
        recentlyViewed: {
          $each: [{ property: property._id, viewedAt: new Date() }],
          $position: 0,
          $slice: 20, // keep only the last 20 viewed properties
        },
      },
    });
  }

  return successResponse(res, 200, "Property fetched successfully", { property });
});

/**
 * @route GET /api/properties
 * Public. Supports search + filters + pagination.
 *
 * Query params:
 *  q            - text search (title, city, state)
 *  propertyType, city, state, purpose
 *  minPrice, maxPrice
 *  bedrooms, bathrooms
 *  minArea, maxArea
 *  isAvailable
 *  page, limit
 */
export const getAllProperties = asyncHandler(async (req, res) => {
  const {
    q,
    propertyType,
    city,
    state,
    purpose,
    minPrice,
    maxPrice,
    bedrooms,
    bathrooms,
    minArea,
    maxArea,
    isAvailable,
    page = 1,
    limit = 12,
  } = req.query;

  const filter = {};

  if (q) filter.$text = { $search: q };
  if (propertyType) filter.propertyType = propertyType;
  if (city) filter.city = new RegExp(`^${city}$`, "i");
  if (state) filter.state = new RegExp(`^${state}$`, "i");
  if (purpose) filter.purpose = purpose;
  if (bedrooms) filter.bedrooms = Number(bedrooms);
  if (bathrooms) filter.bathrooms = Number(bathrooms);
  if (isAvailable !== undefined) filter.isAvailable = isAvailable === "true";

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  if (minArea || maxArea) {
    filter["area.value"] = {};
    if (minArea) filter["area.value"].$gte = Number(minArea);
    if (maxArea) filter["area.value"].$lte = Number(maxArea);
  }

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.max(Number(limit), 1);
  const skip = (pageNum - 1) * limitNum;

  const [properties, total] = await Promise.all([
    Property.find(filter)
      .populate("owner", "companyName ownerName companyLogo")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Property.countDocuments(filter),
  ]);

  return successResponse(res, 200, "Properties fetched successfully", {
    properties,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

/**
 * @route GET /api/owner/properties
 * Owner only — lists properties belonging to the logged-in owner.
 */
export const getOwnerProperties = asyncHandler(async (req, res) => {
  const properties = await Property.find({ owner: req.account._id }).sort({
    createdAt: -1,
  });

  return successResponse(res, 200, "Properties fetched successfully", {
    properties,
  });
});
