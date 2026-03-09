const express = require('express');
const router = express.Router();
const SpiderService = require('../services/spiderService');
const scheduleService = require('../services/scheduleService');
const Log = require('../models/Log');
const logger = require('../utils/logger');

// 手动触发爬取
router.post('/run', async (req, res) => {
  try {
    const { fullCrawl = false } = req.body;
    
    res.json({ message: '爬取任务已启动' });
    
    const result = await scheduleService.manualCrawl(fullCrawl);
    await Log.log('spider', result ? 'info' : 'error', `手动爬取${fullCrawl ? '全量' : '增量'}`, { result });
  } catch (error) {
    logger('spider').error('手动爬取失败', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// 获取爬虫状态
router.get('/status', (req, res) => {
  // TODO: 实现真正的状态追踪
  res.json({
    running: false,
    lastRun: null,
    lastResult: null
  });
});

// 获取爬取日志
router.get('/logs', async (req, res) => {
  try {
    const { type = 'spider', days = 7, level } = req.query;
    
    const query = { type };
    if (level) query.level = level;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    query.createdAt = { $gte: startDate };

    const logs = await Log.find(query)
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取爬虫配置
router.get('/config', (req, res) => {
  res.json({
    retryTimes: 3,
    pageLoadTimeout: 30000,
    schedule: {
      dailyCrawl: '00:00',
      hourlyCrawl: '每小时',
      pushTime: '09:00'
    }
  });
});

// 更新爬虫配置
router.post('/config', (req, res) => {
  // TODO: 实现配置更新
  res.json({ success: true });
});

module.exports = router;
