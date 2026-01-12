import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ChakraProvider, extendTheme, Center, Spinner } from "@chakra-ui/react";
import { useMemo } from "react";
import { findScreenByPathname, canAccessScreen, firstAccessibleScreen } from "~/shared/utils/ability";
import { useAuth } from "~/app/providers/AuthProvides";
import { useRbacCatalog } from "~/features/rbac/hooks/useRbacCatalog";

// //  chỉ allow RBAC pages thôi (nếu cần)
// const ALWAYS_ALLOW_PREFIX = ["/admin/rbac","/admin/profile"];

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
  const { pathname } = useLocation();
  const { isAuthed, permissions,userType, loading: authLoading } = useAuth();

  const {
    groups,
    screens,

    loading: catalogLoading,
    ready: catalogReady, // ✅
    error,
  } = useRbacCatalog(isAuthed);
  //  quan trọng: chờ catalogReady
  const loading = authLoading || (isAuthed && !catalogReady) || catalogLoading;
 
  const matched = useMemo(() => findScreenByPathname(screens, pathname), [screens, pathname]);
  
  return (
    <ChakraProvider theme={adminTheme}>
      {loading ? (
        <Center h="100vh">
          <Spinner size="lg" />
        </Center>
      ) : (() => {
        if (!isAuthed) return <Navigate to="/login" replace />;
        if (userType !== "internal") {
  return (
    <Navigate
      to="/403"
      replace
      state={{ reason: "Tài khoản không thuộc hệ thống nội bộ" }}
    />
  );
}

        if (error) return <Navigate to="/403" replace state={{ reason: error }} />;

        if (pathname === "/403") return <Outlet context={{ groups, screens }} />;

        // if (ALWAYS_ALLOW_PREFIX.some((p) => pathname.startsWith(p))) {
        //   return <Outlet context={{ groups, screens }} />;
        // }

        if (pathname === "/admin" || pathname === "/admin/") {
          const nextPath = firstAccessibleScreen(groups, screens, permissions);
          return nextPath
            ? <Navigate to={nextPath} replace />
            : <Navigate to="/403" replace state={{ reason: "Không có screen nào bạn được phép truy cập" }} />;
        }

        const screen = matched;
        if (!screen) {

          return <Navigate to="/403" replace state={{ reason: "Route không nằm trong catalog" }} />;
        }

        if (!screen?.public && !canAccessScreen(permissions, screen)) {
  return <Navigate to="/403" replace state={{ reason: "Thiếu permission để vào màn này" }} />;
}


        return <Outlet context={{ groups, screens }} />;
      })()}
    </ChakraProvider>
  );
}
