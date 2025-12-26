import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ChakraProvider, extendTheme, Center, Spinner } from "@chakra-ui/react";
import { useEffect, useMemo } from "react";
import { findScreenByPathname, canAccessScreen, firstAccessibleScreen } from "~/shared/utils/ability";
import { useAuth } from "~/app/providers/AuthProvides";
import { useRbacCatalog } from "~/features/rbac/hooks/useRbacCatalog";

const ALWAYS_ALLOW = ["/admin/rbac", "/admin/rbac/"];
console.log("AdminRoute MOUNTED");

const adminTheme = extendTheme({
  config: { initialColorMode: "light", useSystemColorMode: false },
  colors: {
    vrv: {
      50: "#e9efee",
      100: "#c8d5d3",
      200: "#a4bab7",
      300: "#809e9a",
      400: "#5c837e",
      500: "#304945",
      600: "#243634",
      700: "#182423",
      800: "#0c1211",
      900: "#000000",
    },
  },
});

export default function AdminRoute() {
  console.log("AdminRoute MOUNTED");

  const { pathname } = useLocation();
  const { isAuthed, permissions, loading: authLoading } = useAuth();
  const { groups, screens, loading: catalogLoading, error } = useRbacCatalog(isAuthed);

  const loading = authLoading || catalogLoading;

  // ✅ log CHẮC CHẮN hiện
  const matched = useMemo(() => findScreenByPathname(screens, pathname), [screens, pathname]);

  useEffect(() => {
    console.log("[AdminRoute]", {
      pathname,
      loading,
      isAuthed,
      authLoading,
      catalogLoading,
      error,
      sampleRoutes: screens?.[0]?.routes,
      matched,
      permissions,
    });
  }, [pathname, loading, isAuthed, authLoading, catalogLoading, error, matched, permissions, screens]);

  // ===== UI =====
  return (
    <ChakraProvider theme={adminTheme}>
      {loading && (
        <Center h="100vh">
          <Spinner size="lg" />
        </Center>
      )}

      {!loading && (() => {
        if (!isAuthed) return <Navigate to="/login" replace />;
        if (error) return <Navigate to="/4031" replace state={{ reason: error }} />;

        if (pathname === "/403") return <Outlet context={{ groups, screens }} />;
        if (ALWAYS_ALLOW.some((p) => pathname.startsWith(p))) return <Outlet context={{ groups, screens }} />;

        if (pathname === "/admin" || pathname === "/admin/") {
          const nextPath = firstAccessibleScreen(groups, screens, permissions);
          return nextPath
            ? <Navigate to={nextPath} replace />
            : <Navigate to="/4032" replace state={{ reason: "Không có screen nào bạn được phép truy cập" }} />;
        }

        const screen = matched;
        if (!screen) return <Navigate to="/4033" replace state={{ reason: "Route không nằm trong catalog" }} />;

        if (!canAccessScreen(permissions, screen)) {
          return <Navigate to="/4034" replace state={{ reason: "Thiếu permission để vào màn này" }} />;
        }

        return <Outlet context={{ groups, screens }} />;
      })()}
    </ChakraProvider>
  );
}
