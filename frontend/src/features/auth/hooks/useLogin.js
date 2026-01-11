import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { authService } from "../authService";
import { validateLogin } from "~/shared/utils/validators";
import { rbacApi } from "~/api/rbacApi";
import { authApi } from "~/api/authApi";
import { canAccessScreen } from "~/shared/utils/ability";
import { useAuth } from "~/app/providers/AuthProvides";

const unwrap = (res) => res?.data ?? res;

/** Ưu tiên message backend */
const getBackendMessage = (err) => {
  const data = err?.response?.data;
  if (data?.error?.message) return data.error.message;
  if (data?.message) return data.message;
  if (typeof data === "string") return data;
  return err?.message || "Đăng nhập thất bại";
};

export function useLogin() {
  const navigate = useNavigate();
  const { refreshMe } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // =====================
  // FORM HANDLERS
  // =====================
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setFieldErrors((p) => ({ ...p, [name]: "" }));
    setError("");
  };

  // =====================
  // LOCAL LOGIN
  // =====================
  const onSubmit = async (e) => {
    e.preventDefault();

    const { isValid, errors } = validateLogin(form);
    if (!isValid) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const loginRes = await authService.login(form);
      const loginData = unwrap(loginRes);

      const accessToken =
        loginData?.data?.accessToken || loginData?.accessToken;

      if (!accessToken) {
        throw new Error("Không nhận được accessToken");
      }

      setSuccess("Đăng nhập thành công");

      await handleAfterLogin();
    } catch (err) {
      setSuccess("");
      setError(getBackendMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // =====================
  // GOOGLE LOGIN
  // =====================
  const onGoogleLogin = async (credentialResponse) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const credential = credentialResponse?.credential;
      if (!credential) {
        throw new Error("Không nhận được Google credential");
      }


      const res = await authService.googleLogin(credential)

      const result = unwrap(res)?.data || unwrap(res);

      if (!result?.accessToken) {
        throw new Error("Không nhận được accessToken");
      }

      setSuccess("Đăng nhập Google thành công");

      await handleAfterLogin();
    } catch (err) {
      setSuccess("");

      setError(getBackendMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // =====================
  // AFTER LOGIN (CHUNG)
  // =====================
  const handleAfterLogin = async () => {
    const me = await refreshMe();

    const permissions = me?.permissions || [];

    const userType = Array.isArray(me?.userType)
    const isOnlyUser = userType !== "internal"


    // // đợi toast hiện
    await new Promise((r) => setTimeout(r, 1000));

    if (isOnlyUser) {
      navigate("/", { replace: true });
      return;
    }

    // RBAC catalog
    let catalog = {};
    try {
      const catalogRes = await rbacApi.catalog();
      catalog = unwrap(catalogRes) || {};
    } catch {
      catalog = {};
    }

    const screens = catalog?.data?.screens || [];
    const allowedScreens = screens
      .filter((s) => canAccessScreen(permissions, s))
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

    if (!allowedScreens.length) {
      navigate("/", { replace: true });
      return;
    }

    let firstRoute = allowedScreens[0]?.routes?.[0] || "/admin";
    if (!firstRoute.startsWith("/")) firstRoute = "/" + firstRoute;
    if (!firstRoute.startsWith("/admin")) {
      firstRoute = "/admin" + (firstRoute === "/" ? "" : firstRoute);
    }

    navigate(firstRoute, { replace: true });
  };

  return {
    form,
    fieldErrors,
    error,
    success,
    loading,
    onChange,
    onSubmit,
    onGoogleLogin, // ✅ export Google login
  };
}
