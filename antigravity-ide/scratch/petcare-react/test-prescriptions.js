const mongoose = require('mongoose');
const Prescription = require('./API/models/Prescription');
const Appointment = require('./API/models/Appointment');
const connectDB = require('./API/config/db');

async function test() {
  await connectDB();
  const dbPrescriptions = await Prescription.find({})
        .populate({
          path: 'appointmentId',
          populate: { path: 'ownerId petId vetId' }
        })
        .populate('vetId');

  console.log("Found Prescriptions:", dbPrescriptions.length);
  dbPrescriptions.forEach((p, idx) => {
      console.log(`\nPrescription ${idx}:`);
      console.log(`ID: ${p._id}`);
      console.log(`appointmentId: ${p.appointmentId ? (typeof p.appointmentId) : 'null'}`);
      if (p.appointmentId) {
          console.log(`appointment.ownerId:`, p.appointmentId.ownerId);
      }
  });

  process.exit();
}

test().catch(err => {
    console.error(err);
    process.exit(1);
});
