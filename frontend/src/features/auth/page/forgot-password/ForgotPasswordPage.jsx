import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useForgotPassword } from "~/features/auth/hooks/useForgotPassword";

import bg from "~/assets/backgroud-auth.webp";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const { loading, message: success, error, submit } = useForgotPassword();

  // Toast
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("error"); // error | success

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

  // ✅ style input y hệt login
  const inputBase =
    "w-full h-12 px-5 rounded-2xl bg-white/10 backdrop-blur-md " +
    "border outline-none transition text-white placeholder:text-white/60 " +
    "focus:ring-4 disabled:opacity-70 disabled:cursor-not-allowed";

  const inputOk = "border-white/25 focus:border-white/45 focus:ring-white/10";
  const inputErr = "border-red-300/60 focus:border-red-200 focus:ring-red-200/10";

  const emailErr = !email.trim() && toastOpen && toastType === "error" ? "" : "";

  const onSubmit = async (e) => {
    e.preventDefault();
    await submit({ email });
  };

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat relative flex items-center justify-center px-4"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* overlay */}
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
                {isSuccess ? "Gửi link thành công" : "Gửi link thất bại"}
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

      {/* Card */}
      <div className="relative z-10 w-[560px] max-w-[95vw]">
        <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.45)] px-12 py-10">
          <h1 className="text-center text-4xl font-semibold text-white mb-3">
            Forgot Password
          </h1>
          <p className="text-center text-sm text-white/80 mb-10">
            Enter your email to receive a reset link.
          </p>

          <form onSubmit={onSubmit} className="space-y-7">
            {/* EMAIL */}
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                placeholder="Email"
                autoComplete="email"
                className={[inputBase, error ? inputErr : inputOk].join(" ")}
              />
              {/* Nếu bạn muốn hiển thị lỗi ngay dưới input thì mở dòng này */}
              {/* {error && <p className="mt-2 text-xs text-red-200">{error}</p>} */}
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
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            {/* Back */}
            <div className="flex items-center justify-between text-sm text-white/90">
              <Link to="/login" className="hover:underline text-white/90">
                ← Back to login
              </Link>

              <Link to="/register" className="hover:underline text-white/90">
                Create account
              </Link>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }

        /* ✅ Fix Chrome autofill giữ style glass */
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
}
