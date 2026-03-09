const API_BASE = 'http://localhost:3000/api'

App({
  globalData: {
    userInfo: null,
    token: null,
    apiBase: API_BASE
  },

  onLaunch() {
    const token = wx.getStorageSync('token')
    if (token) {
      this.globalData.token = token
    }
  },

  // API请求封装
  request(options) {
    return new Promise((resolve, reject) => {
      const token = this.globalData.token
      wx.request({
        url: this.globalData.apiBase + options.url,
        method: options.method || 'GET',
        data: options.data || {},
        header: {
          'Content-Type': 'application/json',
          'x-user-id': token || ''
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data)
          } else if (res.statusCode === 403) {
            wx.showModal({
              title: '提示',
              content: '查询次数已用完，请订阅',
              success: () => {
                wx.switchTab({ url: '/pages/profile/profile' })
              }
            })
            reject(res)
          } else {
            reject(res)
          }
        },
        fail: reject
      })
    })
  }
})
