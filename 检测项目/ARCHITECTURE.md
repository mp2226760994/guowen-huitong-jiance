# 国文汇通检测项目 - 架构设计文档

## 一、项目概述

**项目名称**: 国文汇通成交数据监控系统  
**项目目标**: 为国文汇通文交所投资者提供成交数据监控、统计分析、风险预警服务  
**技术栈**: Node.js + Express + MongoDB + React + ECharts + 微信小程序

---

## 二、目录结构

```
D:/workspace/国文汇通检测/检测项目/
├── backend/                    # 后端服务
│   ├── config/                 # 配置文件
│   │   ├── database.js        # MongoDB配置
│   │   ├── wechat.js          # 微信配置
│   │   └── spider.js          # 爬虫配置
│   ├── models/                 # 数据模型
│   │   ├── User.js            # 用户模型
│   │   ├── Transaction.js     # 成交记录模型
│   │   ├── Subscription.js    # 订阅模型
│   │   └── Log.js             # 日志模型
│   ├── routes/                # 路由接口
│   │   ├── auth.js            # 认证接口
│   │   ├── transaction.js    # 成交数据接口
│   │   ├── subscription.js    # 订阅接口
│   │   ├── spider.js          # 爬虫管理接口
│   │   └── user.js            # 用户管理接口
│   ├── services/              # 业务逻辑
│   │   ├── spiderService.js   # 爬虫服务
│   │   ├── wechatService.js   # 微信服务
│   │   ├── paymentService.js  # 支付服务
│   │   ├── pushService.js     # 推送服务
│   │   └── scheduleService.js # 定时任务
│   ├── utils/                 # 工具函数
│   │   ├── logger.js          # 日志工具
│   │   ├── cookieStore.js     # Cookie存储
│   │   └── validator.js      # 验证工具
│   ├── app.js                 # 主入口
│   └── package.json
├── frontend/                   # 前端
│   ├── h5/                    # H5端
│   │   ├── src/
│   │   │   ├── components/    # 公共组件
│   │   │   ├── pages/        # 页面
│   │   │   │   ├── index/    # 首页
│   │   │   │   ├── search/   # 查询页
│   │   │   │   └── profile/  # 个人中心
│   │   │   ├── utils/        # 工具
│   │   │   ├── api/          # API请求
│   │   │   ├── App.jsx
│   │   │   └── main.jsx
│   │   ├── index.html
│   │   ├── vite.config.js
│   │   └── package.json
│   └── weapp/                  # 微信小程序
│       ├── pages/
│       │   ├── index/
│       │   ├── search/
│       │   └── profile/
│       ├── app.js
│       ├── app.json
│       └── project.config.json
├── admin/                      # 管理后台
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── utils/
│   │   └── App.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── backup/                     # 数据备份
│   └── 2024-01-01/            # 按日期归档
├── log/                        # 日志文件
│   ├── spider/                 # 爬虫日志
│   └── server/                 # 服务日志
└── README.md
```

---

## 三、数据库表设计

### 3.1 用户表 (users)
```javascript
{
  _id: ObjectId,
  openid: String,           // 微信openid
  phone: String,             // 手机号
  email: String,             // 邮箱
  nickname: String,          // 昵称
  avatar: String,            // 头像
  subscription: {
    status: String,          // 'free' | 'active' | 'expired'
    plan: String,            // 'monthly' | 'quarterly' | 'yearly'
    expireDate: Date,        // 过期时间
    queryCount: Number,     // 免费查询次数剩余
    totalQueryCount: Number // 历史查询总次数
  },
  pushSettings: {
    sms: Boolean,           // 短信推送开关
    email: Boolean          // 邮件推送开关
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 3.2 成交记录表 (transactions)
```javascript
{
  _id: ObjectId,
  transactionId: String,    // 成交ID (唯一主键)
  price: Number,            // 成交单价
  quantity: Number,         // 成交数量
  totalAmount: Number,      // 成交总额
  time: Date,               // 成交时间
  collectionName: String,   // 藏品名称
  direction: String,        // 'buy' | 'sell' 买卖方向
  createdAt: Date
}
// 索引: { transactionId: 1 }, unique: true
// 索引: { collectionName: 1, time: -1 }
```

### 3.3 订阅订单表 (subscriptions)
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  plan: String,             // 'monthly' | 'quarterly' | 'yearly'
  amount: Number,           // 金额(分)
  paymentStatus: String,   // 'pending' | 'paid' | 'failed'
  wechatPayOrderId: String,// 微信订单号
  paidAt: Date,
  expireAt: Date,
  createdAt: Date
}
```

### 3.4 操作日志表 (logs)
```javascript
{
  _id: ObjectId,
  type: String,             // 'spider' | 'login' | 'query' | 'admin'
  level: String,            // 'info' | 'warn' | 'error'
  message: String,
  details: Object,
  createdAt: Date
}
```

---

## 四、核心流程设计

### 4.1 爬虫自动登录流程
1. 启动Chrome浏览器（注入反检测脚本）
2. 访问登录页，等待账号输入框
3. 模拟真人延迟输入账号
4. 等待密码输入框，模拟真人延迟输入密码
5. 等待登录按钮可点击
6. CDP协议模拟鼠标点击
7. 验证登录成功，保存Cookie
8. 持久化Cookie到文件

### 4.2 数据爬取流程
1. 加载Cookie，检查登录态
2. 访问成交列表页
3. 解析页面数据，提取核心字段
4. 查询数据库，已存在ID则跳过
5. 新增数据入库
6. 翻页继续爬取
7. 生成Excel备份

### 4.3 定时任务
- 每日 00:00:00 - 全量爬取
- 每小时 00:00 - 增量爬取
- 每日 09:00 - 数据推送

---

## 五、接口设计

### 5.1 认证接口
- `POST /api/auth/wechat` - 微信登录
- `POST /api/auth/bind-phone` - 绑定手机
- `POST /api/auth/bind-email` - 绑定邮箱

### 5.2 数据查询接口
- `GET /api/transactions/daily` - 当日数据
- `GET /api/transactions/range` - 范围查询
- `GET /api/transactions/stats` - 统计汇总

### 5.3 订阅接口
- `GET /api/subscription/plans` - 套餐列表
- `POST /api/subscription/create` - 创建订单
- `POST /api/subscription/callback` - 支付回调

### 5.4 爬虫管理接口
- `POST /api/spider/run` - 触发爬取
- `GET /api/spider/status` - 运行状态
- `GET /api/spider/logs` - 执行日志

---

## 六、安全配置

- 跨域白名单配置
- JWT token鉴权
- 接口频率限制
- 敏感信息加密存储
- 操作日志审计
