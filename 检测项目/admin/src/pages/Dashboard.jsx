import { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export default function Dashboard() {
  const [stats, setStats] = useState({ totalAmount: 0, totalCount: 0, growthRate: 0 })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const res = await api.get('/transactions/stats?days=7')
      setStats({
        totalAmount: res.totalStats.totalAmount,
        totalCount: res.totalStats.totalCount,
        growthRate: res.growthRate
      })
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div>
      <h2>数据看板</h2>
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="7日成交总额"
              value={stats.totalAmount}
              precision={2}
              prefix="¥"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="7日成交单量"
              value={stats.totalCount}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="较昨日增长率"
              value={stats.growthRate}
              precision={2}
              prefix={stats.growthRate >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
