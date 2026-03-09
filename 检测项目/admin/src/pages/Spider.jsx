import { useState } from 'react'
import { Button, Card, Space, message, Table, Tag } from 'antd'
import { PlayCircleOutlined, ReloadOutlined } from '@ant-design/icons'
import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export default function Spider() {
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState([])
  const [running, setRunning] = useState(false)

  const handleRun = async (fullCrawl = false) => {
    setLoading(true)
    try {
      await api.post('/spider/run', { fullCrawl })
      setRunning(true)
      message.success('爬取任务已启动')
      setTimeout(() => setRunning(false), 60000)
    } catch (e) {
      message.error('启动失败')
    } finally {
      setLoading(false)
    }
  }

  const loadLogs = async () => {
    try {
      const res = await api.get('/spider/logs?days=7')
      setLogs(res)
    } catch (e) {
      console.error(e)
    }
  }

  const columns = [
    { 
      title: '时间', 
      dataIndex: 'createdAt', 
      key: 'createdAt',
      render: (t) => new Date(t).toLocaleString()
    },
    { title: '类型', dataIndex: 'type', key: 'type' },
    { 
      title: '级别', 
      dataIndex: 'level', 
      key: 'level',
      render: (l) => {
        const colorMap = { error: 'red', warn: 'orange', info: 'blue' }
        return <Tag color={colorMap[l] || 'default'}>{l}</Tag>
      }
    },
    { title: '消息', dataIndex: 'message', key: 'message' }
  ]

  return (
    <div>
      <h2>爬虫管理</h2>
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Button 
            type="primary" 
            icon={<PlayCircleOutlined />} 
            loading={loading && !running}
            onClick={() => handleRun(false)}
          >
            增量爬取
          </Button>
          <Button 
            icon={<ReloadOutlined />} 
            loading={loading && running}
            onClick={() => handleRun(true)}
          >
            全量爬取
          </Button>
        </Space>
      </Card>
      
      <h3>运行日志</h3>
      <Table
        columns={columns}
        dataSource={logs}
        rowKey="_id"
        size="small"
      />
    </div>
  )
}
