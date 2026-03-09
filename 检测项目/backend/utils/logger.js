const fs = require('fs');
const path = require('path');
const config = require('../config');

class Logger {
  constructor(type = 'server') {
    this.type = type;
    this.logDir = path.join(__dirname, '../../log', type);
    this.ensureDir();
  }

  ensureDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  getLogFile() {
    const date = new Date().toISOString().split('T')[0];
    return path.join(this.logDir, `${date}.log`);
  }

  format(level, message, details = {}) {
    const timestamp = new Date().toISOString();
    const log = {
      timestamp,
      level: level.toUpperCase(),
      type: this.type,
      message,
      ...details
    };
    return JSON.stringify(log);
  }

  write(content) {
    const file = this.getLogFile();
    fs.appendFileSync(file, content + '\n');
  }

  info(message, details = {}) {
    const log = this.format('info', message, details);
    this.write(log);
    console.log(log);
  }

  warn(message, details = {}) {
    const log = this.format('warn', message, details);
    this.write(log);
    console.warn(log);
  }

  error(message, details = {}) {
    const log = this.format('error', message, details);
    this.write(log);
    console.error(log);
  }

  debug(message, details = {}) {
    if (process.env.NODE_ENV !== 'production') {
      const log = this.format('debug', message, details);
      this.write(log);
      console.log(log);
    }
  }

  // 获取最近N天的日志
  getRecentLogs(days = 7) {
    const logs = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const logFile = path.join(this.logDir, `${dateStr}.log`);
      if (fs.existsSync(logFile)) {
        const content = fs.readFileSync(logFile, 'utf-8');
        const lines = content.split('\n').filter(l => l);
        lines.forEach(line => {
          try {
            logs.push(JSON.parse(line));
          } catch (e) {}
        });
      }
    }
    return logs;
  }
}

module.exports = (type) => new Logger(type);
