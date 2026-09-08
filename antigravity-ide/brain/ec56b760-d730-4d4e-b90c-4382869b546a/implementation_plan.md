# 📹 Implementation Plan: WebRTC Video Calling

This plan details the implementation of a 1-to-1 WebRTC video calling feature for Doctors and Pet Owners, strictly adhering to the requirements of using MongoDB for call tracking and Supabase Realtime *only* for WebRTC signaling.

> [!WARNING]
> **Missing Backend Repository**
> I have thoroughly searched the current workspace (`scratch/petcare-react`), and it **only contains the frontend code**. Your Express backend (currently deployed at `https://odizopetcare.onrender.com`) is not present in this local workspace.
> 
> Therefore, I cannot directly implement the MongoDB models or API endpoints. I will provide the **exact backend code** for you to copy-paste into your backend repository, but I will fully implement the frontend architecture here.

## User Review Required

Please review the missing backend repository warning above. If you want me to write the backend code directly, you will need to clone your backend repository into the `scratch` folder and provide me the path. Otherwise, I will provide the backend code in a document for you to add manually.

## Proposed Changes

### 1. Backend Implementation (Manual Addition Required)
I will provide the code for:
- `server/models/VideoCall.js`: The Mongoose schema storing `appointmentId`, `doctorId`, `ownerId`, `patientId`, `status`, `startedAt`, `endedAt`.
- `server/routes/videoCallRoutes.js`: APIs to create, fetch, update status, and end calls.
- Instructions on integrating this into your `server.js` or `app.js`.

---

### 2. Frontend: Services & Signaling
#### [NEW] `src/services/videoCallApi.js`
- Functions to interact with the new MongoDB video call APIs (`createCall`, `getCall`, `getCallByAppointment`, `updateCallStatus`, `endCall`).
- Uses existing `userToken` from `localStorage`.

#### [NEW] `src/services/webrtc.js`
- Core WebRTC logic using `navigator.mediaDevices.getUserMedia()`.
- Uses `RTCPeerConnection` with the Google STUN server (`stun:stun.l.google.com:19302`).
- Uses `supabase.channel('video-call-{callId}')` strictly for signaling (`offer`, `answer`, `ice-candidate`).
- Completely isolated from the existing chat messaging logic in `LiveChat.jsx`.

---

### 3. Frontend: Video Call UI Components
#### [NEW] `src/components/video-call/LocalVideo.jsx` & `RemoteVideo.jsx`
- Reusable React components to display media streams, utilizing existing Tailwind design tokens.

#### [NEW] `src/components/video-call/VideoControls.jsx`
- Buttons for: Mute/Unmute audio track, Camera On/Off video track, and End Call.

#### [NEW] `src/components/video-call/CallTimer.jsx`
- Displays the active duration of the call.

#### [NEW] `src/components/video-call/VideoCall.jsx`
- The main UI wrapper that integrates the above components and handles the signaling workflow.

---

### 4. Frontend: Pages and Routing
#### [NEW] `src/pages/doctor/VideoCall.jsx`
- The Doctor's entry point. Initializes the call, creates the MongoDB record, generates the WebRTC offer, and waits for the patient.

#### [NEW] `src/pages/owner/VideoCall.jsx`
- The Owner's entry point. Joins the call, receives the offer, generates the answer, and connects the stream.

#### [MODIFY] `src/App.jsx`
- Register the two new routes:
  - `/doctor-dashboard/video-call/:appointmentId`
  - `/owner-dashboard/video-call/:appointmentId`

---

### 5. Frontend: Integration into Existing Workflows
#### [MODIFY] `src/pages/DoctorDashboard.jsx` (and/or `VetAppointments.jsx`)
- Add a "Start Video Call" button to upcoming appointments.
- Clicking the button verifies ownership and redirects to `/doctor-dashboard/video-call/:appointmentId`.

#### [MODIFY] `src/pages/Appointments.jsx` (Owner Dashboard)
- Add a "Join Video Call" button.
- The button will query the backend API (`/api/video-calls/appointment/:id`) to check if a call is `waiting` or `active`. If so, it allows the owner to join.

## Verification Plan
### Manual Verification
1. Open the Doctor Dashboard in one browser and the Owner Dashboard in another.
2. The Doctor clicks "Start Video Call". Ensure the camera activates and the UI shows "Waiting for patient".
3. The Owner clicks "Join Video Call". Ensure the camera activates and the two WebRTC streams connect.
4. Verify Mute and Camera Off controls work.
5. Verify clicking "End Call" terminates the streams, updates the DB status, and redirects both users.
6. Verify the existing text messaging (Supabase) is completely unaffected.
