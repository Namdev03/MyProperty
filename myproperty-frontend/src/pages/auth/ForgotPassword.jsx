import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { toast } from "react-toastify";
import { Mail, Home, ArrowLeft } from "lucide-react";
import axiosInstance from "../../services/axiosInstance.js";
import { getErrorMessage } from "../../utils/getErrorMessage.js";

export function ForgotPassword() {
  const [role, setRole] = useState("user");
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async ({ email }) => {
    try {
      const endpoint = role === "owner" ? "/owner/forgot-password" : "/user/forgot-password";
      const { data } = await axiosInstance.post(endpoint, { email });
      toast.success(data.message);
      setSent(true);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#FEFDFB] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-[#E7E4DC] bg-white p-8 shadow-sm">
        <Link to="/login" className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-[#14213D]">
          <ArrowLeft size={14} /> Back to login
        </Link>

        <div className="mb-6 text-center">
          <Home className="mx-auto mb-2 text-[#2F6844]" size={32} />
          <h1 className="font-serif text-2xl font-bold text-[#14213D]">Forgot password?</h1>
          <p className="mt-1 text-sm text-gray-500">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        {sent ? (
          <div className="rounded-lg bg-[#2F6844]/10 p-4 text-center text-sm text-[#2F6844]">
            If an account exists with that email, a reset link has been sent. Check your inbox.
          </div>
        ) : (
          <>
            <div className="mb-6 flex rounded-full bg-gray-100 p-1">
              {["user", "owner"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex-1 rounded-full py-2 text-sm font-semibold capitalize transition ${
                    role === r ? "bg-[#14213D] text-white shadow" : "text-gray-500"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    {...register("email", { required: "Email is required" })}
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-[#E7E4DC] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#2F6844] focus:ring-2 focus:ring-[#2F6844]/15"
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-[#14213D] py-2.5 text-sm font-semibold text-white transition hover:bg-[#2F6844] disabled:opacity-60"
              >
                {isSubmitting ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
