import { useForm } from "react-hook-form";
import { useParams, useNavigate, Link } from "react-router";
import { toast } from "react-toastify";
import { Lock, Home } from "lucide-react";
import axiosInstance from "../../services/axiosInstance.js";
import { getErrorMessage } from "../../utils/getErrorMessage.js";

export function ResetPassword({ role = "user" }) {
  const { token } = useParams();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const password = watch("password");

  const onSubmit = async ({ password }) => {
    try {
      const endpoint =
        role === "owner"
          ? `/owner/reset-password/${token}`
          : `/user/reset-password/${token}`;
      const { data } = await axiosInstance.post(endpoint, { password });
      toast.success(data.message);
      navigate("/login");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#FEFDFB] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-[#E7E4DC] bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <Home className="mx-auto mb-2 text-[#2F6844]" size={32} />
          <h1 className="font-serif text-2xl font-bold text-[#14213D]">Reset your password</h1>
          <p className="mt-1 text-sm text-gray-500">Choose a new password below</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">New Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "At least 6 characters" },
                })}
                placeholder="••••••••"
                className="w-full rounded-lg border border-[#E7E4DC] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#2F6844] focus:ring-2 focus:ring-[#2F6844]/15"
              />
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Confirm Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) => value === password || "Passwords do not match",
                })}
                placeholder="••••••••"
                className="w-full rounded-lg border border-[#E7E4DC] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#2F6844] focus:ring-2 focus:ring-[#2F6844]/15"
              />
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-[#14213D] py-2.5 text-sm font-semibold text-white transition hover:bg-[#2F6844] disabled:opacity-60"
          >
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Remembered it? <Link to="/login" className="font-semibold text-[#2F6844] hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
