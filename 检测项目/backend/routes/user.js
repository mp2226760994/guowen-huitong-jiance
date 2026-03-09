const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Log = require('../models/Log');

// 获取用户信息
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-__v');
    if (!user) return res.status(404).json({ error: '用户不存在' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新用户信息
router.put('/:id', async (req, res) => {
  try {
    const { nickname, avatar, pushSettings } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { nickname, avatar, pushSettings },
      { new: true }
    );
    
    await Log.log('user', 'info', '更新用户信息', { userId: req.params.id });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取用户列表（管理后台）
router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 20, status } = req.query;
    
    const query = {};
    if (status) query['subscription.status'] = status;
    
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-__v')
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize))
      .sort({ createdAt: -1 });
    
    res.json({
      data: users,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 重置用户查询次数
router.post('/:id/reset-query', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { 'subscription.queryCount': 3 },
      { new: true }
    );
    
    await Log.log('admin', 'info', '重置用户查询次数', { userId: req.params.id });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
