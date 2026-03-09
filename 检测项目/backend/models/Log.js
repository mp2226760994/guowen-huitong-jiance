const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['spider', 'login', 'query', 'payment', 'push', 'admin', 'system'],
    required: true,
    index: true
  },
  level: {
    type: String,
    enum: ['info', 'warn', 'error', 'debug'],
    default: 'info',
    index: true
  },
  message: {
    type: String,
    required: true
  },
  details: mongoose.Schema.Types.Mixed,
  userId: mongoose.Schema.Types.ObjectId,
  ip: String,
  userAgent: String
}, {
  timestamps: true
});

// 索引
logSchema.index({ type: 1, createdAt: -1 });
logSchema.index({ level: 1, createdAt: -1 });

// 静态方法：记录日志
logSchema.statics.log = async function(type, level, message, details = {}) {
  try {
    const log = new this({ type, level, message, details });
    await log.save();
    return log;
  } catch (error) {
    console.error('记录日志失败:', error);
  }
};

// 便捷方法
logSchema.statics.info = function(type, message, details) {
  return this.log(type, 'info', message, details);
};

logSchema.statics.warn = function(type, message, details) {
  return this.log(type, 'warn', message, details);
};

logSchema.statics.error = function(type, message, details) {
  return this.log(type, 'error', message, details);
};

logSchema.statics.debug = function(type, message, details) {
  return this.log(type, 'debug', message, details);
};

module.exports = mongoose.model('Log', logSchema);
