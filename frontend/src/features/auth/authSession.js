// src/features/auth/authSession.js
import { authStorage } from "./authStorage";

const SESSION_EXPIRED_EVENT = "auth:session_expired";

export function forceLogoutWithMessage(
  message = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
) {
  authStorage.clear();

  window.dispatchEvent(
    new CustomEvent(SESSION_EXPIRED_EVENT, { detail: { message } })
  );
}

export function onSessionExpired(handler) {
  const fn = (e) => handler?.(e.detail?.message);
  window.addEventListener(SESSION_EXPIRED_EVENT, fn);
  return () => window.removeEventListener(SESSION_EXPIRED_EVENT, fn);
}
