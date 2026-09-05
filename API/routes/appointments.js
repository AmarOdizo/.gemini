const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const connectDB = require("../config/db");

// Helper to check DB
function isDbAvailable() {
  return connectDB.getStatus ? connectDB.getStatus() : false;
}

// GET /api/appointments
// Supports filtering by vetId
router.get("/", async function (req, res) {
  try {
    const vetId = req.query.vetId;
    const ownerId = req.query.ownerId;
    if (isDbAvailable() && Appointment) {
      const query = {};
      if (vetId) query.vetId = vetId;
      if (ownerId) query.ownerId = ownerId;
      const dbAppointments = await Appointment.find(query).populate('vetId petId ownerId').sort({ createdAt: -1 });
      return res.json({
        success: true,
        count: dbAppointments.length,
        appointments: dbAppointments
      });
    }
    
    // In-memory fallback if DB not connected (empty array for now, avoiding complex shared store)
    return res.json({
      success: true,
      count: 0,
      appointments: [],
      message: "DB not available, returning empty list."
    });
  } catch(err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/appointments
router.post("/", async function (req, res) {
  try {
    const body = req.body;
    
    if (isDbAvailable() && Appointment) {
      const newAppt = await Appointment.create(body);
      return res.status(201).json({ success: true, appointment: newAppt });
    }
    
    // In-memory fallback
    const newAppt = { _id: "appt_" + Date.now(), ...body, createdAt: new Date() };
    return res.status(201).json({ success: true, appointment: newAppt, message: "Created in memory only" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
