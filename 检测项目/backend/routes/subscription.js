const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const Log = require('../models/Log');

// 获取订阅套餐
router.get('/plans', (req, res) => {
  res.json(Subscription.PLANS);
});

// 创建订阅订单
router.post('/create', async (req, res) => {
  try {
    const { userId, plan } = req.body;
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: '用户不存在' });

    const order = await Subscription.createOrder(userId, plan);
    
    // TODO: 调用微信支付统一下单
    const payParams = {
      orderId: order._id,
      amount: order.amount,
      // ... 其他微信支付参数
    };

    await Log.log('payment', 'info', '创建订阅订单', { userId, plan, orderId: order._id });
    
    res.json({
      orderId: order._id,
      amount: order.amount,
      // payParams
    });
  } catch (error) {
    await Log.log('payment', 'error', '创建订单失败', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// 支付回调
router.post('/callback', async (req, res) => {
  try {
    const { orderId, paymentInfo } = req.body;
    
    const order = await Subscription.findById(orderId);
    if (!order) return res.status(404).json({ error: '订单不存在' });

    await order.markPaid(paymentInfo);
    await Log.log('payment', 'info', '支付成功', { orderId });

    res.json({ success: true });
  } catch (error) {
    await Log.log('payment', 'error', '支付回调处理失败', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// 获取用户订阅状态
router.get('/status/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: '用户不存在' });

    res.json({
      status: user.subscription.status,
      plan: user.subscription.plan,
      expireDate: user.subscription.expireDate,
      queryCount: user.subscription.queryCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
