import React, { useEffect, useRef, useState } from "react";
import axiosInstance from "../../services/axiosInstance.js";
import { Navigate, replace, useNavigate, useParams } from "react-router"
import { toast } from "react-toastify";
const VerifyMobile = () => {
  const OTP_LENGTH = 6;

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [timer, setTimer] = useState(20);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const { mobile } = useParams()
  const nevigate = useNavigate()
  const inputRefs = useRef([]);

  // Countdown Timer
  useEffect(() => {
    if (!isResendDisabled) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isResendDisabled]);

  // OTP Input Change
  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Backspace
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  // Paste OTP
  const handlePaste = (e) => {
    e.preventDefault();

    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    if (!pasted) return;

    const newOtp = [...otp];

    pasted.split("").forEach((digit, index) => {
      newOtp[index] = digit;
    });

    setOtp(newOtp);

    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      return toast.error("Please enter a valid 6-digit OTP");
    }
   try {
    const response = await axiosInstance.post(
      `/user/verify/${mobile}`,
      {
        otp: otpCode,
      }
    );
    console.log(response);
    console.log(response.ata);
    toast.success(response.data.message);
    nevigate("/", { replace: true })
   } catch (error) {
    console.log(error);
    toast.error(error.resonse.data.message)
   }
   }
  // Resend
  const handleResend = () => {
    console.log("Resend OTP");
    // Resend OTP API
    setOtp(Array(OTP_LENGTH).fill(""));
    inputRefs.current[0]?.focus();
    setTimer(20);
    setIsResendDisabled(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800">
          Verify Mobile
        </h1>

        <p className="mt-3 text-center text-gray-500 text-sm sm:text-base">
          Enter the 6-digit OTP sent to your registered mobile number.
        </p>

        <form onSubmit={handleSubmit} className="mt-8">
          {/* OTP Inputs */}
          <div className="flex justify-center gap-2 sm:gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) =>
                  handleChange(e.target.value, index)
                }
                onKeyDown={(e) =>
                  handleKeyDown(e, index)
                }
                onPaste={handlePaste}
                className="w-11 h-12 sm:w-14 sm:h-14 border-2 border-gray-300 rounded-xl text-center text-xl sm:text-2xl font-bold outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition"
              />
            ))}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition"
          >
            Verify OTP
          </button>

          {/* Resend */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              Didn't receive the OTP?
            </p>

            <button
              type="button"
              onClick={handleResend}
              disabled={isResendDisabled}
              className={`mt-2 font-semibold transition ${isResendDisabled
                ? "text-gray-400 cursor-not-allowed"
                : "text-blue-600 hover:text-blue-700"
                }`}
            >
              {isResendDisabled
                ? `Resend OTP in ${timer}s`
                : "Resend OTP"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyMobile;