import axios from "axios";

/**
 * Single Axios instance shared across every slice's thunks.
 * withCredentials: true is required so the httpOnly JWT cookie set by
 * the backend is sent on every request (and CORS on the backend must
 * have credentials: true + a specific origin, not "*").
 */
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Central place to react to 401s (e.g. force logout) without repeating
// this logic in every thunk.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Let slices/components decide what to do (e.g. dispatch a logout
      // action or redirect) — this interceptor just normalizes the error.
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
