const app = getApp()
const echarts = require('../../libs/echarts')

Page({
  data: {
    dailyStats: {
      totalCount: 0,
      totalAmount: '0',
      avgPrice: '0'
    },
    chartEc: {
      on: {},
      options: {}
    }
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    this.loadData()
  },

  loadData() {
    this.getDailyStats()
    this.getHourlyData()
  },

  async getDailyStats() {
    try {
      const res = await app.request({ url: '/transactions/daily' })
      this.setData({
        dailyStats: {
          totalCount: res.stats.totalCount,
          totalAmount: (res.stats.totalAmount / 10000).toFixed(1) + '万',
          avgPrice: res.stats.avgPrice.toFixed(0)
        }
      })
    } catch (e) {
      console.error('获取日统计失败', e)
    }
  },

  async getHourlyData() {
    try {
      const res = await app.request({ url: '/transactions/hourly' })
      const hours = res.map(h => `${h.hour}:00`)
      const counts = res.map(h => h.count)

      const chartOption = {
        tooltip: { trigger: 'axis' },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'category', data: hours },
        yAxis: { type: 'value', name: '成交量' },
        series: [{
          name: '成交量',
          type: 'bar',
          data: counts,
          itemStyle: { color: '#1890ff' }
        }]
      }

      this.setData({
        chartEc: {
          on: {},
          options: chartOption
        }
      })
    } catch (e) {
      console.error('获取小时数据失败', e)
    }
  }
})
