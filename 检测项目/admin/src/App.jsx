import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider, Layout, Menu } from 'antd'
import { 
  DashboardOutlined, 
  UserOutlined, 
  ShoppingCartOutlined, 
  SpiderOutlined,
  BarChartOutlined
} from '@ant-design/icons'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Orders from './pages/Orders'
import Spider from './pages/Spider'
import './App.css'

const { Header, Sider, Content } = Layout

export default function App() {
  return (
    <ConfigProvider>
      <BrowserRouter>
        <Layout style={{ minHeight: '100vh' }}>
          <Sider width={200} theme="dark">
            <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 18, fontWeight: 'bold' }}>
              国文汇通检测
            </div>
            <Menu
              theme="dark"
              mode="inline"
              defaultSelectedKeys={['1']}
              items={[
                { key: '1', icon: <DashboardOutlined />, label: <a href="/">数据看板</a> },
                { key: '2', icon: <UserOutlined />, label: <a href="/users">用户管理</a> },
                { key: '3', icon: <ShoppingCartOutlined />, label: <a href="/orders">订阅订单</a> },
                { key: '4', icon: <SpiderOutlined />, label: <a href="/spider">爬虫管理</a> },
              ]}
            />
          </Sider>
          <Layout>
            <Header style={{ background: '#fff', padding: '0 24px', fontSize: 18 }}>
              管理后台
            </Header>
            <Content style={{ margin: 16, padding: 24, background: '#fff' }}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/users" element={<Users />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/spider" element={<Spider />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Content>
          </Layout>
        </Layout>
      </BrowserRouter>
    </ConfigProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
