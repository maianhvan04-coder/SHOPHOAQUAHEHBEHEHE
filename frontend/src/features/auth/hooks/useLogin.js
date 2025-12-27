// src/features/auth/hooks/useLogin.js
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authService } from "../authService";
import { authStorage } from "../authStorage";
import { validateLogin } from "~/shared/utils/validators";
import { rbacApi } from "~/api/rbacApi";
import { canAccessScreen } from "~/shared/utils/ability";
import { useAuth } from "~/app/providers/AuthProvides"; // ✅ sửa đúng file

const unwrap = (res) => res?.data?.data ?? res?.data;

export function useLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshMe } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value, isTrusted } = e.target;
    setForm((p) => ({ ...p, [name]: value }));

    if (isTrusted) {
      setFieldErrors((p) => ({ ...p, [name]: "" }));
      setError("");
    }
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

    try {
      // 1) login => token
      const loginData = await authService.login(form);
      const accessToken = loginData?.accessToken;
      if (!accessToken) throw new Error("Backend không trả accessToken");

      authStorage.setToken(accessToken);

      // 2) refresh /me để AuthProvider có user/permissions
      const me = await refreshMe();
      const permissions = me?.permissions || [];

    const role =me?.roles || me?.user?.roles 
     
      const roles = Array.isArray(me?.roles)
        ? me.roles
        : role
        ? [role]
        : [];

      const isOnlyUser =
        roles.length > 0 &&
        roles.every((r) => String(r).toUpperCase() === "USER");


            console.log("Roles>>>>>",isOnlyUser)
      if (isOnlyUser) {
        navigate("/", { replace: true });
        return;
      }
      let catalog = {};
      try {
        const catalogRes = await rbacApi.catalog();
        catalog = unwrap(catalogRes) || {};
      } catch {
        catalog = {};
      }

      const screens = catalog.screens || [];
      const allowedScreens = screens
        .filter((s) => canAccessScreen(permissions, s))
        .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

      // 5) không có quyền admin => về client
      if (!allowedScreens.length) {
        navigate("/", { replace: true });
        return;
      }

      // 6) có quyền admin => route đầu tiên
      let firstRoute = allowedScreens[0]?.routes?.[0] || "/admin";
      if (!firstRoute.startsWith("/")) firstRoute = "/" + firstRoute;
      if (!firstRoute.startsWith("/admin"))
        firstRoute = "/admin" + (firstRoute === "/" ? "" : firstRoute);

      navigate(firstRoute, { replace: true });
    } catch (err) {
      const backendError = err?.response?.data?.error;

      if (
        backendError?.code === "VALIDATION_ERROR" &&
        Array.isArray(backendError.details)
      ) {
        const mapped = {};
        backendError.details.forEach((d) => {
          if (d?.field) mapped[d.field] = d.message;
        });
        setFieldErrors(mapped);
        setError(backendError.message || "Dữ liệu không hợp lệ");
      } else {
        setError(backendError?.message || err?.message || "Đăng nhập thất bại");
      }
    } finally {
      setLoading(false);
    }
  };

  return { form, fieldErrors, error, loading, onChange, onSubmit };
}
