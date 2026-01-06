// src/features/auth/authStorage.js
const TOKEN_KEY = "access_token";
const ME_KEY = "auth_me";
const ME_EVENT = "auth_me_changed";

export const authStorage = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY) || "";
  },

  setToken(token) {
    if (!token) localStorage.removeItem(TOKEN_KEY);
    else localStorage.setItem(TOKEN_KEY, token);
  },

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

    // báo cho UI biết "me" đã thay đổi
    window.dispatchEvent(new Event(ME_EVENT));
  },

  // patch user trong auth_me.user
  patchMeUser(patch) {
    const cur = this.getMe() || {};
    const next = {
      ...cur,
      user: { ...(cur.user || {}), ...(patch || {}) },
    };
    this.setMe(next);
    return next;
  },

  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ME_KEY);
    window.dispatchEvent(new Event(ME_EVENT));
  },

  // expose event name cho hook dùng
  ME_EVENT,
};
