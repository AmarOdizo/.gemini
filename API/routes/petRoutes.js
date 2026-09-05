const express = require("express");
const router = express.Router();
const Pet = require("../models/Pet");
const connectDB = require("../config/db");
const imagekit = require("../config/imagekit");

// Dynamic runtime storage collection for pets (starts empty, only user registered pets exist)
let memoryPets = [];

function isDbAvailable() {
  return connectDB.getStatus ? connectDB.getStatus() : false;
}

// Middleware: Verify Owner Authorization
function verifyOwnerAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "").trim() || req.query.token;

  if (!token || token.startsWith("vet_token_")) {
    return res.status(403).json({
      success: false,
      message: "Forbidden. Owner authorization token required."
    });
  }
  next();
}

// GET /api/pets - Get all pets from 'pets' collection table
router.get("/", function (req, res) {
  try {
    if (isDbAvailable() && Pet) {
      const query = {};
      if (req.query.type) query.type = new RegExp(req.query.type, "i");
      if (req.query.ownerEmail) query.ownerEmail = req.query.ownerEmail;
      if (req.query.ownerPhone) query.ownerPhone = req.query.ownerPhone;
      if (req.query.status) query.status = req.query.status;
      if (req.query.ownerId) query.ownerId = req.query.ownerId;

      return Pet.find(query).populate('ownerId').sort({ createdAt: -1 }).then(function(dbPets) {
        return res.json({
          success: true,
          count: dbPets.length,
          collection: "pets",
          data: dbPets
        });
      }).catch(function(err) {
        return res.status(500).json({ success: false, message: err.message });
      });
    }

    let filtered = memoryPets;
    if (req.query.type) {
      filtered = filtered.filter(function(p) { return p.type && p.type.toLowerCase().includes(req.query.type.toLowerCase()); });
    }
    if (req.query.ownerEmail) {
      filtered = filtered.filter(function(p) { return p.ownerEmail && p.ownerEmail.toLowerCase() === req.query.ownerEmail.toLowerCase(); });
    }
    if (req.query.status) {
      filtered = filtered.filter(function(p) { return p.status === req.query.status; });
    }
    if (req.query.ownerId) {
      filtered = filtered.filter(function(p) { return p.ownerId === req.query.ownerId; });
    }

    return res.json({
      success: true,
      count: filtered.length,
      collection: "pets",
      data: filtered
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/pets/:id - Get single pet by ID from 'pets' collection table
router.get("/:id", function (req, res) {
  try {
    const idParam = req.params.id;

    if (isDbAvailable() && Pet) {
      return Pet.findById(idParam).populate('ownerId').then(function(dbPet) {
        if (dbPet) return res.json({ success: true, data: dbPet });

        const memPet = memoryPets.find(function(p) { return String(p._id) === String(idParam) || String(p.id) === String(idParam); });
        if (!memPet) return res.status(404).json({ success: false, message: "Pet record not found." });
        return res.json({ success: true, data: memPet });
      }).catch(function() {
        const memPet = memoryPets.find(function(p) { return String(p._id) === String(idParam) || String(p.id) === String(idParam); });
        if (!memPet) return res.status(404).json({ success: false, message: "Pet record not found." });
        return res.json({ success: true, data: memPet });
      });
    }

    const memPet = memoryPets.find(function(p) { return String(p._id) === String(idParam) || String(p.id) === String(idParam); });
    if (!memPet) return res.status(404).json({ success: false, message: "Pet record not found." });
    return res.json({ success: true, data: memPet });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/pets - Register new pet into 'pets' collection table
router.post("/", verifyOwnerAuth, function (req, res) {
  try {
    const body = req.body || {};
    if (!body.name || !body.type) {
      return res.status(400).json({ success: false, message: "Pet Name and Type (Dog/Cat/Bird etc.) are required." });
    }

    const newPet = {
      name: body.name,
      type: body.type,
      breed: body.breed || "Crossbreed",
      gender: body.gender || "Male",
      age: Number(body.age) || 1,
      ageUnit: body.ageUnit || "Years",
      color: body.color || "Standard",
      weight: Number(body.weight) || 5,
      weightUnit: body.weightUnit || "kg",
      image: body.image || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&auto=format&fit=crop",
      description: body.description || "Registered pet patient.",
      vaccinated: body.vaccinated === true || body.vaccinated === "true",
      vaccinationDate: body.vaccinationDate || new Date().toISOString().split("T")[0],
      healthStatus: body.healthStatus || "Healthy",
      ownerName: body.ownerName || "Pet Parent",
      ownerPhone: body.ownerPhone || "+91 98765 43210",
      ownerEmail: body.ownerEmail || "parent@example.com",
      ownerId: body.ownerId || "",
      address: body.address || "Bengaluru",
      status: "Available",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isDbAvailable() && Pet) {
      return Pet.create(newPet).then(function(dbPet) {
        return res.status(201).json({
          success: true,
          message: "Pet Registered Successfully in 'pets' collection table!",
          data: dbPet
        });
      }).catch(function(err) {
        return res.status(500).json({ success: false, message: err.message });
      });
    }

    newPet._id = "pet_" + Date.now();
    newPet.id = memoryPets.length + 101;
    memoryPets.push(newPet);

    return res.status(201).json({
      success: true,
      message: "Pet Registered Successfully in 'pets' collection table! (Memory mode)",
      data: newPet
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/pets/:id - Update pet record in 'pets' collection table
router.put("/:id", verifyOwnerAuth, function (req, res) {
  try {
    const idParam = req.params.id;
    const body = req.body || {};
    body.updatedAt = new Date().toISOString();

    if (isDbAvailable() && Pet) {
      return Pet.findByIdAndUpdate(idParam, body, { new: true }).then(function(updatedPet) {
        if (updatedPet) return res.json({ success: true, message: "Pet updated successfully!", data: updatedPet });
        return res.status(404).json({ success: false, message: "Pet record not found." });
      });
    }

    const index = memoryPets.findIndex(function(p) { return String(p._id) === String(idParam) || String(p.id) === String(idParam); });
    if (index === -1) return res.status(404).json({ success: false, message: "Pet record not found." });

    memoryPets[index] = Object.assign({}, memoryPets[index], body);
    return res.json({ success: true, message: "Pet updated successfully!", data: memoryPets[index] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/pets/:id - Delete pet record from 'pets' collection table
router.delete("/:id", verifyOwnerAuth, function (req, res) {
  try {
    const idParam = req.params.id;

    if (isDbAvailable() && Pet) {
      return Pet.findByIdAndDelete(idParam).then(function(deletedPet) {
        if (deletedPet) return res.json({ success: true, message: "Pet deleted from 'pets' collection table!" });
        return res.status(404).json({ success: false, message: "Pet record not found." });
      });
    }

    const initLen = memoryPets.length;
    memoryPets = memoryPets.filter(function(p) { return String(p._id) !== String(idParam) && String(p.id) !== String(idParam); });

    if (memoryPets.length === initLen) return res.status(404).json({ success: false, message: "Pet record not found." });
    return res.json({ success: true, message: "Pet deleted successfully!" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
