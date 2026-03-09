const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./config');
const logger = require('./utils/logger');
const scheduleService = require('./services/scheduleService');
const Log = require('./models/Log');

const app = express();

// 中间件
app.use(cors({
  origin: config.server.corsOrigins,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志
app.use(async (req, res, next) => {
  const start = Date.now();
  res.on('finish', async () => {
    const duration = Date.now() - start;
    await Log.log('system', 'info', `${req.method} ${req.path}`, {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration
    });
  });
  next();
});

// 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transaction'));
app.use('/api/subscription', require('./routes/subscription'));
app.use('/api/spider', require('./routes/spider'));
app.use('/api/user', require('./routes/user'));

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// 错误处理
app.use((err, req, res, next) => {
  logger('server').error('服务器错误', { error: err.message, stack: err.stack });
  res.status(500).json({ error: '服务器内部错误' });
});

// 连接数据库并启动服务
async function start() {
  try {
    // 连接MongoDB
    const mongoUrl = config.database.username 
      ? `mongodb://${config.database.username}:${config.database.password}@${config.database.host}:${config.database.port}/${config.database.dbName}`
      : `mongodb://${config.database.host}:${config.database.port}/${config.database.dbName}`;
    
    await mongoose.connect(mongoUrl);
    logger('server').info('MongoDB连接成功');

    // 启动定时任务
    scheduleService.start();

    // 启动HTTP服务
    app.listen(config.server.port, () => {
      logger('server').info(`服务已启动: http://localhost:${config.server.port}`);
    });
  } catch (error) {
    logger('server').error('启动失败', { error: error.message });
    process.exit(1);
  }
}

start();
