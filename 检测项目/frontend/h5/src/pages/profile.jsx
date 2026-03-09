import { useState, useEffect } from 'react'
import { Button, List, Modal, Input, Toast } from 'antd-mobile'
import { user, subscription } from '../utils/api'

export default function ProfilePage() {
  const [userInfo, setUserInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showBindPhone, setShowBindPhone] = useState(false)
  const [showSubModal, setShowSubModal] = useState(false)
  const [phone, setPhone] = useState('')

  useEffect(() => {
    loadUserInfo()
  }, [])

  const loadUserInfo = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        const id = atob(token)
        const res = await user.getInfo(id)
        setUserInfo(res)
      }
    } catch (error) {
      console.error('获取用户信息失败', error)
    } finally {
      setLoading(false)
    }
  }

  const handleWechatLogin = () => {
    // TODO: 微信登录
    // 实际应用中调用 wx.login 获取 code
    Toast.info('微信登录功能开发中')
  }

  const handleBindPhone = async () => {
    if (!phone) {
      Toast.fail('请输入手机号')
      return
    }
    try {
      const token = localStorage.getItem('token')
      const id = atob(token)
      await user.updateInfo(id, { phone })
      Toast.success('绑定成功')
      setShowBindPhone(false)
      loadUserInfo()
    } catch (error) {
      Toast.fail('绑定失败')
    }
  }

  const handleSubscribe = async (plan) => {
    if (!userInfo) {
      Toast.fail('请先登录')
      return
    }
    try {
      const res = await subscription.createOrder(userInfo._id, plan)
      // TODO: 调用微信支付
      Toast.info('支付功能开发中')
    } catch (error) {
      Toast.fail('创建订单失败')
    }
  }

  if (loading) {
    return <div className="page">加载中...</div>
  }

  return (
    <div>
      <div className="header">
        <h1>个人中心</h1>
        <p>管理账户和订阅</p>
      </div>

      <div className="page">
        {userInfo ? (
          <>
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ 
                  width: 60, 
                  height: 60, 
                  borderRadius: '50%', 
                  background: '#eee',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24
                }}>
                  {userInfo.nickname?.[0] || '用户'}
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 'bold' }}>
                    {userInfo.nickname || '未设置昵称'}
                  </div>
                  <div style={{ fontSize: 14, color: '#999' }}>
                    {userInfo.phone || '未绑定手机'}
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 style={{ marginBottom: 12 }}>订阅状态</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>状态</span>
                <span style={{ 
                  color: userInfo.subscription.status === 'active' ? '#52c41a' : '#999' 
                }}>
                  {userInfo.subscription.status === 'active' ? '已订阅' : '未订阅'}
                </span>
              </div>
              {userInfo.subscription.status !== 'active' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>免费查询次数</span>
                  <span>{userInfo.subscription.queryCount} 次</span>
                </div>
              )}
              {userInfo.subscription.status === 'active' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>到期时间</span>
                  <span>{userInfo.subscription.expireDate?.split('T')[0]}</span>
                </div>
              )}
              
              {userInfo.subscription.status !== 'active' && (
                <Button 
                  color="primary" 
                  block 
                  onClick={() => setShowSubModal(true)}
                  style={{ marginTop: 12 }}
                >
                  立即订阅
                </Button>
              )}
            </div>

            <div className="card">
              <List>
                <List.Item onClick={() => setShowBindPhone(true)}>
                  绑定手机号
                </List.Item>
                <List.Item>
                  <span>推送设置</span>
                  <List.ItemExtra>未配置</List.ItemExtra>
                </List.Item>
              </List>
            </div>
          </>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ marginBottom: 20, color: '#666' }}>
              登录后可查看订阅状态和查询历史
            </div>
            <Button type="primary" block onClick={handleWechatLogin}>
              微信一键登录
            </Button>
          </div>
        )}
      </div>

      {/* 绑定手机弹窗 */}
      <Modal
        visible={showBindPhone}
        title="绑定手机号"
        onClose={() => setShowBindPhone(false)}
        content={
          <div>
            <Input
              placeholder="请输入手机号"
              value={phone}
              onChange={setPhone}
              type="phone"
              style={{ marginBottom: 12 }}
            />
            <Button color="primary" block onClick={handleBindPhone}>
              绑定
            </Button>
          </div>
        }
      />

      {/* 订阅弹窗 */}
      <Modal
        visible={showSubModal}
        title="选择订阅套餐"
        onClose={() => setShowSubModal(false)}
        content={
          <div>
            <div 
              className="card" 
              style={{ marginBottom: 12, cursor: 'pointer' }}
              onClick={() => handleSubscribe('monthly')}
            >
              <div style={{ fontSize: 16, fontWeight: 'bold' }}>月度订阅</div>
              <div style={{ color: '#1890ff', fontSize: 24, marginTop: 4 }}>¥29.99/月</div>
            </div>
            <div 
              className="card" 
              style={{ marginBottom: 12, cursor: 'pointer' }}
              onClick={() => handleSubscribe('quarterly')}
            >
              <div style={{ fontSize: 16, fontWeight: 'bold' }}>季度订阅</div>
              <div style={{ color: '#1890ff', fontSize: 24, marginTop: 4 }}>¥79.99/季</div>
              <div style={{ fontSize: 12, color: '#52c41a' }}>省20%</div>
            </div>
            <div 
              className="card" 
              style={{ cursor: 'pointer' }}
              onClick={() => handleSubscribe('yearly')}
            >
              <div style={{ fontSize: 16, fontWeight: 'bold' }}>年度订阅</div>
              <div style={{ color: '#1890ff', fontSize: 24, marginTop: 4 }}>¥299.99/年</div>
              <div style={{ fontSize: 12, color: '#52c41a' }}>省50%，最划算</div>
            </div>
          </div>
        }
      />
    </div>
  )
}
