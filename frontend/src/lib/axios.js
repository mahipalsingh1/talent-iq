import axios from "axios";

// ✅ Safe env read
const BASE_URL = import.meta.env.VITE_API_URL;

// 🔥 Debug (IMPORTANT)
console.log("🌐 BASE_URL:", BASE_URL);

// ❌ Don't crash app in production
if (!BASE_URL) {
  console.error("❌ VITE_API_URL is not defined");
}

const axiosInstance = axios.create({
  baseURL: BASE_URL || "", // fallback to avoid crash
  withCredentials: true,
  timeout: 10000,
});

// 🔥 Request logger (VERY IMPORTANT)
axiosInstance.interceptors.request.use((config) => {
  console.log("🚀 API Request:", `${config.baseURL}${config.url}`);
  return config;
});

// 🔥 Response logger
axiosInstance.interceptors.response.use(
  (response) => {
    console.log("✅ API Response:", response.config.url);
    return response;
  },
  (error) => {
    console.error("❌ API Error:", error.response?.config?.url || error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;