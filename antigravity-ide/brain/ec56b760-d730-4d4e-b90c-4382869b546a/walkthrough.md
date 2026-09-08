# 📹 WebRTC Video Calling Implemented!

The 1-to-1 Native WebRTC video calling feature has been fully implemented on the frontend. 

As requested, **MongoDB** is designed to act as the main database for tracking the video call records and statuses, while the **existing Supabase Realtime** is securely used exclusively for WebRTC signaling (exchanging Offers, Answers, and ICE candidates) without sending any actual media data through Supabase.

> [!WARNING]
> **Manual Backend Implementation Required**
> Since the backend codebase (Express/MongoDB) is not present in your local workspace, the API calls from the frontend to `odizopetcare.onrender.com` will currently fail with a 404 error.
> 
> **You must copy-paste the backend code provided at the bottom of this document into your Express backend repository.**

---

## 🖥️ Frontend Overview

### New UI Components
1. **VideoCall Wrapper**: The main container for the consultation room. Handles the dynamic state of the connection and overlays.
2. **LocalVideo (PiP)**: A sleek Picture-in-Picture display for your own camera view in the corner of the screen.
3. **RemoteVideo**: Full-screen video display for the other participant. Includes loading skeletons while connecting.
4. **VideoControls**: A floating action bar that lets you mute, turn off the camera, and end the call securely.
5. **CallTimer**: Displays how long the consultation has been active.

### Dashboards Integrated
- **Doctor Dashboard**: Now features a **Start Video Call** button alongside "Text Consult". It creates the MongoDB record, opens the camera, and waits for the patient.
- **Owner Dashboard (Appointments)**: The **Join Call** button will now redirect to the new `/owner-dashboard/video-call` route.

### Architecture Security
- **Native WebRTC (P2P)**: The video and audio streams are sent directly from peer to peer using Google's public STUN servers for NAT traversal.
- **Supabase Signaling**: The `WebRTCManager` (`src/services/webrtc.js`) subscribes to a specific channel `video-call-{callId}` to exchange signaling tokens. Supabase has zero access to the video data.

---

## 🛠️ Required Backend Code

Please copy the following code into your backend server codebase.

### 1. The MongoDB Model (`server/models/VideoCall.js`)
Create a new file in your backend's `models` directory:

```javascript
const mongoose = require('mongoose');

const videoCallSchema = new mongoose.Schema({
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
  doctorId: { type: String, required: true }, // Using String to match your current system if using _id or string ID
  doctorName: { type: String },
  ownerId: { type: String, required: true },
  ownerName: { type: String },
  patientId: { type: String },
  patientName: { type: String },
  status: { 
    type: String, 
    enum: ['waiting', 'active', 'ended', 'failed'], 
    default: 'waiting' 
  },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('VideoCall', videoCallSchema);
```

### 2. The API Routes (`server/routes/videoCallRoutes.js`)
Create a new file in your backend's `routes` directory:

```javascript
const express = require('express');
const router = express.Router();
const VideoCall = require('../models/VideoCall');
// Import your auth middleware (adjust the path to match your structure)
// const { protect } = require('../middleware/authMiddleware');

// 1. Doctor creates a video call
router.post('/', async (req, res) => {
  try {
    const { appointmentId, doctorId, doctorName, ownerId, ownerName, patientId, patientName } = req.body;
    
    // Optional: check if one already exists and is active
    let existing = await VideoCall.findOne({ appointmentId, status: { $in: ['waiting', 'active'] } });
    if (existing) {
      return res.status(200).json({ success: true, videoCall: existing });
    }

    const newCall = await VideoCall.create({
      appointmentId, doctorId, doctorName, ownerId, ownerName, patientId, patientName, status: 'waiting'
    });

    res.status(201).json({ success: true, videoCall: newCall });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. Fetch specific call
router.get('/:id', async (req, res) => {
  try {
    const call = await VideoCall.findById(req.params.id);
    if (!call) return res.status(404).json({ message: "Call not found" });
    res.json(call);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. Get call by Appointment ID
router.get('/appointment/:appointmentId', async (req, res) => {
  try {
    const calls = await VideoCall.find({ appointmentId: req.params.appointmentId }).sort({ createdAt: -1 });
    res.json({ success: true, data: calls });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 4. Update call status (e.g., active)
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const call = await VideoCall.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json({ success: true, call });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 5. End the call
router.post('/:id/end', async (req, res) => {
  try {
    const call = await VideoCall.findByIdAndUpdate(req.params.id, { 
      status: 'ended', 
      endedAt: new Date() 
    }, { new: true });
    res.json({ success: true, call });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
```

### 3. Add to `server.js` (or `app.js`)
Finally, import and use the routes in your main Express server file:

```javascript
// Import the routes
const videoCallRoutes = require('./routes/videoCallRoutes');

// Mount the routes (below your other routes)
app.use('/api/video-calls', videoCallRoutes);
```
