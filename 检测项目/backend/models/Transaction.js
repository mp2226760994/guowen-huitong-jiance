const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  time: {
    type: Date,
    required: true,
    index: true
  },
  collectionName: {
    type: String,
    required: true,
    index: true
  },
  direction: {
    type: String,
    enum: ['buy', 'sell'],
    required: true
  }
}, {
  timestamps: true
});

// 复合索引：按藏品名和时间排序
transactionSchema.index({ collectionName: 1, time: -1 });

// 静态方法：批量插入（去重）
transactionSchema.statics.bulkUpsert = async function(records) {
  const bulkOps = records.map(record => ({
    updateOne: {
      filter: { transactionId: record.transactionId },
      update: { $set: record },
      upsert: true
    }
  }));
  
  if (bulkOps.length > 0) {
    return await this.bulkWrite(bulkOps);
  }
  return { matchedCount: 0, upsertedCount: 0 };
};

// 静态方法：按日期范围查询
transactionSchema.statics.findByDateRange = async function(startDate, endDate) {
  return await this.find({
    time: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  }).sort({ time: -1 });
};

// 静态方法：按日期统计
transactionSchema.statics.aggregateByDate = async function(startDate, endDate) {
  return await this.aggregate([
    {
      $match: {
        time: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$time' }
        },
        totalAmount: { $sum: '$totalAmount' },
        totalCount: { $sum: 1 },
        avgPrice: { $avg: '$price' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

module.exports = mongoose.model('Transaction', transactionSchema);
