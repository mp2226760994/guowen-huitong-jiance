module.exports = {
  // 爬虫配置
  spider: {
    // 国文汇通平台URL
    baseUrl: 'https://www.gwht.com',
    loginUrl: 'https://www.gwht.com/login',
    transactionUrl: 'https://www.gwht.com/deal/list',
    
    // 登录账号（从环境变量或配置文件读取）
    username: process.env.SPIDER_USERNAME || '',
    password: process.env.SPIDER_PASSWORD || '',
    
    // 爬取配置
    retryTimes: 3,
    retryDelay: 3000,
    pageLoadTimeout: 30000,
    elementWaitTimeout: 10000,
    
    // 随机延迟范围（毫秒）
    minDelay: 500,
    maxDelay: 2000,
    
    // Chrome启动配置
    headless: false,
    userDataDir: null,  // 使用临时用户目录
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-dev-shm-usage',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--allow-running-insecure-content',
      '--disable-gpu'
    ]
  },
  
  // 数据库配置
  database: {
    host: process.env.MONGO_HOST || 'localhost',
    port: process.env.MONGO_PORT || 27017,
    dbName: process.env.MONGO_DB || 'gwht_spider',
    username: process.env.MONGO_USER || '',
    password: process.env.MONGO_PASSWORD || ''
  },
  
  // 服务配置
  server: {
    port: process.env.PORT || 3000,
    corsOrigins: ['http://localhost:5173', 'http://localhost:3001'],
    jwtSecret: process.env.JWT_SECRET || 'gwht-secret-key-change-in-production'
  },
  
  // 微信配置
  wechat: {
    appId: process.env.WECHAT_APPID || '',
    appSecret: process.env.WECHAT_SECRET || '',
    mchId: process.env.WECHAT_MCHID || '',
    apiKey: process.env.WECHAT_APIKEY || ''
  },
  
  // 推送配置
  push: {
    sms: {
      provider: 'aliyun',
      accessKeyId: process.env.SMS_ACCESS_KEY || '',
      accessKeySecret: process.env.SMS_SECRET || '',
      signName: '国文汇通',
      templateCode: 'SMS_xxx'
    },
    email: {
      host: process.env.SMTP_HOST || 'smtp.qq.com',
      port: process.env.SMTP_PORT || 465,
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    }
  }
};
