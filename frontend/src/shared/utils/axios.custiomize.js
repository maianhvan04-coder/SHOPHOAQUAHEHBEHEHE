import axios from "axios";

const baseURL = import.meta.env.VITE_BACKEND_URL;

// ===== helpers =====
const logoutUser = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
  localStorage.removeItem("user_id");
  localStorage.removeItem("user_email");
  localStorage.removeItem("user_fullName");
  localStorage.removeItem("user_role");
  localStorage.removeItem("user_image");

  // tránh vòng lặp redirect nếu đang ở /login
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

const logoutAdmin = () => {
  localStorage.removeItem("admin_access_token");
  localStorage.removeItem("admin_user"); // nếu bạn có lưu

  if (!window.location.pathname.startsWith("/admin/login")) {
    window.location.href = "/admin/login";
  }
};

// ===== USER AXIOS =====
export const axiosUser = axios.create({ baseURL });

axiosUser.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

axiosUser.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error?.response?.status;

    // ✅ token hết hạn / token revoked / missing token
    if (status === 401) {
      logoutUser();
    }

    return Promise.reject(error);
  }
);

// ===== ADMIN AXIOS =====
export const axiosAdmin = axios.create({
  baseURL,
  headers: { "Cache-Control": "no-store" },
});

axiosAdmin.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("admin_access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

axiosAdmin.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      logoutAdmin();
    }

    return Promise.reject(error);
  }
);
