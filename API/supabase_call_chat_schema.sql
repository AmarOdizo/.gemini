-- ==============================================================================
-- PetCare Call & Chat Schema (PostgreSQL / Supabase)
-- NOTE: All other data (Users, Pets, Vets, Appointments, Prescriptions, 
--       Advisories, Reports, Settings) is stored in MongoDB!
--       PostgreSQL is used EXCLUSIVELY for Realtime Video Calling & Chat.
-- ==============================================================================

-- 1. Live Chat Messages Table (Realtime Chat between Owner & Doctor)
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "conversationId" VARCHAR(255) NOT NULL, -- Corresponds to consultationId / appointmentId
    "senderId" VARCHAR(255) NOT NULL,
    "senderName" VARCHAR(255) NOT NULL,
    "senderRole" VARCHAR(50) NOT NULL, -- 'owner', 'vet', 'doctor', 'admin'
    message TEXT NOT NULL,
    "attachmentUrl" TEXT,
    "isRead" BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Index for instant chat lookup per consultation/room
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON public.chat_messages("conversationId", "createdAt");

-- 2. Video Call Sessions & WebRTC Signaling Logs
CREATE TABLE IF NOT EXISTS public.video_calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "appointmentId" VARCHAR(255) NOT NULL,
    "roomName" VARCHAR(255) NOT NULL, -- e.g. 'video-call-APT-1092'
    "doctorId" VARCHAR(255) NOT NULL,
    "doctorName" VARCHAR(255),
    "ownerId" VARCHAR(255) NOT NULL,
    "ownerName" VARCHAR(255),
    "patientName" VARCHAR(255),
    status VARCHAR(50) DEFAULT 'waiting', -- 'waiting', 'active', 'ended', 'rejected'
    "startedAt" TIMESTAMPTZ DEFAULT NOW(),
    "endedAt" TIMESTAMPTZ,
    "durationSeconds" INT DEFAULT 0,
    "recordingUrl" TEXT
);

CREATE INDEX IF NOT EXISTS idx_video_calls_appointment ON public.video_calls("appointmentId");

-- 3. Realtime Call & Chat Push Notifications
CREATE TABLE IF NOT EXISTS public.realtime_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "recipientId" VARCHAR(255) NOT NULL, -- Doctor or Owner ID
    type VARCHAR(50) NOT NULL, -- 'incoming_call', 'chat_message', 'call_ended'
    "sessionId" VARCHAR(255),
    payload JSONB DEFAULT '{}'::jsonb,
    "isDelivered" BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_realtime_notifications_recipient ON public.realtime_notifications("recipientId");

-- 4. Enable Supabase Realtime Publication for Live Calling & Chatting
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.video_calls;
ALTER PUBLICATION supabase_realtime ADD TABLE public.realtime_notifications;

-- 5. Row Level Security (RLS) & Access Policies
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.realtime_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to chat messages" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Allow public insert to chat messages" ON public.chat_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to video calls" ON public.video_calls FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update to video calls" ON public.video_calls FOR ALL USING (true);

CREATE POLICY "Allow public access to realtime notifications" ON public.realtime_notifications FOR ALL USING (true);

-- 6. Demo Seed Data for Live Video Calling & Chat Testing
INSERT INTO public.video_calls ("appointmentId", "roomName", "doctorId", "doctorName", "ownerId", "ownerName", "patientName", status, "durationSeconds")
VALUES 
  ('APT-1092', 'video-call-APT-1092', 'VET-003', 'Dr. Marcus Sterling', 'OWN-101', 'Eleanor Vance', 'Barnaby', 'active', 872),
  ('APT-1094', 'video-call-APT-1094', 'VET-005', 'Dr. Neil Roberts', 'OWN-103', 'Sophia Chen', 'Rory', 'active', 430)
ON CONFLICT DO NOTHING;

INSERT INTO public.chat_messages ("conversationId", "senderId", "senderName", "senderRole", message)
VALUES
  ('APT-1092', 'VET-003', 'Dr. Marcus Sterling', 'doctor', 'Hello Eleanor, I can see Barnaby moving around. How is his appetite this morning?'),
  ('APT-1092', 'OWN-101', 'Eleanor Vance', 'owner', 'He drank about a bowl of water and had some boiled chicken, doctor!'),
  ('APT-1092', 'VET-003', 'Dr. Marcus Sterling', 'doctor', 'That is great news. Keep monitoring his hydration and incision site.'),
  ('APT-1094', 'OWN-103', 'Sophia Chen', 'owner', 'Doctor Neil, Rory is panting heavily and his gums look slightly pale!'),
  ('APT-1094', 'VET-005', 'Dr. Neil Roberts', 'doctor', 'Keep him upright and cool immediately. I am escalating this to Emergency Priority 1.')
ON CONFLICT DO NOTHING;

