import { authApi } from "~/api/authApi";
import { authStorage } from "./authStorage";

function unwrap(res) {
  return res?.data?.data ?? res?.data;
}

export const authService = {
  async login(payload) {
    try {
      const res = await authApi.login(payload);
      return unwrap(res); // { accessToken, user, ... }
    } catch (err) {
      // 🔥 QUAN TRỌNG: ném lỗi lên cho useLogin xử lý
      throw err;
    }
  },

  async me() {
    const res = await authApi.me();
    return unwrap(res);
  },

  async logout() {
    // ❌ ĐỪNG clear trước
    const res = await authApi.logout();
    authStorage.clear(); // ✅ clear sau
    return unwrap(res);
  },
};
