import { Router } from "express";
import {
  addProperty,
  updateProperty,
  deleteProperty,
  getPropertyById,
  getAllProperties,
} from "../controllers/property.controller.js";
import {
  addReview,
} from "../controllers/review.controller.js";
import { verifyAuth } from "../middlewares/auth.middleware.js";
import { isOwner, isUser } from "../middlewares/role.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

const propertyImageFields = [
  { name: "propertyImages", maxCount: 10 },
  { name: "roomImages", maxCount: 10 },
  { name: "kitchenImages", maxCount: 10 },
  { name: "bathroomImages", maxCount: 10 },
  { name: "hallImages", maxCount: 10 },
];

// Public
router.get("/", getAllProperties);

// Optional auth: logged-in users get recentlyViewed tracking, guests can still view.
// This lightweight wrapper lets the route work whether or not a cookie is present.
const optionalAuth = asyncHandler(async (req, res, next) => {
  if (!req.cookies?.token) return next();
  return verifyAuth(req, res, next);
});
router.get("/:id", optionalAuth, getPropertyById);

// Owner only
router.post(
  "/",
  verifyAuth,
  isOwner,
  upload.fields(propertyImageFields),
  addProperty
);
router.patch(
  "/:id",
  verifyAuth,
  isOwner,
  upload.fields(propertyImageFields),
  updateProperty
);
router.delete("/:id", verifyAuth, isOwner, deleteProperty);

// Reviews (nested under property)
router.post("/:propertyId/reviews", verifyAuth, isUser, addReview);

export default router;
