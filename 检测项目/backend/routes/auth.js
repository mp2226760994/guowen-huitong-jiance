const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Log = require('../models/Log');

// 微信登录
router.post('/wechat', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: '缺少code参数' });

    // TODO: 调用微信API获取openid
    // const openid = await getWechatOpenid(code);
    const openid = `test_${code}`; // 测试用

    let user = await User.findOne({ openid });
    if (!user) {
      user = new User({ openid });
      await user.save();
      await Log.log('login', 'info', '新用户微信登录', { openid });
    } else {
      user.lastLoginAt = new Date();
      await user.save();
    }

    // 生成token（简化版，实际应用使用JWT）
    const token = Buffer.from(user._id.toString()).toString('base64');

    res.json({
      token,
      user: {
        id: user._id,
        nickname: user.nickname,
        avatar: user.avatar,
        subscription: user.subscription
      }
    });
  } catch (error) {
    await Log.log('login', 'error', '微信登录失败', { error: error.message });
    res.status(500).json({ error: '登录失败' });
  }
});

// 绑定手机号
router.post('/bind-phone', async (req, res) => {
  try {
    const { userId, phone, code } = req.body;
    // TODO: 验证手机验证码
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: '用户不存在' });

    user.phone = phone;
    await user.save();

    await Log.log('user', 'info', '绑定手机号', { userId, phone });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: '绑定失败' });
  }
});

// 绑定邮箱
router.post('/bind-email', async (req, res) => {
  try {
    const { userId, email, code } = req.body;
    // TODO: 验证邮箱验证码
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: '用户不存在' });

    user.email = email;
    await user.save();

    await Log.log('user', 'info', '绑定邮箱', { userId, email });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: '绑定失败' });
  }
});

module.exports = router;
