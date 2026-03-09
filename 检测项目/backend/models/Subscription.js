const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  plan: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  wechatPayOrderId: String,
  transactionId: String,
  paidAt: Date,
  expireAt: Date
}, {
  timestamps: true
});

// 订阅套餐价格（分）
subscriptionSchema.statics.PLANS = {
  monthly: { price: 2999, days: 30, name: '月度订阅' },
  quarterly: { price: 7999, days: 90, name: '季度订阅' },
  yearly: { price: 29999, days: 365, name: '年度订阅' }
};

// 生成预支付订单
subscriptionSchema.statics.createOrder = async function(userId, plan) {
  const planInfo = this.PLANS[plan];
  if (!planInfo) throw new Error('无效的订阅套餐');
  
  const order = new this({
    userId,
    plan,
    amount: planInfo.price,
    expireAt: new Date(Date.now() + planInfo.days * 24 * 60 * 60 * 1000)
  });
  
  await order.save();
  return order;
};

// 处理支付成功
subscriptionSchema.methods.markPaid = async function(paymentInfo) {
  this.paymentStatus = 'paid';
  this.wechatPayOrderId = paymentInfo.transaction_id;
  this.transactionId = paymentInfo.out_trade_no;
  this.paidAt = new Date();
  await this.save();
  
  // 更新用户订阅状态
  const User = mongoose.model('User');
  await User.findByIdAndUpdate(this.userId, {
    'subscription.status': 'active',
    'subscription.plan': this.plan,
    'subscription.expireDate': this.expireAt,
    'subscription.queryCount': 999 // 订阅用户无限次查询
  });
};

module.exports = mongoose.model('Subscription', subscriptionSchema);
