const express = require("express");
const router = express.Router();
const ChatMessage = require("../models/ChatMessage");
const Consultation = require("../models/Consultation");
const connectDB = require("../config/db");

function isDbAvailable() {
  return connectDB.getStatus ? connectDB.getStatus() : false;
}

let memoryChatMessages = [];

// GET /api/chat
// For debugging purposes
router.get("/", async function (req, res) {
  try {
    if (isDbAvailable() && ChatMessage) {
      const messages = await ChatMessage.find({}).sort({ createdAt: -1 }).limit(50);
      return res.json({ success: true, count: messages.length, data: messages });
    }
    return res.json({ success: true, count: memoryChatMessages.length, data: memoryChatMessages });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/chat/:consultationId
router.get("/:consultationId", async function (req, res) {
  try {
    const { consultationId } = req.params;
    
    if (isDbAvailable() && ChatMessage && Consultation) {
      const consultation = await Consultation.findById(consultationId);
      if (!consultation) {
         return res.status(404).json({ success: false, message: "Consultation not found" });
      }

      const ownerId = consultation.ownerId;
      const vetId = consultation.vetId;

      const messages = await ChatMessage.find({
          $or: [
              { senderId: ownerId, receiverId: vetId },
              { senderId: vetId, receiverId: ownerId }
          ]
      }).populate('consultationId').sort({ createdAt: 1 });

      return res.json({
        success: true,
        count: messages.length,
        data: messages
      });
    }
    
    // In-memory fallback (best effort without full Consultation object)
    // We will just filter by consultationId for memory fallback because we might not have ownerId/vetId available in memory without a DB query.
    // However, if we must filter strictly by sender/receiver, we would need it. For memory, we fallback to consultationId.
    const memMsgs = memoryChatMessages.filter(m => m.consultationId === consultationId).sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
    return res.json({
      success: true,
      count: memMsgs.length,
      data: memMsgs,
      message: "DB not available, returning memory list."
    });
  } catch(err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/chat/seed
router.get("/seed/test", async function(req, res) {
  try {
    if (!isDbAvailable()) return res.json({ success: false, message: "DB not available." });
    
    const mongoose = require("mongoose");
    const testVetId = new mongoose.Types.ObjectId();
    const testPetId = new mongoose.Types.ObjectId();
    const testOwnerId = new mongoose.Types.ObjectId();
    
    await Consultation.deleteMany({ vetId: testVetId });
    
    const consultation = await Consultation.create({
        vetId: testVetId,
        vetName: "Dr. Ananya Sharma",
        vetSpecialization: "Bengaluru • Canine Vet",
        petId: testPetId,
        petName: "Sheru",
        petSpecies: "Canine",
        petBreed: "Indian Pariah",
        petAge: "3 years",
        petWeight: "22 kg",
        petSex: "Male",
        ownerId: testOwnerId,
        ownerName: "Ananya Sharma",
        ownerPhone: "+91 98765 43210",
        date: "2026-09-03",
        time: "10:00 AM",
        consultationType: "Virtual Telehealth Call",
        reasonForVisit: "Lethargy and decreased appetite over last 48 hours.",
        fee: 499,
        status: "upcoming",
        clinicalNotes: {
            symptoms: ["Lethargy", "Decreased Appetite"],
            tentativeDiagnosis: "Mild Dietary Indiscretion / Gastroenteritis",
            notes: "Luna presented with 48h history of lethargy and mild anorexia. On video examination, gums are pink with normal CRT (<2s). Abdomen appears non-painful on owner palpation. Recommending 3-day bland diet and probiotics.",
            prescriptionPlan: [
                { item: "Veterinary Probiotic Paste", dosage: "15ml syringe - 2ml SID x 5 days" },
                { item: "Canine Bland Diet Cans", dosage: "6 cans - Feed 2 cans daily for 3 days" }
            ]
        }
    });

    const consultationId = consultation._id.toString();
    await ChatMessage.deleteMany({ consultationId });

    await ChatMessage.create([
        {
            consultationId: consultationId,
            senderId: testOwnerId,
            receiverId: testVetId,
            senderName: "Ananya Sharma",
            senderRole: "owner",
            message: "Namaste Dr. Ananya, Sheru hasn't been eating much since yesterday morning and seems low on energy.",
            createdAt: new Date(Date.now() - 5 * 60000)
        },
        {
            consultationId: consultationId,
            senderId: testVetId,
            receiverId: testOwnerId,
            senderName: "Dr. Ananya Sharma",
            senderRole: "vet",
            message: "Namaste Ananya ji. I'm sorry to hear that. Has Sheru had any fever, vomiting, or change in water drinking?",
            createdAt: new Date(Date.now() - 4 * 60000)
        },
        {
            consultationId: consultationId,
            senderId: testOwnerId,
            receiverId: testVetId,
            senderName: "Ananya Sharma",
            senderRole: "owner",
            message: "No vomiting, but she did have one slightly loose stool last night. I took a picture just in case.",
            attachmentName: "luna_photo.jpg",
            createdAt: new Date(Date.now() - 1 * 60000)
        }
    ]);
    
    return res.json({ success: true, consultationId });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/chat/:consultationId
router.post("/:consultationId", async function (req, res) {
  try {
    const { consultationId } = req.params;
    let body = { ...req.body, consultationId };

    // Auto-select receiverId
    if (isDbAvailable() && Consultation) {
      const consultation = await Consultation.findById(consultationId);
      if (consultation) {
        if (body.senderRole === 'vet') {
          body.receiverId = consultation.ownerId;
        } else if (body.senderRole === 'owner') {
          body.receiverId = consultation.vetId;
        }
      }
    }
    
    if (isDbAvailable() && ChatMessage) {
      const newMessage = await ChatMessage.create(body);
      return res.status(201).json({ success: true, data: newMessage });
    }
    
    // In-memory fallback
    const newMessage = { _id: "msg_" + Date.now(), ...body, createdAt: new Date() };
    memoryChatMessages.push(newMessage);
    return res.status(201).json({ success: true, data: newMessage, message: "Created in memory only" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
