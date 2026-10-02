import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (typeof window !== "undefined" ? `http://${window.location.hostname}:8000/api` : "http://localhost:8000/api"),
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export default api;