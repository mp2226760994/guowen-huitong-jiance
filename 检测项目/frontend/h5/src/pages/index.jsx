import { useState, useEffect } from 'react'
import ReactECharts from 'echarts-for-react'
import { transactions } from '../utils/api'
import dayjs from 'dayjs'

export default function IndexPage() {
  const [dailyStats, setDailyStats] = useState({ totalCount: 0, totalAmount: 0, avgPrice: 0 })
  const [hourlyData, setHourlyData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      // 获取当日数据
      const dailyRes = await transactions.getDaily()
      setDailyStats(dailyRes.stats)

      // 获取小时级数据
      const hourlyRes = await transactions.getHourly()
      setHourlyData(hourlyRes)
    } catch (error) {
      console.error('加载数据失败', error)
    } finally {
      setLoading(false)
    }
  }

  const chartOption = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: hourlyData.map(h => `${h.hour}:00`),
      axisLabel: {
        interval: 2,
        fontSize: 10
      }
    },
    yAxis: {
      type: 'value',
      name: '成交量'
    },
    series: [
      {
        name: '成交量',
        type: 'bar',
        data: hourlyData.map(h => h.count),
        itemStyle: {
          color: '#1890ff'
        }
      }
    ]
  }

  return (
    <div>
      <div className="header">
        <h1>国文汇通检测</h1>
        <p>每日成交数据监控</p>
      </div>

      <div className="page">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <div className="stat-card">
              <div className="stat-value">{dailyStats.totalCount}</div>
              <div className="stat-label">今日成交单量</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{(dailyStats.totalAmount / 10000).toFixed(1)}万</div>
              <div className="stat-label">成交总额</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{dailyStats.avgPrice.toFixed(0)}</div>
              <div className="stat-label">平均单价</div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 12 }}>小时成交量</h3>
          <ReactECharts 
            option={chartOption} 
            style={{ height: 250 }}
            opts={{ renderer: 'canvas' }}
          />
        </div>
      </div>
    </div>
  )
}
