import { useState, useEffect } from 'react'
import { Table, Tag } from 'antd'

export default function Orders() {
  const [orders] = useState([])
  const columns = [
    { title: '订单ID', dataIndex: '_id', key: '_id' },
    { title: '用户ID', dataIndex: 'userId', key: 'userId' },
    { title: '套餐', dataIndex: 'plan', key: 'plan' },
    { title: '金额', dataIndex: 'amount', key: 'amount' },
    { 
      title: '状态', 
      dataIndex: 'paymentStatus', 
      key: 'paymentStatus',
      render: (status) => {
        const colorMap = { paid: 'green', pending: 'orange', failed: 'red' }
        return <Tag color={colorMap[status] || 'default'}>{status}</Tag>
      }
    },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt' }
  ]

  return (
    <div>
      <h2>订阅订单</h2>
      <Table columns={columns} dataSource={orders} rowKey="_id" />
    </div>
  )
}
