// src/features/auth/authService.js
import { authApi } from "~/api/authApi";
import { authStorage } from "./authStorage";

const unwrap = (res) => res?.data?.data ?? res?.data;

export const authService = {
  // ======================
  // LOCAL LOGIN
  // ======================
  async login(payload) {
    const res = await authApi.login(payload);
    const data = unwrap(res);

    if (!data?.accessToken) {
      throw new Error("Không nhận được accessToken");
    }

    // ✅ lưu token
    authStorage.setToken(data.accessToken);

    // ✅ cache me
    authStorage.setMe({
      user: data?.user || null,
      roles: Array.isArray(data?.roles) ? data.roles.filter(Boolean) : [],
      permissions: Array.isArray(data?.permissions)
        ? data.permissions.filter(Boolean)
        : [],
    });

    return data;
  },

  // ======================
  // GOOGLE LOGIN
  // ======================
  async googleLogin(credential) {
    const res = await authApi.googleLogin(credential);
    const data = unwrap(res);

    if (!data?.accessToken) {
      throw new Error("Không nhận được accessToken từ Google login");
    }

    authStorage.setToken(data.accessToken);

    //  cache me giống login thường
    authStorage.setMe({
      user: data?.user || null,
      roles: Array.isArray(data?.roles) ? data.roles.filter(Boolean) : [],
      permissions: Array.isArray(data?.permissions)
        ? data.permissions.filter(Boolean)
        : [],
    });

    return data;
  },

  // ======================
  // ME
  // ======================
  async me() {
    const res = await authApi.me();
    const data = unwrap(res);

    authStorage.setMe({
      user: data?.user || null,
      roles: Array.isArray(data?.roles) ? data.roles.filter(Boolean) : [],
      permissions: Array.isArray(data?.permissions)
        ? data.permissions.filter(Boolean)
        : [],
    });

    return data;
  },

  // ======================
  // LOGOUT
  // ======================
  async logout() {
    try {
      await authApi.logout();
    } finally {
      authStorage.clear();
    }
    return { ok: true };
  },
};
