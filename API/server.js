const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables first

const connectDB = require("./config/db");
connectDB(); // Establish MongoDB connection

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
const adminRoutes = require("./routes/adminRoutes");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swaggerSpec");

const app = express();

// Middleware
const corsOptions = {
  origin: process.env.FRONTEND_URL || "*",
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging middleware
app.use(function (req, res, next) {
  console.log(
    "[" + new Date().toISOString() + "] " + req.method + " " + req.url,
  );
  next();
});

// Database connection now handled via MongoDB and Mongoose

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
app.use("/api/admin", adminRoutes);
app.use("/api", apiRoutes);

// Swagger API Documentation UI
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "PetCare Tele-Veterinary Platform API Docs"
  })
);

app.get("/swagger.json", function (req, res) {
  res.setHeader("Content-Type", "application/json");
  res.json(swaggerSpec);
});

// Root Index Route
app.get("/", function (req, res) {
  res.json({
    success: true,
    message: "Welcome to PetCare Tele-Veterinary API Server",
    documentation: "/api-docs",
    swaggerJson: "/swagger.json",
    endpoints: {
      swaggerUI: "/api-docs",
      adminMetrics: "/api/admin/metrics",
      adminAppointments: "/api/admin/appointments",
      adminVets: "/api/admin/vets",
      adminOwners: "/api/admin/owners",
      adminPrescriptions: "/api/admin/prescriptions",
      health: "/api/health",
      authLogin: "/api/auth/login",
      authRegister: "/api/auth/register",
      vets: "/api/vets",
      pets: "/api/pets",
      appointments: "/api/appointments"
    },
  });
});

// 404 Route Handler
app.use(function (req, res) {
  res.status(404).json({
    success: false,
    message: "Endpoint not found: " + req.originalUrl,
  });
});

// Start Server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, function () {
  console.log("==========================================");
  console.log("  PetCare API Server Running Successfully ");
  console.log("  Port: " + PORT);
  console.log("  Swagger Docs: http://localhost:" + PORT + "/api-docs");
  console.log("  Health URL: http://localhost:" + PORT + "/api/health");
  console.log("  Admin Metrics: http://localhost:" + PORT + "/api/admin/metrics");
  console.log("  Vets API: http://localhost:" + PORT + "/api/vets");
  console.log("  Pets API: http://localhost:" + PORT + "/api/pets");
  console.log("==========================================");
});

// DB seeded via Supabase SQL directly.

// Keep process active
setInterval(function () {}, 1000000);

module.exports = app;
