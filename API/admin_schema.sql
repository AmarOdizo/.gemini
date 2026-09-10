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
