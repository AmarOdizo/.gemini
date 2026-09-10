require('dotenv').config();
const mongoose = require('mongoose');

// Import all models
const User = require('./models/User');
const Vet = require('./models/Vet');
const Pet = require('./models/Pet');
const Appointment = require('./models/Appointment');
const Consultation = require('./models/Consultation');
const Prescription = require('./models/Prescription');
const ClinicalAdvisory = require('./models/ClinicalAdvisory');
const ClinicalReport = require('./models/ClinicalReport');
const AdminNotification = require('./models/AdminNotification');
const PlatformSetting = require('./models/PlatformSetting');
const Review = require('./models/Review');
const ConsultationTelemetry = require('./models/ConsultationTelemetry');

async function initMongoDB() {
  const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/gemini_api";
  console.log("Connecting to MongoDB:", mongoURI.replace(/:([^:@]{4})[^:@]*@/, ':****@'));

  try {
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB successfully!\n");

    console.log("Creating collections and seeding admin data in MongoDB...");

    // 1. Platform Settings
    const existingSettings = await PlatformSetting.findOne();
    if (!existingSettings) {
      await PlatformSetting.create({
        platformName: 'PetCare Tele-Veterinary Network',
        emergencyHotline: '+1 (800) 555-PETCARE',
        supportEmail: 'admin@petcare.org',
        autoTriageEnabled: true,
        clinicalRegions: [
          'Seattle Metro',
          'Northern California',
          'Austin & Central Texas',
          'Chicago Tri-State',
          'New York Metropolitan',
          'South Florida',
          'Denver Front Range'
        ],
        maxConcurrentStreamsPerDoctor: 1,
        telehealthBitrateThresholdKbps: 1200,
        maintenanceMode: false
      });
      console.log(" Created 'platformsettings' collection & seeded default settings.");
    } else {
      console.log(" Collection 'platformsettings' already exists.");
    }

    // 2. Clinical Advisories
    const advisoryCount = await ClinicalAdvisory.countDocuments();
    if (advisoryCount === 0) {
      await ClinicalAdvisory.insertMany([
        {
          title: 'Canine Respiratory Disease Protocol Advisory',
          message: 'Elevated cases of atypical canine respiratory disease reported in Seattle and Northern California. Implement strict isolation triage during telehealth consultations.',
          urgency: 'high',
          targetAudience: 'all',
          regions: ['Seattle Metro', 'Northern California'],
          active: true,
          broadcastedBy: 'Dr. Sarah Jenkins'
        },
        {
          title: 'Emergency Triage Escalation Standard 2024',
          message: 'All patients presenting with acute breathing distress or trauma must be fast-tracked to priority 1 and referred to physical ER within 15 minutes of tele-intake.',
          urgency: 'emergency',
          targetAudience: 'veterinarians',
          regions: ['All Active Regions'],
          active: true,
          broadcastedBy: 'Chief Clinical Admin'
        }
      ]);
      console.log(" Created 'clinicaladvisories' collection & seeded initial advisories.");
    } else {
      console.log(" Collection 'clinicaladvisories' already exists.");
    }

    // 3. Clinical Reports
    const reportCount = await ClinicalReport.countDocuments();
    if (reportCount === 0) {
      await ClinicalReport.insertMany([
        {
          title: 'Monthly Telehealth Practice Compliance Audit (Q4 2023)',
          reportType: 'compliance',
          department: 'all',
          period: 'October 2023',
          fileSize: '2.4 MB',
          fileFormat: 'PDF',
          summaryData: { totalSessions: 3892, complianceScore: 100, criticalFlags: 0 },
          generatedBy: 'Dr. Sarah Jenkins'
        },
        {
          title: 'State Veterinary Board Credentialing Summary',
          reportType: 'telehealth_volume',
          department: 'all',
          period: 'Annual 2023',
          fileSize: '890 KB',
          fileFormat: 'CSV',
          summaryData: { totalSessions: 14820, complianceScore: 98, criticalFlags: 1 },
          generatedBy: 'Dr. Sarah Jenkins'
        }
      ]);
      console.log(" Created 'clinicalreports' collection & seeded initial compliance reports.");
    } else {
      console.log(" Collection 'clinicalreports' already exists.");
    }

    // 4. Admin Notifications
    const notifCount = await AdminNotification.countDocuments();
    if (notifCount === 0) {
      await AdminNotification.insertMany([
        {
          title: 'Urgent Triage Request',
          description: 'Canine respiratory distress reported in Seattle region. Fast-track tele-vet assigned.',
          type: 'error',
          urgency: 'emergency',
          isRead: false,
          relatedModel: 'Appointment'
        },
        {
          title: 'Veterinarian Credential Submission',
          description: 'Dr. Jonathan Blake submitted updated California state veterinary license.',
          type: 'info',
          urgency: 'routine',
          isRead: false,
          relatedModel: 'Vet'
        },
        {
          title: 'System Security Audit Clean',
          description: 'Automated end-to-end encryption audit completed with 0 vulnerability flags.',
          type: 'success',
          urgency: 'routine',
          isRead: true,
          relatedModel: 'System'
        }
      ]);
      console.log(" Created 'adminnotifications' collection & seeded initial notifications.");
    } else {
      console.log(" Collection 'adminnotifications' already exists.");
    }

    // 5. Reviews
    const reviewCount = await Review.countDocuments();
    if (reviewCount === 0) {
      await Review.insertMany([
        {
          vetId: 'VET-003',
          vetName: 'Dr. Marcus Sterling',
          ownerName: 'Eleanor Vance',
          petName: 'Barnaby',
          rating: 5,
          comment: 'Dr. Sterling was compassionate and patient throughout the call. My dog is feeling so much better!',
          verified: true,
          status: 'published'
        },
        {
          vetId: 'VET-005',
          vetName: 'Dr. Neil Roberts',
          ownerName: 'Sophia Chen',
          petName: 'Rory',
          rating: 5,
          comment: 'Quick response during an emergency scare. Thank you for walking me through what to do step by step!',
          verified: true,
          status: 'published'
        }
      ]);
      console.log(" Created 'reviews' collection & seeded initial ratings.");
    } else {
      console.log(" Collection 'reviews' already exists.");
    }

    // 6. Consultation Telemetry
    const telemetryCount = await ConsultationTelemetry.countDocuments();
    if (telemetryCount === 0) {
      await ConsultationTelemetry.create({
        appointmentId: 'APT-1092',
        consultationId: 'CNS-1092',
        sessionId: 'sess_' + Date.now(),
        roomName: 'room-vet-8942',
        doctorName: 'Dr. Marcus Sterling',
        ownerName: 'Eleanor Vance',
        petName: 'Barnaby',
        triageLevel: 'urgent',
        streamMetrics: {
          vetBitrateKbps: 1800,
          ownerBitrateKbps: 1200,
          latencyMs: 28,
          packetLossPercentage: 0.02,
          resolution: '1080p @ 30fps',
          encryption: 'AES-256'
        },
        durationSeconds: 872,
        webrtcState: 'connected',
        clinicalDiagnosisNotes: 'Patient recovering well post-operation. Continuing prescribed hydration regimen.'
      });
      console.log(" Created 'consultationtelemetries' collection & seeded telemetry.");
    } else {
      console.log(" Collection 'consultationtelemetries' already exists.");
    }

    // List all collections in the MongoDB database
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("\n=======================================================");
    console.log(" ALL COLLECTIONS CURRENTLY IN MONGODB DATABASE:");
    console.log("=======================================================");
    collections.forEach((c) => console.log(` * ${c.name}`));
    console.log("=======================================================\n");

    console.log("All data storage tables successfully initialized in MongoDB!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error initializing MongoDB collections:", err);
    process.exit(1);
  }
}

initMongoDB();
