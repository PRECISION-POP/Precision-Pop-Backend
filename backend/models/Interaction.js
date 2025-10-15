const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
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
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'campaignType'
  },
  campaignType: {
    type: String,
    enum: ['Campaign', 'FlashPromo'],
    required: true
  },
  eventType: {
    type: String,
    enum: ['impression', 'accept', 'decline', 'redemption'],
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  sessionType: {
    type: String,
    enum: ['weeklyBrowse', 'dayOfCheckIn'],
    default: 'dayOfCheckIn'
  },
  checkInMethod: {
    type: String,
    enum: ['geofence', 'BLE', 'manual', 'NFC'],
    default: 'geofence'
  },
  storeLocation: {
    latitude: Number,
    longitude: Number
  },
  addedToShoppingList: {
    type: Boolean,
    default: false
  },
  redemptionDate: {
    type: Date
  },
  redemptionAmount: {
    type: Number,
    default: 0
  },
  deviceType: {
    type: String,
    enum: ['iOS', 'Android', 'Web'],
    default: 'iOS'
  },
  appVersion: {
    type: String,
    default: '1.0.0'
  }
}, {
  timestamps: true
});

// Compound indexes for analytics queries
interactionSchema.index({ campaignId: 1, eventType: 1, timestamp: -1 });
interactionSchema.index({ retailerId: 1, timestamp: -1 });
interactionSchema.index({ customerId: 1, campaignId: 1, eventType: 1 });

// Static method to update campaign metrics
interactionSchema.statics.updateCampaignMetrics = async function(campaignId, campaignType) {
  const interactions = await this.aggregate([
    { $match: { campaignId: mongoose.Types.ObjectId(campaignId) } },
    {
      $group: {
        _id: '$eventType',
        count: { $sum: 1 }
      }
    }
  ]);

  const metrics = {
    impressions: 0,
    accepts: 0,
    declines: 0,
    redemptions: 0
  };

  interactions.forEach(item => {
    metrics[item._id + 's'] = item.count;
  });

  // Update the campaign or flash promo
  const Model = mongoose.model(campaignType);
  await Model.findByIdAndUpdate(campaignId, {
    'metrics.impressions': metrics.impressions,
    'metrics.accepts': metrics.accepts,
    'metrics.declines': metrics.declines || 0,
    'metrics.redemptions': metrics.redemptions
  });
};

module.exports = mongoose.model('Interaction', interactionSchema);
