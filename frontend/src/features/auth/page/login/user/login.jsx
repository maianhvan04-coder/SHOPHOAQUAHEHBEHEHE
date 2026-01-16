import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { GoogleLogin } from "@react-oauth/google";

import { useLogin } from "~/features/auth/hooks/useLogin";
import bg from "~/assets/backgroud-auth.webp";

export default function LoginPage() {
  const {
    form,
    fieldErrors,
    error,
    success,
    loading,
    onChange,
    onSubmit,
    onGoogleLogin,
  } = useLogin();

  const [showPassword, setShowPassword] = useState(false);

  // Toast
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("error");

  useEffect(() => {
    const msg = success || error;
    if (!msg) return;

    setToastType(success ? "success" : "error");
    setToastMsg(msg);
    setToastOpen(true);

    const t = setTimeout(() => setToastOpen(false), 2500);
    return () => clearTimeout(t);
  }, [error, success]);

  const isSuccess = toastType === "success";

  const inputBase =
    "w-full h-12 px-5 rounded-2xl bg-white/10 backdrop-blur-md " +
    "border outline-none transition text-white placeholder:text-white/60 " +
    "focus:ring-4 disabled:opacity-70 disabled:cursor-not-allowed";

  const inputOk = "border-white/25 focus:border-white/45 focus:ring-white/10";
  const inputErr =
    "border-red-300/60 focus:border-red-200 focus:ring-red-200/10";

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat relative flex items-center justify-center px-4"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="absolute inset-0 bg-black/35" />

      {/* Toast */}
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
                {isSuccess ? "Đăng nhập thành công" : "Đăng nhập thất bại"}
              </p>
              <p className="mt-1 text-sm text-white/85 break-words">
                {toastMsg}
              </p>
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

      {/* Card */}
      <div className="relative z-10 w-[560px] max-w-[95vw]">
        <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.45)] px-12 py-10">
          <h1 className="text-center text-4xl font-semibold text-white mb-10">
            Login
          </h1>

          <form onSubmit={onSubmit} className="space-y-7">
            {/* Email */}
            <div>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                disabled={loading}
                placeholder="Email"
                autoComplete="username"
                className={[
                  "glass-input",
                  inputBase,
                  fieldErrors.email ? inputErr : inputOk,
                ].join(" ")}
              />
              {fieldErrors.email && (
                <p className="mt-2 text-xs text-red-200">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  disabled={loading}
                  placeholder="Password"
                  autoComplete="current-password"
                  className={[
                    "glass-input",
                    inputBase,
                    "pr-12",
                    fieldErrors.password ? inputErr : inputOk,
                  ].join(" ")}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>

              <div className="mt-2 flex items-center justify-between">
                {fieldErrors.password ? (
                  <p className="text-xs text-red-200">{fieldErrors.password}</p>
                ) : (
                  <span />
                )}

                {/* ✅ Link sang trang quên password có sẵn */}
                <Link
                  to="/forgot-password"
                  className="text-xs text-white/85 hover:text-white hover:underline"
                >
                  Forgot-password?
                </Link>
              </div>
            </div>

            {/* Local login button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl font-semibold text-lg bg-white/90 text-gray-900 hover:bg-white disabled:opacity-70"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-4">
              <div className="flex-1 h-px bg-white/20" />
              <span className="text-sm text-white/70">OR</span>
              <div className="flex-1 h-px bg-white/20" />
            </div>

            {/* Google login */}
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={onGoogleLogin}
                onError={() => {
                  setToastType("error");
                  setToastMsg("Google login failed");
                  setToastOpen(true);
                }}
              />
            </div>

            <p className="text-center text-sm text-white/90">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="hover:underline text-white">
                Register
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

        /* ✅ Remove Chrome/Google autofill white/blue background (scoped) */
        input.glass-input:-webkit-autofill,
        input.glass-input:-webkit-autofill:hover,
        input.glass-input:-webkit-autofill:focus,
        textarea.glass-input:-webkit-autofill,
        select.glass-input:-webkit-autofill {
          -webkit-text-fill-color: #ffffff !important;
          caret-color: #ffffff !important;

          /* phủ nền autofill bằng nền glass */
          box-shadow: 0 0 0px 1000px rgba(255,255,255,0.10) inset !important;
          -webkit-box-shadow: 0 0 0px 1000px rgba(255,255,255,0.10) inset !important;

          /* trick để chrome không “vẽ lại” nền autofill */
          transition: background-color 9999s ease-out 0s !important;
        }
      `}</style>
    </div>
  );
}
