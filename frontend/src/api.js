// api.js
// All API calls to our backend in one place
// This keeps things organised — if the URL changes, we only update here

import axios from 'axios'

// Create an axios instance with our backend URL as base
// Every call using 'API' will automatically prepend this URL
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL  // reads from .env file
})

// ─── INTERCEPTOR ──────────────────────────────────────────────
// This runs before EVERY request automatically
// It attaches the user's token to every request header
// So we don't have to manually add it every time
API.interceptors.request.use((config) => {
  // Get token from localStorage (where we save it after login)
  const token = localStorage.getItem('token')

  if (token) {
    // Attach token to Authorization header
    // Backend middleware reads this to verify the user
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// ─── AUTH ─────────────────────────────────────────────────────
export const registerUser = (data) =>
  API.post('/api/auth/register', data)

export const loginUser = (data) =>
  API.post('/api/auth/login', data)

export const getProfile = () =>
  API.get('/api/auth/profile')

// ─── DEPARTMENTS ──────────────────────────────────────────────
export const getDepartments = () =>
  API.get('/api/departments')

// ─── SUBJECTS ─────────────────────────────────────────────────
// Accepts an object of filters e.g. { department_id, year, semester }
export const getSubjects = (filters) =>
  API.get('/api/subjects', { params: filters })

// ─── MATERIALS ────────────────────────────────────────────────
export const getMaterials = (subject_id) =>
  API.get('/api/materials', { params: { subject_id } })

export const uploadMaterial = (formData) =>
  API.post('/api/materials/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })

// Ensure this is named 'downloadMaterial'
export const downloadMaterial = (material_id) =>
  API.patch(`/api/materials/${material_id}/download`)

export const getMyUploads = () =>
  API.get('/api/materials/my-uploads')