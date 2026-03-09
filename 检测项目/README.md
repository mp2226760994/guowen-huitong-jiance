# 国文汇通检测项目 - 部署文档

## 一、环境要求

- Node.js >= 18.0.0
- MongoDB >= 5.0
- Chrome/Chromium (用于爬虫)

## 二、项目结构

```
检测项目/
├── backend/          # 后端服务
├── frontend/h5/      # H5前端
├── frontend/weapp/   # 微信小程序
└── admin/            # 管理后台
```

## 三、安装步骤

### 1. 安装后端依赖
```bash
cd 检测项目/backend
npm install
```

### 2. 安装前端依赖
```bash
cd 检测项目/frontend/h5
npm install

cd ../weapp
npm install

cd ../../admin
npm install
```

## 四、配置说明

### 环境变量配置

在 `backend/config/index.js` 中配置以下内容：

```javascript
// 爬虫配置
spider.username = '国文汇通账号'
spider.password = '国文汇通密码'

// MongoDB配置
database.host = 'localhost'
database.port = 27017
database.dbName = 'gwht_spider'
database.username = ''  // 如有需要
database.password = ''  // 如有需要

// JWT密钥
server.jwtSecret = 'your-secret-key'

// 微信配置
wechat.appId = 'wx...'
wechat.appSecret = 'wx...'
wechat.mchId = 'wx...'
wechat.apiKey = 'wx...'

// 阿里云短信
sms.accessKeyId = 'LKI...'
sms.accessKeySecret = '...'

// 邮箱配置
smtp.host = 'smtp.qq.com'
smtp.user = 'xxx@qq.com'
smtp.pass = 'xxx'
```

## 五、启动方式

### 1. 启动MongoDB
```bash
mongod --dbpath /data/db
```

### 2. 启动后端服务
```bash
cd 检测项目/backend
npm start
# 服务运行在 http://localhost:3000
```

### 3. 启动H5前端
```bash
cd 检测项目/frontend/h5
npm run dev
# 运行在 http://localhost:5173
```

### 4. 启动管理后台
```bash
cd 检测项目/admin
npm run dev
# 运行在 http://localhost:5174
```

### 5. 微信小程序开发
使用微信开发者工具打开 `检测项目/frontend/weapp` 目录

## 六、定时任务

- 每日 00:00 - 全量爬取
- 每小时 - 增量爬取  
- 每日 09:00 - 数据推送

## 七、常用命令

```bash
# 手动触发爬取
curl -X POST http://localhost:3000/api/spider/run -H "Content-Type: application/json" -d '{"fullCrawl": false}'

# 查看爬虫日志
curl http://localhost:3000/api/spider/logs

# 健康检查
curl http://localhost:3000/api/health
```

## 八、注意事项

1. 首次运行需要配置正确的账号密码
2. 确保MongoDB已启动
3. 微信支付功能需要企业认证
4. 爬虫需要安装Chrome浏览器
