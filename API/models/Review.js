const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    vetId: {
      type: String,
      required: true
    },
    vetName: {
      type: String,
      required: true
    },
    ownerId: {
      type: String
    },
    ownerName: {
      type: String,
      required: true
    },
    petName: {
      type: String,
      default: 'Pet'
    },
    appointmentId: {
      type: String
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
      default: 5
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required']
    },
    verified: {
      type: Boolean,
      default: true
    },
    status: {
      type: String,
      enum: ['published', 'flagged', 'hidden'],
      default: 'published'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.Review || mongoose.model('Review', reviewSchema);
