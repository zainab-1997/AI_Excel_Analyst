import axios from 'axios'

// In production (Render), VITE_API_URL is empty so calls go to same origin.
// In local dev, Vite proxy maps /api → http://127.0.0.1:8000
const BASE = import.meta.env.VITE_API_URL ?? '/api'

const api = axios.create({ baseURL: BASE, timeout: 60000 })

export const analyzeFile = (file) => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/analyze/', form)
}

export const compareFiles = (files) => {
  const form = new FormData()
  files.forEach((f) => form.append('files', f))
  return api.post('/compare/', form)
}

export const chatWithData = (question, analysis, samples, language) =>
  api.post('/chat/', { question, analysis, samples, language })

export const generateReport = (analysis, reportType, samples, language) =>
  api.post('/report/', { analysis, report_type: reportType, samples, language })

export const getHistory = () => api.get('/history/')

export const exportPDF = (text, reportType) =>
  api.post('/pdf/', { text, report_type: reportType }, { responseType: 'blob' })
