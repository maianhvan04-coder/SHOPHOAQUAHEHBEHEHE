import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../authService";
import { authStorage } from "../authStorage";
import { validateRegister } from "~/utils/validators";

export function useRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  useEffect(() => {
    const token = authStorage.get();
    if (token) navigate("/", { replace: true });
  }, [navigate]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setFieldErrors((p) => ({ ...p, [name]: "" }));
    setError("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const { isValid, errors } = validateRegister(form);
    if (!isValid) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    setError("");
     setSuccess("");   

    try {
      const payload = {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
      };

      const res = await authService.register(payload);
    setSuccess("Đăng ký thành công! Đang chuyển tới trang đăng nhập...");
      // success thì interceptor trả res.data dạng phẳng
      const accessToken =
        res?.tokens?.accessToken ||
        res?.accessToken ||
        res?.token;

      if (accessToken) {
        authStorage.set(accessToken);
        if (res.user) localStorage.setItem("user", JSON.stringify(res.user));
         setTimeout(() => navigate("/", { replace: true }), 800);
        return;
      }

      setTimeout(() => navigate("/", { replace: true }), 800);
    } catch (err) {
      const backendError =
        err?.backendError || err?.raw?.response?.data?.error;


      if (
        backendError?.code === "VALIDATION_ERROR" &&
        Array.isArray(backendError.details)
      ) {
        const mapped = {};

        backendError.details.forEach((d) => {
          if (!d?.field) return;

          // backend dùng "name" nhưng FE dùng "fullName"
          if (d.field === "fullName") mapped.fullName = d.message;
          else mapped[d.field] = d.message;
        });

        setFieldErrors(mapped);

        if (Object.keys(mapped).length === 0) {
          setError(backendError.message || "Dữ liệu không hợp lệ");
        } else {
          setError("");
        }
        return;

      }

      setError(backendError?.message || err?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    fieldErrors,
    error,
    success,
    loading,
    onChange,
    onSubmit,
  };
}
