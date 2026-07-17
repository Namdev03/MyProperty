import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router";
import { toast } from "react-toastify";
import { Home, Mail, Lock, User, Phone, Building2 } from "lucide-react";
import { registerUser } from "../../redux/slices/userSlice.js";
import { registerOwner } from "../../redux/slices/ownerSlice.js";

export function Signup() {
  const [role, setRole] = useState("user");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const password = watch("password");

  const onSubmit = async (formData) => {
    const action =
      role === "owner" ? registerOwner(formData) : registerUser(formData);
    const result = await dispatch(action);

    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Account created! Please log in.");
      navigate("/login");
    } else {
      toast.error(result.payload || "Registration failed");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#FEFDFB] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-[#E7E4DC] bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <Home className="mx-auto mb-2 text-[#2F6844]" size={32} />
          <h1 className="font-serif text-2xl font-bold text-[#14213D]">Create an account</h1>
          <p className="mt-1 text-sm text-gray-500">Join MyProperty in seconds</p>
        </div>

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
              {r === "owner" ? "Property Owner" : "User"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {role === "owner" ? (
            <>
              <Field
                icon={Building2}
                label="Company Name"
                error={errors.companyName}
                inputProps={register("companyName", { required: "Company name is required" })}
                placeholder="Acme Realty"
              />
              <Field
                icon={User}
                label="Owner Name"
                error={errors.ownerName}
                inputProps={register("ownerName", { required: "Owner name is required" })}
                placeholder="Jane Doe"
              />
            </>
          ) : (
            <Field
              icon={User}
              label="Full Name"
              error={errors.fullName}
              inputProps={register("fullName", { required: "Full name is required" })}
              placeholder="Jane Doe"
            />
          )}

          <Field
            icon={Mail}
            label="Email"
            type="email"
            error={errors.email}
            inputProps={register("email", { required: "Email is required" })}
            placeholder="you@example.com"
          />

          <Field
            icon={Phone}
            label="Mobile Number"
            error={errors.mobile}
            inputProps={register("mobile", {
              required: "Mobile number is required",
              pattern: { value: /^[0-9+ ]{10,15}$/, message: "Enter a valid mobile number" },
            })}
            placeholder="+91 98765 43210"
          />

          <Field
            icon={Lock}
            label="Password"
            type="password"
            error={errors.password}
            inputProps={register("password", {
              required: "Password is required",
              minLength: { value: 6, message: "At least 6 characters" },
            })}
            placeholder="••••••••"
          />

          <Field
            icon={Lock}
            label="Confirm Password"
            type="password"
            error={errors.confirmPassword}
            inputProps={register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) => value === password || "Passwords do not match",
            })}
            placeholder="••••••••"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-[#14213D] py-2.5 text-sm font-semibold text-white transition hover:bg-[#2F6844] disabled:opacity-60"
          >
            {isSubmitting ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-[#2F6844] hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, type = "text", error, inputProps, placeholder }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type={type}
          {...inputProps}
          placeholder={placeholder}
          className="w-full rounded-lg border border-[#E7E4DC] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#2F6844] focus:ring-2 focus:ring-[#2F6844]/15"
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error.message}</p>}
    </div>
  );
}
