const puppeteer = require('puppeteer');
const path = require('path');
const config = require('../config');
const logger = require('../utils/logger');
const CookieStore = require('../utils/cookieStore');
const Transaction = require('../models/Transaction');
const Log = require('../models/Log');

class SpiderService {
  constructor() {
    this.browser = null;
    this.page = null;
    this.cookieStore = new CookieStore();
    this.logger = logger('spider');
  }

  // 随机延迟
  randomDelay() {
    const delay = Math.random() * (config.spider.maxDelay - config.spider.minDelay) + config.spider.minDelay;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  // 启动浏览器
  async launchBrowser() {
    try {
      this.logger.info('启动Chrome浏览器');
      
      this.browser = await puppeteer.launch({
        headless: config.spider.headless,
        args: config.spider.args,
        defaultViewport: { width: 1920, height: 1080 },
        userDataDir: path.join(__dirname, '../../chrome-data')
      });

      this.page = await this.browser.newPage();
      
      // 注入反检测脚本
      await this.page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        window.navigator.chrome = { runtime: {} };
        Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
        Object.defineProperty(navigator, 'languages', { get: () => ['zh-CN', 'zh', 'en'] });
      });

      // 设置User-Agent
      await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

      this.logger.info('浏览器启动成功');
      return true;
    } catch (error) {
      this.logger.error('浏览器启动失败', { error: error.message });
      return false;
    }
  }

  // 等待元素出现
  async waitForSelector(selector, timeout = config.spider.elementWaitTimeout) {
    try {
      await this.page.waitForSelector(selector, { timeout, visible: true });
      return true;
    } catch (error) {
      this.logger.error('等待元素失败', { selector, error: error.message });
      return false;
    }
  }

  // 模拟真人输入
  async humanType(selector, text) {
    await this.waitForSelector(selector);
    await this.page.click(selector);
    await this.randomDelay();
    
    // 逐字符输入
    for (const char of text) {
      await this.page.keyboard.type(char);
      await this.randomDelay();
    }
  }

  // 模拟点击
  async humanClick(selector) {
    await this.waitForSelector(selector);
    await this.randomDelay();
    
    // 使用 CDP 模拟鼠标移动和点击
    const element = await this.page.$(selector);
    const box = await element.boundingBox();
    
    // 随机偏移，模拟人操作
    const x = box.x + box.width / 2 + (Math.random() - 0.5) * 10;
    const y = box.y + box.height / 2 + (Math.random() - 0.5) * 10;
    
    await this.page.mouse.move(x, y);
    await this.randomDelay();
    await this.page.mouse.click(x, y);
  }

  // 检查登录状态
  async checkLogin() {
    try {
      await this.page.goto(config.spider.transactionUrl, { 
        waitUntil: 'networkidle2',
        timeout: config.spider.pageLoadTimeout 
      });

      // 检查是否跳转到登录页
      const currentUrl = this.page.url();
      if (currentUrl.includes('login')) {
        return false;
      }

      // 检查用户头像等登录标识
      const userInfo = await this.page.$('.user-info, .avatar, [class*="user"]');
      return !!userInfo;
    } catch (error) {
      this.logger.error('检查登录状态失败', { error: error.message });
      return false;
    }
  }

  // 执行登录
  async login() {
    try {
      this.logger.info('开始登录');
      
      // 加载保存的Cookie
      const cookies = this.cookieStore.load();
      if (cookies) {
        await this.page.setCookie(...cookies);
        this.logger.info('已加载保存的Cookie');
        
        // 检查Cookie是否有效
        const isLoggedIn = await this.checkLogin();
        if (isLoggedIn) {
          this.logger.info('Cookie有效，登录成功');
          return true;
        }
        this.logger.info('Cookie失效，需要重新登录');
      }

      // 访问登录页
      await this.page.goto(config.spider.loginUrl, {
        waitUntil: 'networkidle2',
        timeout: config.spider.pageLoadTimeout
      });
      
      await this.randomDelay();

      // 输入账号
      const usernameSelector = '#username, input[name="username"], input[type="text"]';
      await this.humanType(usernameSelector, config.spider.username);
      
      // 输入密码
      const passwordSelector = '#password, input[name="password"], input[type="password"]';
      await this.humanType(passwordSelector, config.spider.password);
      
      // 点击登录按钮
      const loginBtnSelector = '#loginBtn, button[type="submit"], .login-btn, [class*="login"]';
      await this.humanClick(loginBtnSelector);
      
      // 等待登录结果
      await this.randomDelay();
      await this.page.waitForNavigation({ timeout: 30000 }).catch(() => {});
      
      // 保存登录Cookie
      const newCookies = await this.page.cookies();
      this.cookieStore.save(newCookies);
      
      // 验证登录
      const isLoggedIn = await this.checkLogin();
      if (isLoggedIn) {
        this.logger.info('登录成功');
        await Log.log('spider', 'info', '自动登录成功');
        return true;
      } else {
        this.logger.error('登录失败');
        await Log.log('spider', 'error', '自动登录失败');
        return false;
      }
    } catch (error) {
      this.logger.error('登录过程异常', { error: error.message });
      await Log.log('spider', 'error', '登录异常', { error: error.message });
      return false;
    }
  }

  // 爬取成交数据
  async crawlTransactions(maxPages = 10) {
    try {
      this.logger.info('开始爬取成交数据');
      let totalNew = 0;
      let pageNum = 1;

      while (pageNum <= maxPages) {
        this.logger.info(`正在爬取第 ${pageNum} 页`);
        
        // 等待数据加载
        await this.page.waitForSelector('table, .list, [class*="deal"]', { timeout: 10000 }).catch(() => {});
        await this.randomDelay();

        // 提取页面数据
        const transactions = await this.page.evaluate(() => {
          const data = [];
          
          // 根据实际页面结构调整选择器
          const rows = document.querySelectorAll('table tbody tr, .deal-list .item, [class*="record"]');
          
          rows.forEach(row => {
            try {
              const cells = row.querySelectorAll('td, .cell');
              if (cells.length >= 5) {
                data.push({
                  transactionId: cells[0]?.innerText?.trim() || '',
                  price: parseFloat(cells[1]?.innerText?.replace(/[^\d.]/g, '')) || 0,
                  quantity: parseFloat(cells[2]?.innerText?.replace(/[^\d.]/g, '')) || 0,
                  time: cells[3]?.innerText?.trim() || '',
                  collectionName: cells[4]?.innerText?.trim() || '',
                  direction: cells[5]?.innerText?.trim()?.toLowerCase().includes('买') ? 'buy' : 'sell'
                });
              }
            } catch (e) {}
          });
          
          return data;
        });

        if (transactions.length === 0) {
          this.logger.info('没有更多数据');
          break;
        }

        // 数据处理
        const validData = transactions
          .filter(t => t.transactionId && t.price > 0)
          .map(t => ({
            ...t,
            totalAmount: t.price * t.quantity,
            time: new Date(t.time)
          }));

        // 批量入库（去重）
        const result = await Transaction.bulkUpsert(validData);
        totalNew += result.upsertedCount;
        
        this.logger.info(`第 ${pageNum} 页: 新增 ${result.upsertedCount} 条`);

        // 翻页
        const nextBtn = await this.page.$('.next, .pagination .next, [class*="next"]');
        if (nextBtn) {
          const isDisabled = await nextBtn.$eval('.disabled, [class*="disabled"]', () => true).catch(() => false);
          if (isDisabled) break;
          
          await this.humanClick('.next, .pagination .next, [class*="next"]');
          await this.page.waitForNetworkIdle({ timeout: 15000 }).catch(() => {});
          pageNum++;
        } else {
          break;
        }
      }

      this.logger.info(`爬取完成，共新增 ${totalNew} 条数据`);
      await Log.log('spider', 'info', `爬取完成，新增 ${totalNew} 条数据`, { totalNew, pages: pageNum });
      
      return { success: true, newCount: totalNew, pages: pageNum };
    } catch (error) {
      this.logger.error('爬取失败', { error: error.message });
      await Log.log('spider', 'error', '爬取失败', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  // 完整爬取流程
  async run(fullCrawl = false) {
    let success = false;
    let retryCount = 0;

    while (retryCount < config.spider.retryTimes && !success) {
      try {
        // 启动浏览器
        if (!this.browser) {
          const launched = await this.launchBrowser();
          if (!launched) {
            retryCount++;
            continue;
          }
        }

        // 登录
        const loginSuccess = await this.login();
        if (!loginSuccess) {
          this.cookieStore.clear();
          retryCount++;
          continue;
        }

        // 爬取数据
        const crawlResult = await this.crawlTransactions(fullCrawl ? 100 : 10);
        success = crawlResult.success;
        
        if (!success) {
          retryCount++;
        }
      } catch (error) {
        this.logger.error('爬取流程异常', { error: error.message });
        retryCount++;
      }
    }

    // 关闭浏览器
    await this.close();

    if (!success) {
      await Log.log('spider', 'error', `爬取失败，已重试 ${retryCount} 次`);
      this.logger.error(`爬取失败，已重试 ${retryCount} 次`);
    }

    return success;
  }

  // 关闭浏览器
  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
      this.logger.info('浏览器已关闭');
    }
  }
}

module.exports = SpiderService;
