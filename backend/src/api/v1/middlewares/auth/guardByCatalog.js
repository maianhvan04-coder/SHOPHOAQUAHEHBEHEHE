const ApiError = require("../../../../core/ApiError");
const httpStatus = require("../../../../core/httpStatus");

const { ADMIN_SCREENS } = require("../../../../constants/permissions");
const { matchRoutePatterns } = require("./routeMatch");
const { canAny, canAll } = require("./authz.util");

// map method -> action key (tuỳ bạn quy ước)
function resolveAction(req) {
    const m = req.method.toUpperCase();
    if (m === "GET") return "view";
    if (m === "POST") return "create";
    if (m === "PUT" || m === "PATCH") return "update";
    if (m === "DELETE") return "delete";
    return null;
}

// Ví dụ: dùng khi bạn muốn check action theo query/header
function resolveActionOverride(req) {
    // cho phép override bằng header: x-action: updateStatus
    const x = req.headers["x-action"];
    if (typeof x === "string" && x.trim()) return x.trim();
    return null;
}

exports.guardByCatalog = (opts = {}) => (req, res, next) => {
    const screens = Object.values(ADMIN_SCREENS);
    const pathname = req.baseUrl + req.path; // baseUrl = "/api/v1", tuỳ bạn dùng

    // Nếu bạn mount admin router tại "/api/v1/admin"
    // thì pathname sẽ là "/api/v1/admin/..."
    // => thường mình chỉ match phần sau "/admin"
    const adminPath = pathname.replace(/^\/api\/v\d+/, ""); // strip "/api/v1"

    // tìm screen match route
    let matchedScreen = null;
    let matchedPattern = null;

    for (const s of screens) {
        const p = matchRoutePatterns(adminPath, s.routes || []);
        if (p) {
            matchedScreen = s;
            matchedPattern = p;
            break;
        }
    }

    if (!matchedScreen) return next(); // route không nằm trong catalog thì bỏ qua

    const perms = req.user?.permissions || [];
    const actionOverride = resolveActionOverride(req);
    const action = actionOverride || resolveAction(req);

    // Nếu có actions map, ưu tiên check actions theo method
    let requiredAny = matchedScreen.accessAny || [];

    if (action && matchedScreen.actions && matchedScreen.actions[action]) {
        // action check thường là canAll (ví dụ delete cần write)
        const requiredAll = matchedScreen.actions[action];
        const ok = canAll(perms, requiredAll);

        if (!ok) {
            return next(
                new ApiError(
                    httpStatus.FORBIDDEN,
                    `Forbidden: missing permissions for action '${action}'`
                )
            );
        }

        // attach debug info (optional)
        req.authzDebug = {
            screen: matchedScreen.key,
            route: matchedPattern,
            action,
            required: requiredAll,
            mode: "ALL",
        };
        return next();
    }

    // fallback: chỉ cần có 1 quyền trong accessAny để vào screen
    const ok = canAny(perms, requiredAny);

    if (!ok) {
        return next(
            new ApiError(
                httpStatus.FORBIDDEN,
                `Forbidden: missing permission for screen '${matchedScreen.key}'`
            )
        );
    }

    req.authzDebug = {
        screen: matchedScreen.key,
        route: matchedPattern,
        action: action || null,
        required: requiredAny,
        mode: "ANY",
    };

    next();
};
