// Central app settings. The API URL comes from .env (VITE_API_URL), with a local default.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const APP_SETTINGS = {
  API_URL,
  // buyer photos are served by the backend at http://localhost:5000/images/...
  IMAGE_BASE: API_URL.replace(/\/api\/?$/, ""),
  STORAGE_KEY: "agri_user",
};
