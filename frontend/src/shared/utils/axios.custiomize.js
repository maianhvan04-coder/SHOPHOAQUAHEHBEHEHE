import axios from "axios";

const baseURL = import.meta.env.VITE_BACKEND_URL;

// ===== USER AXIOS =====
export const axiosUser = axios.create({ baseURL });

axiosUser.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔥 QUAN TRỌNG: KHÔNG NUỐT LỖI
axiosUser.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
);

// ===== ADMIN AXIOS =====
export const axiosAdmin = axios.create({
  baseURL,
  headers: { "Cache-Control": "no-store" },
});

axiosAdmin.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("admin_access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔥 QUAN TRỌNG
axiosAdmin.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
);
