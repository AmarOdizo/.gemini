const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const apiRoutes = require("./routes/apiRoutes");
const authRoutes = require("./routes/authRoutes");
const petRoutes = require("./routes/petRoutes");
const vetRoutes = require("./routes/vets");
const appointmentRoutes = require("./routes/appointments");
const consultationRoutes = require("./routes/consultations");
const chatRoutes = require("./routes/chat");
const prescriptionRoutes = require("./routes/prescriptions");
const imagekitRoutes = require("./routes/imagekitRoutes");
const favoriteVetsRoutes = require("./routes/favoriteVets");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging middleware
app.use(function (req, res, next) {
  console.log("[" + new Date().toISOString() + "] " + req.method + " " + req.url);
  next();
});

// Database Connection
connectDB();

// Register API Routes
app.use("/api/auth", authRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/vets", vetRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/consultations", consultationRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/imagekit", imagekitRoutes);
app.use("/api/favorites", favoriteVetsRoutes);
app.use("/api", apiRoutes);

// Root Index Route
app.get("/", function (req, res) {
  res.json({
    success: true,
    message: "Welcome to Gemini Backend API Server",
    endpoints: {
      health: "/api/health",
      status: "/api/status",
      login: "/api/auth/login",
      register: "/api/auth/register",
      vets: "/api/vets",
      vetLogin: "/api/vets/login",
      vetRegister: "/api/vets/register",
      pets: "/api/pets",
      imagekitAuth: "/api/imagekit/auth",
      imagekitUpload: "/api/imagekit/upload",
      items: "/api/items"
    }
  });
});

// 404 Route Handler
app.use(function (req, res) {
  res.status(404).json({
    success: false,
    message: "Endpoint not found: " + req.originalUrl
  });
});

// Start Server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, function () {
  console.log("==========================================");
  console.log("  Gemini API Server Running Successfully  ");
  console.log("  Port: " + PORT);
  console.log("  Health URL: http://localhost:" + PORT + "/api/health");
  console.log("  Auth Login: http://localhost:" + PORT + "/api/auth/login");
  console.log("  Auth Register: http://localhost:" + PORT + "/api/auth/register");
  console.log("  Vets API: http://localhost:" + PORT + "/api/vets");
  console.log("  Vet Register: http://localhost:" + PORT + "/api/vets/register");
  console.log("  Vet Login: http://localhost:" + PORT + "/api/vets/login");
  console.log("  Pets API: http://localhost:" + PORT + "/api/pets");
  console.log("==========================================");
});

