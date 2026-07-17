import { Navigate, Outlet, useLocation } from "react-router";
import { useSelector } from "react-redux";
import { Loader } from "../components/Loader.jsx";

/**
 * Blocks access until auth state has been checked (avoids a flash of
 * "redirect to login" before we even know if the session cookie is valid),
 * then redirects to /login if truly unauthenticated.
 */
export function ProtectedRoute() {
  const { isLoggedIn, authChecked } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!authChecked) return <Loader fullScreen />;

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
