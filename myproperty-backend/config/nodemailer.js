import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Gmail is assumed here. Swap `service` for your provider, or use host/port
// if you're on a transactional email provider (SendGrid, Mailgun, etc.).
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD, // use a Gmail App Password, not your real password
  },
});