const runAutoSeed = async () => {
  try {
    const mongoose = require("mongoose");
    if (!mongoose) return;
    
    const User = require("./models/User");
    const Vet = require("./models/Vet");
    const Pet = require("./models/Pet");
    const Appointment = require("./models/Appointment");
    const Consultation = require("./models/Consultation");
    const Prescription = require("./models/Prescription");
    const ChatMessage = require("./models/ChatMessage");

    if (!User || typeof User.countDocuments !== 'function') return;

    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log("Database already populated. Skipping auto-seed.");
      return;
    }

    console.log("Starting Auto-Seed: Populating empty database directly from server.js...");

    const users = await User.insertMany([
      { name: "Rahul Verma", email: "rahul@example.com", password: "password123", role: "owner", phone: "+91 9876543210" },
      { name: "Priya Sharma", email: "priya@example.com", password: "password123", role: "owner", phone: "+91 9876543211" },
      { name: "Amit Kumar", email: "amit@example.com", password: "password123", role: "owner", phone: "+91 9876543212" },
      { name: "Neha Singh", email: "neha@example.com", password: "password123", role: "owner", phone: "+91 9876543213" }
    ]);

    const vets = await Vet.insertMany([
      { name: "Dr. Ananya Sharma", email: "ananya@pawsindia.com", vciNumber: "VCI-2024-001", password: "password123", qualification: "B.V.Sc & A.H.", specialization: ["General Practice", "Canine Care"], city: "Bengaluru", consultationFee: 499 },
      { name: "Dr. Vikram Singh", email: "vikram@pawsindia.com", vciNumber: "VCI-2024-002", password: "password123", qualification: "M.V.Sc (Surgery)", specialization: ["Surgery", "Orthopedics"], city: "Delhi", consultationFee: 699 },
      { name: "Dr. Meera Reddy", email: "meera@pawsindia.com", vciNumber: "VCI-2024-003", password: "password123", qualification: "B.V.Sc & A.H.", specialization: ["Feline Care", "Dermatology"], city: "Hyderabad", consultationFee: 599 },
      { name: "Dr. Rohan Patel", email: "rohan@pawsindia.com", vciNumber: "VCI-2024-004", password: "password123", qualification: "M.V.Sc (Medicine)", specialization: ["Internal Medicine"], city: "Mumbai", consultationFee: 799 }
    ]);

    const pets = await Pet.insertMany([
      { ownerId: users[0]._id, name: "Max", species: "Dog", breed: "Golden Retriever", age: 3, weight: 28, gender: "Male", medicalHistory: ["Vaccinated 2023"] },
      { ownerId: users[1]._id, name: "Luna", species: "Cat", breed: "Persian", age: 2, weight: 4.5, gender: "Female", medicalHistory: ["Dewormed"] },
      { ownerId: users[2]._id, name: "Rocky", species: "Dog", breed: "German Shepherd", age: 5, weight: 35, gender: "Male", medicalHistory: ["Hip Dysplasia"] },
      { ownerId: users[3]._id, name: "Bella", species: "Dog", breed: "Labrador", age: 1, weight: 15, gender: "Female", medicalHistory: ["Healthy"] }
    ]);

    const today = new Date().toISOString().split("T")[0];
    const appointments = await Appointment.insertMany([
      { vetId: vets[0]._id, ownerId: users[0]._id, petId: pets[0]._id, vetName: vets[0].name, ownerName: users[0].name, petName: pets[0].name, date: today, time: "10:00 AM", consultationType: "video", fee: vets[0].consultationFee, status: "completed" },
      { vetId: vets[1]._id, ownerId: users[1]._id, petId: pets[1]._id, vetName: vets[1].name, ownerName: users[1].name, petName: pets[1].name, date: today, time: "11:30 AM", consultationType: "clinic", fee: vets[1].consultationFee, status: "upcoming" },
      { vetId: vets[2]._id, ownerId: users[2]._id, petId: pets[2]._id, vetName: vets[2].name, ownerName: users[2].name, petName: pets[2].name, date: today, time: "02:30 PM", consultationType: "video", fee: vets[2].consultationFee, status: "upcoming" },
      { vetId: vets[3]._id, ownerId: users[3]._id, petId: pets[3]._id, vetName: vets[3].name, ownerName: users[3].name, petName: pets[3].name, date: today, time: "04:00 PM", consultationType: "clinic", fee: vets[3].consultationFee, status: "completed" }
    ]);

    const consultations = await Consultation.insertMany([
      { vetId: vets[0]._id, appointmentId: appointments[0]._id, petId: pets[0]._id, ownerId: users[0]._id, vetName: vets[0].name, ownerName: users[0].name, petName: pets[0].name, date: today, time: "10:00 AM", consultationType: "video", fee: vets[0].consultationFee, status: "completed", clinicalNotes: { symptoms: ["Cough", "Lethargy"], tentativeDiagnosis: "Mild Kennel Cough", notes: "Rest and hydration required." } },
      { vetId: vets[1]._id, appointmentId: appointments[1]._id, petId: pets[1]._id, ownerId: users[1]._id, vetName: vets[1].name, ownerName: users[1].name, petName: pets[1].name, date: today, time: "11:30 AM", consultationType: "clinic", fee: vets[1].consultationFee, status: "upcoming", reasonForVisit: "Routine checkup" },
      { vetId: vets[2]._id, appointmentId: appointments[2]._id, petId: pets[2]._id, ownerId: users[2]._id, vetName: vets[2].name, ownerName: users[2].name, petName: pets[2].name, date: today, time: "02:30 PM", consultationType: "video", fee: vets[2].consultationFee, status: "upcoming", reasonForVisit: "Skin rash" },
      { vetId: vets[3]._id, appointmentId: appointments[3]._id, petId: pets[3]._id, ownerId: users[3]._id, vetName: vets[3].name, ownerName: users[3].name, petName: pets[3].name, date: today, time: "04:00 PM", consultationType: "clinic", fee: vets[3].consultationFee, status: "completed", clinicalNotes: { symptoms: ["Fever"], tentativeDiagnosis: "Viral Infection", notes: "Prescribed antibiotics." } }
    ]);

    const prescriptions = await Prescription.insertMany([
      { vetId: vets[0]._id, appointmentId: appointments[0]._id, patientName: pets[0].name, diagnosis: "Mild Kennel Cough", medications: [{ name: "Cough Syrup", dosage: "5ml", frequency: "Twice daily", duration: "5 days" }] },
      { vetId: vets[3]._id, appointmentId: appointments[3]._id, patientName: pets[3].name, diagnosis: "Viral Infection", medications: [{ name: "Antibiotic Tablets", dosage: "1 tablet", frequency: "Once daily", duration: "7 days" }, { name: "Multivitamin", dosage: "1 tablet", frequency: "Once daily", duration: "10 days" }] }
    ]);

    await ChatMessage.insertMany([
      { consultationId: consultations[2]._id, senderId: users[2]._id, senderModel: "User", text: "Hello doctor, Rocky has been scratching a lot.", isRead: true },
      { consultationId: consultations[2]._id, senderId: vets[2]._id, senderModel: "Vet", text: "Hi Amit, how long has this been going on?", isRead: true },
      { consultationId: consultations[2]._id, senderId: users[2]._id, senderModel: "User", text: "Since yesterday.", isRead: false }
    ]);

    console.log("Database Auto-Seed Complete! All 7 collections have been successfully populated.");
  } catch (error) {
    console.error("Auto-Seed Failed:", error.message);
  }
};

// Wait 5 seconds after server start to ensure DB is fully connected
setTimeout(runAutoSeed, 5000);

// Keep process active
setInterval(function () {}, 1000000);

module.exports = app;
