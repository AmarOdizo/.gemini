const mongoose = require('mongoose');

const clinicalReportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Report title is required'],
      trim: true
    },
    reportType: {
      type: String,
      enum: ['compliance', 'telehealth_volume', 'pharmacy_audit', 'financial', 'triage_outcomes'],
      default: 'compliance'
    },
    department: {
      type: String,
      enum: ['all', 'emergency', 'surgery', 'internal_medicine', 'dermatology', 'orthopedics'],
      default: 'all'
    },
    period: {
      type: String,
      default: 'Monthly'
    },
    fileUrl: {
      type: String,
      default: ''
    },
    fileSize: {
      type: String,
      default: '1.2 MB'
    },
    fileFormat: {
      type: String,
      enum: ['PDF', 'CSV', 'XLSX'],
      default: 'PDF'
    },
    summaryData: {
      totalSessions: { type: Number, default: 0 },
      complianceScore: { type: Number, default: 100 },
      criticalFlags: { type: Number, default: 0 }
    },
    generatedBy: {
      type: String,
      default: 'Dr. Sarah Jenkins'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.ClinicalReport || mongoose.model('ClinicalReport', clinicalReportSchema);
