import { useCallback, useState } from "react";
import { authApi } from "~/api/authApi";

const getBackendMessage = (err) => {
  const data = err?.response?.data;
  if (data?.error?.message) return data.error.message;
  if (data?.message) return data.message;
  if (typeof data === "string") return data;
  return err?.message || "Có lỗi xảy ra";
};

export function useForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(""); // success msg
  const [error, setError] = useState("");     // error msg

  const submit = useCallback(async ({ email }) => {
    setError("");
    setMessage("");

    const value = String(email || "").trim();
    if (!value) {
      setError("Vui lòng nhập email");
      return { ok: false };
    }

    try {
      setLoading(true);
      const res = await authApi.forgotPassword({ email: value });
      const msg =
        res?.data?.data?.message ||
        "Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.";
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
