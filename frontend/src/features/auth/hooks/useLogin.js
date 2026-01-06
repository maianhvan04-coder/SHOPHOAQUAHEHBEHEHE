// src/features/auth/hooks/useLogin.js
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authService } from "../authService";
import { authStorage } from "../authStorage";
import { validateLogin } from "~/shared/utils/validators";
import { rbacApi } from "~/api/rbacApi";
import { canAccessScreen } from "~/shared/utils/ability";
import { useAuth } from "~/app/providers/AuthProvides";

const unwrap = (res) => res?.data ?? res;

/** Luôn ưu tiên thông báo backend trả về */
const getBackendMessage = (err) => {
  const data = err?.response?.data;
  if (data?.error?.message) return data.error.message;
  if (data?.message) return data.message;
  if (typeof data === "string") return data;
  return err?.message || "Đăng nhập thất bại";
};

export function useLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshMe } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(""); // ✅ thêm
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setFieldErrors((p) => ({ ...p, [name]: "" }));
    setError("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const { isValid, errors } = validateLogin(form);
    if (!isValid) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(""); // ✅ clear success cũ

    try {
      // 1) LOGIN
      const loginRes = await authService.login(form);
      const loginData = unwrap(loginRes);

      const accessToken =
        loginData?.data?.accessToken || loginData?.accessToken;

      if (!accessToken) throw new Error("Không nhận được accessToken")

      // ✅ toast success
      setSuccess("Đăng nhập thành công");

      // 2) ME
      const me = await refreshMe();
      const permissions = me?.permissions || [];

      const roles = Array.isArray(me?.roles)
        ? me.roles
        : me?.user?.roles
          ? [me.user.roles]
          : [];

      const isOnlyUser =
        roles.length > 0 &&
        roles.every((r) => String(r).toUpperCase() === "USER");

      // ✅ đợi 600ms cho toast kịp hiện rồi mới navigate
      await new Promise((r) => setTimeout(r, 1000));


      if (isOnlyUser) {
        navigate("/", { replace: true });
        return;
      }

      // 3) CATALOG
      let catalog = {};
      try {
        const catalogRes = await rbacApi.catalog();
        catalog = unwrap(catalogRes) || {};
      } catch {
        catalog = {};
      }


      const screens = catalog.data.screens
      const allowedScreens = screens
        .filter((s) => canAccessScreen(permissions, s))
        .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));


      if (!allowedScreens.length) {
        navigate("/", { replace: true });
        return;
      }

      let firstRoute = allowedScreens[0]?.routes?.[0] || "/admin";
      if (!firstRoute.startsWith("/")) firstRoute = "/" + firstRoute;
      if (!firstRoute.startsWith("/admin"))
        firstRoute = "/admin" + (firstRoute === "/" ? "" : firstRoute);


      navigate(firstRoute, { replace: true });
    } catch (err) {
      setSuccess("");

      const backendError = err?.response?.data?.error;

      if (
        backendError?.code === "VALIDATION_ERROR" &&
        Array.isArray(backendError?.details)
      ) {
        const mapped = {};
        backendError.details.forEach((d) => {
          if (d?.field) mapped[d.field] = d.message;
        });
        setFieldErrors(mapped);
      }

      setError(getBackendMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return { form, fieldErrors, error, success, loading, onChange, onSubmit };
}
