// src/features/auth/hooks/useLogin.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../authService";
import { authStorage } from "../authStorage";
import { validateLogin } from "~/shared/utils/validators";
import { rbacApi } from "~/api/rbacApi";
import { canAccessScreen } from "~/shared/utils/ability";
import { useAuth } from "~/app/providers/AuthProvides";

const unwrap = (res) => res?.data?.data ?? res?.data;

export function useLogin() {
  const navigate = useNavigate();
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
    if (!isValid) return setFieldErrors(errors);

    setLoading(true);
    setError("");

    try {
      // 1) login => token
      const loginData = await authService.login(form);
      const accessToken = loginData?.accessToken;

      if (!accessToken) throw new Error("Backend không trả accessToken");
      authStorage.setToken(accessToken);

      // 2) refresh /me để AuthProvider có permissions
      const me = await refreshMe(); // mình sẽ sửa refreshMe return data bên dưới
      const permissions = me?.permissions || [];


      // 3) lấy catalog và tìm screen đầu tiên user được vào
      const catalogRes = await rbacApi.catalog();
      console.log(catalogRes, "Catalog")
      console.log(">>>>> Vao den day")
      const catalog = unwrap(catalogRes) || {};

      const screens = catalog.screens || [];
      console.log(screens, "Day la screens")


      const allowedScreens = screens
        .filter((s) => canAccessScreen(permissions, s))
        .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

      console.log(allowedScreens)
      if (!allowedScreens.length) {
        // không có quyền admin => về client
        navigate("/", { replace: true });
        return;
      }


      let firstRoute = allowedScreens[0]?.routes?.[0] || "/admin";
      if (!firstRoute.startsWith("/")) firstRoute = "/" + firstRoute;
      if (!firstRoute.startsWith("/admin")) firstRoute = "/admin" + (firstRoute === "/" ? "" : firstRoute);
      navigate(firstRoute, { replace: true });


    } catch (err) {
      const backendError = err?.response?.data?.error;

      if (backendError?.code === "VALIDATION_ERROR" && Array.isArray(backendError.details)) {
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
