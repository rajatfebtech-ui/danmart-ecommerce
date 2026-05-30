import axios from "axios";
import Cookies from "js-cookie";

const AdminAxios = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1"}/admin`,
  headers: { Accept: "application/json" },
});

AdminAxios.interceptors.request.use((config) => {
  const token = Cookies.get("adminToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default AdminAxios;
