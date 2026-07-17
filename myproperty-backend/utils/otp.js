import { twilioClient, TWILIO_VERIFY_SERVICE_SID } from "../config/twilio.js";

/**
 * Sends an OTP to the given mobile number via Twilio Verify.
 * `mobile` must be in E.164 format, e.g. +919876543210.
 */
export const sendOtp = async (mobile) => {
  return twilioClient.verify.v2
    .services(TWILIO_VERIFY_SERVICE_SID)
    .verifications.create({ to: mobile, channel: "sms" });
};

/**
 * Verifies the OTP code the user submitted.
 * Returns true only if Twilio reports status "approved".
 */
export const verifyOtp = async (mobile, code) => {
  const result = await twilioClient.verify.v2
    .services(TWILIO_VERIFY_SERVICE_SID)
    .verificationChecks.create({ to: mobile, code });

  return result.status === "approved";
};
