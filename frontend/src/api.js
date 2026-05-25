import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
})

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

export const updateProfile = (data) =>
  API.patch('/api/auth/profile', data)

export const getDashboard = () =>
  API.get('/api/dashboard')

export const getDepartments = () =>
  API.get('/api/departments')

export const getSubjects = (filters) =>
  API.get('/api/subjects', { params: filters })

export const getSubject = (id) =>
  API.get(`/api/subjects/${id}`)

export const getMaterials = (filters = {}) =>
  API.get('/api/materials', { params: filters })

export const getMaterial = (id) =>
  API.get(`/api/materials/${id}`)

export const getMyUploads = () =>
  API.get('/api/materials/my-uploads')

export const uploadMaterial = (formData) =>
  API.post('/api/materials/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const trackDownload = (id) =>
  API.patch(`/api/materials/${id}/download`)

export default API
