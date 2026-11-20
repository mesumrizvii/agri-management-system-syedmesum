// One axios instance for the whole app.
// - request: adds "Authorization: Bearer <token>"
// - response: on 401 (expired / invalid token) clears the session and goes to /login
import axios from "axios";
import { APP_SETTINGS } from "../../../config";

const http = axios.create({ baseURL: APP_SETTINGS.API_URL });

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem(APP_SETTINGS.STORAGE_KEY));
  } catch {
    return null;
  }
};

http.interceptors.request.use((config) => {
  const user = getStoredUser();
  if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthCall = /\/users\/(login|register)$/.test(err.config?.url || "");
    if (err.response?.status === 401 && !isAuthCall) {
      localStorage.removeItem(APP_SETTINGS.STORAGE_KEY);
      if (window.location.pathname !== "/login") window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default http;
