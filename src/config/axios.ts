import Axios from 'axios'

const axios = Axios.create({
  baseURL: import.meta.env.VITE_URL_BASE_ENDPOINT
})

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default axios
