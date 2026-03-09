import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { TabBar } from 'antd-mobile'
import { 
  ChartOutlined, 
  SearchOutlined, 
  UserOutlined 
} from '@ant-design/icons'
import './App.css'

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const tabs = [
    { key: '/', title: '首页', icon: <ChartOutlined /> },
    { key: '/search', title: '查询', icon: <SearchOutlined /> },
    { key: '/profile', title: '我的', icon: <UserOutlined /> },
  ]

  return (
    <div className="app">
      <div className="content">
        <Outlet />
      </div>
      <TabBar activeKey={location.pathname} onChange={key => navigate(key)}>
        {tabs.map(tab => (
          <TabBar.Item key={tab.key} icon={tab.icon} title={tab.title} />
        ))}
      </TabBar>
    </div>
  )
}
