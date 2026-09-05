const Vet = require('../../API/models/Vet');
const Appointment = require('../../API/models/Appointment');
const DataStore = require('../../API/models/DataStore');

console.log("Vet Model Collection Name:", Vet.collection.name);
console.log("Appointment Model Collection Name:", Appointment.collection.name);
console.log("DataStore Base Collection Name:", DataStore.collection.name);

console.log("Are Vet and Appointment in the same collection?", Vet.collection.name === Appointment.collection.name);

const vetDoc = new Vet({ name: 'Dr. Test', email: 'test@example.com', vciNumber: '123', password: 'password' });
console.log("Vet document docType:", vetDoc.docType);

const apptDoc = new Appointment({ vetId: '123', ownerName: 'John', petName: 'Buddy', date: '2026-09-03', time: '10:00 AM', reason: 'Checkup' });
console.log("Appointment document docType:", apptDoc.docType);
