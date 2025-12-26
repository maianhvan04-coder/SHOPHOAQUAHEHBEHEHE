// src/features/auth/authStorage.js
const TOKEN_KEY = "access_token";
const ME_KEY = "auth_me"; // { user, roles, permissions }

export const authStorage = {
  // token
  getToken() {
    return localStorage.getItem(TOKEN_KEY) || "";
  },
  setToken(token) {
    if (!token) localStorage.removeItem(TOKEN_KEY);
    else localStorage.setItem(TOKEN_KEY, token);
  },

  // me cache
  getMe() {
    try {
      const raw = localStorage.getItem(ME_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  setMe(me) {
    if (!me) localStorage.removeItem(ME_KEY);
    else localStorage.setItem(ME_KEY, JSON.stringify(me));
  },

  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ME_KEY);
  },
};
