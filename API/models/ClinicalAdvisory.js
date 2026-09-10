const mongoose = require('mongoose');

const clinicalAdvisorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Advisory title is required'],
      trim: true
    },
    message: {
      type: String,
      required: [true, 'Advisory message content is required']
    },
    urgency: {
      type: String,
      enum: ['routine', 'medium', 'high', 'emergency'],
      default: 'high'
    },
    targetAudience: {
      type: String,
      enum: ['all', 'veterinarians', 'pet_owners'],
      default: 'all'
    },
    regions: {
      type: [String],
      default: ['All Active Regions']
    },
    active: {
      type: Boolean,
      default: true
    },
    broadcastedBy: {
      type: String,
      default: 'Chief Clinical Admin'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.ClinicalAdvisory || mongoose.model('ClinicalAdvisory', clinicalAdvisorySchema);
