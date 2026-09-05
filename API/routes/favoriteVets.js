const express = require("express");
const router = express.Router();
const FavoriteVet = require("../models/FavoriteVet");
const connectDB = require("../config/db");

// In-memory array for fallback
let memoryFavorites = [];

function isDbAvailable() {
  return connectDB.getStatus ? connectDB.getStatus() : false;
}

// GET /api/favorites?ownerId=...
router.get("/", async (req, res) => {
  try {
    const ownerId = req.query.ownerId;
    if (!ownerId) {
      return res.status(400).json({ success: false, message: "ownerId query parameter is required" });
    }

    if (isDbAvailable() && FavoriteVet) {
      const favorites = await FavoriteVet.find({ ownerId });
      return res.json({ success: true, data: favorites });
    }

    const favorites = memoryFavorites.filter(f => f.ownerId === ownerId);
    return res.json({ success: true, data: favorites });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/favorites
router.post("/", async (req, res) => {
  try {
    const { ownerId, vetId, favoriteProfileImage } = req.body;
    if (!ownerId || !vetId) {
      return res.status(400).json({ success: false, message: "ownerId and vetId are required" });
    }

    if (isDbAvailable() && FavoriteVet) {
      let favorite = await FavoriteVet.findOne({ ownerId, vetId });
      if (favorite) {
        favorite.favoriteProfileImage = favoriteProfileImage || favorite.favoriteProfileImage;
        await favorite.save();
      } else {
        favorite = await FavoriteVet.create({ ownerId, vetId, favoriteProfileImage });
      }
      return res.status(201).json({ success: true, data: favorite });
    }

    let favorite = memoryFavorites.find(f => f.ownerId === ownerId && f.vetId === vetId);
    if (favorite) {
      favorite.favoriteProfileImage = favoriteProfileImage || favorite.favoriteProfileImage;
    } else {
      favorite = { id: String(Date.now()), ownerId, vetId, favoriteProfileImage, createdAt: new Date() };
      memoryFavorites.push(favorite);
    }
    return res.status(201).json({ success: true, data: favorite });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/favorites
router.delete("/", async (req, res) => {
  try {
    const { ownerId, vetId } = req.body;
    if (!ownerId || !vetId) {
      return res.status(400).json({ success: false, message: "ownerId and vetId are required" });
    }

    if (isDbAvailable() && FavoriteVet) {
      await FavoriteVet.findOneAndDelete({ ownerId, vetId });
      return res.json({ success: true, message: "Favorite removed" });
    }

    memoryFavorites = memoryFavorites.filter(f => !(f.ownerId === ownerId && f.vetId === vetId));
    return res.json({ success: true, message: "Favorite removed" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
