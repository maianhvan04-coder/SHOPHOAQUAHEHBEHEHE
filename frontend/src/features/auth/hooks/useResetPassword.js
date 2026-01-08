import { useCallback, useState } from "react";
import { authApi } from "~/api/authApi";

const getBackendMessage = (err) => {
  const data = err?.response?.data;
  if (data?.error?.message) return data.error.message;
  if (data?.message) return data.message;
  if (typeof data === "string") return data;
  return err?.message || "Có lỗi xảy ra";
};

export function useResetPassword() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(""); // success msg
  const [error, setError] = useState("");     // error msg

  const submit = useCallback(async ({ token, newPassword, confirmPassword }) => {
    setError("");
    setMessage("");

    const t = String(token || "").trim();
    const np = String(newPassword || "");
    const cp = String(confirmPassword || "");

    if (!t) {
      const msg = "Thiếu token. Hãy mở từ link được gửi qua email.";
      setError(msg);
      return { ok: false, error: msg };
    }
    if (!np.trim() || !cp.trim()) {
      const msg = "Vui lòng nhập đầy đủ mật khẩu mới và xác nhận mật khẩu";
      setError(msg);
      return { ok: false, error: msg };
    }
    if (np !== cp) {
      const msg = "Xác nhận mật khẩu không khớp";
      setError(msg);
      return { ok: false, error: msg };
    }

    try {
      setLoading(true);
      const res = await authApi.resetPassword({
        token: t,
        newPassword: np.trim(),
        confirmPassword: cp.trim(),
      });

      const msg =
        res?.data?.data?.message ||
        "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.";
      setMessage(msg);
      return { ok: true, message: msg };
    } catch (err) {
      const msg = getBackendMessage(err);
      setError(msg);
      return { ok: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const resetState = useCallback(() => {
    setLoading(false);
    setMessage("");
    setError("");
  }, []);

  return { loading, message, error, submit, resetState };
}
