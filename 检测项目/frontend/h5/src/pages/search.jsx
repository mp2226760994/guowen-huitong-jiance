import { useState } from 'react'
import { DatePicker, Button, List, Modal } from 'antd-mobile'
import { transactions, subscription } from '../utils/api'
import dayjs from 'dayjs'

export default function SearchPage() {
  const [startDate, setStartDate] = useState(dayjs().subtract(7, 'day'))
  const [endDate, setEndDate] = useState(dayjs())
  const [data, setData] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showSubModal, setShowSubModal] = useState(false)

  const handleSearch = async () => {
    try {
      setLoading(true)
      const res = await transactions.getRange(
        startDate.format('YYYY-MM-DD'),
        endDate.format('YYYY-MM-DD')
      )
      setData(res.data)
      setStats(res.stats)
    } catch (error) {
      if (error.response?.status === 403) {
        setShowSubModal(true)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="header">
        <h1>数据查询</h1>
        <p>查询历史成交数据</p>
      </div>

      <div className="page">
        <div className="card">
          <div className="form-group">
            <label className="form-label">开始日期</label>
            <DatePicker
              mode="date"
              value={startDate.toDate()}
              onChange={date => setStartDate(dayjs(date))}
            >
              <Button>{startDate.format('YYYY-MM-DD')}</Button>
            </DatePicker>
          </div>

          <div className="form-group">
            <label className="form-label">结束日期</label>
            <DatePicker
              mode="date"
              value={endDate.toDate()}
              onChange={date => setEndDate(dayjs(date))}
            >
              <Button>{endDate.format('YYYY-MM-DD')}</Button>
            </DatePicker>
          </div>

          <Button 
            type="primary" 
            loading={loading}
            onClick={handleSearch}
            style={{ marginTop: 16 }}
          >
            查询
          </Button>
        </div>

        {stats && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              <div className="stat-card">
                <div className="stat-value">{stats.totalCount}</div>
                <div className="stat-label">总单量</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{(stats.totalAmount / 10000).toFixed(1)}万</div>
                <div className="stat-label">总成交额</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.avgPrice.toFixed(0)}</div>
                <div className="stat-label">平均单价</div>
              </div>
            </div>
          </div>
        )}

        {data.length > 0 && (
          <div className="card">
            <h3 style={{ marginBottom: 12 }}>成交明细</h3>
            <List>
              {data.slice(0, 20).map(item => (
                <List.Item key={item._id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <div>
                      <div>{item.collectionName}</div>
                      <div style={{ fontSize: 12, color: '#999' }}>
                        {dayjs(item.time).format('MM-DD HH:mm')}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: item.direction === 'buy' ? '#ff4d4f' : '#52c41a' }}>
                        {item.direction === 'buy' ? '买入' : '卖出'}
                      </div>
                      <div>¥{item.price.toFixed(0)} × {item.quantity}</div>
                    </div>
                  </div>
                </List.Item>
              ))}
            </List>
            {data.length > 20 && (
              <div style={{ textAlign: 'center', padding: 12, color: '#999' }}>
                还有 {data.length - 20} 条数据...
              </div>
            )}
          </div>
        )}
      </div>

      <Modal
        visible={showSubModal}
        title="提示"
        content="查询次数已用完，请订阅后继续查询"
        closeOnMaskClick
        onClose={() => setShowSubModal(false)}
      >
        <Button color="primary" onClick={() => {
          setShowSubModal(false)
          window.location.href = '/profile'
        }}>
          去订阅
        </Button>
      </Modal>
    </div>
  )
}
