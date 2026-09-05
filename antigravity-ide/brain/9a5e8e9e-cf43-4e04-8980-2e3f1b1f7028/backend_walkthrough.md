# Database Architecture Walkthrough

The PetCare MongoDB database structure has been successfully decoupled from the previous monolithic configuration into a clean, modern, multi-collection architecture!

## What Changed?
Previously, the backend relied on a single file called `DataStore.js`. It leveraged a MongoDB pattern called "discriminators" to forcefully cram every single record—whether it was a `User`, a `Vet`, a `Pet`, or a `Prescription`—into one giant collection called `master_data`. 

While functionally okay for small apps, this is considered an anti-pattern for scaling because it heavily complicates indexing, queries, and data separation.

**The Refactoring:**
1. **Removed DataStore:** The `DataStore.js` file has been completely removed from the backend architecture.
2. **Standardized Schemas:** All 7 backend modules (`User`, `Pet`, `Vet`, `Consultation`, `Appointment`, `Prescription`, and `ChatMessage`) have been refactored to use standard Mongoose modeling (`mongoose.model()`).
3. **Independent Collections:** Mongoose will now automatically generate strict, independent collections in your database (e.g., `users`, `pets`, `vets`, `appointments`, etc.). This dramatically improves database query performance, makes backups easier, and aligns with professional NoSQL design principles.

## Seed Script Optimization
To accommodate the new structure, both `/api/seed` in `apiRoutes.js` and the standalone `seed_full_database.js` script have been completely updated. 

Previously, they deleted data via one single `DataStore.deleteMany({})` command. They now intelligently iterate through and clear every independent collection concurrently before cleanly populating the 5 required records for every single module. 

*(Note: During testing, a validation error regarding an invalid enum status of "scheduled" for Appointments in the seed script was caught and automatically fixed to "upcoming").*

## How to Test
The backend API remains structurally identical on the surface. All your existing API routes (`/api/vets`, `/api/pets`, `/api/prescriptions`) will continue to work perfectly out-of-the-box. The React application will not notice any difference, but your MongoDB Compass GUI will now cleanly display 7 separate folders of data!
