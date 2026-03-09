const SpiderService = require('./spiderService');
const logger = require('../utils/logger');
const Log = require('../models/Log');

class ScheduleService {
  constructor() {
    this.spiderService = null;
    this.timers = {};
  }

  // 每日全量爬取（0点）
  scheduleDailyCrawl() {
    const now = new Date();
    const targetTime = new Date(now);
    targetTime.setHours(0, 0, 0, 0);
    
    // 如果已经过了0点，设置到明天
    if (targetTime <= now) {
      targetTime.setDate(targetTime.getDate() + 1);
    }
    
    const delay = targetTime.getTime() - now.getTime();
    
    this.timers.dailyCrawl = setTimeout(async () => {
      logger('spider').info('开始执行每日全量爬取任务');
      await Log.log('spider', 'info', '开始每日全量爬取');
      
      const spider = new SpiderService();
      await spider.run(true); // fullCrawl = true
      
      // 递归设置下一次
      this.scheduleDailyCrawl();
    }, delay);
    
    logger('spider').info(`每日全量爬取已安排: ${targetTime.toLocaleString()}`);
  }

  // 每小时增量爬取
  scheduleHourlyCrawl() {
    const runHourly = async () => {
      logger('spider').info('开始执行每小时增量爬取');
      await Log.log('spider', 'info', '开始每小时增量爬取');
      
      const spider = new SpiderService();
      await spider.run(false); // fullCrawl = false
      
      // 继续下一小时
      this.timers.hourlyCrawl = setTimeout(runHourly, 60 * 60 * 1000);
    };
    
    // 立即执行一次
    setTimeout(runHourly, 5000);
    logger('spider').info('每小时增量爬取已启动');
  }

  // 每日数据推送（9点）
  scheduleDailyPush() {
    const sendPush = async () => {
      const now = new Date();
      const targetTime = new Date(now);
      targetTime.setHours(9, 0, 0, 0);
      
      if (targetTime <= now) {
        targetTime.setDate(targetTime.getDate() + 1);
      }
      
      const delay = targetTime.getTime() - now.getTime();
      
      this.timers.dailyPush = setTimeout(async () => {
        logger('schedule').info('开始执行每日数据推送');
        // TODO: 调用推送服务
        await Log.log('push', 'info', '每日数据推送执行');
        
        // 递归设置下一次
        sendPush();
      }, delay);
      
      logger('schedule').info(`每日推送已安排: ${targetTime.toLocaleString()}`);
    };
    
    sendPush();
  }

  // 启动所有定时任务
  start() {
    logger('schedule').info('启动定时任务服务');
    this.scheduleDailyCrawl();
    this.scheduleHourlyCrawl();
    this.scheduleDailyPush();
    logger('schedule').info('所有定时任务已启动');
  }

  // 停止所有定时任务
  stop() {
    Object.values(this.timers).forEach(timer => clearTimeout(timer));
    this.timers = {};
    logger('schedule').info('所有定时任务已停止');
  }

  // 手动触发爬取
  async manualCrawl(fullCrawl = false) {
    const spider = new SpiderService();
    return await spider.run(fullCrawl);
  }
}

module.exports = new ScheduleService();
