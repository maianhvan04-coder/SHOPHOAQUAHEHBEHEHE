import apiClient from "../services/apiClient";
import { endpoints } from "../services/endpoints";
import { axiosUser, axiosAdmin } from "../shared/utils/axios.custiomize";

export const authApi = {
    login: (payload) => apiClient.post(endpoints.auth.login, payload),
    register: (payload) => apiClient.post(endpoints.auth.register, payload),
    me: () => apiClient.get(endpoints.auth.me),
    refresh: () => apiClient.post(endpoints.auth.refresh),
    logout: () => apiClient.post(endpoints.auth.logout),
    registerUserApi: (data) =>
        axiosUser.post("/api/v1/auth/register", data)

};

