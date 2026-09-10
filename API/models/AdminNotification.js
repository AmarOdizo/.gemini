const mongoose = require('mongoose');

const adminNotificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['error', 'warning', 'info', 'success'],
      default: 'info'
    },
    urgency: {
      type: String,
      enum: ['emergency', 'urgent', 'routine'],
      default: 'routine'
    },
    link: {
      type: String,
      default: ''
    },
    isRead: {
      type: Boolean,
      default: false
    },
    relatedId: {
      type: String,
      default: ''
    },
    relatedModel: {
      type: String,
      enum: ['Appointment', 'Vet', 'User', 'Prescription', 'Advisory', 'System'],
      default: 'System'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.AdminNotification || mongoose.model('AdminNotification', adminNotificationSchema);
