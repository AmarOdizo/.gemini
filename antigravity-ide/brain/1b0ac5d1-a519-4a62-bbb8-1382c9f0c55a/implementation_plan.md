# Doctor APIs Implementation Plan

The goal is to connect `vet-appointments.html`, `vet-availability.html`, and `create-prescription.html` to a functional backend API, removing all static demo data and enabling real data persistence.

## User Review Required

Currently, the backend (`vets.js`) uses a simple in-memory object (`doctorDataStore`) to mock appointments and availability, and it has no concept of prescriptions. 
To build a proper, scalable application, **we should create real MongoDB Collections (Mongoose Models) for Appointments and Prescriptions**. 

> [!IMPORTANT]
> **Please confirm if you approve creating MongoDB models for Appointments and Prescriptions**, or if you'd prefer I just extend the temporary in-memory store for quick testing.

## Proposed Changes

### 1. Database Models (Backend)
I will create two new Mongoose schema files to define the data structures:
- #### [NEW] `API/models/Appointment.js`
  Will store fields such as `vetId`, `petId`, `ownerName`, `petName`, `date`, `time`, `status` (e.g. pending, completed, urgent), and `consultationType`.
- #### [NEW] `API/models/Prescription.js`
  Will store fields such as `vetId`, `patientName`, `diagnosis`, `symptoms`, an array of `medications` (name, dosage, frequency), and `instructions`.

### 2. API Endpoints (`API/routes/vets.js`)
I will update and add the following endpoints to interact with MongoDB instead of the in-memory store:
- `GET /api/vets/:id/appointments`: Fetch all appointments for a specific doctor.
- `GET /api/vets/:id/availability`: Fetch the doctor's weekly schedule. (We will store this directly on the `Vet` model).
- `PUT /api/vets/:id/availability`: Update the doctor's weekly schedule.
- `POST /api/vets/:id/prescriptions`: Submit and save a new prescription.

### 3. Frontend Integration
I will modify the three HTML files to consume the new APIs:

#### [MODIFY] `scratch/petcare-app/vet-appointments.html`
- Remove the hardcoded table rows.
- Add a script to fetch `GET /api/vets/:id/appointments` and dynamically render the rows (Patient Name, Time, Status, Actions).

#### [MODIFY] `scratch/petcare-app/vet-availability.html`
- Add a script to fetch the doctor's saved schedule on page load and populate the toggles/time inputs.
- Wire up the "Save Changes" button to construct a JSON payload and send a `PUT` request to the API.

#### [MODIFY] `scratch/petcare-app/create-prescription.html`
- Wire up the "Issue & Send" button.
- Extract the dynamic medication rows, diagnosis, and patient info into a JSON payload.
- Send a `POST` request to the backend to officially record the prescription in the database.

## Verification Plan
1. We will verify that saving availability persists across page refreshes.
2. We will submit a prescription via `create-prescription.html` and verify it saves to the database successfully.
3. We will verify the appointments table loads real data from the API endpoint.
