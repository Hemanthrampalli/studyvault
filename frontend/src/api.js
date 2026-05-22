import axios from 'axios'

// Log the URL so we can confirm it's loaded
console.log('API URL is:', import.meta.env.VITE_API_URL)

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL
})

// Attach token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const registerUser = (data) =>
  API.post('/api/auth/register', data)

export const loginUser = (data) =>
  API.post('/api/auth/login', data)

export const getProfile = () =>
  API.get('/api/auth/profile')

export const getDepartments = () =>
  API.get('/api/departments')

export const getSubjects = (filters) =>
  API.get('/api/subjects', { params: filters })

export const getMaterials = (subject_id) =>
  API.get('/api/materials', { params: { subject_id } })

export const uploadMaterial = (formData) =>
  API.post('/api/materials/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })

export const trackDownload = (id) =>
  API.patch(`/api/materials/${id}/download`)