import { Router } from "express";
import {
  registerOwner,
  loginOwner,
  logoutOwner,
  sendMobileOtp,
  verifyMobileOtp,
  forgotPassword,
  resetPassword,
  getOwnerProfile,
  updateOwnerProfile,
  updateCompanyLogo,
} from "../controllers/owner.auth.controller.js";
import { getOwnerDashboardStats } from "../controllers/owner.dashboard.controller.js";
import {
  getOwnerProperties,
} from "../controllers/property.controller.js";
import { getOwnerBookings } from "../controllers/booking.controller.js";
import { verifyAuth } from "../middlewares/auth.middleware.js";
import { isOwner } from "../middlewares/role.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

// Public
router.post("/register", registerOwner);
router.post("/login", loginOwner);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Protected (owner only)
router.post("/logout", verifyAuth, isOwner, logoutOwner);
router.post("/send-otp", verifyAuth, isOwner, sendMobileOtp);
router.post("/verify-otp", verifyAuth, isOwner, verifyMobileOtp);

router.get("/profile", verifyAuth, isOwner, getOwnerProfile);
router.patch("/profile", verifyAuth, isOwner, updateOwnerProfile);
router.patch(
  "/company-logo",
  verifyAuth,
  isOwner,
  upload.single("companyLogo"),
  updateCompanyLogo
);

router.get("/dashboard/stats", verifyAuth, isOwner, getOwnerDashboardStats);
router.get("/properties", verifyAuth, isOwner, getOwnerProperties);
router.get("/bookings", verifyAuth, isOwner, getOwnerBookings);

export default router;
