import { Route } from "react-router-dom";

export function renderAdminRoutes(routes) {
    return routes.map((r) => {
        if (r.children) {
            return (
                <Route key={r.path} path={r.path}>
                    {r.index && (
                        <Route index element={r.element} />
                    )}

                    {renderAdminRoutes(r.children)}
                </Route>
            );
        }

        return (
            <Route
                key={r.path || "index"}
                path={r.path}
                index={r.index}
                element={r.element}
            />
        );
    });
}
