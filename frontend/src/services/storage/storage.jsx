// src/services/storage/index.js
export const getAccessToken = () =>
  localStorage.getItem("access_token");

export const setAccessToken = (token) =>
  localStorage.setItem("access_token", token);

export const clearStorage = () => {
  localStorage.removeItem("access_token");
};
