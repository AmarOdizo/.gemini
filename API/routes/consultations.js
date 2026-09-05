const express = require("express");
const router = express.Router();
const Consultation = require("../models/Consultation");
const connectDB = require("../config/db");

// Helper to check DB
function isDbAvailable() {
  return connectDB.getStatus ? connectDB.getStatus() : false;
}

// GET /api/consultations
// Supports filtering by vetId or ownerId
router.get("/", async function (req, res) {
  try {
    const vetId = req.query.vetId;
    const ownerId = req.query.ownerId;
    
    if (isDbAvailable() && Consultation) {
      const query = {};
      if (vetId) query.vetId = vetId;
      if (ownerId) query.ownerId = ownerId;
      
      const dbConsultations = await Consultation.find(query).populate('vetId petId ownerId appointmentId').sort({ createdAt: -1 });
      return res.json({
        success: true,
        count: dbConsultations.length,
        data: dbConsultations
      });
    }
    
    // In-memory fallback if DB not connected
    return res.json({
      success: true,
      count: 0,
      data: [],
      message: "DB not available, returning empty list."
    });
  } catch(err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/consultations/metrics
router.get("/metrics", async function (req, res) {
  try {
    const vetId = req.query.vetId;
    if (!vetId) {
      return res.status(400).json({ success: false, message: "vetId is required" });
    }
    
    if (isDbAvailable() && Consultation) {
      const today = new Date();
      const todayStr = today.toISOString().split("T")[0]; // YYYY-MM-DD
      
      const allConsults = await Consultation.find({ vetId });
      
      const metrics = {
        totalConsultations: allConsults.length,
        completedConsultations: allConsults.filter(c => c.status === 'completed').length,
        upcomingConsultations: allConsults.filter(c => c.status === 'upcoming').length,
        todayConsultations: allConsults.filter(c => c.date === todayStr).length,
        totalEarnings: allConsults.filter(c => c.status === 'completed').reduce((sum, c) => sum + (c.fee || 499), 0),
        rating: 4.8 // Default or mocked for now
      };
      
      return res.json({ success: true, data: metrics });
    }
    
    // In-memory fallback
    return res.json({ success: false, message: "DB not available." });
  } catch(err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/consultations/:id
router.get("/:id", async function (req, res) {
  try {
    const { id } = req.params;
    if (isDbAvailable() && Consultation) {
      const consultation = await Consultation.findById(id).populate('vetId petId ownerId appointmentId');
      if (!consultation) {
        return res.status(404).json({ success: false, message: "Consultation not found." });
      }
      return res.json({ success: true, data: consultation });
    }
    
    // In-memory fallback
    return res.json({ success: false, message: "DB not available." });
  } catch(err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/consultations
router.post("/", async function (req, res) {
  try {
    const body = req.body;
    
    if (isDbAvailable() && Consultation) {
      const newConsultation = await Consultation.create(body);
      return res.status(201).json({ success: true, data: newConsultation });
    }
    
    // In-memory fallback
    const newConsultation = { _id: "consult_" + Date.now(), ...body, createdAt: new Date() };
    return res.status(201).json({ success: true, data: newConsultation, message: "Created in memory only" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/consultations/:id/notes
router.put("/:id/notes", async function (req, res) {
  try {
    const { id } = req.params;
    const { clinicalNotes } = req.body;
    
    if (isDbAvailable() && Consultation) {
      const updatedConsultation = await Consultation.findByIdAndUpdate(
        id, 
        { $set: { clinicalNotes } },
        { new: true }
      );
      if (!updatedConsultation) {
         return res.status(404).json({ success: false, message: "Consultation not found." });
      }
      return res.json({ success: true, data: updatedConsultation });
    }
    
    // In-memory fallback
    return res.json({ success: false, message: "DB not available." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/consultations/:id/status
router.put("/:id/status", async function (req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (isDbAvailable() && Consultation) {
      const updatedConsultation = await Consultation.findByIdAndUpdate(
        id, 
        { $set: { status } },
        { new: true }
      );
      if (!updatedConsultation) {
         return res.status(404).json({ success: false, message: "Consultation not found." });
      }
      return res.json({ success: true, data: updatedConsultation });
    }
    
    // In-memory fallback
    return res.json({ success: false, message: "DB not available." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/consultations/:id
router.delete("/:id", async function (req, res) {
  try {
    const { id } = req.params;
    
    if (isDbAvailable() && Consultation) {
      const deletedConsultation = await Consultation.findByIdAndDelete(id);
      if (!deletedConsultation) {
         return res.status(404).json({ success: false, message: "Consultation not found." });
      }
      return res.json({ success: true, message: "Consultation deleted." });
    }
    
    // In-memory fallback
    return res.json({ success: false, message: "DB not available." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
