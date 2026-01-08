import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { useResetPassword } from "~/features/auth/hooks/useResetPassword";
import bg from "~/assets/backgroud-auth.webp";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const query = useQuery();

  // token trên URL (chỉ dùng 1 lần rồi xoá khỏi URL)
  const urlToken = query.get("token") || "";

  // token dùng để submit: ưu tiên sessionStorage để refresh không mất
  const [token, setToken] = useState(() => sessionStorage.getItem("reset_token") || "");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNew, setShowNew] = useState(false);
  const [showCfm, setShowCfm] = useState(false);

  const { loading, message: success, error, submit } = useResetPassword();

  // Toast
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("error"); // error | success
  const isSuccess = toastType === "success";

  // ✅ Nhận token từ URL -> lưu lại -> ẩn token khỏi URL
  useEffect(() => {
    if (!urlToken) return;

    sessionStorage.setItem("reset_token", urlToken);
    setToken(urlToken);

    // ẩn token khỏi thanh địa chỉ
    navigate("/reset-password", { replace: true });
  }, [urlToken, navigate]);

  // ✅ Toast message
  useEffect(() => {
    const msg = success || error;
    if (!msg) return;

    setToastType(success ? "success" : "error");
    setToastMsg(msg);
    setToastOpen(true);

    const t = setTimeout(() => setToastOpen(false), 2500);
    return () => clearTimeout(t);
  }, [success, error]);

  // ✅ Redirect sau success + clear token
  useEffect(() => {
    if (!success) return;

    sessionStorage.removeItem("reset_token");

    const t = setTimeout(() => navigate("/login"), 800);
    return () => clearTimeout(t);
  }, [success, navigate]);

  // ✅ style input
  const inputBase =
    "w-full h-12 px-5 rounded-2xl bg-white/10 backdrop-blur-md " +
    "border outline-none transition text-white placeholder:text-white/60 " +
    "focus:ring-4 disabled:opacity-70 disabled:cursor-not-allowed";

  const inputOk = "border-white/25 focus:border-white/45 focus:ring-white/10";
  const inputErr = "border-red-300/60 focus:border-red-200 focus:ring-red-200/10";

  const onSubmit = async (e) => {
    e.preventDefault();
    await submit({ token, newPassword, confirmPassword });
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
                {isSuccess ? "Đặt lại mật khẩu thành công" : "Đặt lại mật khẩu thất bại"}
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
          <h1 className="text-center text-4xl font-semibold text-white mb-3">Reset Password</h1>
          <p className="text-center text-sm text-white/80 mb-10">
            Set a new password for your account.
          </p>

          {!token ? (
            <div className="mb-6 text-sm bg-yellow-50/10 text-yellow-100 border border-yellow-200/20 rounded-xl p-3">
              Missing token. Please open the reset link from your email and try again.
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="space-y-7">
            {/* NEW PASSWORD */}
            <div>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                  placeholder="New password"
                  autoComplete="new-password"
                  className={[inputBase, "pr-12", error ? inputErr : inputOk].join(" ")}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((p) => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition"
                  aria-label={showNew ? "Hide password" : "Show password"}
                >
                  {showNew ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <div className="relative">
                <input
                  type={showCfm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  placeholder="Confirm password"
                  autoComplete="new-password"
                  className={[inputBase, "pr-12", error ? inputErr : inputOk].join(" ")}
                />
                <button
                  type="button"
                  onClick={() => setShowCfm((p) => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition"
                  aria-label={showCfm ? "Hide confirm password" : "Show confirm password"}
                >
                  {showCfm ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading || !token}
              className={[
                "w-full h-12 rounded-xl font-semibold text-lg",
                "bg-white/90 text-gray-900 hover:bg-white transition",
                "disabled:opacity-70 disabled:cursor-not-allowed",
              ].join(" ")}
            >
              {loading ? "Saving..." : "Reset Password"}
            </button>

            {/* Links */}
            <div className="flex items-center justify-between text-sm text-white/90">
              <Link
                to="/forgot-password"
                className="hover:underline text-white/90"
                onClick={() => sessionStorage.removeItem("reset_token")}
              >
                Get new link
              </Link>

              <Link to="/login" className="hover:underline text-white/90">
                Back to login
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
