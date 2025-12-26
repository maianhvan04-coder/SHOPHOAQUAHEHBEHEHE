// src/shared/utils/ability.js
import { matchPath } from "react-router-dom";

/**
 * Normalize pathname để:
 * - bỏ query/hash
 * - bỏ trailing slash (trừ "/")
 */
export function normalizePathname(pathname = "") {
    if (!pathname) return "";
    const p = pathname.split("?")[0].split("#")[0];
    if (p.length > 1 && p.endsWith("/")) return p.slice(0, -1);
    return p;
}

/**
 * Normalize route pattern tương tự (bỏ trailing slash)
 */
export function normalizePattern(pattern = "") {
    if (!pattern) return "";
    if (pattern.length > 1 && pattern.endsWith("/")) return pattern.slice(0, -1);
    return pattern;
}

/**
 * Match 1 pathname với 1 pattern.
 * - end:false để "/admin/user/123" match "/admin/user/:id" hoặc "/admin/user"
 * - thêm "/*" nếu pattern không có param để match nested ổn định
 */
export function matchRoute(pattern = "", pathname = "") {
    const ptn = normalizePattern(pattern);
    const path = normalizePathname(pathname);

    if (!ptn || !path) return false;

    // Nếu pattern không có ":" và không có "*" thì cho match nested luôn
    // ví dụ "/admin/user" sẽ match "/admin/user/123"
    const needsWildcard = !ptn.includes(":") && !ptn.includes("*");
    const effective = needsWildcard ? `${ptn}/*` : ptn;

    return !!matchPath({ path: effective, end: false }, path);
}

/**
 * Match pathname với bất kỳ route patterns nào trong mảng.
 */
export function matchAnyRoute(routes = [], pathname = "") {
    if (!Array.isArray(routes) || routes.length === 0) return false;
    return routes.some((pattern) => matchRoute(pattern, pathname));
}

/**
 * Tìm screen theo pathname hiện tại.
 * Match theo catalog.screens[].routes (có thể chứa :id, bulk, ...).
 *
 * Ưu tiên screen "match sát hơn":
 * - match exact pattern có param/:id sẽ ưu tiên hơn pattern ngắn.
 */
export function findScreenByPathname(screens = [], pathname = "") {
    if (!Array.isArray(screens) || screens.length === 0) return null;

    const path = normalizePathname(pathname);

    let best = null;
    let bestScore = -1;

    for (const s of screens) {
        const routes = s?.routes || [];
        for (const r of routes) {
            if (!matchRoute(r, path)) continue;

            // scoring: pattern dài hơn + có ":" ưu tiên hơn
            const rr = normalizePattern(r);
            const score = rr.length + (rr.includes(":") ? 1000 : 0);

            if (score > bestScore) {
                best = s;
                bestScore = score;
            }
        }
    }

    return best;
}

/**
 * Check user có được vào screen không theo accessAny.
 * - accessAny: chỉ cần có 1 permission là OK
 * - không có accessAny => cho vào (optional)
 */
export function canAccessScreen(userPermissions = [], screen) {
    const perms = Array.isArray(userPermissions) ? userPermissions : [];
    const needAny = screen?.accessAny;

    if (!Array.isArray(needAny) || needAny.length === 0) return true;
    return needAny.some((p) => perms.includes(p));
}

/**
 * Pick screen đầu tiên user truy cập được để redirect "/admin" -> screen đó
 * - sort theo group.order rồi screen.order rồi label
 * - trả về route "UI path" đầu tiên (không phải route API)
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

    // chọn route đầu tiên "giống UI": bắt đầu bằng "/admin" và KHÔNG phải endpoint action (như /admin/rbac/role-permissions)
    const routes = Array.isArray(first.routes) ? first.routes : [];
    const uiRoute =
        routes.find((r) => typeof r === "string" && r.startsWith("/admin") && !r.includes("/rbac/")) ||
        routes.find((r) => typeof r === "string" && r.startsWith("/admin")) ||
        null;

    return uiRoute ? normalizePattern(uiRoute) : null;
}
