//   api/dashboardApi.js
import apiClient from "~/services/apiClient";

// ✅ DAY
export const getDashboardDayAPI = (params) => {
  const URL_API = "/api/v1/dashboard/order/day";
  return apiClient.get(URL_API, { params });
};

// MONTH
export const getDashboardMonthAPI = (params) => {
  const URL_API = "/api/v1/dashboard/order/month";
  return apiClient.get(URL_API, { params });
};

// YEAR
export const getDashboardYearAPI = (params) => {
  const URL_API = "/api/v1/dashboard/order/year";
  return apiClient.get(URL_API, { params });
};