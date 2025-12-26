import { axiosUser } from "../shared/utils/axios.custiomize";

import apiClient from "~/services/apiClient";
import { endpoints } from "~/services/endpoints";

export const userApi = {
  list: (params) => apiClient.get(endpoints.users.getAll, { params }),
};

// ===== USER =====
export const getUsersApi = (params) =>
  axiosUser.get("/api/v1/users", { params });

export const getUserDetailApi = (id) =>
  axiosUser.get(`/api/v1/users/${id}`);

export const updateProfileApi = (data) =>
  axiosUser.put("/api/v1/users/me/profile", data);

export const changePasswordApi = (data) =>
  axiosUser.put("/api/v1/users/me/change-password", data);
export const getCartAPI = () => {
  const URL_API = "/api/v1/cart";
 return axiosUser.get(URL_API);
};
export const addToCartAPI = (productId, quantity) => {
  const URL_API = "/api/v1/cart/add";
 return axiosUser.post(URL_API, { productId, quantity });
};

export const updateQuantityCartAPI = (productId, quantity) => {
  const URL_API = "/api/v1/cart/update";
 return axiosUser.patch(URL_API, { productId, quantity });
};
export const deleteFromCartAPI = (productId)=>{
   const URL_API = `/api/v1/cart/delete/${productId}`;
   return axiosUser.delete(URL_API);
}