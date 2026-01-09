// src/pages/auth/RegisterPage.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { authApi } from "../../../../../api/authApi";

import bg from "~/assets/backgroud-auth.webp";

const RegisterPage = () => {
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // toast
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("error"); // error | success

  const validate = () => {
    const newErrors = {};

    if (!formValues.fullName.trim())
      newErrors.fullName = "Vui lòng nhập họ và tên!";

    if (!formValues.email)
      newErrors.email = "Vui lòng nhập email!";
    else if (!/\S+@\S+\.\S+/.test(formValues.email))
      newErrors.email = "Email không hợp lệ!";

    // Password rules
    if (!formValues.password) {
      newErrors.password = "Vui lòng nhập mật khẩu!";
    } else {
      const pwd = formValues.password;

      if (pwd.length < 8) {
        newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự!";
      } else if (!/[A-Z]/.test(pwd)) {
        newErrors.password = "Mật khẩu phải có ít nhất 1 chữ hoa (A-Z)!";
      } else if (!/[0-9]/.test(pwd)) {
        newErrors.password = "Mật khẩu phải có ít nhất 1 chữ số (0-9)!";
      } else if (!/[^\w\s]/.test(pwd)) {
        newErrors.password = "Mật khẩu phải có ít nhất 1 ký tự đặc biệt (VD: !@#$)!";
      }
    }

    // ✅ Confirm password
    if (!formValues.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng nhập lại mật khẩu!";
    } else if (formValues.confirmPassword !== formValues.password) {
      newErrors.confirmPassword = "Mật khẩu nhập lại không khớp!";
    }

    return newErrors;
  };

  const showToast = (type, message) => {
    setToastType(type);
    setToastMsg(message);
    setToastOpen(true);
  };

  useEffect(() => {
    if (!toastOpen) return;
    const t = setTimeout(() => setToastOpen(false), 2500);
    return () => clearTimeout(t);
  }, [toastOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setToastOpen(false);

    try {
      await authApi.register({
        fullName: formValues.fullName,
        email: formValues.email,
        password: formValues.password,
      });

      showToast("success", "Đăng ký thành công! Đang chuyển đến trang đăng nhập...");
      setTimeout(() => navigate("/login"), 800);
    } catch (error) {
      const msg =
        error?.response?.data?.error?.message ||
        error?.response?.data?.EM ||
        error?.response?.data?.message ||
        "Đăng ký thất bại! Vui lòng thử lại.";

      showToast("error", msg);
    } finally {
      setLoading(false);
    }
  };

  const isSuccess = toastType === "success";

  const inputBase =
    "w-full h-12 px-5 rounded-2xl bg-white/10 backdrop-blur-md " +
    "border outline-none transition text-white placeholder:text-white/60 " +
    "focus:ring-4 disabled:opacity-70 disabled:cursor-not-allowed";

  const inputOk = "border-white/25 focus:border-white/45 focus:ring-white/10";
  const inputErr = "border-red-300/60 focus:border-red-200 focus:ring-red-200/10";

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat relative flex items-center justify-center px-4"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* overlay */}
      <div className="absolute inset-0 bg-black/35" />

      {/* Toast (giống login) */}
      {toastOpen && toastMsg && (
        <div className="fixed top-5 right-5 z-[9999] w-[340px] max-w-[92vw]">
          <div
            className={[
              "rounded-xl border backdrop-blur-md shadow-2xl overflow-hidden",
              "bg-white/10",
              isSuccess ? "border-emerald-300/30" : "border-red-300/30",
            ].join(" ")}
          >
            <div className="px-4 py-3">
              <p className="text-sm font-semibold text-white">
                {isSuccess ? "Register successful" : "Register failed"}
              </p>
              <p className="mt-1 text-sm text-white/85 break-words">{toastMsg}</p>
            </div>

            <div className="h-1 w-full bg-white/10">
              <div
                className={isSuccess ? "h-1 bg-emerald-400" : "h-1 bg-red-400"}
                style={{ animation: "shrink 2.5s linear forwards" }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Card (giống login) */}
      <div className="relative z-10 w-[560px] max-w-[95vw]">
        <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.45)] px-12 py-10">
          <h1 className="text-center text-4xl font-semibold text-white mb-10">
            Register
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full name */}
            <div>
              <input
                type="text"
                name="fullName"
                placeholder="Full name"
                value={formValues.fullName}
                onChange={handleChange}
                disabled={loading}
                autoComplete="name"
                className={[
                  inputBase,
                  errors.fullName ? inputErr : inputOk,
                ].join(" ")}
              />
              {errors.fullName && (
                <p className="mt-2 text-xs text-red-200">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={formValues.email}
                onChange={handleChange}
                disabled={loading}
                autoComplete="email"
                className={[inputBase, errors.email ? inputErr : inputOk].join(
                  " "
                )}
              />
              {errors.email && (
                <p className="mt-2 text-xs text-red-200">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formValues.password}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="new-password"
                  className={[
                    inputBase,
                    "pr-12",
                    errors.password ? inputErr : inputOk,
                  ].join(" ")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-xs text-red-200">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={formValues.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="new-password"
                  className={[
                    inputBase,
                    "pr-12",
                    errors.confirmPassword ? inputErr : inputOk,
                  ].join(" ")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-xs text-red-200">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className={[
                "w-full h-12 rounded-xl font-semibold text-lg",
                "bg-white/90 text-gray-900 hover:bg-white transition",
                "disabled:opacity-70 disabled:cursor-not-allowed",
              ].join(" ")}
            >
              {loading ? "Creating..." : "Create Account"}
            </button>

            {/* Link to login */}
            <p className="text-center text-sm text-white/90">
              Already have an account?{" "}
              <Link to="/login" className="text-white hover:underline">
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }

        /* ✅ Fix nền trắng/xanh do Chrome autofill (giống login) */
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-text-fill-color: #fff !important;
          caret-color: #fff !important;
          transition: background-color 9999s ease-out 0s;
          -webkit-box-shadow: 0 0 0px 1000px rgba(255,255,255,0.10) inset !important;
          box-shadow: 0 0 0px 1000px rgba(255,255,255,0.10) inset !important;
          background-color: transparent !important;
          border-radius: 16px !important;
        }
      `}</style>
    </div>
  );
};

export default RegisterPage;
