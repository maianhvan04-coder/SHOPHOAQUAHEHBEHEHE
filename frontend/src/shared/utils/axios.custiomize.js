import axios from "axios";

const baseURL = import.meta.env.VITE_BACKEND_URL;

const onFulfilled = (response) => (response?.data ? response.data : response);
const onRejected = (error) => {
  if (error?.response?.data) return error.response.data;
  return Promise.reject(error);
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

axiosUser.interceptors.response.use(onFulfilled, onRejected);


export const axiosAdmin = axios.create({ baseURL, headers: {
    "Cache-Control": "no-store",
  }, });



axiosAdmin.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("admin_access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

axiosAdmin.interceptors.response.use(onFulfilled, onRejected);
