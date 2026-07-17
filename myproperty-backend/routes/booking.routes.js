import { Router } from "express";
import { createBooking, cancelBooking } from "../controllers/booking.controller.js";
import { verifyAuth } from "../middlewares/auth.middleware.js";
import { isUser } from "../middlewares/role.middleware.js";

const router = Router();

router.post("/", verifyAuth, isUser, createBooking);
// Either the booking user or the owning owner can cancel — role check happens inside the controller.
router.patch("/:id/cancel", verifyAuth, cancelBooking);

export default router;
