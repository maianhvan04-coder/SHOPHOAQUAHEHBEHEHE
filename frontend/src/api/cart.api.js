import apiClient from "../services/apiClient";

export const getCartAPI = () => {
  return apiClient.get("/api/v1/cart/me");
};

export const addToCartAPI = (data) => {
  return apiClient.post("/api/v1/cart/me/add", data);
};

export const updateQuantityAPI = (data) => {
  return apiClient.patch("/api/v1/cart/me/update", data);
};

export const deleteItemAPI = (productId) => {
  return apiClient.delete(`/api/v1/cart/me/${productId}`);
};
export const mergeCartAPI = (data) => {
 
  return apiClient.post("/api/v1/cart/me/merge", data);
};