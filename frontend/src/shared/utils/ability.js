// src/shared/utils/ability.js
import { matchPath } from "react-router-dom";

/** bỏ query/hash + bỏ trailing slash (trừ "/") */
export function normalizePathname(pathname = "") {
  if (!pathname) return "";
  const p = pathname.split("?")[0].split("#")[0];
  if (p.length > 1 && p.endsWith("/")) return p.slice(0, -1);
  return p;
}

/** bỏ trailing slash cho pattern */
export function normalizePattern(pattern = "") {
  if (!pattern) return "";
  if (pattern.length > 1 && pattern.endsWith("/")) return pattern.slice(0, -1);
  return pattern;
}

function hasPermission(perms, key) {
  return !!perms?.[key];
}


/**
 * Match RRv6 chuẩn:
 * - end:false => "/admin/user" match "/admin/user/123"
 * - pattern có :id vẫn match đúng nếu pathname có đủ segment
 */
export function matchRoute(pattern = "", pathname = "") {
  const ptn = normalizePattern(pattern);
  const path = normalizePathname(pathname);

  if (!ptn || !path) return false;

  return !!matchPath({ path: ptn, end: false }, path);
}

/** Match pathname với bất kỳ route patterns nào */
export function matchAnyRoute(routes = [], pathname = "") {
  if (!Array.isArray(routes) || routes.length === 0) return false;
  return routes.some((r) => matchRoute(r, pathname));
}

/**
 * Tìm screen theo pathname hiện tại.
 * Chọn match “sát nhất”:
 * - pattern dài hơn ưu tiên hơn
 * - pattern có ":" ưu tiên hơn (nhưng chỉ khi match)
 */
export function findScreenByPathname(screens = [], pathname = "") {
  if (!Array.isArray(screens) || screens.length === 0) return null;

  const path = normalizePathname(pathname);

  let best = null;
  let bestScore = -1;

  for (const s of screens) {
    const routes = Array.isArray(s?.routes) ? s.routes : [];
    for (const r of routes) {
      if (!matchRoute(r, path)) continue;

      const rr = normalizePattern(r);

      // score: dài hơn tốt hơn, có param ":" cộng thêm điểm
      // (ưu tiên /admin/user/:id hơn /admin/user nếu đang ở /admin/user/123)
      const score = rr.length + (rr.includes(":") ? 10000 : 0);

      if (score > bestScore) {
        best = s;
        bestScore = score;
      }
    }
  }

  return best;
}

/**
 * Check quyền vào screen
 *
 * @param {string[]} userPermissions
 * @param {object} screen
 * @param {object} options
 * @param {"route"|"menu"} options.mode
 */
export function canAccessScreen(
  userPermissions = {},
  screen,
  { mode = "route" } = {}
) {



  // screen public luôn cho
  if (screen?.public) return true;

  // ===== MENU: chỉ check quyền VIEW =====
  if (mode === "menu") {
    const viewPerms = screen?.actions?.view;

    // nếu screen có khai báo view → bắt buộc có READ
    if (Array.isArray(viewPerms) && viewPerms.length > 0) {
      return viewPerms.some((p) => hasPermission(userPermissions, p));
    }

    // không có view thì ẩn luôn cho chắc
    return false;
  }

  // ===== ROUTE / ACTION: accessAny =====
  const needAny = screen?.accessAny;
  if (!Array.isArray(needAny) || needAny.length === 0) return true;

  return needAny.some((p) => hasPermission(userPermissions, p));
}


/**
 * Lấy screen đầu tiên user truy cập được (để redirect /admin)
 */
export function firstAccessibleScreen(groups = [], screens = [], userPermissions = {}) {
  const groupOrder = new Map(
    (groups || []).map((g) => [g.key, Number(g.order ?? 9999)])
  );

  const sorted = (screens || []).slice().sort((a, b) => {
    const ga = groupOrder.get(a.group) ?? -1;
    const gb = groupOrder.get(b.group) ?? -1;
    if (ga !== gb) return ga - gb;
    return (a.order ?? 9999) - (b.order ?? 9999);
  });

  const first = sorted.find((s) => canAccessScreen(userPermissions, s));
  if (!first) return null;

  return first.routes?.[0] || null;
}



/**
 * Quyền theo action trong screen.actions:
 * - không có actionKey hoặc action không khai báo => cho phép
 * - có action => chỉ cần 1 permission match (OR)
 */
export function canAccessAction(userPermissions = {}, screen, actionKey) {
  if (!screen || !actionKey) return false;

  const need = screen?.actions?.[actionKey];

  if (!actionKey) return true;
  if (!Array.isArray(need) || need.length === 0) return false;

  return need.some((p) => hasPermission(userPermissions, p));
}

