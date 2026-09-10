const mongoose = require('mongoose');

const consultationTelemetrySchema = new mongoose.Schema(
  {
    appointmentId: {
      type: String,
      required: true
    },
    consultationId: {
      type: String
    },
    sessionId: {
      type: String,
      required: true,
      unique: true
    },
    roomName: {
      type: String,
      default: ''
    },
    doctorName: {
      type: String
    },
    ownerName: {
      type: String
    },
    petName: {
      type: String
    },
    triageLevel: {
      type: String,
      enum: ['routine', 'urgent', 'emergency'],
      default: 'routine'
    },
    streamMetrics: {
      vetBitrateKbps: { type: Number, default: 1800 },
      ownerBitrateKbps: { type: Number, default: 1200 },
      latencyMs: { type: Number, default: 28 },
      packetLossPercentage: { type: Number, default: 0.02 },
      resolution: { type: String, default: '1080p @ 30fps' },
      encryption: { type: String, default: 'AES-256' }
    },
    durationSeconds: {
      type: Number,
      default: 0
    },
    webrtcState: {
      type: String,
      enum: ['connecting', 'connected', 'in-waiting', 'disconnected', 'failed', 'completed'],
      default: 'connected'
    },
    adminInterventionLogged: {
      type: Boolean,
      default: false
    },
    clinicalDiagnosisNotes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.ConsultationTelemetry || mongoose.model('ConsultationTelemetry', consultationTelemetrySchema);
