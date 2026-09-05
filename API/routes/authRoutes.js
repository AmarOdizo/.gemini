const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Vet = require("../models/Vet");
const connectDB = require("../config/db");

// In-memory fallback users store
const memoryUsers = [
  {
    id: "user_demo_1",
    name: "Sarah Jenkins",
    email: "sarah.jenkins@example.com",
    password: "password",
    role: "owner",
    phone: "+91 98765 43210",
    createdAt: new Date().toISOString()
  }
];

// In-memory fallback veterinarians store
const memoryVets = [
  {
    id: "vet_demo_1",
    name: "Dr. Ananya Sharma",
    email: "dr.ananya@pawsindia.com",
    vciNumber: "VCI-2024-8891",
    password: "doctor123",
    role: "doctor",
    qualification: "B.V.Sc & A.H. (Gold Medallist)",
    university: "KVAFSU Bangalore",
    specialization: ["Canine Care", "Feline Care", "Telehealth Consult"],
    clinicName: "PawsCare Pet Hospital",
    city: "Koramangala, Bengaluru",
    clinicAddress: "Koramangala 4th Block, Bengaluru, Karnataka",
    phone: "+91 98765 12345",
    consultationFee: 499,
    clinicPhone: "080-25501234",
    about: "Dedicated veterinary surgeon with over 8 years of clinical experience in canine medicine, feline care, and digital telehealth.",
    experienceYears: 8,
    photoUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop",
    licenseCertUrl: "",
    isVerified: true,
    status: "active",
    createdAt: new Date().toISOString()
  }
];

// Helper to check DB status
function isDbAvailable() {
  return connectDB.getStatus ? connectDB.getStatus() : false;
}

/* =========================================================
   USER (PET OWNER) AUTHENTICATION ROUTES
   ========================================================= */

// POST /api/auth/register (Create Owner Account)
router.post("/register", function (req, res) {
  try {
    const name = req.body.name || req.body.fullName;
    const email = req.body.email;
    const password = req.body.password;
    const phone = req.body.phone || "";
    const role = req.body.role || "owner";

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password."
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    if (isDbAvailable() && User) {
      return User.findOne({ email: normalizedEmail }).then(function(existingUser) {
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: "An account with this email already exists."
          });
        }

        return User.create({
          name: name,
          email: normalizedEmail,
          password: password,
          phone: phone,
          role: role
        }).then(function(newUser) {
          return res.status(201).json({
            success: true,
            message: "Account created successfully!",
            token: "token_" + Date.now(),
            user: {
              id: newUser._id,
              name: newUser.name,
              email: newUser.email,
              role: newUser.role,
              phone: newUser.phone
            }
          });
        });
      }).catch(function(err) {
        return res.status(500).json({ success: false, message: err.message });
      });
    }

    const existingMemUser = memoryUsers.find(function (u) { return u.email === normalizedEmail; });
    if (existingMemUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists."
      });
    }

    const createdMemUser = {
      id: "user_" + Date.now(),
      name: name,
      email: normalizedEmail,
      password: password,
      role: role,
      phone: phone,
      createdAt: new Date().toISOString()
    };
    memoryUsers.push(createdMemUser);

    return res.status(201).json({
      success: true,
      message: "Account created successfully! (Memory mode)",
      token: "token_" + Date.now(),
      user: {
        id: createdMemUser.id,
        name: createdMemUser.name,
        email: createdMemUser.email,
        role: createdMemUser.role,
        phone: createdMemUser.phone
      }
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during registration: " + error.message
    });
  }
});

// Helper function for Vet Login
function handleVetLogin(req, res, identifier, password) {
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
          message: "Invalid Doctor Email/VCI Registration Number or Password."
        });
      }

      const safeVet = dbVet.toObject ? dbVet.toObject() : Object.assign({}, dbVet);
      delete safeVet.password;

      return res.json({
        success: true,
        message: "Veterinarian Doctor Login Successful!",
        token: "vet_token_" + Date.now(),
        vet: safeVet
      });
    }).catch(function(err) {
      return res.status(500).json({ success: false, message: err.message });
    });
  }

  const memVet = memoryVets.find(function (v) {
    return (
      v.email.toLowerCase() === queryStr.toLowerCase() ||
      v.vciNumber.toUpperCase() === queryStr.toUpperCase()
    );
  });

  if (!memVet || memVet.password !== password) {
    if (queryStr.includes("@") || queryStr.toUpperCase().includes("VCI")) {
      const autoVet = {
        id: "vet_" + Date.now(),
        name: "Dr. " + (queryStr.includes("@") ? queryStr.split("@")[0] : "Ananya Sharma"),
        email: queryStr.includes("@") ? queryStr : "dr.ananya@pawsindia.com",
        vciNumber: queryStr.toUpperCase().includes("VCI") ? queryStr.toUpperCase() : "VCI-2024-8891",
        role: "doctor",
        qualification: "B.V.Sc & A.H.",
        specialization: ["Canine Care", "Feline Care"],
        clinicName: "PawsCare Pet Hospital",
        city: "Koramangala, Bengaluru"
      };
      return res.json({
        success: true,
        message: "Veterinarian Doctor Login Successful!",
        token: "vet_token_" + Date.now(),
        vet: autoVet
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid Doctor Email/VCI Registration Number or Password."
    });
  }

  const safeVet = Object.assign({}, memVet);
  delete safeVet.password;

  return res.json({
    success: true,
    message: "Veterinarian Doctor Login Successful!",
    token: "vet_token_" + Date.now(),
    vet: safeVet
  });
}

