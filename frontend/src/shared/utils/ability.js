import { matchPath } from "react-router-dom";

/* ======================================================
 * PATH NORMALIZE
 * ====================================================== */

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

/* ======================================================
 * PERMISSION HELPERS
 * ====================================================== */

function hasPermission(perms, key) {
  return !!perms?.[key];
}

/* ======================================================
 * ROUTE MATCHING (RRv6)
 * ====================================================== */

/**
 * Match route chuẩn RRv6:
 * - end:false => "/admin/user" match "/admin/user/123"
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

/* ======================================================
 * FLATTEN SCREENS (CHA + CON)
 * ====================================================== */

/**
 * Convert:
 * [
 *   { key, children:[{...}] }
 * ]
 * =>
 * [ parent, child(with parentKey, group inherited) ]
 */
export function flattenScreens(screens = []) {
  const result = [];

  for (const s of screens) {
    result.push(s);

    if (Array.isArray(s.children)) {
      s.children.forEach((c) => {
        result.push({
          ...c,
          parentKey: s.key,
          group: s.group,
        });
      });
    }
  }

  return result;
}

/* ======================================================
 * FIND SCREEN BY URL
 * ====================================================== */

/**
 * Tìm screen (cha hoặc con) theo pathname hiện tại.
 * Ưu tiên:
 * - route dài hơn
 * - route có param (:id)
 */
export function findScreenByPathname(screens = [], pathname = "") {
  if (!Array.isArray(screens) || screens.length === 0) return null;

  const flat = flattenScreens(screens);
  const path = normalizePathname(pathname);

  let best = null;
  let bestScore = -1;

  for (const s of flat) {
    const routes = Array.isArray(s?.routes) ? s.routes : [];
    for (const r of routes) {
      if (!matchRoute(r, path)) continue;

      const rr = normalizePattern(r);

      const score =
        rr.length +
        (rr.includes(":") ? 10000 : 0) +
        (s.parentKey ? 100000 : 0); // ⭐ child > parent

      if (score > bestScore) {
        best = s;
        bestScore = score;
      }
    }
  }

  return best;
}


/* ======================================================
 * SCREEN ACCESS CHECK
 * ====================================================== */

/**
 * Check quyền truy cập screen
 *
 * @param {object} userPermissions  { "product:read": {scope,...} }
 * @param {object} screen
 * @param {object} options
 * @param {"menu"|"route"} options.mode
 */
export function canAccessScreen(
  userPermissions = {},
  screen,
  { mode = "route" } = {}
) {
  if (!screen) return false;

  // screen public → luôn cho
  if (screen.public) return true;

  /* ================= MENU MODE ================= */
  if (mode === "menu") {
    // 1️⃣ nếu screen public
    if (screen.public) return true;

    // 2️⃣ nếu screen có accessAny → check trực tiếp
    if (Array.isArray(screen.accessAny) && screen.accessAny.length > 0) {
      if (screen.accessAny.some(p => hasPermission(userPermissions, p))) {
        return true;
      }
    }

    // 3️⃣ nếu có children → chỉ cần 1 child access được
    if (Array.isArray(screen.children) && screen.children.length > 0) {
      return screen.children.some(child =>
        canAccessScreen(userPermissions, child, { mode: "menu" })
      );
    }

    return false;
  }


  /* ================= ROUTE MODE ================= */
  const needAny = screen?.accessAny;
  if (!Array.isArray(needAny) || needAny.length === 0) return true;

  return needAny.some((p) => hasPermission(userPermissions, p));
}

/* ======================================================
 * FIRST ACCESSIBLE SCREEN (FOR /admin REDIRECT)
 * ====================================================== */

export function firstAccessibleScreen(
  groups = [],
  screens = [],
  userPermissions = {}
) {
  const flat = flattenScreens(screens);

  const groupOrder = new Map(
    (groups || []).map((g) => [g.key, Number(g.order ?? 9999)])
  );

  const sorted = flat.slice().sort((a, b) => {
    const ga = groupOrder.get(a.group) ?? -1;
    const gb = groupOrder.get(b.group) ?? -1;
    if (ga !== gb) return ga - gb;
    return (a.order ?? 9999) - (b.order ?? 9999);
  });

  const first = sorted.find((s) =>
    canAccessScreen(userPermissions, s, { mode: "route" })
  );

  return first?.routes?.[0] || null;
}

/* ======================================================
 * ACTION-LEVEL PERMISSION
 * ====================================================== */

/**
 * Check quyền cho action trong screen.actions
 * VD: actions: { create:[...], delete:[...] }
 */
export function canAccessAction(userPermissions = {}, screen, actionKey) {
  if (!screen || !actionKey) return false;

  const need = screen?.actions?.[actionKey];
  if (!Array.isArray(need) || need.length === 0) return false;

  return need.some((p) => hasPermission(userPermissions, p));
}
