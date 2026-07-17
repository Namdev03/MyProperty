import { Router } from "express";
import { updateReview, deleteReview } from "../controllers/review.controller.js";
import { verifyAuth } from "../middlewares/auth.middleware.js";
import { isUser } from "../middlewares/role.middleware.js";

const router = Router();

router.patch("/:id", verifyAuth, isUser, updateReview);
router.delete("/:id", verifyAuth, isUser, deleteReview);

export default router;