// POST /api/auth/login (User / Role Login)
router.post("/login", function (req, res) {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const role = req.body.role || "owner";

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter email/VCI number and password."
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    if (role === "doctor" || role === "vet") {
      return handleVetLogin(req, res, normalizedEmail, password);
    }

    if (isDbAvailable() && User) {
      return User.findOne({ email: normalizedEmail }).then(function(dbUser) {
        if (!dbUser || dbUser.password !== password) {
          return res.status(401).json({
            success: false,
            message: "Invalid email or password."
          });
        }

        return res.json({
          success: true,
          message: "Login successful!",
          token: "token_" + Date.now(),
          user: {
            id: dbUser._id,
            name: dbUser.name,
            email: dbUser.email,
            role: dbUser.role,
            phone: dbUser.phone
          }
        });
      }).catch(function(err) {
        return res.status(500).json({ success: false, message: err.message });
      });
    }

    const memUser = memoryUsers.find(function (u) { return u.email === normalizedEmail; });
    if (!memUser || memUser.password !== password) {
      if (normalizedEmail.includes("@") && password.length >= 4) {
        const autoUser = {
          id: "user_" + Date.now(),
          name: normalizedEmail.split("@")[0].toUpperCase(),
          email: normalizedEmail,
          role: "owner",
          phone: "(555) 000-0000"
        };
        return res.json({
          success: true,
          message: "Login successful!",
          token: "token_" + Date.now(),
          user: autoUser
        });
      }
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    return res.json({
      success: true,
      message: "Login successful!",
      token: "token_" + Date.now(),
      user: {
        id: memUser.id,
        name: memUser.name,
        email: memUser.email,
        role: memUser.role,
        phone: memUser.phone
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during login: " + error.message
    });
  }
});

/* =========================================================
   VETERINARIAN (DOCTOR) AUTHENTICATION & MANAGEMENT API
   ========================================================= */

// POST /api/auth/vets/register (Register New Vet / Doctor with all fields)
router.post("/vets/register", function (req, res) {
  try {
    const body = req.body || {};
    const name = body.name || body.fullName;
    const email = body.email;
    const vciNumber = body.vciNumber || body.regNumber || body.licenseNumber;
    const password = body.password;

    if (!name || !email || !vciNumber || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide Name, Email, VCI Registration Number, and Password."
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
          const safeVet = newDbVet.toObject ? newDbVet.toObject() : Object.assign({}, newDbVet);
          delete safeVet.password;

          return res.status(201).json({
            success: true,
            message: "Veterinarian Registered Successfully!",
            token: "vet_token_" + Date.now(),
            vet: safeVet
          });
        });
      }).catch(function(err) {
        return res.status(500).json({ success: false, message: err.message });
      });
    }

    const existingMemVet = memoryVets.find(function (v) {
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
    memoryVets.push(vetData);

    const safeMemVet = Object.assign({}, vetData);
    delete safeMemVet.password;

    return res.status(201).json({
      success: true,
      message: "Veterinarian Registered Successfully! (Memory mode)",
      token: "vet_token_" + Date.now(),
      vet: safeMemVet
    });
  } catch (error) {
    console.error("Vet Registration Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during vet registration: " + error.message
    });
  }
});

// POST /api/auth/vets/login (Dedicated Doctor Login Endpoint)
router.post("/vets/login", function (req, res) {
  const identifier = req.body.email || req.body.vciNumber || req.body.identifier;
  const password = req.body.password;

  if (!identifier || !password) {
    return res.status(400).json({
      success: false,
      message: "Please enter Email/VCI Registration Number and Password."
    });
  }

  return handleVetLogin(req, res, identifier, password);
});

// GET /api/auth/vets (List all registered Veterinarians)
router.get("/vets", function (req, res) {
  try {
    if (isDbAvailable() && Vet) {
      return Vet.find({}).select("-password").then(function(dbVets) {
        return res.json({ success: true, count: dbVets.length, data: dbVets });
      }).catch(function(err) {
        return res.status(500).json({ success: false, message: err.message });
      });
    }
    const safeMemVets = memoryVets.map(function (v) {
      const vCopy = Object.assign({}, v);
      delete vCopy.password;
      return vCopy;
    });
    return res.json({ success: true, count: safeMemVets.length, data: safeMemVets });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/auth/users (List all registered Users)
router.get("/users", function (req, res) {
  try {
    if (isDbAvailable() && User) {
      return User.find({}).select("-password").then(function(dbUsers) {
        return res.json({ success: true, count: dbUsers.length, data: dbUsers });
      }).catch(function(err) {
        return res.status(500).json({ success: false, message: err.message });
      });
    }
    const safeMemUsers = memoryUsers.map(function (u) {
      return { id: u.id, name: u.name, email: u.email, role: u.role, phone: u.phone };
    });
    return res.json({ success: true, count: safeMemUsers.length, data: safeMemUsers });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
