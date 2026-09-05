const express = require("express");
const router = express.Router();
const Vet = require("../models/Vet");
const Appointment = require("../models/Appointment");
const Prescription = require("../models/Prescription");
const connectDB = require("../config/db");

// Dynamic runtime storage collection for vets (starts empty, only user registered vets exist)
let memoryVetsCollection = [
  {
    _id: "vet_101",
    name: 'Dr. Ananya Sharma',
    vciNumber: 'VCI-2024-8891',
    qualification: 'B.V.Sc & A.H. (Gold Medallist)',
    university: 'KVAFSU Bangalore',
    experienceYears: 8,
    specialization: ['Canine Care', 'Feline Care', 'Telehealth Consult', 'Soft Surgery'],
    clinicName: 'PawsCare Pet Hospital',
    city: 'Koramangala, Bengaluru',
    clinicAddress: 'Koramangala 4th Block, Bengaluru, Karnataka',
    phone: '+91 98765 12345',
    email: 'dr.ananya@pawsindia.com',
    consultationFee: 499,
    clinicPhone: '080-25501234',
    about: 'Dr. Ananya Sharma is a senior veterinary physician and canine healthcare expert based in Koramangala, Bengaluru. With over 8 years of clinical excellence, she provides comprehensive diagnosis, surgical care, and telehealth for all pet breeds across India.',
    photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&auto=format&fit=crop',
    role: "doctor",
    createdAt: new Date().toISOString()
  }
];

// Scoped doctor data store (appointments, availability, earnings)
const doctorDataStore = {};

function isDbAvailable() {
  return connectDB.getStatus ? connectDB.getStatus() : false;
}

function getScopedDoctorStore(vetId) {
  const key = String(vetId);
  if (!doctorDataStore[key]) {
    doctorDataStore[key] = {
      appointments: [],
      prescriptions: [],
      availability: {
        weeklyHours: { "Monday": "09:00 AM - 05:00 PM", "Tuesday": "09:00 AM - 05:00 PM", "Wednesday": "09:00 AM - 05:00 PM", "Thursday": "09:00 AM - 05:00 PM", "Friday": "09:00 AM - 05:00 PM", "Saturday": "Closed", "Sunday": "Closed" },
        slotDuration: 30,
        emergencyConsult: true
      },
      earnings: {
        thisMonth: 0,
        totalConsultations: 0,
        pendingPayout: 0,
        history: []
      }
    };
  }
  return doctorDataStore[key];
}

// Middleware: Verify Doctor Authorization
function verifyDoctorAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "").trim() || req.query.token;

  if (!token || !token.startsWith("vet_token_")) {
    return res.status(403).json({
      success: false,
      message: "Forbidden. Doctor authorization token required."
    });
  }

  next();
}

/* =========================================================
   VETERINARIAN DATABASE COLLECTION API ENDPOINTS ('vets')
   ========================================================= */

