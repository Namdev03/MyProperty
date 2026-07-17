import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  sendMobileOtp,
  verifyMobileOtp,
  forgotPassword,
  resetPassword,
  changePassword,
  getUserProfile,
  updateUserProfile,
  updateUserProfileImage,
} from "../controllers/user.auth.controller.js";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../controllers/wishlist.controller.js";
import { getUserBookings } from "../controllers/booking.controller.js";
import { verifyAuth } from "../middlewares/auth.middleware.js";
import { isUser } from "../middlewares/role.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

// Public
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Protected (user only)
router.post("/logout", verifyAuth, isUser, logoutUser);
router.post("/send-otp", verifyAuth, isUser, sendMobileOtp);
router.post("/verify-otp", verifyAuth, isUser, verifyMobileOtp);
router.patch("/change-password", verifyAuth, isUser, changePassword);

router.get("/profile", verifyAuth, isUser, getUserProfile);
router.patch("/profile", verifyAuth, isUser, updateUserProfile);
router.patch(
  "/profile-image",
  verifyAuth,
  isUser,
  upload.single("profileImage"),
  updateUserProfileImage
);

router.get("/wishlist", verifyAuth, isUser, getWishlist);
router.post("/wishlist/:propertyId", verifyAuth, isUser, addToWishlist);
router.delete("/wishlist/:propertyId", verifyAuth, isUser, removeFromWishlist);

router.get("/bookings", verifyAuth, isUser, getUserBookings);

export default router;
