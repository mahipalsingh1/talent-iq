import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

if (!BASE_URL) {
  throw new Error("❌ VITE_API_URL is not defined");
}

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

console.log("✅ API URL:", BASE_URL);

export default axiosInstance;