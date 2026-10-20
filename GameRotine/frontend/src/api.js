import axios from 'axios'

const getToken = () => localStorage.getItem('access_token') 

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  interceptors: {
    request: [
      (config) => {
        const token = getToken()
        if (token) {
          config.headers.Authorization = `Bearer \${token}`
        }

        if (config.url.endsWith('/')) {
          config.url = config.url.slice(0, -1)
        }
        return config
      },
    ],
  },
})

export const tasksAPI = {
  getTasks: () => api.get('/tasks'),
  createTask: (data) => api.post('/tasks', data),
  // метод для обновления статуса
  updateStatus: (id, status) => api.patch(`/tasks/\${id}`, { status }),
}

export default api
