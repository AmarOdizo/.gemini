const mongoose = require('mongoose');

const platformSettingSchema = new mongoose.Schema(
  {
    platformName: {
      type: String,
      default: 'PetCare Tele-Veterinary Network'
    },
    emergencyHotline: {
      type: String,
      default: '+1 (800) 555-PETCARE'
    },
    supportEmail: {
      type: String,
      default: 'admin@petcare.org'
    },
    autoTriageEnabled: {
      type: Boolean,
      default: true
    },
    clinicalRegions: {
      type: [String],
      default: [
        'Seattle Metro',
        'Northern California',
        'Austin & Central Texas',
        'Chicago Tri-State',
        'New York Metropolitan',
        'South Florida',
        'Denver Front Range'
      ]
    },
    maxConcurrentStreamsPerDoctor: {
      type: Number,
      default: 1
    },
    telehealthBitrateThresholdKbps: {
      type: Number,
      default: 1200
    },
    maintenanceMode: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.PlatformSetting || mongoose.model('PlatformSetting', platformSettingSchema);
