import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { authApi } from "../../../api/authApi";
import "./register.css";

const RegisterPage = () => {
  const navigate = useNavigate();

  // ================= STATE =================
  const [formValues, setFormValues] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    message: "",
    type: "",
  });

  // ================= HANDLERS =================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // ================= VALIDATE =================
  const validate = () => {
    const newErrors = {};

    if (!formValues.fullName.trim()) {
      newErrors.fullName = "Please input your full name!";
    }

    if (!formValues.email) {
      newErrors.email = "Please input your email!";
    } else if (!/\S+@\S+\.\S+/.test(formValues.email)) {
      newErrors.email = "Email is invalid!";
    }

    if (!formValues.password) {
      newErrors.password = "Please input your password!";
    } else if (formValues.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters!";
    }

    if (!formValues.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password!";
    } else if (formValues.confirmPassword !== formValues.password) {
      newErrors.confirmPassword = "Passwords do not match!";
    }

    return newErrors;
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      await authApi.registerUserApi({
        fullName: formValues.fullName,
        email: formValues.email,
        password: formValues.password,
      });

      // ✅ nếu không throw => SUCCESS
      setNotification({
        message: "Register successful!",
        type: "success",
      });

      setTimeout(() => navigate("/login"), 800);
    } catch (error) {
      console.log("REGISTER ERROR =", error?.response?.data);

      setNotification({
        message:
          error?.response?.data?.EM ||
          error?.response?.data?.message ||
          "Register failed!",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // ================= RENDER =================
  return (
    <div className="register-page">
      {notification.message && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="register-card">
        {/* LEFT */}
        <div className="register-left">
          <h1>Create Account</h1>
          <p>Join us and start your journey now.</p>
        </div>

        {/* RIGHT */}
        <div className="register-right">
          <form className="register-form" onSubmit={handleSubmit}>
            <h2 className="form-title">Register</h2>

            {/* Full Name */}
            <div className="form-group">
              <input
                type="text"
                name="fullName"
                placeholder="Full name"
                value={formValues.fullName}
                onChange={handleChange}
              />
              {errors.fullName && (
                <span className="error">{errors.fullName}</span>
              )}
            </div>

            {/* Email */}
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={formValues.email}
                onChange={handleChange}
              />
              {errors.email && (
                <span className="error">{errors.email}</span>
              )}
            </div>

            {/* Password */}
            <div className="form-group">
              <div className="password-container">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formValues.password}
                  onChange={handleChange}
                />
                <span
                  className="password-toggle"
                  onClick={() => setShowPassword((p) => !p)}
                >
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </span>
              </div>
              {errors.password && (
                <span className="error">{errors.password}</span>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <div className="password-container">
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={formValues.confirmPassword}
                  onChange={handleChange}
                />
                <span
                  className="password-toggle"
                  onClick={() => setShowPassword((p) => !p)}
                >
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </span>
              </div>
              {errors.confirmPassword && (
                <span className="error">{errors.confirmPassword}</span>
              )}
            </div>

            <button className="submit-btn" disabled={loading}>
              {loading ? "Creating..." : "Create Account"}
            </button>

            <p className="login-link">
              Already have an account? <Link to="/login">Sign In</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
