import { Navigate, Outlet } from "react-router";
import { useSelector } from "react-redux";
import { Loader } from "../components/Loader.jsx";

/**
 * Usage: <Route element={<RoleProtectedRoute role="owner" />}>...</Route>
 * Redirects non-matching roles to the home page rather than login,
 * since they ARE authenticated, just as the wrong role.
 */
export function RoleProtectedRoute({ role }) {
  const { isLoggedIn, role: currentRole, authChecked } = useSelector(
    (state) => state.auth
  );

  if (!authChecked) return <Loader fullScreen />;

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (currentRole !== role) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
