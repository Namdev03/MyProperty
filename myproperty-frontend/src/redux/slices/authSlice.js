import { createSlice } from "@reduxjs/toolkit";

/**
 * authSlice is intentionally separate from userSlice/ownerSlice:
 * it only tracks *who is currently logged in and as what role*, so the
 * Navbar, ProtectedRoute, and RoleProtectedRoute can all read one small,
 * fast-changing piece of state without subscribing to the full
 * user/owner profile objects (which change far less often).
 */
const initialState = {
  isLoggedIn: false,
  role: null, // "user" | "owner" | null
  authChecked: false, // becomes true once we've confirmed session state on app load
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthenticated: (state, action) => {
      state.isLoggedIn = true;
      state.role = action.payload.role;
      state.authChecked = true;
    },
    clearAuthenticated: (state) => {
      state.isLoggedIn = false;
      state.role = null;
      state.authChecked = true;
    },
    setAuthChecked: (state) => {
      state.authChecked = true;
    },
  },
});

export const { setAuthenticated, clearAuthenticated, setAuthChecked } =
  authSlice.actions;
export default authSlice.reducer;
