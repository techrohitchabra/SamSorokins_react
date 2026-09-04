import axios from "axios";
import type { AxiosRequestConfig, AxiosInstance } from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { logoutUser } from "../redux/user/userSlice";
import { useSnackbarHelper } from "../views/components/snackbar";

const API_URL = import.meta.env.VITE_API_URL;

// Module-level flag — persists across re-renders and hook calls so we never
// show the "session expired" snackbar more than once per logout event.
let isLoggingOut = false;

/**
 * Custom hook to manage authenticated API requests and access the current user information.
 * The axios response interceptor automatically logs out the user and redirects to /login
 * on any 401 or 404-user-not-found response, covering expired/invalid tokens on every request.
 * @hook
 */
export default function useAuth(): {
  request: AxiosInstance;
  userId: string | undefined;
} {
  const dispatch = useDispatch();
  const { user } = useSelector((state: any) => state.user);
  const navigate = useNavigate();
  const showSnackbar = useSnackbarHelper();
  const userId = user?.userId || null;

  const config: AxiosRequestConfig = {
    baseURL: `${API_URL}`,
    headers: {
      Authorization: `Bearer ${user?.token}`,
    },
  };

  const request: AxiosInstance = axios.create(config);

  request.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status;
      const message: string = error?.response?.data?.message || "";

      const isAuthError =
        (status === 401 || status === 404) &&
        (message === "Invalid or expired token" ||
          message === "User not found" ||
          message === "Session expired due to inactivity");

      if (isAuthError && !isLoggingOut) {
        isLoggingOut = true; // prevent duplicate logouts from parallel requests

        dispatch(logoutUser());
        localStorage.removeItem("persist:user");
        navigate("/login");
        showSnackbar(
          "Your session has expired. Please sign in again to continue.",
          "error"
        );

        // Reset the flag after a short delay so future logins work correctly
        setTimeout(() => {
          isLoggingOut = false;
        }, 3000);
      }

      return Promise.reject(error);
    }
  );

  return {
    request,
    userId,
  };
}
