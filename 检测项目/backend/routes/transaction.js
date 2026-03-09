const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Log = require('../models/Log');

// 获取当日数据
router.get('/daily', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const data = await Transaction.find({
      time: { $gte: today, $lt: tomorrow }
    }).sort({ time: -1 });

    const stats = {
      totalCount: data.length,
      totalAmount: data.reduce((sum, t) => sum + t.totalAmount, 0),
      avgPrice: data.length > 0 ? data.reduce((sum, t) => sum + t.price, 0) / data.length : 0
    };

    res.json({ data, stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 按时间范围查询
router.get('/range', async (req, res) => {
  try {
    const { startDate, endDate, page = 1, pageSize = 50 } = req.query;
    const userId = req.headers['x-user-id'];

    if (!startDate || !endDate) {
      return res.status(400).json({ error: '缺少时间参数' });
    }

    // 检查用户权限
    const user = userId ? await User.findById(userId) : null;
    if (user) {
      const canQuery = user.canQuery();
      if (!canQuery) {
        return res.status(403).json({ error: '查询次数已用完，请订阅' });
      }
      await user.consumeQuery();
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const skip = (page - 1) * pageSize;
    const data = await Transaction.findByDateRange(start, end)
      .skip(skip)
      .limit(parseInt(pageSize));

    const total = await Transaction.countDocuments({
      time: { $gte: start, $lte: end }
    });

    // 计算统计数据
    const allData = await Transaction.findByDateRange(start, end);
    const stats = {
      totalCount: allData.length,
      totalAmount: allData.reduce((sum, t) => sum + t.totalAmount, 0),
      avgPrice: allData.length > 0 ? allData.reduce((sum, t) => sum + t.price, 0) / allData.length : 0
    };

    if (userId) {
      await Log.log('query', 'info', '查询成交数据', { userId, startDate, endDate, count: data.length });
    }

    res.json({
      data,
      stats,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    await Log.log('query', 'error', '查询失败', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// 统计汇总
router.get('/stats', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const dailyStats = await Transaction.aggregateByDate(startDate, endDate);

    // 计算总体统计
    const totalStats = dailyStats.reduce((acc, day) => ({
      totalAmount: acc.totalAmount + day.totalAmount,
      totalCount: acc.totalCount + day.totalCount
    }), { totalAmount: 0, totalCount: 0 });

    // 计算增长率
    let growthRate = 0;
    if (dailyStats.length >= 2) {
      const recent = dailyStats[dailyStats.length - 1].totalAmount;
      const previous = dailyStats[dailyStats.length - 2].totalAmount;
      growthRate = previous > 0 ? ((recent - previous) / previous * 100).toFixed(2) : 0;
    }

    res.json({
      dailyStats,
      totalStats,
      growthRate: parseFloat(growthRate)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 小时级统计数据
router.get('/hourly', async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const hourlyStats = await Transaction.aggregate([
      {
        $match: {
          time: { $gte: targetDate, $lt: nextDate }
        }
      },
      {
        $group: {
          _id: { $hour: '$time' },
          count: { $sum: 1 },
          amount: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 补齐24小时
    const result = [];
    for (let i = 0; i < 24; i++) {
      const hourData = hourlyStats.find(h => h._id === i);
      result.push({
        hour: i,
        count: hourData ? hourData.count : 0,
        amount: hourData ? hourData.amount : 0
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
