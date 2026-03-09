import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 请求拦截
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers['x-user-id'] = token
  }
  return config
})

// 响应拦截
api.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 403) {
      alert('查询次数已用完，请订阅')
    }
    return Promise.reject(error)
  }
)

// 认证
export const auth = {
  wechatLogin: (code) => api.post('/auth/wechat', { code }),
  bindPhone: (userId, phone, code) => api.post('/auth/bind-phone', { userId, phone, code }),
  bindEmail: (userId, email, code) => api.post('/auth/bind-email', { userId, email, code })
}

// 成交数据
export const transactions = {
  getDaily: () => api.get('/transactions/daily'),
  getRange: (startDate, endDate, page, pageSize) => 
    api.get('/transactions/range', { params: { startDate, endDate, page, pageSize } }),
  getStats: (days) => api.get('/transactions/stats', { params: { days } }),
  getHourly: (date) => api.get('/transactions/hourly', { params: { date } })
}

// 订阅
export const subscription = {
  getPlans: () => api.get('/subscription/plans'),
  createOrder: (userId, plan) => api.post('/subscription/create', { userId, plan }),
  getStatus: (userId) => api.get(`/subscription/status/${userId}`)
}

// 用户
export const user = {
  getInfo: (id) => api.get(`/user/${id}`),
  updateInfo: (id, data) => api.put(`/user/${id}`, data)
}

export default api
