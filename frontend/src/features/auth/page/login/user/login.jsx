import { useState } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

import { useLogin } from "~/features/auth/hooks/useLogin";
import "./login.css";

const LoginPage = () => {
  const { form, fieldErrors, error, loading, onChange, onSubmit } = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="login-page">
      {/* Notification */}
      {error && <div className="notification error">{error}</div>}

      <div className="login-card">
        {/* LEFT banner */}
        <div className="login-left">
          <h1>Welcome back!</h1>
          <p>You can sign in to access with your existing account.</p>
        </div>

        {/* RIGHT form */}
        <div className="login-right">
          <form className="login-form" onSubmit={onSubmit}>
            <h2 className="form-title">Sign In</h2>

            {/* Email */}
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Username or email"
                value={form.email}
                onChange={onChange}
                disabled={loading}
              />
              {fieldErrors.email && (
                <span className="error">{fieldErrors.email}</span>
              )}
            </div>

            {/* Password */}
            <div className="form-group">
              <div className="password-container">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={onChange}
                  disabled={loading}
                />

                <span
                  className="password-toggle"
                  onClick={() => setShowPassword((p) => !p)}
                  role="button"
                  tabIndex={0}
                >
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </span>
              </div>

              {fieldErrors.password && (
                <span className="error">{fieldErrors.password}</span>
              )}
            </div>

            <div className="remember">
              <label>
                <input type="checkbox" /> Remember me
              </label>
              <a href="#">Forgot password?</a>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <p className="create-account">
              New here? <Link to="/register">Create an Account</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
