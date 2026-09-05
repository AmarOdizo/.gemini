# Implementation Plan: Supabase Migration

This plan details how we will migrate the existing Express/Mongoose backend to use **Supabase (PostgreSQL)** for database operations, ensuring the React frontend remains **completely unchanged** (no UI, component, or routing changes).

## User Review Required

> [!IMPORTANT]
> **Action Required**: Since I cannot execute DDL commands to create tables in your Supabase project (the Anon key does not have this privilege), **you will need to run a SQL script** in your Supabase dashboard's SQL editor to create the necessary tables before I can start writing the code. 
> I have provided the script in the **Open Questions / Prerequisites** section below.

## Open Questions / Prerequisites

**1. Create Tables in Supabase:**
Please copy the following SQL and execute it in your [Supabase SQL Editor](https://supabase.com/dashboard/project/mdlkjdnxgansppoklehv/sql/new):

```sql
-- Users Table
CREATE TABLE users (
  _id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'owner',
  phone TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vets Table
CREATE TABLE vets (
  _id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  "vciNumber" TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'doctor',
  qualification TEXT,
  university TEXT,
  specialization TEXT[],
  "clinicName" TEXT,
  city TEXT,
  "clinicAddress" TEXT,
  phone TEXT,
  "consultationFee" NUMERIC,
  "clinicPhone" TEXT,
  about TEXT,
  "experienceYears" INTEGER,
  "photoUrl" TEXT,
  "licenseCertUrl" TEXT,
  "isVerified" BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'active',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pets Table
CREATE TABLE pets (
  _id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "ownerId" TEXT NOT NULL,
  name TEXT NOT NULL,
  species TEXT,
  breed TEXT,
  age TEXT,
  weight TEXT,
  gender TEXT,
  "medicalHistory" TEXT[],
  "photoUrl" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments Table
CREATE TABLE appointments (
  _id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "vetId" TEXT NOT NULL,
  "vetName" TEXT,
  "petId" TEXT,
  "ownerId" TEXT,
  "ownerName" TEXT NOT NULL,
  "petName" TEXT NOT NULL,
  "petSpecies" TEXT,
  "petWeight" TEXT,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  duration TEXT DEFAULT '30 Min Telehealth',
  reason TEXT NOT NULL,
  "consultationType" TEXT DEFAULT 'Virtual Telehealth Call',
  status TEXT DEFAULT 'pending',
  "meetLink" TEXT,
  notes TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consultations Table
CREATE TABLE consultations (
  _id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "vetId" TEXT NOT NULL,
  "vetName" TEXT,
  "appointmentId" TEXT,
  "petId" TEXT,
  "ownerId" TEXT,
  "ownerName" TEXT NOT NULL,
  "petName" TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  "consultationType" TEXT DEFAULT 'Virtual Telehealth Call',
  fee NUMERIC DEFAULT 499,
  status TEXT DEFAULT 'pending',
  "meetLink" TEXT,
  "vetSpecialization" TEXT,
  "petSpecies" TEXT,
  "petBreed" TEXT,
  "petAge" TEXT,
  "petWeight" TEXT,
  "petSex" TEXT,
  "ownerPhone" TEXT,
  "reasonForVisit" TEXT,
  "clinicalNotes" JSONB,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prescriptions Table
CREATE TABLE prescriptions (
  _id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "vetId" TEXT NOT NULL,
  "appointmentId" TEXT,
  "consultationId" TEXT,
  "patientName" TEXT NOT NULL,
  diagnosis TEXT,
  medications JSONB,
  instructions TEXT,
  "followUpDate" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Messages Table
CREATE TABLE chat_messages (
  _id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "consultationId" TEXT NOT NULL,
  "senderId" TEXT NOT NULL,
  "receiverId" TEXT,
  "senderName" TEXT,
  "senderRole" TEXT,
  "senderModel" TEXT,
  message TEXT,
  text TEXT,
  "attachmentUrl" TEXT,
  "attachmentName" TEXT,
  "isRead" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Favorite Vets Table
CREATE TABLE favorite_vets (
  _id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "ownerId" TEXT NOT NULL,
  "vetId" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE("ownerId", "vetId")
);
```

**2. Proceed with Code Changes?**
If you have created the tables in Supabase using the script above, click **Proceed** so I can begin rewriting the Express API to use Supabase.

## Proposed Changes

### Setup & Configuration
- **[MODIFY]** `API/package.json` - Install `@supabase/supabase-js`.
- **[MODIFY]** `API/.env` - Add `SUPABASE_URL` and `SUPABASE_KEY` (Publishable/Anon key).
- **[NEW]** `API/config/supabase.js` - Create a reusable singleton Supabase client.

### Backend Routes Migration
We will replace all Mongoose queries (`.find`, `.create`, `.findByIdAndUpdate`, etc.) with equivalent `@supabase/supabase-js` queries (`.select`, `.insert`, `.update`) in the following files:

- **[MODIFY]** `API/routes/authRoutes.js` (User & Vet Auth)
- **[MODIFY]** `API/routes/petRoutes.js` (Pet CRUD)
- **[MODIFY]** `API/routes/vets.js` (Vet Listing/Profiles)
- **[MODIFY]** `API/routes/appointments.js` (Appointment Scheduling)
- **[MODIFY]** `API/routes/consultations.js` (Consultation logic)
- **[MODIFY]** `API/routes/chat.js` (Live Chat messages)
- **[MODIFY]** `API/routes/prescriptions.js` (Prescription CRUD)
- **[MODIFY]** `API/routes/favoriteVets.js` (Favorites)

*Note: The frontend expects MongoDB's `_id` field. To keep the UI and frontend completely unchanged, the Supabase schema explicitly names the primary key `_id` so the JSON response shapes remain 100% identical.*

## Verification Plan
1. **Startup Check**: Restart the API server and ensure no Mongoose/MongoDB connection errors disrupt the service.
2. **End-to-End Test**:
   - Register a new Owner and Veterinarian.
   - Book an appointment and verify it saves to Supabase.
   - Accept the appointment from the Vet profile (save Google Meet link).
   - Exchange chat messages.
3. Verify via Supabase Dashboard that tables are populated correctly without duplicate data.
