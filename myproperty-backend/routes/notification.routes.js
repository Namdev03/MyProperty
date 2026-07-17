import { Router } from "express";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../controllers/notification.controller.js";
import { verifyAuth } from "../middlewares/auth.middleware.js";

const router = Router();

// Works for both roles — verifyAuth attaches req.role either way.
router.get("/", verifyAuth, getNotifications);
router.patch("/:id/read", verifyAuth, markNotificationRead);
router.patch("/read-all", verifyAuth, markAllNotificationsRead);

export default router;
