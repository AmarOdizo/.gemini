const fs = require('fs');

let content = fs.readFileSync('C:/Users/VICTUS/.gemini/API/routes/vets.js', 'utf8');

// Add model imports
if (!content.includes('const Appointment')) {
    content = content.replace(
        'const connectDB = require("../config/db");',
        'const connectDB = require("../config/db");\nconst Appointment = require("../models/Appointment");\nconst Prescription = require("../models/Prescription");'
    );
}

// Ensure scopedStore has prescriptions array
if (!content.includes('prescriptions: []')) {
    content = content.replace(
        'appointments: [],',
        'appointments: [],\n      prescriptions: [],'
    );
}

// Replace GET appointments
const getApptsRegex = /\/\/ GET \/api\/vets\/:id\/appointments - Scoped Appointment List\nrouter\.get\("\/:id\/appointments", verifyDoctorAuth, function \(req, res\) \{\n  try \{\n    const idParam = req\.params\.id;\n    const scopedStore = getScopedDoctorStore\(idParam\);\n    return res\.json\(\{\n      success: true,\n      doctorId: idParam,\n      count: scopedStore\.appointments\.length,\n      appointments: scopedStore\.appointments\n    \}\);\n  \} catch\(err\) \{\n    return res\.status\(500\)\.json\(\{ success: false, message: err\.message \}\);\n  \}\n\}\);/s;

const newGetAppts = `// GET /api/vets/:id/appointments - Scoped Appointment List
router.get("/:id/appointments", verifyDoctorAuth, async function (req, res) {
  try {
    const idParam = req.params.id;
    if (isDbAvailable() && Appointment) {
      const dbAppointments = await Appointment.find({ vetId: idParam }).sort({ createdAt: -1 });
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
});`;

content = content.replace(getApptsRegex, newGetAppts);

// Add Prescriptions endpoint after GET availability
const getAvailabilityRegex = /\/\/ PUT \/api\/vets\/:id\/availability - Update Scoped Availability/s;

const prescriptionsEndpoints = `// POST /api/vets/:id/prescriptions - Create Digital Prescription
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

// GET /api/vets/:id/prescriptions
router.get("/:id/prescriptions", verifyDoctorAuth, async function (req, res) {
  try {
    const idParam = req.params.id;
    if (isDbAvailable() && Prescription) {
      const dbPrescriptions = await Prescription.find({ vetId: idParam }).sort({ createdAt: -1 });
      return res.json({ success: true, prescriptions: dbPrescriptions });
    }
    const scopedStore = getScopedDoctorStore(idParam);
    return res.json({ success: true, prescriptions: scopedStore.prescriptions || [] });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/vets/:id/availability - Update Scoped Availability`;

content = content.replace(getAvailabilityRegex, prescriptionsEndpoints);

fs.writeFileSync('C:/Users/VICTUS/.gemini/API/routes/vets.js', content, 'utf8');
console.log("Updated vets.js successfully!");
