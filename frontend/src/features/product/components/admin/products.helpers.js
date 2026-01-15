import { canAccessAction } from "~/shared/utils/ability";

export const stop = (e) => e.stopPropagation();

export const getThumb = (p) => p?.image?.url || p?.images?.[0]?.url || "";

export const formatVND = (v) => `${Number(v || 0).toLocaleString("vi-VN")} đ`;

export function computePermission({ screens, userPermissions, resourceKey, actionKey }) {
    const screen = (screens || []).find((s) => s?.key === resourceKey) || null;
    if (!screen) return false;
    return canAccessAction(userPermissions, screen, actionKey);
}
