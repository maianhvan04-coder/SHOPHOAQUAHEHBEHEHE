// src/features/auth/authService.js
import { authApi } from "~/api/authApi";
import { authStorage } from "./authStorage";

const unwrap = (res) => res?.data?.data ?? res?.data;

export const authService = {
  async login(payload) {
    const res = await authApi.login(payload);
    const data = unwrap(res);

    if (!data?.accessToken) throw new Error("Không nhận được accessToken");

    authStorage.setToken(data.accessToken);

    // optional cache me luôn nếu backend trả roles/permissions
    authStorage.setMe({
      user: data?.user || null,
      roles: Array.isArray(data?.roles) ? data.roles.filter(Boolean) : [],
      permissions: Array.isArray(data?.permissions) ? data.permissions.filter(Boolean) : [],
    });

    return data;
  },

  async me() {
    const res = await authApi.me();
    const data = unwrap(res);

    authStorage.setMe({
      user: data?.user || null,
      roles: Array.isArray(data?.roles) ? data.roles.filter(Boolean) : [],
      permissions: Array.isArray(data?.permissions) ? data.permissions.filter(Boolean) : [],
    });

    return data;
  },

  async logout() {
    // ✅ request này đi qua apiClient -> có Bearer -> backend có sid -> xóa session DB
    try {
      await authApi.logout();
    } finally {
      authStorage.clear();
    }
    return { ok: true };
  },
};
