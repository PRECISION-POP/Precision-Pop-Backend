const mongoose = require('mongoose');

const flashPromoSchema = new mongoose.Schema({
  retailerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Retailer',
    required: true,
    index: true
  },
  createdBy: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'retailerFlash'
  },
  sku: {
    type: String,
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'general'
  },
  stockRemaining: {
    type: Number,
    default: 0
  },
  stockInitial: {
    type: Number,
    default: 0
  },
  autoDisableAtZero: {
    type: Boolean,
    default: true
  },
  discountType: {
    type: String,
    enum: ['fixed', 'percentage'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true
  },
  regularPrice: {
    type: Number,
    default: 0
  },
  discountedPrice: {
    type: Number,
    default: 0
  },
  showToAll: {
    type: Boolean,
    default: false
  },
  targetSegments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Segment'
  }],
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date,
    required: true
  },
  priority: {
    type: String,
    enum: ['high', 'normal'],
    default: 'normal'
  },
  metrics: {
    impressions: { type: Number, default: 0 },
    accepts: { type: Number, default: 0 },
    redemptions: { type: Number, default: 0 },
    stockMoved: { type: Number, default: 0 },
    stockMovedPercentage: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'autoDisabled'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Auto-disable when stock reaches zero
flashPromoSchema.pre('save', function(next) {
  if (this.autoDisableAtZero && this.stockRemaining <= 0) {
    this.status = 'autoDisabled';
  }
  
  // Calculate stock moved percentage
  if (this.stockInitial > 0) {
    this.metrics.stockMoved = this.stockInitial - this.stockRemaining;
    this.metrics.stockMovedPercentage = Math.round((this.metrics.stockMoved / this.stockInitial) * 100);
  }
  
  next();
});

// Index for active promos by retailer
flashPromoSchema.index({ retailerId: 1, status: 1, startTime: -1 });
flashPromoSchema.index({ retailerId: 1, endTime: 1 });

module.exports = mongoose.model('FlashPromo', flashPromoSchema);
