import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate, Link, useLocation } from "react-router";
import { toast } from "react-toastify";
import { Mail, Lock, Home } from "lucide-react";
import { loginUser } from "../../redux/slices/userSlice.js";
import { loginOwner } from "../../redux/slices/ownerSlice.js";

export function Login() {
  const [role, setRole] = useState("user");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (formData) => {
  const action =
    role === "owner" ? loginOwner(formData) : loginUser(formData);

  const result = await dispatch(action);

  if (result.meta.requestStatus === "fulfilled") {
    // Mobile not verified
    if (!result.payload.data?.user?.isMobileVerified) {
       const mobile = result?.payload?.data?.mobile
      navigate(`/verifymobile/${mobile}`);
      toast.success(result.payload.message);
      return;
    }

    // Login successful
    toast.success(result.payload.message);

    const redirectTo = location.state?.from?.pathname || "/";
    navigate(redirectTo, { replace: true });
  } else {
    toast.error(result.payload || "Login failed");
  }
};

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#FEFDFB] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-[#E7E4DC] bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <Home className="mx-auto mb-2 text-[#2F6844]" size={32} />
          <h1 className="font-serif text-2xl font-bold text-[#14213D]">Welcome back</h1>
          <p className="mt-1 text-sm text-gray-500">Log in to continue to MyProperty</p>
        </div>

        {/* Role toggle */}
        <div className="mb-6 flex rounded-full bg-gray-100 p-1">
          {["user", "owner"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 rounded-full py-2 text-sm font-semibold capitalize transition ${role === r ? "bg-[#14213D] text-white shadow" : "text-gray-500"
                }`}
            >
              {r}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email or Phone
            </label>

            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="String"
                {...register("emailOrmobile", {
                  required: "Email or phone is required",
                  validate: (value) => {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    const phoneRegex = /^(\+91)?[6-9]\d{9}$/;

                    if (emailRegex.test(value) || phoneRegex.test(value)) {
                      return true;
                    }
                    return "Enter a valid email or mobile number";
                  },
                })}
                placeholder="Enter email or phone"
                className="w-full rounded-lg border border-[#E7E4DC] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#2F6844] focus:ring-2 focus:ring-[#2F6844]/15"
              />
            </div>

            {errors.emailOrmobile && (
              <p className="mt-1 text-xs text-red-500">
                {errors.emailOrmobile.message}
              </p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                {...register("password", { required: "Password is required" })}
                placeholder="••••••••"
                className="w-full rounded-lg border border-[#E7E4DC] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#2F6844] focus:ring-2 focus:ring-[#2F6844]/15"
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="text-right">
            <Link
              to={role === "owner" ? "/owner/forgot-password" : "/forgot-password"}
              className="text-xs font-medium text-[#2F6844] hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-[#14213D] py-2.5 text-sm font-semibold text-white transition hover:bg-[#2F6844] disabled:opacity-60"
          >
            {isSubmitting ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link to="/signup" className="font-semibold text-[#2F6844] hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
