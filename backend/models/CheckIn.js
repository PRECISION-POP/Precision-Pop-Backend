const mongoose = require('mongoose');

const checkInSchema = new mongoose.Schema({
  customerId: {
    type: String,
    required: true,
    index: true
  },
  retailerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Retailer',
    required: true,
    index: true
  },
  checkInTime: {
    type: Date,
    default: Date.now,
    required: true
  },
  checkInMethod: {
    type: String,
    enum: ['geofence', 'BLE', 'manual', 'NFC'],
    default: 'geofence'
  },
  campaignsShown: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign'
  }],
  billableImpressions: {
    type: Map,
    of: {
      shown: Boolean,
      charged: Boolean,
      amount: Number
    }
  },
  sessionDuration: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for querying by date and retailer
checkInSchema.index({ retailerId: 1, checkInTime: -1 });
checkInSchema.index({ customerId: 1, checkInTime: -1 });

module.exports = mongoose.model('CheckIn', checkInSchema);
