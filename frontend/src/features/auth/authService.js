import { authApi } from "~/api/authApi";
import { authStorage } from "./authStorage"
function unwrap(res) {
  // backend bạn: res.json({ data: ... })
  return res?.data?.data ?? res?.data;
}

export const authService = {
  async login(payload) {
    const res = await authApi.login(payload);
    console.log("Vao day reoi neeeeee")
    return unwrap(res); // => { user, accessToken, refreshToken? }
  },

  async me() {
    const res = await authApi.me();
    return unwrap(res); // => { user, roles, permissions }
  },

  async logout() {
    await authStorage.clear()
    const res = await authApi.logout();

    return unwrap(res);
  },
};
