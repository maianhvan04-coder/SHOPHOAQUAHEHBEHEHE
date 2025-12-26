import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "~/app/providers/AuthProvides";

export default function PrivateRoute() {
  const { loading, isAuthed } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
