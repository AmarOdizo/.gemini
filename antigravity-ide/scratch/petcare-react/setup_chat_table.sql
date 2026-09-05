-- Supabase SQL to create chat_messages table for Realtime Chat
-- You can run this in the Supabase Dashboard -> SQL Editor

CREATE TABLE IF NOT EXISTS public.chat_messages (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "conversationId" TEXT NOT NULL,
  "senderId" TEXT NOT NULL,
  "senderRole" TEXT NOT NULL,
  "receiverId" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "messageType" TEXT DEFAULT 'text',
  "readAt" TIMESTAMP WITH TIME ZONE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Set up Row Level Security (RLS) - Basic policy to allow all authenticated users for now
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all" ON "public"."chat_messages"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert for all" ON "public"."chat_messages"
AS PERMISSIVE FOR INSERT
TO public
WITH CHECK (true);
