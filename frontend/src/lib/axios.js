import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 10000, // prevent hanging requests
});

// 🔍 Debug (optional)
console.log("API URL:", BASE_URL);

export default axiosInstance;