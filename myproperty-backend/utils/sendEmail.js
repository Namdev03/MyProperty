import { transporter } from "../config/nodemailer.js";

/**
 * Generic email sender. Pass a plain-text `text` or `html` body.
 * Every module (auth, booking, contact) reuses this instead of
 * duplicating nodemailer calls.
 */
export const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"MyProperty" <${process.env.EMAIL}>`,
    to,
    subject,
    html,
  });
};
