import { useState, useEffect } from 'react'
import { Table, Button, Tag, Space, Modal, message } from 'antd'
import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 })

  useEffect(() => {
    loadUsers()
  }, [pagination.current])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const res = await api.get('/user', { params: { page: pagination.current, pageSize: pagination.pageSize } })
      setUsers(res.data)
      setPagination({ ...pagination, total: res.pagination.total })
    } catch (e) {
      message.error('加载失败')
    } finally {
      setLoading(false)
    }
  }

  const handleResetQuery = async (userId) => {
    try {
      await api.post(`/user/${userId}/reset-query`)
      message.success('重置成功')
      loadUsers()
    } catch (e) {
      message.error('重置失败')
    }
  }

  const columns = [
    { title: 'ID', dataIndex: '_id', key: '_id', width: 120 },
    { title: '昵称', dataIndex: 'nickname', key: 'nickname' },
    { title: '手机', dataIndex: 'phone', key: 'phone' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { 
      title: '订阅状态', 
      dataIndex: ['subscription', 'status'], 
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'default'}>
          {status === 'active' ? '已订阅' : '未订阅'}
        </Tag>
      )
    },
    { 
      title: '剩余查询次数', 
      dataIndex: ['subscription', 'queryCount'], 
      key: 'queryCount' 
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => handleResetQuery(record._id)}>
            重置查询
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div>
      <h2>用户管理</h2>
      <Table
        columns={columns}
        dataSource={users}
        rowKey="_id"
        loading={loading}
        pagination={{ ...pagination, onChange: (page) => setPagination({ ...pagination, current: page }) }}
      />
    </div>
  )
}
