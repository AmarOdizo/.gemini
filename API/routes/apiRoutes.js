const express = require("express");
const router = express.Router();
const connectDB = require("../config/db");

// In-memory data store for fallback
let items = [
  { id: "1", name: "Sample Item 1", description: "Demo item for testing backend API", createdAt: new Date().toISOString() },
  { id: "2", name: "Sample Item 2", description: "Another demo item", createdAt: new Date().toISOString() }
];

// Health Check Endpoint
router.get("/health", function (req, res) {
  res.json({
    success: true,
    message: "API backend is running successfully",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// System Status Endpoint
router.get("/status", function (req, res) {
  const dbStatus = connectDB.getStatus ? connectDB.getStatus() : false;
  res.json({
    success: true,
    server: "Node.js Express Backend",
    port: process.env.PORT || 5000,
    databaseConnected: dbStatus,
    mode: dbStatus ? "MongoDB Connected" : "Standalone Memory Mode",
    timestamp: new Date().toISOString()
  });
});

// GET all items
router.get("/items", function (req, res) {
  res.json({
    success: true,
    count: items.length,
    data: items
  });
});

// GET single item
router.get("/items/:id", function (req, res) {
  const item = items.find(function (i) { return i.id === req.params.id; });
  if (!item) {
    return res.status(404).json({ success: false, message: "Item not found" });
  }
  res.json({ success: true, data: item });
});

// POST create item
router.post("/items", function (req, res) {
  const name = req.body && req.body.name ? req.body.name : ("Item " + (items.length + 1));
  const description = req.body && req.body.description ? req.body.description : "No description provided";
  
  const newItem = {
    id: String(Date.now()),
    name: name,
    description: description,
    createdAt: new Date().toISOString()
  };
  
  items.push(newItem);
  res.status(201).json({
    success: true,
    message: "Item created successfully",
    data: newItem
  });
});

// DELETE item
router.delete("/items/:id", function (req, res) {
  const initialLength = items.length;
  items = items.filter(function (i) { return i.id !== req.params.id; });
  
  if (items.length === initialLength) {
    return res.status(404).json({ success: false, message: "Item not found" });
  }
  
  res.json({ success: true, message: "Item deleted successfully" });
});

// GET /seed - Populates database with 5 complete, realistic records
router.get("/seed", async function(req, res) {
  try {

    const Vet = require("../models/Vet");
    const User = require("../models/User");
    const Pet = require("../models/Pet");
    const Appointment = require("../models/Appointment");
    const Consultation = require("../models/Consultation");
    const Prescription = require("../models/Prescription");
    const ChatMessage = require("../models/ChatMessage");

    await Promise.all([
      User.deleteMany({}), Pet.deleteMany({}), Vet.deleteMany({}),
      Appointment.deleteMany({}), Consultation.deleteMany({}),
      Prescription.deleteMany({}), ChatMessage.deleteMany({})
    ]);

    const users = await User.insertMany([
      { name: "Rahul Verma", email: "rahul@example.com", phone: "9876543211", password: "password123", role: "owner" },
      { name: "Priya Sharma", email: "priya@example.com", phone: "9876543212", password: "password123", role: "owner" },
      { name: "Amit Kumar", email: "amit@example.com", phone: "9876543213", password: "password123", role: "owner" },
      { name: "Sneha Reddy", email: "sneha@example.com", phone: "9876543214", password: "password123", role: "owner" }
    ]);

    const pets = await Pet.insertMany([
      { ownerId: users[0]._id, ownerName: users[0].name, ownerEmail: users[0].email, ownerPhone: users[0].phone, name: "Sheru", species: "Dog", type: "Dog", breed: "Indian Pariah", age: 3, weight: 15, gender: "Male" },
      { ownerId: users[1]._id, ownerName: users[1].name, ownerEmail: users[1].email, ownerPhone: users[1].phone, name: "Luna", species: "Dog", type: "Dog", breed: "Golden Retriever", age: 2, weight: 22, gender: "Female" },
      { ownerId: users[2]._id, ownerName: users[2].name, ownerEmail: users[2].email, ownerPhone: users[2].phone, name: "Milo", species: "Cat", type: "Cat", breed: "Calico", age: 4, weight: 5, gender: "Male" },
      { ownerId: users[3]._id, ownerName: users[3].name, ownerEmail: users[3].email, ownerPhone: users[3].phone, name: "Bruno", species: "Dog", type: "Dog", breed: "German Shepherd", age: 5, weight: 30, gender: "Male" }
    ]);

    const vets = await Vet.insertMany([
      { name: "Dr. Ananya Sharma", email: "ananya@example.com", vciNumber: "VCI-2024-8891", password: "password123", specialization: ["General Practice", "Surgery"], clinicName: "PawsCare Pet Hospital", city: "Bengaluru", consultationFee: 499, experienceYears: 8 },
      { name: "Dr. Vikram Singh", email: "vikram@example.com", vciNumber: "VCI-2024-9922", password: "password123", specialization: ["Dermatology"], clinicName: "Healthy Paws Clinic", city: "Delhi", consultationFee: 599, experienceYears: 12 },
      { name: "Dr. Neha Gupta", email: "neha@example.com", vciNumber: "VCI-2024-7733", password: "password123", specialization: ["Dental", "General Practice"], clinicName: "Happy Tails Vet", city: "Mumbai", consultationFee: 450, experienceYears: 5 },
      { name: "Dr. Rajesh Patel", email: "rajesh@example.com", vciNumber: "VCI-2024-6644", password: "password123", specialization: ["Orthopedics", "Surgery"], clinicName: "Care Vet Clinic", city: "Ahmedabad", consultationFee: 700, experienceYears: 15 }
    ]);

    const appointments = await Appointment.insertMany([
      { vetId: vets[0]._id, ownerId: users[0]._id, ownerName: users[0].name, petId: pets[0]._id, petName: pets[0].name, date: "Tomorrow", time: "10:00 AM", consultationType: "Virtual Telehealth Call", status: "scheduled", reason: "Annual checkup", fee: 499 },
      { vetId: vets[1]._id, ownerId: users[1]._id, ownerName: users[1].name, petId: pets[1]._id, petName: pets[1].name, date: "Yesterday", time: "02:30 PM", consultationType: "In-Person Clinic Visit", status: "completed", reason: "Vaccination", fee: 499 },
      { vetId: vets[2]._id, ownerId: users[2]._id, ownerName: users[2].name, petId: pets[2]._id, petName: pets[2].name, date: "Today", time: "11:30 AM", consultationType: "Virtual Telehealth Call", status: "completed", reason: "Skin allergy", fee: 599 },
      { vetId: vets[3]._id, ownerId: users[3]._id, ownerName: users[3].name, petId: pets[3]._id, petName: pets[3].name, date: "Next Week", time: "04:00 PM", consultationType: "In-Person Clinic Visit", status: "scheduled", reason: "Dental cleaning", fee: 450 }
    ]);

    const consultations = await Consultation.insertMany([
      { vetId: vets[0]._id, vetName: vets[0].name, appointmentId: appointments[0]._id, ownerId: users[0]._id, ownerName: users[0].name, petId: pets[0]._id, petName: pets[0].name, date: appointments[0].date, time: appointments[0].time, reasonForVisit: appointments[0].reason, clinicalNotes: {}, status: "upcoming", fee: appointments[0].fee },
      { vetId: vets[1]._id, vetName: vets[1].name, appointmentId: appointments[1]._id, ownerId: users[1]._id, ownerName: users[1].name, petId: pets[1]._id, petName: pets[1].name, date: appointments[1].date, time: appointments[1].time, reasonForVisit: appointments[1].reason, clinicalNotes: { symptoms: ["None"], tentativeDiagnosis: "Healthy", notes: "Administered annual booster shots." }, status: "completed", fee: appointments[1].fee },
      { vetId: vets[2]._id, vetName: vets[2].name, appointmentId: appointments[2]._id, ownerId: users[2]._id, ownerName: users[2].name, petId: pets[2]._id, petName: pets[2].name, date: appointments[2].date, time: appointments[2].time, reasonForVisit: appointments[2].reason, clinicalNotes: { symptoms: ["Itching", "Redness"], tentativeDiagnosis: "Flea allergy dermatitis", notes: "Prescribed topical ointment and flea control." }, status: "completed", fee: appointments[2].fee },
      { vetId: vets[3]._id, vetName: vets[3].name, appointmentId: appointments[3]._id, ownerId: users[3]._id, ownerName: users[3].name, petId: pets[3]._id, petName: pets[3].name, date: appointments[3].date, time: appointments[3].time, reasonForVisit: appointments[3].reason, clinicalNotes: {}, status: "upcoming", fee: appointments[3].fee }
    ]);

    const prescriptions = await Prescription.insertMany([
      { vetId: vets[0]._id, appointmentId: appointments[0]._id, patientName: pets[0].name, ageWeight: pets[0].age + " / " + pets[0].weight, speciesBreed: pets[0].type + " / " + pets[0].breed, petParent: users[0].name, diagnosis: "Pending", medications: [], date: "Tomorrow" },
      { vetId: vets[1]._id, appointmentId: appointments[1]._id, patientName: pets[1].name, ageWeight: pets[1].age + " / " + pets[1].weight, speciesBreed: pets[1].type + " / " + pets[1].breed, petParent: users[1].name, diagnosis: "Healthy - Annual Vaccinations", medications: [{ name: "Nobivac DHPPi", dosage: "1 ml", frequency: "Once", duration: "1 day", instructions: "Subcutaneous injection" }], date: "Yesterday" },
      { vetId: vets[2]._id, appointmentId: appointments[2]._id, patientName: pets[2].name, ageWeight: pets[2].age + " / " + pets[2].weight, speciesBreed: pets[2].type + " / " + pets[2].breed, petParent: users[2].name, diagnosis: "Flea allergy dermatitis", medications: [{ name: "Bravecto Spot-On", dosage: "1 pipette", frequency: "Once", duration: "12 weeks", instructions: "Apply to back of neck" }], date: "Today" },
      { vetId: vets[3]._id, appointmentId: appointments[3]._id, patientName: pets[3].name, ageWeight: pets[3].age + " / " + pets[3].weight, speciesBreed: pets[3].type + " / " + pets[3].breed, petParent: users[3].name, diagnosis: "Pending Assessment", medications: [], date: "Next Week" }
    ]);

    const chatMessages = await ChatMessage.insertMany([
      { consultationId: consultations[1]._id, senderId: users[1]._id, senderName: users[1].name, senderRole: "owner", message: "Hi Dr. Vikram, we are ready for Luna's vaccination.", createdAt: new Date(Date.now() - 3600000 * 2) },
      { consultationId: consultations[1]._id, senderId: vets[1]._id, senderName: vets[1].name, senderRole: "vet", message: "Great! Please bring her to the examination room.", createdAt: new Date(Date.now() - 3600000) },
      { consultationId: consultations[2]._id, senderId: users[2]._id, senderName: users[2].name, senderRole: "owner", message: "Dr. Neha, Milo is scratching his ears constantly.", createdAt: new Date(Date.now() - 7200000) },
      { consultationId: consultations[2]._id, senderId: vets[2]._id, senderName: vets[2].name, senderRole: "vet", message: "I'll prescribe an ear drop and we'll check it in the video call.", createdAt: new Date(Date.now() - 3600000) }
    ]);

    res.json({ success: true, message: "Database seeded successfully with 4 records in each collection." });
  } catch(e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
