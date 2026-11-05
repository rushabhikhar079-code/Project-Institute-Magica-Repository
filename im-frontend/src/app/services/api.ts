import axios, { InternalAxiosRequestConfig } from "axios";
import type { AppStore } from "../redux/store";
import { showLoader, hideLoader } from "../redux/slices/loaderSlice";
import { setGlobalError } from "../redux/slices/errorSlice";

let store: AppStore;

export const injectStore = (_store: AppStore) => {
  store = _store;
};

// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_BASE_URL,
//   timeout: 30000,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
});

// Separate instance for refresh calls to avoid infinite loops on 401
const refreshApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});
const handleSessionExpired = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");

  store.dispatch(
    setGlobalError({
      message: "Your session has expired. Please login again.",
      status: 401,
    }),
  );

  window.dispatchEvent(new Event("session-expired"));
};
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;
let isLoggingOut = false;

export const setLoggingOut = (value: boolean) => {
  isLoggingOut = value;
};

const refreshAccessToken = async (): Promise<string | null> => {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;

  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    isRefreshing = false;
    return null;
  }

  refreshPromise = refreshApi
    .post("/Auth/Refresh-Token", { token: refreshToken })
    .then((response) => {
      const data = response.data?.data;
      if (data?.accessToken && data?.refreshToken) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        return data.accessToken as string;
      }
      return null;
    })
    .catch((err) => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      throw err;
    })
    .finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });

  return refreshPromise;
};

/*
 * Request Interceptor: Attach Bearer Token to ALL outgoing requests
 */
api.interceptors.request.use((config) => {
  if (config.showLoader) {
    store.dispatch(showLoader());
  }

  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/*
 * Response Interceptor: Handle 401 & Automatic Refresh Token Rotation
 */
const extract400Errors = (data: any): string[] => {
  if (!data) {
    return ["Something went wrong."];
  }

  // ASP.NET validation errors
  if (data.errors && typeof data.errors === "object") {
    if (Array.isArray(data.errors)) {
      return data.errors.map(String);
    }

    return Object.values(data.errors).flat().map(String);
  }

  // Normal API message
  if (data.message) {
    return [String(data.message)];
  }

  // ProblemDetails
  if (data.title) {
    return [String(data.title)];
  }

  return ["Something went wrong."];
};
api.interceptors.response.use(
  async (response) => {
    if (response.config.showLoader) {
      // await delay(2000);
      store.dispatch(hideLoader());
    }
    return response;
  },
  async (error) => {
    if (error.config?.showLoader) {
      // await delay(2000);
      store.dispatch(hideLoader());
    }

    const status = error.response?.status;

    if (status === 401) {
      if (isLoggingOut) {
        return Promise.reject(error);
      }

      const originalRequest = error.config as RetryableRequestConfig;

      const isRefreshRequest = originalRequest?.url
        ?.toLowerCase()
        .includes("/auth/refresh-token");

      const isCheckAuthRequest = originalRequest?.url
        ?.toLowerCase()
        .includes("/auth/checkauth");
      // ProtectedRoute handles CheckAuth
      if (isCheckAuthRequest) {
        return Promise.reject(error);
      }

      // Already retried / refresh request failed
      if (isRefreshRequest || originalRequest?._retry) {
        handleSessionExpired();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();

        if (newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }

        // No refresh token available
        handleSessionExpired();

        return Promise.reject(error);
      } catch (refreshError) {
        // Refresh token is invalid/expired
        handleSessionExpired();

        return Promise.reject(refreshError);
      }
    }
    if (!error.response) {
      store.dispatch(
        setGlobalError({
          message: "Unable to connect to the server.",
        }),
      );
      return Promise.reject(error);
    }
    if (status === 400) {
      const errors = extract400Errors(error.response?.data);

      store.dispatch(
        setGlobalError({
          status: 400,
          errors,
        }),
      );

      return Promise.reject(error);
    }
    const responseData = error.response?.data;

    const validationErrors = responseData?.errors;

    let message =
      responseData?.message ||
      responseData?.title ||
      `Request failed (${status})`;

    if (validationErrors && typeof validationErrors === "object") {
      const validationMessages = Object.values(validationErrors)
        .flat()
        .filter(Boolean);

      if (validationMessages.length > 0) {
        message = validationMessages.join("\n");
      }
    }

    store.dispatch(
      setGlobalError({
        message,
        status,
      }),
    );

    return Promise.reject(error);
  },
);

export default api;
