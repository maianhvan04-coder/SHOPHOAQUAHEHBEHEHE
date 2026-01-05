import { authApi } from "~/api/authApi";
import { authStorage } from "./authStorage";

function unwrap(res) {
  return res?.data?.data ?? res?.data;
}

export const authService = {
  async login(payload) {
    const res = await authApi.login(payload);
    const data = unwrap(res); // { accessToken, user, roles, permissions, ... }

    // ✅ QUAN TRỌNG: lưu access token
    if (data?.accessToken) authStorage.setToken(data.accessToken);

    // ✅ optional: nếu backend trả luôn user/roles/permissions thì cache luôn
    // authStorage.setMe({ user: data.user, roles: data.roles, permissions: data.permissions });

    return data;
  },

  async me() {
    const res = await authApi.me();
    const data = unwrap(res);

    // optional: cache me
    // authStorage.setMe(data);

    return data;
  },

  async logout() {
    const res = await authApi.logout();
    authStorage.clear();
    return unwrap(res);
  },
};
