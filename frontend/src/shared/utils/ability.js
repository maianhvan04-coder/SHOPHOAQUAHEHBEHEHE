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
 * Quyền vào screen:
 * - không có accessAny => cho vào
 * - có accessAny => chỉ cần 1 permission match
 */
export function canAccessScreen(userPermissions = [], screen) {
  const perms = Array.isArray(userPermissions) ? userPermissions : [];
  const needAny = screen?.accessAny;

  if (!Array.isArray(needAny) || needAny.length === 0) return true;
  return needAny.some((p) => perms.includes(p));
}

/**
 * Lấy screen đầu tiên user truy cập được (để redirect /admin)
 */
export function firstAccessibleScreen(groups = [], screens = [], userPermissions = []) {
  const groupOrder = new Map(
    (Array.isArray(groups) ? groups : []).map((g) => [g.key, Number(g.order ?? 9999)])
  );

  const sorted = (Array.isArray(screens) ? screens : [])
    .slice()
    .sort((a, b) => {
      const ga = groupOrder.get(a.group) ?? 9999;
      const gb = groupOrder.get(b.group) ?? 9999;
      if (ga !== gb) return ga - gb;

      const oa = Number(a.order ?? 9999);
      const ob = Number(b.order ?? 9999);
      if (oa !== ob) return oa - ob;

      return String(a.label || "").localeCompare(String(b.label || ""));
    });

  const first = sorted.find((s) => canAccessScreen(userPermissions, s));
  if (!first) return null;

  const routes = Array.isArray(first.routes) ? first.routes : [];
  const uiRoute =
    routes.find((r) => typeof r === "string" && r.startsWith("/admin")) || null;

  return uiRoute ? normalizePattern(uiRoute) : null;
}


/**
 * Quyền theo action trong screen.actions:
 * - không có actionKey hoặc action không khai báo => cho phép
 * - có action => chỉ cần 1 permission match (OR)
 */
export function canAccessAction(userPermissions = [], screen, actionKey) {
  const perms = Array.isArray(userPermissions) ? userPermissions : [];

  // Không tìm thấy screen => không cho phép action
  if (!screen) return false;

  const need = screen?.actions?.[actionKey];

  // nếu action không khai báo thì tuỳ bạn:
  // - an toàn: return false
  // - dễ dãi: return true
  // mình khuyên an toàn:
  if (!actionKey) return true;
  if (!Array.isArray(need) || need.length === 0) return false;

  return need.some((p) => perms.includes(p));
}

