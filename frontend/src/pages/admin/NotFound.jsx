import { Link, useLocation } from "react-router-dom";

export default function ForbiddenPage() {
  const { state } = useLocation();
  const reason = state?.reason;

  return (
    <div style={{ minHeight: "70vh", display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ maxWidth: 560, textAlign: "center" }}>
        <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1 }}>403</div>
        <h1 style={{ margin: "12px 0 6px", fontSize: 24, fontWeight: 700 }}>
          Bạn không có quyền truy cập
        </h1>
        <p style={{ color: "#666", marginBottom: 18 }}>
          Tài khoản của bạn không được phép vào trang này.
          {reason ? <><br /><b>Lý do:</b> {reason}</> : null}
        </p>

        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            to="/"
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              background: "#111",
              color: "#fff",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Về trang chủ
          </Link>

          <Link
            to="/admin"
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #ddd",
              color: "#111",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Về Admin
          </Link>

          <Link
            to="/login"
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #ddd",
              color: "#111",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Đăng nhập lại
          </Link>
        </div>
      </div>
    </div>
  );
}