// GET /api/vets - Retrieve all registered veterinarians from 'vets' collection table
router.get("/", function (req, res) {
  try {
    if (isDbAvailable() && Vet) {
      const query = {};
      if (req.query.city) query.city = new RegExp(req.query.city, "i");
      if (req.query.specialization) query.specialization = req.query.specialization;

      return Vet.find(query).select("-password").sort({ createdAt: -1 }).then(function(dbVets) {
        return res.json({
          success: true,
          count: dbVets.length,
          collection: "vets",
          data: dbVets
        });
      }).catch(function(err) {
        return res.status(500).json({ success: false, message: err.message });
      });
    }

    let filtered = memoryVetsCollection;
    if (req.query.city) {
      filtered = filtered.filter(function (v) { return v.city.toLowerCase().includes(req.query.city.toLowerCase()); });
    }
    if (req.query.specialization) {
      filtered = filtered.filter(function (v) { return v.specialization.includes(req.query.specialization); });
    }

    const safeVets = filtered.map(function (v) {
      const vCopy = Object.assign({}, v);
      delete vCopy.password;
      return vCopy;
    });

    return res.json({
      success: true,
      count: safeVets.length,
      collection: "vets",
      data: safeVets
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/vets/me - Authenticated Doctor Profile Self Check
router.get("/me", verifyDoctorAuth, function (req, res) {
  if (memoryVetsCollection.length > 0) {
    const doc = memoryVetsCollection[0];
    const safeDoc = Object.assign({}, doc);
    delete safeDoc.password;
    return res.json({ success: true, doctor: safeDoc });
  }

  return res.status(404).json({ success: false, message: "No doctor registered in session." });
});

// GET /api/vets/:id - Single Doctor Details from 'vets' collection table
router.get("/:id", function (req, res) {
  try {
    const idParam = req.params.id;

    if (isDbAvailable() && Vet) {
      const mongoose = require("mongoose");
      const queryOr = [];
      if (mongoose.Types.ObjectId.isValid(idParam)) {
        queryOr.push({ _id: idParam });
      }
      queryOr.push({ vciNumber: String(idParam).toUpperCase() });

      return Vet.findOne({ $or: queryOr })
      .select("-password").then(function(dbVet) {
        if (dbVet) return res.json({ success: true, data: dbVet });
        
        const memVet = memoryVetsCollection.find(function(v) {
          return String(v._id) === String(idParam) || String(v.id) === String(idParam) || v.vciNumber.toUpperCase() === String(idParam).toUpperCase();
        });
        if (!memVet) return res.status(404).json({ success: false, message: "Veterinarian record not found." });
        const safeVet = Object.assign({}, memVet);
        delete safeVet.password;
        return res.json({ success: true, data: safeVet });
      }).catch(function(err) {
        console.error("GET /api/vets/:id Error:", err.message);
        const memVet = memoryVetsCollection.find(function(v) {
          return String(v._id) === String(idParam) || String(v.id) === String(idParam) || v.vciNumber.toUpperCase() === String(idParam).toUpperCase();
        });
        if (!memVet) return res.status(404).json({ success: false, message: "Veterinarian record not found." });
        const safeVet = Object.assign({}, memVet);
        delete safeVet.password;
        return res.json({ success: true, data: safeVet });
      });
    }

    const memVet = memoryVetsCollection.find(function(v) {
      return String(v._id) === String(idParam) || String(v.id) === String(idParam) || v.vciNumber.toUpperCase() === String(idParam).toUpperCase();
    });

    if (!memVet) {
      return res.status(404).json({ success: false, message: "Veterinarian record not found." });
    }

    const safeVet = Object.assign({}, memVet);
    delete safeVet.password;
    return res.json({ success: true, data: safeVet });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/vets/:id - Update Doctor Profile
router.put("/:id", async function (req, res) {
  try {
    const idParam = req.params.id;
    const updateData = req.body;
    
    if (isDbAvailable() && Vet) {
      const updatedVet = await Vet.findByIdAndUpdate(
        idParam,
        { $set: updateData },
        { new: true }
      ).select("-password");
      if (!updatedVet) {
         return res.status(404).json({ success: false, message: "Vet not found." });
      }
      return res.json({ success: true, vet: updatedVet });
    }
    
    return res.json({ success: false, message: "DB not available." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/* =========================================================
   SCOPED DOCTOR DATA ISOLATION API ENDPOINTS
   ========================================================= */

// GET /api/vets/:id/dashboard - Scoped Dashboard Metrics
router.get("/:id/dashboard", verifyDoctorAuth, async function (req, res) {
  try {
    const idParam = req.params.id;
    
    if (isDbAvailable() && require("../models/Consultation")) {
      const Consultation = require("../models/Consultation");
      const today = new Date();
      const todayStr = today.toISOString().split("T")[0]; // YYYY-MM-DD
      
      const allConsults = await Consultation.find({ vetId: idParam }).sort({ createdAt: -1 });
      const todaysConsultations = allConsults.filter(c => c.date === todayStr);
      const completed = allConsults.filter(c => c.status === 'completed');
      
      return res.json({
        success: true,
        doctorId: idParam,
        metrics: {
          todaysConsultations: todaysConsultations.length,
          totalAppointments: completed.length, // Or total based on definition
          monthlyEarnings: completed.reduce((sum, c) => sum + (c.fee || 499), 0),
          pendingPayout: 0
        },
        appointments: allConsults
      });
    }

    const scopedStore = getScopedDoctorStore(idParam);
    return res.json({
      success: true,
      doctorId: idParam,
      metrics: {
        todaysConsultations: scopedStore.appointments.filter(a => a.date === "Today").length,
        totalAppointments: scopedStore.appointments.length,
        monthlyEarnings: scopedStore.earnings.thisMonth,
        pendingPayout: scopedStore.earnings.pendingPayout
      },
      appointments: scopedStore.appointments
    });
  } catch(err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/vets/:id/appointments - Scoped Appointment List
router.get("/:id/appointments", verifyDoctorAuth, async function (req, res) {
  try {
    const idParam = req.params.id;
    if (isDbAvailable() && Appointment) {
      const dbAppointments = await Appointment.find({ vetId: idParam }).populate('petId ownerId').sort({ createdAt: -1 });
      return res.json({
        success: true,
        doctorId: idParam,
        count: dbAppointments.length,
        appointments: dbAppointments
      });
    }
    const scopedStore = getScopedDoctorStore(idParam);
    return res.json({
      success: true,
      doctorId: idParam,
      count: scopedStore.appointments.length,
      appointments: scopedStore.appointments
    });
  } catch(err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/vets/:id/appointments - Create Appointment
router.post("/:id/appointments", async function (req, res) {
  try {
    const idParam = req.params.id;
    const body = req.body;
    body.vetId = idParam;
    
    if (isDbAvailable() && Appointment) {
      const newAppt = await Appointment.create(body);
      return res.status(201).json({ success: true, appointment: newAppt });
    }
    const scopedStore = getScopedDoctorStore(idParam);
    const newAppt = { _id: "appt_" + Date.now(), ...body, createdAt: new Date() };
    scopedStore.appointments.push(newAppt);
    return res.status(201).json({ success: true, appointment: newAppt });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/vets/:id/availability - Scoped Availability Schedule
router.get("/:id/availability", verifyDoctorAuth, function (req, res) {
  try {
    const idParam = req.params.id;
    const scopedStore = getScopedDoctorStore(idParam);
    return res.json({
      success: true,
      doctorId: idParam,
      availability: scopedStore.availability
    });
  } catch(err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/vets/:id/availability - Update Scoped Availability
router.put("/:id/availability", verifyDoctorAuth, async function (req, res) {
  try {
    const idParam = req.params.id;
    
    let dbVet = null;
    if (isDbAvailable() && Vet) {
      dbVet = await Vet.findById(idParam);
    }
    
    // Memory store update
    const scopedStore = getScopedDoctorStore(idParam);
    if (req.body && req.body.weeklyHours) {
      scopedStore.availability.weeklyHours = req.body.weeklyHours;
      if (dbVet) {
        // Map weeklyHours back to array format if needed, but the schema has array of days
        // Wait, Vet schema expects: [{day, active, slots}]
        if (Array.isArray(req.body.availability)) {
            dbVet.availability = req.body.availability;
        }
      }
    }
    if (Array.isArray(req.body.availability)) {
        if (dbVet) dbVet.availability = req.body.availability;
    }
    if (typeof req.body.emergencyDuty === 'boolean') {
      if (dbVet) dbVet.emergencyDuty = req.body.emergencyDuty;
    }
    if (typeof req.body.telehealthMode === 'boolean') {
      if (dbVet) dbVet.telehealthMode = req.body.telehealthMode;
    }
    
    if (dbVet) {
        await dbVet.save();
    }

    return res.json({
      success: true,
      message: "Doctor availability schedule updated successfully!",
      availability: dbVet ? dbVet.availability : scopedStore.availability
    });
  } catch(err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/vets/:id/prescriptions - Create Digital Prescription
router.post("/:id/prescriptions", verifyDoctorAuth, async function (req, res) {
  try {
    const idParam = req.params.id;
    const body = req.body;
    body.vetId = idParam;
    
    if (isDbAvailable() && Prescription) {
      const newPrescription = await Prescription.create(body);
      return res.status(201).json({
        success: true,
        message: "Prescription issued successfully",
        prescription: newPrescription
      });
    }
    
    const scopedStore = getScopedDoctorStore(idParam);
    if (!scopedStore.prescriptions) scopedStore.prescriptions = [];
    const newPrescription = { _id: "rx_" + Date.now(), ...body, createdAt: new Date() };
    scopedStore.prescriptions.push(newPrescription);
    
    return res.status(201).json({
        success: true,
        message: "Prescription issued successfully (Memory Mode)",
        prescription: newPrescription
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/vets/:id/prescriptions - Get Prescriptions
router.get("/:id/prescriptions", verifyDoctorAuth, async function (req, res) {
  try {
    const idParam = req.params.id;
    if (isDbAvailable() && Prescription) {
      const dbPrescriptions = await Prescription.find({ vetId: idParam }).populate('appointmentId').sort({ createdAt: -1 });
      return res.json({ success: true, prescriptions: dbPrescriptions });
    }
    const scopedStore = getScopedDoctorStore(idParam);
    return res.json({ success: true, prescriptions: scopedStore.prescriptions || [] });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/vets/:id/earnings - Scoped Financial & Earnings Data
router.get("/:id/earnings", verifyDoctorAuth, async function (req, res) {
  try {
    const idParam = req.params.id;
    if (isDbAvailable() && Appointment) {
      const allAppts = await Appointment.find({ vetId: idParam, status: 'completed' });
      const totalEarnings = allAppts.reduce((sum, c) => sum + (c.fee || 499), 0);
      const todayStr = new Date().toISOString().split("T")[0].substring(0, 7); // YYYY-MM
      const thisMonthAppts = allAppts.filter(c => c.date.startsWith(todayStr) || true); // Simplified for demo
      const thisMonthEarnings = thisMonthAppts.reduce((sum, c) => sum + (c.fee || 499), 0);

      return res.json({
        success: true,
        doctorId: idParam,
        earnings: {
          thisMonth: thisMonthEarnings,
          totalConsultations: allAppts.length,
          pendingPayout: totalEarnings > 1000 ? 1000 : totalEarnings, // Mock pending payout
          history: []
        }
      });
    }

    const scopedStore = getScopedDoctorStore(idParam);
    return res.json({
      success: true,
      doctorId: idParam,
      earnings: scopedStore.earnings
    });
  } catch(err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/vets/register - Register New Veterinarian Document into 'vets' collection table
router.post("/register", function (req, res) {
  try {
    const body = req.body || {};
    const name = body.name || body.fullName;
    const email = body.email;
    const vciNumber = body.vciNumber || body.regNumber || body.licenseNumber;
    const password = body.password;

    if (!name || !email || !vciNumber || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide Full Name, Email, VCI Registration Number, and Password."
      });
    }

    const normEmail = String(email).toLowerCase().trim();
    const normVci = String(vciNumber).toUpperCase().trim();

    const vetData = {
      name: name,
      email: normEmail,
      vciNumber: normVci,
      password: password,
      phone: body.phone || "+91 98765 43210",
      qualification: body.qualification || "B.V.Sc & A.H.",
      university: body.university || "Veterinary College",
      experienceYears: Number(body.experienceYears || body.experience) || 5,
      specialization: Array.isArray(body.specialization) ? body.specialization : (body.specialization ? [body.specialization] : ["General Practice"]),
      clinicName: body.clinicName || "PawsCare Pet Hospital",
      city: body.city || "Bengaluru",
      clinicAddress: body.clinicAddress || (body.clinicName ? body.clinicName + ", " : "") + (body.city || "Bengaluru"),
      consultationFee: Number(body.consultationFee || body.consultFee || body.fee) || 499,
      clinicPhone: body.clinicPhone || "080-25501234",
      about: body.about || "Dedicated veterinarian registered with VCI.",
      photoUrl: body.photoUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop",
      licenseCertUrl: body.licenseCertUrl || "",
      isVerified: true,
      status: "active",
      role: "doctor"
    };

    if (isDbAvailable() && Vet) {
      return Vet.findOne({
        $or: [{ email: normEmail }, { vciNumber: normVci }]
      }).then(function(existingDbVet) {
        if (existingDbVet) {
          return res.status(400).json({
            success: false,
            message: "A veterinarian with this email or VCI License number already exists."
          });
        }

        return Vet.create(vetData).then(function(newDbVet) {
          const respVet = newDbVet.toObject ? newDbVet.toObject() : Object.assign({}, newDbVet);
          delete respVet.password;

          return res.status(201).json({
            success: true,
            message: "Doctor Registered Successfully into 'vets' collection table!",
            token: "vet_token_" + (newDbVet._id || Date.now()),
            vet: respVet,
            user: respVet
          });
        });
      }).catch(function(err) {
        return res.status(500).json({ success: false, message: err.message });
      });
    }

    const existingMemVet = memoryVetsCollection.find(function(v) {
      return v.email.toLowerCase() === normEmail || v.vciNumber.toUpperCase() === normVci;
    });

    if (existingMemVet) {
      return res.status(400).json({
        success: false,
        message: "A veterinarian with this email or VCI License number already exists."
      });
    }

    vetData._id = "vet_" + Date.now();
    vetData.id = vetData._id;
    vetData.createdAt = new Date().toISOString();
    memoryVetsCollection.push(vetData);

    const safeResponseVet = Object.assign({}, vetData);
    delete safeResponseVet.password;

    return res.status(201).json({
      success: true,
      message: "Doctor Registered Successfully into 'vets' table!",
      token: "vet_token_" + (safeResponseVet._id || Date.now()),
      vet: safeResponseVet,
      user: safeResponseVet
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error during vet registration: " + error.message
    });
  }
});

// POST /api/vets/login - Doctor Login via Email or VCI Registration Number
router.post("/login", function (req, res) {
  try {
    const identifier = req.body.email || req.body.vciNumber || req.body.identifier;
    const password = req.body.password;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter Email/VCI Registration Number and Password."
      });
    }

    const queryStr = String(identifier).trim();

    if (isDbAvailable() && Vet) {
      return Vet.findOne({
        $or: [
          { email: queryStr.toLowerCase() },
          { vciNumber: queryStr.toUpperCase() }
        ]
      }).then(function(dbVet) {
        if (!dbVet || dbVet.password !== password) {
          return res.status(401).json({
            success: false,
            message: "Invalid Email/VCI Registration Number or Password."
          });
        }

        const safeVet = dbVet.toObject ? dbVet.toObject() : Object.assign({}, dbVet);
        delete safeVet.password;

        return res.json({
          success: true,
          message: "Doctor Login Successful!",
          token: "vet_token_" + (dbVet._id || Date.now()),
          vet: safeVet,
          user: safeVet
        });
      }).catch(function(err) {
        return res.status(500).json({ success: false, message: err.message });
      });
    }

    const memVet = memoryVetsCollection.find(function(v) {
      return (
        v.email.toLowerCase() === queryStr.toLowerCase() ||
        v.vciNumber.toUpperCase() === queryStr.toUpperCase()
      );
    });

    if (!memVet || memVet.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid Email/VCI Registration Number or Password."
      });
    }

    const safeVet = Object.assign({}, memVet);
    delete safeVet.password;

    return res.json({
      success: true,
      message: "Doctor Login Successful!",
      token: "vet_token_" + (safeVet._id || Date.now()),
      vet: safeVet,
      user: safeVet
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
