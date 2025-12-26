import { Navigate, Outlet, useLocation } from "react-router-dom";
import {
  findScreenByPathname,
  canAccessScreen,
  firstAccessibleScreen,
} from "~/shared/utils/ability";
import { useAuth } from "~/app/providers/AuthProvides";
import { useRbacCatalog } from "~/features/rbac/hooks/useRbacCatalog";
import { Center, Spinner } from "@chakra-ui/react";

const ALWAYS_ALLOW = ["/admin/rbac", "/admin/rbac/"];

export default function AdminRoute() {
  const { pathname } = useLocation();
  const { isAuthed, permissions, loading: authLoading } = useAuth();
  const { groups, screens, loading: catalogLoading, error } = useRbacCatalog(isAuthed);

  if (authLoading || catalogLoading) {
    return (
      <Center h="100vh">
        <Spinner size="lg" />
      </Center>
    );
  }

  if (!isAuthed) return <Navigate to="/login" replace />;

  if (error) {
    return <Navigate to="/403" replace state={{ reason: error }} />;
  }

  // tránh loop
  if (pathname === "/403") return <Outlet context={{ groups, screens }} />;

  // whitelist
  if (ALWAYS_ALLOW.some((p) => pathname.startsWith(p))) {
    return <Outlet context={{ groups, screens }} />;
  }

  // /admin -> redirect screen đầu tiên có quyền
  if (pathname === "/admin" || pathname === "/admin/") {
    const nextPath = firstAccessibleScreen(groups, screens, permissions);
    return nextPath
      ? <Navigate to={nextPath} replace />
      : <Navigate
          to="/403"
          replace
          state={{ reason: "Không có screen nào bạn được phép truy cập" }}
        />;
  }

  const screen = findScreenByPathname(screens, pathname);
  if (!screen) {
    return <Navigate to="/403" replace state={{ reason: "Route không nằm trong catalog" }} />;
  }

  if (!canAccessScreen(permissions, screen)) {
    return <Navigate to="/403" replace state={{ reason: "Thiếu permission để vào màn này" }} />;
  }

  return <Outlet context={{ groups, screens }} />;
}
