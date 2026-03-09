const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  openid: {
    type: String,
    unique: true,
    sparse: true
  },
  phone: {
    type: String,
    sparse: true
  },
  email: {
    type: String,
    sparse: true
  },
  nickname: String,
  avatar: String,
  subscription: {
    status: {
      type: String,
      enum: ['free', 'active', 'expired'],
      default: 'free'
    },
    plan: {
      type: String,
      enum: ['monthly', 'quarterly', 'yearly', null],
      default: null
    },
    expireDate: Date,
    queryCount: {
      type: Number,
      default: 3
    },
    totalQueryCount: {
      type: Number,
      default: 0
    }
  },
  pushSettings: {
    sms: { type: Boolean, default: true },
    email: { type: Boolean, default: true }
  },
  lastLoginAt: Date
}, {
  timestamps: true
});

// 验证免费查询次数
userSchema.methods.canQuery = function() {
  if (this.subscription.status === 'active') return true;
  return this.subscription.queryCount > 0;
};

// 消耗查询次数
userSchema.methods.consumeQuery = async function() {
  if (this.subscription.status === 'active') return true;
  
  if (this.subscription.queryCount > 0) {
    this.subscription.queryCount -= 1;
    this.subscription.totalQueryCount += 1;
    await this.save();
    return true;
  }
  return false;
};

// 验证订阅状态
userSchema.methods.validateSubscription = function() {
  if (this.subscription.status === 'free') return true;
  if (!this.subscription.expireDate) return true;
  return new Date(this.subscription.expireDate) > new Date();
};

module.exports = mongoose.model('User', userSchema);
