// ============================================================
// services/api.js — Axios instance with automatic JWT attachment
// ============================================================

import axios from "axios";

// Base URL reads from Vite's environment variables
// Create a .env file in your frontend root with:
//   VITE_API_URL=http://localhost:5000
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Create a configured axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ─── Request interceptor ──────────────────────────────────
// Automatically attaches the JWT token to every outgoing request.
// This means we never have to manually add Authorization headers
// in individual API calls.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("telehealth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor ─────────────────────────────────
// Handles 401 Unauthorized globally — clears storage and
// redirects to login when a token expires mid-session.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — force re-login
      localStorage.removeItem("telehealth_token");
      localStorage.removeItem("telehealth_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ─── Auth API calls ───────────────────────────────────────
export const authAPI = {
  register: (userData) => api.post("/api/auth/register", userData),
  login: (credentials) => api.post("/api/auth/login", credentials),
  getMe: () => api.get("/api/auth/me"),
};

// ─── Health Records API ───────────────────────────────────
export const recordsAPI = {
  create: (data) => api.post("/api/records", data),
  getByPatient: (patientId) => api.get(`/api/records/${patientId}`),
  update: (recordId, data) => api.put(`/api/records/${recordId}`, data),
};

// ─── Consultation API ─────────────────────────────────────
export const consultationAPI = {
  request: (data) => api.post("/api/consultations/request", data),
  getPatient: (patientId) => api.get(`/api/consultations/patient/${patientId}`),
  getDoctor: (doctorId) => api.get(`/api/consultations/doctor/${doctorId}`),
  getPending: () => api.get("/api/consultations/pending"),
  accept: (id) => api.put(`/api/consultations/accept/${id}`),
  complete: (id) => api.put(`/api/consultations/complete/${id}`),
  addPrescription: (id, data) => api.put(`/api/consultations/prescription/${id}`, data),
  sendMessage: (id, data) => api.post(`/api/consultations/message/${id}`, data),
  getById: (id) => api.get(`/api/consultations/${id}`),
};

// ─── Symptom Checker API ──────────────────────────────────
export const symptomsAPI = {
  check: (symptoms) => api.post("/api/symptoms/check", { symptoms }),
  getHistory: (patientId) => api.get(`/api/symptoms/history/${patientId}`),
};

// ─── Medicine API ─────────────────────────────────────────
export const medicineAPI = {
  add: (data) => api.post("/api/medicines/add", data),
  update: (id, data) => api.put(`/api/medicines/update/${id}`, data),
  search: (name, inStock) =>
    api.get(`/api/medicines/search`, { params: { name, inStock } }),
  getInventory: (pharmacyId) => api.get(`/api/medicines/pharmacy/${pharmacyId}`),
};

// ─── Emergency API ────────────────────────────────────────
export const emergencyAPI = {
  getInfo: () => api.get("/api/emergency/info"),
};

export default api;