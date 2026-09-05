const express = require("express");
const router = express.Router();
const Prescription = require("../models/Prescription");
const connectDB = require("../config/db");

// Helper to check DB
function isDbAvailable() {
  return connectDB.getStatus ? connectDB.getStatus() : false;
}

// GET /api/prescriptions
router.get("/", async function (req, res) {
  try {
    const vetId = req.query.vetId;
    const ownerId = req.query.ownerId;
    if (isDbAvailable() && Prescription) {
      const query = vetId ? { vetId: vetId } : {};
      const dbPrescriptions = await Prescription.find(query)
        .populate('appointmentId')
        .populate('vetId')
        .sort({ createdAt: -1 });

      let filtered = dbPrescriptions;
      if (ownerId) {
        filtered = filtered.filter(p => {
          // Check if ownerId is stored directly on the prescription
          if (p.ownerId && p.ownerId === String(ownerId)) return true;
          
          // Fallback to checking the populated appointment
          if (!p.appointmentId) return false;
          const id = typeof p.appointmentId.ownerId === 'object' ? p.appointmentId.ownerId._id?.toString() || p.appointmentId.ownerId.toString() : String(p.appointmentId.ownerId);
          return id === String(ownerId);
        });
      }
      return res.json({ success: true, data: filtered });
    }
    
    return res.json({ success: true, data: [], message: "DB not available" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/prescriptions/:id
router.get("/:id", async function (req, res) {
  try {
    const { id } = req.params;
    if (isDbAvailable() && Prescription) {
      const prescription = await Prescription.findById(id).populate('vetId appointmentId');
      if (!prescription) {
        return res.status(404).json({ success: false, message: "Prescription not found." });
      }
      return res.json({ success: true, data: prescription });
    }
    
    // In-memory fallback
    return res.json({ success: false, message: "DB not available." });
  } catch(err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/prescriptions
router.post("/", async function (req, res) {
  try {
    const body = req.body;
    
    if (isDbAvailable() && Prescription) {
      const newPrescription = await Prescription.create(body);
      return res.status(201).json({
        success: true,
        message: "Prescription issued successfully",
        prescription: newPrescription
      });
    }
    
    const newPrescription = { _id: "rx_" + Date.now(), ...body, createdAt: new Date() };
    
    return res.status(201).json({
        success: true,
        message: "Prescription issued successfully (Memory Mode)",
        prescription: newPrescription
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
