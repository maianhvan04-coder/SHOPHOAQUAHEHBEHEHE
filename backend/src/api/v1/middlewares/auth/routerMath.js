function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// "/admin/products/:id" -> /^\/admin\/products\/[^/]+$/
function patternToRegex(pattern) {
    const parts = pattern.split("/").filter(Boolean);
    const rx = parts
        .map((p) => (p.startsWith(":") ? "[^/]+" : escapeRegex(p)))
        .join("\\/");
    return new RegExp(`^\\/${rx}$`);
}

function matchRoutePatterns(pathname, patterns = []) {
    for (const p of patterns) {
        const rx = patternToRegex(p);
        if (rx.test(pathname)) return p;
    }
    return null;
}

module.exports = { matchRoutePatterns };
