const fs = require('fs');
const path = require('path');

class CookieStore {
  constructor(cookiePath = null) {
    this.cookiePath = cookiePath || path.join(__dirname, '../../cookie.json');
    this.ensureDir();
  }

  ensureDir() {
    const dir = path.dirname(this.cookiePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  save(cookies) {
    try {
      fs.writeFileSync(this.cookiePath, JSON.stringify(cookies, null, 2));
      return true;
    } catch (error) {
      console.error('保存Cookie失败:', error);
      return false;
    }
  }

  load() {
    try {
      if (fs.existsSync(this.cookiePath)) {
        const data = fs.readFileSync(this.cookiePath, 'utf-8');
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error('加载Cookie失败:', error);
      return null;
    }
  }

  isValid() {
    const cookies = this.load();
    if (!cookies || !Array.isArray(cookies)) return false;
    
    // 检查cookie是否过期
    const now = Date.now();
    for (const cookie of cookies) {
      if (cookie.expires && cookie.expires * 1000 < now) {
        return false;
      }
    }
    return cookies.length > 0;
  }

  clear() {
    try {
      if (fs.existsSync(this.cookiePath)) {
        fs.unlinkSync(this.cookiePath);
      }
      return true;
    } catch (error) {
      console.error('清除Cookie失败:', error);
      return false;
    }
  }
}

module.exports = CookieStore;
