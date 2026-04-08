import axios from 'axios'

export const publicClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

publicClient.interceptors.response.use(
  (r) => r,
  (error) => {
    const message = error.response?.data?.error ?? error.message
    return Promise.reject(new Error(message))
  },
)
