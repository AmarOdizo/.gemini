# Revert Backend to MongoDB & Implement Supabase Chat/Notifications

We will revert the aggressive migration to Supabase that replaced the primary database, restoring MongoDB as the single source of truth for the application's core data. Supabase will be implemented strictly for real-time messaging and notifications.

## User Review Required
> [!WARNING]
> This plan involves rewriting the backend route files (`appointments.js`, `consultations.js`, `vets.js`, `pets.js`, etc.) to use the existing `mongoose` models, as the previous iteration replaced them with Supabase `.from()` queries.
> Please review the approach for real-time notifications: we will insert an automated "system" message into the Supabase chat messages table when an appointment is created so the Vet gets a real-time notification via Supabase Realtime without needing a separate `notifications` table.

## Open Questions
- Is there any backup of the original `mongoose` route files (e.g., in git or another directory), or should I rewrite the routes based on standard CRUD patterns using the existing Mongoose models? (I will assume rewrite if no backup is provided).

## Proposed Changes

### Database Setup & Backend Routes

- **Supabase Messages Table**
  - Create a new `chat_messages` table in Supabase via SQL with the schema: `id`, `conversationId`, `senderId`, `senderRole`, `receiverId`, `message`, `messageType`, `readAt`, `createdAt`.
  - Enable Row Level Security (RLS) and real-time on this table.
  
- **MongoDB API Reversion**
  - Update `server.js` to ensure `connectDB()` connects to MongoDB.
  - Rewrite all routes in `API/routes/` to use the Mongoose models in `API/models/` (e.g., `Appointment.find()`, `Consultation.create()`) instead of Supabase client.
  - The `API/routes/chat.js` will be the **only** route that uses the Supabase client to fetch/insert messages (though the frontend will primarily use the Supabase JS client for real-time).

### Frontend Updates (`petcare-react`)

- **Supabase Client Setup**
  - Create `src/supabaseClient.js` with proper environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). No service role key will be exposed.
  
- **Owner Dashboard & Appointments**
  - When an owner books an appointment, the frontend calls the MongoDB API to create the `Appointment`/`Consultation`. 
  - Upon success, the backend (or frontend) will insert a system notification message into the Supabase `chat_messages` table directed at the Vet.
  - Add a "Message" button in the consultations list to open the Live Chat.
  - Ensure the "Join Google Meet" button is disabled until the exact scheduled time.

- **Doctor/Vet Portal**
  - Vets will receive a real-time notification (via Supabase Realtime listener) when a new booking message is inserted.
  - The Doctor can accept the consultation, which updates the status in MongoDB.
  - Add functionality for the Vet to input and save the Google Meet link, updating the MongoDB consultation record.

- **Live Chat Component (`LiveChat.jsx`)**
  - Implement a complete chat interface using Supabase Realtime.
  - Messages will appear instantly without page refresh.
  - Map MongoDB IDs to `senderId`, `receiverId`, and use `consultationId` as `conversationId`.
  - Display read/unread status and timestamps.

## Verification Plan

### Automated/Manual Tests
- Start the backend and frontend servers.
- **Booking Flow**: Log in as Owner, book an appointment. Verify MongoDB creates the record.
- **Notification Flow**: Verify Vet receives a real-time notification/message via Supabase.
- **Acceptance Flow**: Vet accepts the booking, inputs a Google Meet link. Verify it saves to MongoDB.
- **Meeting Access**: Verify the Owner's Meet button remains disabled until the start time.
- **Live Chat**: Open the chat on both Owner and Vet sides, send messages, and verify real-time delivery and read receipts.
