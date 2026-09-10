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

async function seedAllAdminData() {
  const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/gemini_api";
  console.log("Connecting to MongoDB Atlas...");

  try {
    await mongoose.connect(mongoURI);
    console.log(" Connected to MongoDB successfully!\n");
    console.log("==================================================================");
    console.log(" SEEDING ALL DEMO DATA USED IN ADMIN PANEL INTO MONGODB TABLES");
    console.log("==================================================================\n");

    // =================================================================
    // 1. PET OWNERS (USERS)
    // =================================================================
    console.log("1. Seeding Pet Owners (users collection)...");
    const demoOwners = [
      {
        name: 'Eleanor Vance',
        email: 'eleanor.vance@example.com',
        password: '$2b$10$demoHashEncryptedPasswordForEleanor123',
        role: 'owner',
        phone: '+1 (555) 432-8901'
      },
      {
        name: 'Liam Henderson',
        email: 'liam.h@example.com',
        password: '$2b$10$demoHashEncryptedPasswordForLiam123',
        role: 'owner',
        phone: '+1 (555) 543-9012'
      },
      {
        name: 'Sophia Chen',
        email: 'sophia.c@example.com',
        password: '$2b$10$demoHashEncryptedPasswordForSophia123',
        role: 'owner',
        phone: '+1 (555) 654-0123'
      },
      {
        name: 'David Miller',
        email: 'david.m@example.com',
        password: '$2b$10$demoHashEncryptedPasswordForDavid123',
        role: 'owner',
        phone: '+1 (555) 765-1234'
      },
      {
        name: 'Maya Lin',
        email: 'maya.lin@example.com',
        password: '$2b$10$demoHashEncryptedPasswordForMaya123',
        role: 'owner',
        phone: '+1 (555) 876-2345'
      },
      {
        name: 'James Wilson',
        email: 'j.wilson@example.com',
        password: '$2b$10$demoHashEncryptedPasswordForJames123',
        role: 'owner',
        phone: '+1 (555) 987-3456'
      },
      {
        name: 'Chief Medical Administrator',
        email: 'admin@petcare.org',
        password: '$2b$10$demoHashEncryptedPasswordForAdmin123',
        role: 'admin',
        phone: '+1 (800) 555-PETCARE'
      }
    ];

    const ownerDocs = {};
    for (const ownerData of demoOwners) {
      let u = await User.findOne({ email: ownerData.email });
      if (!u) {
        u = await User.create(ownerData);
      } else {
        u.name = ownerData.name;
        u.phone = ownerData.phone;
        u.role = ownerData.role;
        await u.save();
      }
      ownerDocs[ownerData.email] = u;
    }
    console.log(` -> Synced ${demoOwners.length} users (Pet Owners & Admin)`);

    // =================================================================
    // 2. VETERINARIANS (vets collection)
    // =================================================================
    console.log("2. Seeding Veterinarians (vets collection)...");
    const demoVets = [
      {
        name: 'Dr. Jonathan Blake, DVM',
        email: 'dr.blake@oakridgevet.com',
        vciNumber: 'VET-CA-90421',
        licenseNumber: 'VET-CA-90421',
        deaNumber: 'DEA-CA-88912',
        password: 'securePassword123!',
        specialization: ['Internal Medicine'],
        clinicName: 'Oak Ridge Animal Hospital',
        university: 'UC Davis School of Veterinary Medicine',
        experienceYears: 9,
        status: 'pending',
        isVerified: false,
        consultationFee: 550,
        phone: '+1 (555) 234-5678',
        city: 'Sacramento, CA',
        clinicAddress: '104 Oak Ridge Way, Davis, CA',
        photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
        about: 'Specialist in internal veterinary diagnostics, metabolic health, and remote ultrasound evaluation.'
      },
      {
        name: 'Dr. Amanda Thorne, MRCVS',
        email: 'dr.thorne@metrovet.com',
        vciNumber: 'VET-NY-81093',
        licenseNumber: 'VET-NY-81093',
        deaNumber: 'DEA-NY-41290',
        password: 'securePassword123!',
        specialization: ['Emergency & Critical Care'],
        clinicName: 'Metropolitan Veterinary Center',
        university: 'Cornell University College of Veterinary Medicine',
        experienceYears: 12,
        status: 'pending',
        isVerified: false,
        consultationFee: 750,
        phone: '+1 (555) 345-6789',
        city: 'New York, NY',
        clinicAddress: '550 W 42nd St, New York, NY',
        photoUrl: 'https://images.unsplash.com/photo-1594824813583-05b135767b36?auto=format&fit=crop&q=80&w=400',
        about: 'Decade of critical intensive care and emergency trauma management across tier-1 animal hospitals.'
      },
      {
        name: 'Dr. Marcus Sterling, DVM',
        email: 'm.sterling@sterlingvet.com',
        vciNumber: 'VET-TX-45210',
        licenseNumber: 'VET-TX-45210',
        deaNumber: 'DEA-TX-77341',
        password: 'securePassword123!',
        specialization: ['Orthopedics & Spine', 'Internal Medicine'],
        clinicName: 'Sterling Animal Specialty Center',
        university: 'Texas A&M College of Veterinary Medicine',
        experienceYears: 15,
        status: 'active',
        isVerified: true,
        verifiedBy: 'Chief Clinical Admin',
        verifiedAt: new Date(),
        consultationFee: 600,
        phone: '+1 (555) 456-7890',
        city: 'Austin, TX',
        clinicAddress: '2200 Specialty Blvd, Austin, TX',
        photoUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400',
        about: 'Orthopedic surgeon and musculoskeletal rehabilitator focusing on canine joint mobility.'
      },
      {
        name: 'Dr. Chloe Aris, DVM',
        email: 'chloe.aris@sunshinevet.com',
        vciNumber: 'VET-FL-67129',
        licenseNumber: 'VET-FL-67129',
        deaNumber: 'DEA-FL-55612',
        password: 'securePassword123!',
        specialization: ['Dermatology & Allergies'],
        clinicName: 'Sunshine Pet Dermatology',
        university: 'University of Florida Veterinary College',
        experienceYears: 7,
        status: 'active',
        isVerified: true,
        verifiedBy: 'Chief Clinical Admin',
        verifiedAt: new Date(),
        consultationFee: 450,
        phone: '+1 (555) 567-8901',
        city: 'Orlando, FL',
        clinicAddress: '88 Ocean Pines Dr, Orlando, FL',
        photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
        about: 'Comprehensive dermatological allergy panels, cytological skin workups, and feline pruritus therapy.'
      },
      {
        name: 'Dr. Neil Roberts, BVSc',
        email: 'neil.roberts@chicagovet.org',
        vciNumber: 'VET-IL-98124',
        licenseNumber: 'VET-IL-98124',
        deaNumber: 'DEA-IL-33981',
        password: 'securePassword123!',
        specialization: ['Cardiology'],
        clinicName: 'Chicago Veterinary Specialists',
        university: 'University of Illinois Veterinary Medicine',
        experienceYears: 11,
        status: 'active',
        isVerified: true,
        verifiedBy: 'Chief Clinical Admin',
        verifiedAt: new Date(),
        consultationFee: 700,
        phone: '+1 (555) 678-9012',
        city: 'Chicago, IL',
        clinicAddress: '410 N Michigan Ave, Chicago, IL',
        photoUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=400',
        about: 'Board-certified veterinary cardiologist treating congestive heart failure and cardiac arrhythmias.'
      },
      {
        name: 'Dr. Kenneth Cole, DVM',
        email: 'k.cole@pacificvet.com',
        vciNumber: 'VET-WA-12489',
        licenseNumber: 'VET-WA-12489',
        deaNumber: 'DEA-WA-10934',
        password: 'securePassword123!',
        specialization: ['General Practice'],
        clinicName: 'Pacific Animal Care',
        university: 'Washington State University',
        experienceYears: 4,
        status: 'rejected',
        isVerified: false,
        rejectionReason: 'State license expired on 01/2024. Awaiting renewal receipt from Washington Veterinary Board.',
        consultationFee: 350,
        phone: '+1 (555) 789-0123',
        city: 'Seattle, WA',
        clinicAddress: '142 Pike St, Seattle, WA',
        photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
        about: 'Companion animal preventative care, vaccination regimes, and senior pet wellness exams.'
      },
      {
        name: 'Dr. Sarah Jenkins, DVM',
        email: 'sarah.jenkins@petcare.org',
        vciNumber: 'VET-WA-88312',
        licenseNumber: 'VET-WA-88312',
        deaNumber: 'DEA-WA-99210',
        password: 'securePassword123!',
        specialization: ['Orthopedics & Spine'],
        clinicName: 'Northwest Animal Surgery',
        university: 'Washington State University',
        experienceYears: 14,
        status: 'active',
        isVerified: true,
        verifiedBy: 'Chief Clinical Admin',
        verifiedAt: new Date(),
        consultationFee: 650,
        phone: '+1 (555) 890-1234',
        city: 'Seattle, WA',
        clinicAddress: '701 5th Ave, Seattle, WA',
        photoUrl: 'https://images.unsplash.com/photo-1594824813583-05b135767b36?auto=format&fit=crop&q=80&w=400',
        about: 'Director of Orthopedic Tele-Triage and Post-Operative Tele-Rehabilitation.'
      }
    ];

    const vetDocs = {};
    for (const vetData of demoVets) {
      let v = await Vet.findOne({ email: vetData.email });
      if (!v) {
        v = await Vet.create(vetData);
      } else {
        Object.assign(v, vetData);
        await v.save();
      }
      vetDocs[vetData.email] = v;
    }
    console.log(` -> Synced ${demoVets.length} veterinarians`);

    // =================================================================
    // 3. PETS (pets collection)
    // =================================================================
    console.log("3. Seeding Registered Pets (pets collection)...");
    const demoPets = [
      {
        name: 'Barnaby',
        species: 'Dog',
        breed: 'Golden Retriever',
        gender: 'Male',
        age: 4,
        ageUnit: 'Years',
        weight: 31,
        weightUnit: 'kg',
        color: 'Golden',
        microchipId: '985141002349182',
        vaccinated: true,
        ownerEmail: 'eleanor.vance@example.com',
        ownerName: 'Eleanor Vance',
        ownerPhone: '+1 (555) 432-8901',
        healthStatus: 'Under Treatment'
      },
      {
        name: 'Pip',
        species: 'Cat',
        breed: 'Tabby',
        gender: 'Female',
        age: 2,
        ageUnit: 'Years',
        weight: 4,
        weightUnit: 'kg',
        color: 'Grey Tabby',
        microchipId: '985141002349183',
        vaccinated: true,
        ownerEmail: 'eleanor.vance@example.com',
        ownerName: 'Eleanor Vance',
        ownerPhone: '+1 (555) 432-8901',
        healthStatus: 'Healthy'
      },
      {
        name: 'Cleo',
        species: 'Cat',
        breed: 'Siamese',
        gender: 'Female',
        age: 3,
        ageUnit: 'Years',
        weight: 3.8,
        weightUnit: 'kg',
        color: 'Seal Point',
        microchipId: '985141008819201',
        vaccinated: true,
        ownerEmail: 'liam.h@example.com',
        ownerName: 'Liam Henderson',
        ownerPhone: '+1 (555) 543-9012',
        healthStatus: 'Sick'
      },
      {
        name: 'Mochi',
        species: 'Cat',
        breed: 'Siamese',
        gender: 'Male',
        age: 3,
        ageUnit: 'Years',
        weight: 4.2,
        weightUnit: 'kg',
        color: 'Chocolate Point',
        microchipId: '985141008819202',
        vaccinated: false,
        ownerEmail: 'liam.h@example.com',
        ownerName: 'Liam Henderson',
        ownerPhone: '+1 (555) 543-9012',
        healthStatus: 'Healthy'
      },
      {
        name: 'Rory',
        species: 'Dog',
        breed: 'French Bulldog',
        gender: 'Male',
        age: 1,
        ageUnit: 'Years',
        weight: 12,
        weightUnit: 'kg',
        color: 'Fawn',
        microchipId: '985141003412984',
        vaccinated: true,
        ownerEmail: 'sophia.c@example.com',
        ownerName: 'Sophia Chen',
        ownerPhone: '+1 (555) 654-0123',
        healthStatus: 'Under Treatment'
      },
      {
        name: 'Zeus',
        species: 'Dog',
        breed: 'German Shepherd',
        gender: 'Male',
        age: 6,
        ageUnit: 'Years',
        weight: 38,
        weightUnit: 'kg',
        color: 'Black & Tan',
        microchipId: '985141009948210',
        vaccinated: true,
        ownerEmail: 'david.m@example.com',
        ownerName: 'David Miller',
        ownerPhone: '+1 (555) 765-1234',
        healthStatus: 'Under Treatment'
      },
      {
        name: 'Luna',
        species: 'Cat',
        breed: 'Persian',
        gender: 'Female',
        age: 5,
        ageUnit: 'Years',
        weight: 4.5,
        weightUnit: 'kg',
        color: 'White',
        microchipId: '985141001293847',
        vaccinated: true,
        ownerEmail: 'maya.lin@example.com',
        ownerName: 'Maya Lin',
        ownerPhone: '+1 (555) 876-2345',
        healthStatus: 'Healthy'
      },
      {
        name: 'Buster',
        species: 'Dog',
        breed: 'Beagle',
        gender: 'Male',
        age: 2,
        ageUnit: 'Years',
        weight: 14,
        weightUnit: 'kg',
        color: 'Tricolor',
        microchipId: '985141007728192',
        vaccinated: false,
        ownerEmail: 'j.wilson@example.com',
        ownerName: 'James Wilson',
        ownerPhone: '+1 (555) 987-3456',
        healthStatus: 'Healthy'
      }
    ];

    const petDocs = {};
    for (const petData of demoPets) {
      const owner = ownerDocs[petData.ownerEmail];
      let p = await Pet.findOne({ microchipId: petData.microchipId });
      const payload = {
        ...petData,
        ownerId: owner ? owner._id : null
      };
      if (!p) {
        p = await Pet.create(payload);
      } else {
        Object.assign(p, payload);
        await p.save();
      }
      petDocs[petData.name] = p;
    }
    console.log(` -> Synced ${demoPets.length} pets`);

    // =================================================================
    // 4. APPOINTMENTS (appointments collection)
    // =================================================================
    console.log("4. Seeding Appointments (appointments collection)...");
    const demoAppointments = [
      {
        vetId: vetDocs['m.sterling@sterlingvet.com'] ? vetDocs['m.sterling@sterlingvet.com']._id.toString() : 'VET-003',
        vetName: 'Dr. Marcus Sterling',
        petName: 'Barnaby',
        petSpecies: 'Dog',
        petWeight: '31 kg',
        ownerName: 'Eleanor Vance',
        ownerId: ownerDocs['eleanor.vance@example.com'] ? ownerDocs['eleanor.vance@example.com']._id.toString() : 'OWN-101',
        date: new Date().toISOString().split('T')[0],
        time: '10:00 AM EST',
        reason: 'Post-operative monitoring and appetite check',
        triage: 'urgent',
        status: 'live',
        isLive: true,
        meetLink: 'room-vet-8942',
        notes: 'Post-op recovery tracking for abdominal surgery. Incision clean, dog drinking fluids regularly.'
      },
      {
        vetId: vetDocs['chloe.aris@sunshinevet.com'] ? vetDocs['chloe.aris@sunshinevet.com']._id.toString() : 'VET-004',
        vetName: 'Dr. Chloe Aris',
        petName: 'Cleo & Mochi',
        petSpecies: 'Cat',
        petWeight: '4 kg',
        ownerName: 'Liam Henderson',
        ownerId: ownerDocs['liam.h@example.com'] ? ownerDocs['liam.h@example.com']._id.toString() : 'OWN-102',
        date: new Date().toISOString().split('T')[0],
        time: '10:15 AM EST',
        reason: 'Chronic skin itching & ear inflammation',
        triage: 'routine',
        status: 'pending',
        isLive: true,
        meetLink: 'room-vet-8943',
        notes: 'Evaluation of seasonal allergies. Reviewing hypoallergenic diet and topical spray.'
      },
      {
        vetId: vetDocs['neil.roberts@chicagovet.org'] ? vetDocs['neil.roberts@chicagovet.org']._id.toString() : 'VET-005',
        vetName: 'Dr. Neil Roberts',
        petName: 'Rory',
        petSpecies: 'Dog',
        petWeight: '12 kg',
        ownerName: 'Sophia Chen',
        ownerId: ownerDocs['sophia.c@example.com'] ? ownerDocs['sophia.c@example.com']._id.toString() : 'OWN-103',
        date: new Date().toISOString().split('T')[0],
        time: '10:30 AM EST',
        reason: 'Acute respiratory distress and rapid panting',
        triage: 'emergency',
        status: 'live',
        isLive: true,
        meetLink: 'room-vet-8944',
        notes: 'Emergency tele-triage. Advising owner on upright positioning and immediate oxygen stabilization.'
      },
      {
        vetId: vetDocs['sarah.jenkins@petcare.org'] ? vetDocs['sarah.jenkins@petcare.org']._id.toString() : 'VET-007',
        vetName: 'Dr. Sarah Jenkins',
        petName: 'Zeus',
        petSpecies: 'Dog',
        petWeight: '38 kg',
        ownerName: 'David Miller',
        ownerId: ownerDocs['david.m@example.com'] ? ownerDocs['david.m@example.com']._id.toString() : 'OWN-104',
        date: new Date().toISOString().split('T')[0],
        time: '11:00 AM EST',
        reason: 'Hind leg limping after park exercise',
        triage: 'routine',
        status: 'upcoming',
        isLive: false,
        meetLink: 'room-vet-8945',
        notes: 'Suspected mild cruciate ligament sprain. Awaiting gait video upload.'
      },
      {
        vetId: vetDocs['m.sterling@sterlingvet.com'] ? vetDocs['m.sterling@sterlingvet.com']._id.toString() : 'VET-003',
        vetName: 'Dr. Marcus Sterling',
        petName: 'Luna',
        petSpecies: 'Cat',
        petWeight: '4.5 kg',
        ownerName: 'Maya Lin',
        ownerId: ownerDocs['maya.lin@example.com'] ? ownerDocs['maya.lin@example.com']._id.toString() : 'OWN-105',
        date: new Date().toISOString().split('T')[0],
        time: '09:00 AM EST',
        reason: 'Follow-up on renal support diet',
        triage: 'routine',
        status: 'completed',
        isLive: false,
        notes: 'Hydration levels stable. Blood urea nitrogen within acceptable home-care margins.'
      },
      {
        vetId: vetDocs['chloe.aris@sunshinevet.com'] ? vetDocs['chloe.aris@sunshinevet.com']._id.toString() : 'VET-004',
        vetName: 'Dr. Chloe Aris',
        petName: 'Buster',
        petSpecies: 'Dog',
        petWeight: '14 kg',
        ownerName: 'James Wilson',
        ownerId: ownerDocs['j.wilson@example.com'] ? ownerDocs['j.wilson@example.com']._id.toString() : 'OWN-106',
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        time: '02:00 PM EST',
        reason: 'Suspected flea dermatitis & ear mite inspection',
        triage: 'routine',
        status: 'completed',
        isLive: false,
        notes: 'Topical antiparasitic prescribed and administered.'
      }
    ];

    const apptDocs = [];
    for (const apptData of demoAppointments) {
      let a = await Appointment.findOne({
        petName: apptData.petName,
        ownerName: apptData.ownerName,
        reason: apptData.reason
      });
      if (!a) {
        a = await Appointment.create(apptData);
      } else {
        Object.assign(a, apptData);
        await a.save();
      }
      apptDocs.push(a);
    }
    console.log(` -> Synced ${apptDocs.length} appointments`);

    // =================================================================
    // 5. CONSULTATIONS (consultations collection)
    // =================================================================
    console.log("5. Seeding Consultations (consultations collection)...");
    for (const appt of apptDocs) {
      let c = await Consultation.findOne({ appointmentId: appt._id.toString() });
      const cPayload = {
        vetId: appt.vetId,
        vetName: appt.vetName,
        appointmentId: appt._id.toString(),
        ownerId: appt.ownerId,
        ownerName: appt.ownerName,
        petName: appt.petName,
        date: appt.date,
        time: appt.time,
        fee: 499,
        status: appt.status === 'completed' ? 'completed' : 'upcoming',
        meetLink: appt.meetLink,
        petSpecies: appt.petSpecies,
        reasonForVisit: appt.reason,
        clinicalNotes: {
          symptoms: [appt.reason],
          tentativeDiagnosis: appt.notes,
          notes: appt.notes
        }
      };
      if (!c) {
        await Consultation.create(cPayload);
      } else {
        Object.assign(c, cPayload);
        await c.save();
      }
    }
    console.log(` -> Synced ${apptDocs.length} consultations`);

    // =================================================================
    // 6. PRESCRIPTIONS (prescriptions collection)
    // =================================================================
    console.log("6. Seeding Digital Prescriptions (prescriptions collection)...");
    const demoPrescriptions = [
      {
        vetEmail: 'm.sterling@sterlingvet.com',
        petName: 'Barnaby',
        ownerName: 'Eleanor Vance',
        diagnosis: 'Abdominal Post-Op Recovery & Prophylaxis',
        medications: [
          { name: 'Amoxicillin 250mg', dosage: '250mg', frequency: 'Every 12 hrs', duration: '7 days', instructions: 'Give with meal' }
        ],
        date: 'Today'
      },
      {
        vetEmail: 'chloe.aris@sunshinevet.com',
        petName: 'Cleo',
        ownerName: 'Liam Henderson',
        diagnosis: 'Canine/Feline Atopic Dermatitis',
        medications: [
          { name: 'Apoquel 5.4mg', dosage: '5.4mg', frequency: 'Once daily', duration: '14 days', instructions: 'Monitor itching index' }
        ],
        date: 'Today'
      },
      {
        vetEmail: 'neil.roberts@chicagovet.org',
        petName: 'Rory',
        ownerName: 'Sophia Chen',
        diagnosis: 'Acute Bronchospasm & Respiratory Strain',
        medications: [
          { name: 'Salbutamol Inhaler', dosage: '100mcg', frequency: 'As needed', duration: '5 days', instructions: 'Administer using pediatric spacer during panting' }
        ],
        date: 'Today'
      },
      {
        vetEmail: 'sarah.jenkins@petcare.org',
        petName: 'Zeus',
        ownerName: 'David Miller',
        diagnosis: 'Mild Cruciate Ligament Sprain',
        medications: [
          { name: 'Carprofen 75mg', dosage: '75mg', frequency: 'Once daily', duration: '10 days', instructions: 'Administer with solid food' }
        ],
        date: 'Yesterday'
      }
    ];

    for (const rx of demoPrescriptions) {
      const vDoc = vetDocs[rx.vetEmail] || Object.values(vetDocs)[0];
      const existingRx = await Prescription.findOne({
        patientName: rx.petName,
        petParent: rx.ownerName
      });
      const rxPayload = {
        vetId: vDoc._id,
        vetName: vDoc.name,
        vetQualification: vDoc.qualification,
        vetSpecialization: vDoc.specialization[0],
        vetClinic: vDoc.clinicName,
        patientName: rx.petName,
        petParent: rx.ownerName,
        diagnosis: rx.diagnosis,
        medications: rx.medications,
        date: rx.date
      };
      if (!existingRx) {
        await Prescription.create(rxPayload);
      } else {
        Object.assign(existingRx, rxPayload);
        await existingRx.save();
      }
    }
    console.log(` -> Synced ${demoPrescriptions.length} prescriptions`);

    // =================================================================
    // 7. CLINICAL REPORTS (clinicalreports collection)
    // =================================================================
    console.log("7. Seeding Clinical Reports (clinicalreports collection)...");
    const demoReports = [
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
      },
      {
        title: 'Patient Outcome & Tele-Triage Resolution Metrics',
        reportType: 'triage_outcomes',
        department: 'emergency',
        period: 'Last 30 Days',
        fileSize: '1.8 MB',
        fileFormat: 'PDF',
        summaryData: { totalSessions: 812, complianceScore: 99.4, criticalFlags: 0 },
        generatedBy: 'Chief Clinical Admin'
      },
      {
        title: 'Controlled Substances & Pharmacy Fulfillment Log',
        reportType: 'pharmacy_audit',
        department: 'internal_medicine',
        period: 'Current Quarter',
        fileSize: '450 KB',
        fileFormat: 'CSV',
        summaryData: { totalSessions: 420, complianceScore: 100, criticalFlags: 0 },
        generatedBy: 'Dr. Marcus Sterling'
      }
    ];

    for (const r of demoReports) {
      const exists = await ClinicalReport.findOne({ title: r.title });
      if (!exists) {
        await ClinicalReport.create(r);
      }
    }
    console.log(` -> Synced ${demoReports.length} clinical reports`);

    // =================================================================
    // 8. CLINICAL ADVISORIES (clinicaladvisories collection)
    // =================================================================
    console.log("8. Seeding Clinical Advisories (clinicaladvisories collection)...");
    const demoAdvisories = [
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
      },
      {
        title: 'Feline Hyperthyroidism Telehealth Monitoring Guidance',
        message: 'Recommended remote monitoring protocol for senior felines on methimazole maintenance therapy.',
        urgency: 'routine',
        targetAudience: 'veterinarians',
        regions: ['All Active Regions'],
        active: true,
        broadcastedBy: 'Dr. Marcus Sterling'
      }
    ];

    for (const adv of demoAdvisories) {
      const exists = await ClinicalAdvisory.findOne({ title: adv.title });
      if (!exists) {
        await ClinicalAdvisory.create(adv);
      }
    }
    console.log(` -> Synced ${demoAdvisories.length} clinical advisories`);

    // =================================================================
    // 9. ADMIN NOTIFICATIONS (adminnotifications collection)
    // =================================================================
    console.log("9. Seeding Admin Notifications (adminnotifications collection)...");
    const demoNotifications = [
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
      },
      {
        title: 'Doctor Account Verification Due',
        description: 'Dr. Amanda Thorne credential review pending in queue for 24+ hours.',
        type: 'warning',
        urgency: 'routine',
        isRead: false,
        relatedModel: 'Vet'
      }
    ];

    for (const n of demoNotifications) {
      const exists = await AdminNotification.findOne({ title: n.title });
      if (!exists) {
        await AdminNotification.create(n);
      }
    }
    console.log(` -> Synced ${demoNotifications.length} admin notifications`);

    // =================================================================
    // 10. REVIEWS (reviews collection)
    // =================================================================
    console.log("10. Seeding Reviews (reviews collection)...");
    const demoReviews = [
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
      },
      {
        vetId: 'VET-004',
        vetName: 'Dr. Chloe Aris',
        ownerName: 'Liam Henderson',
        petName: 'Cleo',
        rating: 4,
        comment: 'Very knowledgeable on feline allergies. The prescribed treatment plan was clear and easy to follow.',
        verified: true,
        status: 'published'
      },
      {
        vetId: 'VET-007',
        vetName: 'Dr. Sarah Jenkins',
        ownerName: 'David Miller',
        petName: 'Zeus',
        rating: 5,
        comment: 'Exceptional clinical advice. Saved us an unnecessary midnight trip to the hospital.',
        verified: true,
        status: 'published'
      }
    ];

    for (const rev of demoReviews) {
      const exists = await Review.findOne({
        vetName: rev.vetName,
        ownerName: rev.ownerName,
        petName: rev.petName
      });
      if (!exists) {
        await Review.create(rev);
      }
    }
    console.log(` -> Synced ${demoReviews.length} reviews`);

    // =================================================================
    // 11. CONSULTATION TELEMETRIES (consultationtelemetries collection)
    // =================================================================
    console.log("11. Seeding WebRTC Consultation Telemetries...");
    const demoTelemetries = [
      {
        appointmentId: 'APT-1092',
        consultationId: 'CNS-1092',
        sessionId: 'sess_webrtc_1092',
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
      },
      {
        appointmentId: 'APT-1094',
        consultationId: 'CNS-1094',
        sessionId: 'sess_webrtc_1094',
        roomName: 'room-vet-8944',
        doctorName: 'Dr. Neil Roberts',
        ownerName: 'Sophia Chen',
        petName: 'Rory',
        triageLevel: 'emergency',
        streamMetrics: {
          vetBitrateKbps: 2100,
          ownerBitrateKbps: 1400,
          latencyMs: 19,
          packetLossPercentage: 0.01,
          resolution: '1080p @ 60fps',
          encryption: 'AES-256'
        },
        durationSeconds: 430,
        webrtcState: 'connected',
        clinicalDiagnosisNotes: 'Acute respiratory distress. Owner instructed on oxygen tent and immediate clinic transport.'
      }
    ];

    for (const t of demoTelemetries) {
      let existingT = await ConsultationTelemetry.findOne({ appointmentId: t.appointmentId });
      if (!existingT) {
        await ConsultationTelemetry.create(t);
      } else {
        Object.assign(existingT, t);
        await existingT.save();
      }
    }
    console.log(` -> Synced ${demoTelemetries.length} telemetry streams`);

    // =================================================================
    // 12. PLATFORM SETTINGS (platformsettings collection)
    // =================================================================
    console.log("12. Seeding Platform Settings (platformsettings collection)...");
    let settings = await PlatformSetting.findOne();
    const settingsPayload = {
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
    };
    if (!settings) {
      await PlatformSetting.create(settingsPayload);
    } else {
      Object.assign(settings, settingsPayload);
      await settings.save();
    }
    console.log(" -> Synced platform settings");

    // =================================================================
    // VERIFICATION: COUNT DOCUMENTS IN EACH COLLECTION
    // =================================================================
    console.log("\n==================================================================");
    console.log(" 📊 SUMMARY: TOTAL RECORDS IN EACH MONGODB COLLECTION (TABLE)");
    console.log("==================================================================");
    const summary = {
      'users (Pet Parents & Admins)': await User.countDocuments(),
      'vets (Veterinarians)': await Vet.countDocuments(),
      'pets (Registered Animals & Microchips)': await Pet.countDocuments(),
      'appointments (Scheduled & Live)': await Appointment.countDocuments(),
      'consultations (Consultation Records)': await Consultation.countDocuments(),
      'prescriptions (Electronic RX)': await Prescription.countDocuments(),
      'clinicalreports (Compliance & Audits)': await ClinicalReport.countDocuments(),
      'clinicaladvisories (Health Advisories)': await ClinicalAdvisory.countDocuments(),
      'adminnotifications (Live Alerts)': await AdminNotification.countDocuments(),
      'reviews (Doctor Testimonials)': await Review.countDocuments(),
      'consultationtelemetries (WebRTC Logs)': await ConsultationTelemetry.countDocuments(),
      'platformsettings (Global Config)': await PlatformSetting.countDocuments()
    };

    for (const [coll, count] of Object.entries(summary)) {
      console.log(` • ${coll.padEnd(45)} : ${count} documents`);
    }
    console.log("==================================================================\n");
    console.log("✨ All Admin Panel demo data successfully stored in MongoDB Atlas!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding admin demo data:", err);
    process.exit(1);
  }
}

seedAllAdminData();
