/**
 * AcadMaid API Configuration
 * All API calls go through this axios instance.
 * The JWT token is automatically attached to every request.
 */

import axios from "axios";

// Base URL of your FastAPI backend
const API = axios.create({
  baseURL: "http://localhost:8000",
});

// Interceptor: add JWT token to every request if it exists
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("acadmaid_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: redirect to login on 401 (token expired/invalid)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("acadmaid_token");
      localStorage.removeItem("acadmaid_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API;