const ROLE_KEY = "myproperty_role";

/**
 * We only ever store the role string ("user" | "owner") here — never the
 * JWT itself, which lives in an httpOnly cookie the frontend can't (and
 * shouldn't) read. This is purely so that on a hard page refresh we know
 * which profile endpoint (/user/profile vs /owner/profile) to call to
 * restore session state.
 */
export const setStoredRole = (role) => localStorage.setItem(ROLE_KEY, role);
export const getStoredRole = () => localStorage.getItem(ROLE_KEY);
export const clearStoredRole = () => localStorage.removeItem(ROLE_KEY);
