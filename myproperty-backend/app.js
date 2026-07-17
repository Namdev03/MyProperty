import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import userRoutes from "./routes/user.routes.js";
import ownerRoutes from "./routes/owner.routes.js";
import propertyRoutes from "./routes/property.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import notificationRoutes from "./routes/notification.routes.js";

import { errorMiddleware, notFoundMiddleware } from "./middlewares/error.middleware.js";

dotenv.config();

const app = express();

// ---- Security & core middleware ----
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Global rate limiter — protects auth + write endpoints from abuse.
// Tighten further per-route (e.g. login) if you see brute-force attempts.
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later",
    data: {},
  },
});
app.use(globalLimiter);

// ---- Routes ----
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "API is healthy", data: {} });
});

app.use("/api/user", userRoutes);
app.use("/api/owner", ownerRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/notifications", notificationRoutes);

// ---- Error handling (must be last) ----
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
