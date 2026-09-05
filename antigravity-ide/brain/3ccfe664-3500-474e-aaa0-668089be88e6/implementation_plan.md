# Comprehensive Backend & Frontend Integration Plan

This plan details the massive architectural undertaking to connect all existing frontend HTML files to the backend API, remove all mock/static data, update schemas, and populate realistic database records.

## User Review Required
> [!IMPORTANT]
> This is a comprehensive overhaul touching nearly every frontend file and backend model. Please review the proposed models and data flows to ensure they meet your expectations before I begin execution.

## Proposed Changes

---

### Phase 1: Authentication & User/Vet Models
**Goal:** Ensure login/registration flows are fully driven by the backend `User` and `Vet` models, removing hardcoded credentials.

#### Backend
- **Models**: Validate `User.js` and `Vet.js` to ensure they have all required fields (e.g., Vet specialization, clinic name, experience, availability schedule).
- **Routes**: Validate `authRoutes.js` and `vets.js` registration endpoints.
#### Frontend
- **[MODIFY] `login.html` & `register.html`**: Connect to `/api/auth/login` and `/api/auth/register`. Remove any static demo logic.
- **[MODIFY] `vet-login.html` & `vet-register.html`**: Connect to `/api/vets/login` and `/api/vets/register`.

---

### Phase 2: Pets Collection
**Goal:** Full CRUD for Pet profiles, connected to their respective Owners.

#### Backend
- **Models**: `Pet.js` schema check (species, breed, age, weight, ownerId reference).
- **Routes**: `petRoutes.js` for `GET /api/pets?ownerId=...`, `POST /api/pets`, `PUT`, `DELETE`.
#### Frontend
- **[MODIFY] `my-pets.html`**: Completely replace the hardcoded UI list with a `fetch()` call. Connect the "Add Pet" modal form to `POST /api/pets`.
- **[MODIFY] `owner-dashboard.html`**: Update the "My Pets" widget to fetch directly from the DB without local state fallbacks.

---

### Phase 3: Consultations, Appointments & Telehealth
**Goal:** Centralize all bookings around the `Consultation` model (already mostly done, but needs application to remaining pages).

#### Backend
- **Routes**: `consultations.js`. Create an endpoint for Vet metrics (total patients, revenue, upcoming vs completed appointments).
#### Frontend
- **[MODIFY] `owner-dashboard.html`**: Fetch the "Next Upcoming Appointment" widget from `/api/consultations`.
- **[MODIFY] `doctor-dashboard.html`**: Remove static metrics. Fetch today's appointments and metric summaries from the API.
- **[MODIFY] `vet-appointments.html`**: Replace the static tables with dynamic data from `/api/consultations?vetId=...`.
- **[MODIFY] `vet-telehealth-room.html`**: Connect to the specific Consultation ID to show real patient data instead of hardcoded details.

---

### Phase 4: Prescriptions
**Goal:** Decouple prescriptions into a structured collection (or enhance existing schemas) for proper generation and retrieval.

#### Backend
- **Models**: `Prescription.js` (ref: consultationId, vetId, petId, medications array, instructions).
- **Routes**: `prescriptions.js` `POST /` and `GET /`.
#### Frontend
- **[MODIFY] `create-prescription.html`**: Connect the form to POST to the Prescription API. Populate the patient/doctor dropdowns or fields from DB data.
- **[MODIFY] `prescription.html`**: Fetch the generated prescription by ID and render the medical Rx UI. Remove static demo prescriptions.

---

### Phase 5: Vet Availability & Earnings
**Goal:** Implement scheduling and financial tracking for Doctors.

#### Backend
- **Models**: Update `Vet.js` to handle `availability` (days, time slots). Create an earnings aggregation endpoint (`GET /api/vets/:id/earnings`) that sums up `Consultation.fee` where status is 'completed'.
#### Frontend
- **[MODIFY] `vet-availability.html`**: Fetch and update the Vet's schedule dynamically via API.
- **[MODIFY] `vet-earnings.html`**: Fetch aggregated financial data and render the charts/tables using real Consultation history.

---

### Phase 6: Global Directory & Profiles
**Goal:** Ensure directories pull live DB data.

#### Frontend
- **[MODIFY] `find-vets.html`**: Remove any static placeholder cards; ensure it relies entirely on `/api/vets`.
- **[MODIFY] `doctor-profile.html`**: (Ensure parity with `vet-profile.html` or merge functionality if redundant). Fetch from API.

---

### Phase 7: Comprehensive Database Seeding
**Goal:** Provide a robust, realistic dataset for testing.

#### Backend
- **[NEW] `seed_full_database.js`**: Create a script that wipes the DB and inserts realistic:
  - 3+ Users (Owners)
  - 3+ Vets with detailed profiles
  - 10+ Pets distributed among owners
  - 15+ Consultations (Past, Upcoming, In-Progress)
  - 20+ Chat Messages
  - 5+ Prescriptions
  This will ensure all tables, charts, and lists instantly look "alive" upon login.

---

## Verification Plan

### Automated/Backend Verification
- Run `node seed_full_database.js` and verify it populates all collections without error.
- Use `curl` or Postman to verify new endpoints (Earnings aggregation, Pet creation).

### Manual Verification
- Walk through the app as an **Owner**: Login -> View Dashboard -> Add Pet -> Find Vet -> Book -> View Appointment -> Join Telehealth.
- Walk through the app as a **Vet**: Login -> View Dashboard -> View Appointments -> Live Chat -> Create Prescription -> View Earnings.
- Ensure 0 mock data elements are visible in the UI.
