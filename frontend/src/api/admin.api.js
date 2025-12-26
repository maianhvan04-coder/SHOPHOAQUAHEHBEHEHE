import { axiosAdmin } from "../shared/utils/axios.custiomize";

/* ================= ADMIN MANAGEMENT ================= */
export const getAdminApi = (params) =>
  axiosAdmin.get("/api/v1/admins", { params });

export const getAdminDetailApi = (id) =>
  axiosAdmin.get(`/api/v1/admins/${id}`);

export const changeAdminStatusApi = (id, isActive) =>
  axiosAdmin.patch(`/api/v1/admins/${id}/status`, { isActive });

// admin.api.js
export const updateAdminApi = (id, data) =>
  axiosAdmin.put(`/api/v1/admins/${id}`, data);

export const deleteAdminApi = (id) =>
  axiosAdmin.delete(`/api/v1/admins/${id}`);


/* ================= USER MANAGEMENT (BY ADMIN) ================= */
export const getUsersByAdminApi = (params) => {
  return axiosAdmin.get("/api/v1/admins/users", { params });
};

export const deleteUserByAdminApi = (id) =>
  axiosAdmin.delete(`/api/v1/admins/users/${id}`);

/* ================= ADMIN SELF ================= */
export const updateAdminProfileApi = (data) =>
  axiosAdmin.put("/api/v1/admins/me/profile", data);

export const changeAdminPasswordApi = (data) =>
  axiosAdmin.put("/api/v1/admins/me/change-password", data);

/* ================= PRODUCT MANAGEMENT (BY ADMIN) ================= */
export const getProductApi = (params) =>
  axiosAdmin.get("/api/v1/admin/products", { params });

export const deleteProductApi = (id) =>
  axiosAdmin.delete(`/api/v1/admin/products/${id}`);

export const createProductApi = (data) =>
  axiosAdmin.post("/api/v1/admin/products", data);

export const updateProductApi = (id, data) =>
  axiosAdmin.put(`/api/v1/admin/products/${id}`, data);

/* ================= CATEGORY MANAGEMENT (BY ADMIN) ================= */
export const getCategoryApi = (params) =>
  axiosAdmin.get("/api/v1/admin/categories", { params });

export const createCategoryApi = (data) =>
  axiosAdmin.post("/api/v1/admin/categories", data);

export const updateCategoryApi = (id, data) =>
  axiosAdmin.put(`/api/v1/admin/categories/${id}`, data);

export const deleteCategoryApi = (id) =>
  axiosAdmin.delete(`/api/v1/admin/categories/${id}`);
