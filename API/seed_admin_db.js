const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const dotenv = require('dotenv');

dotenv.config();

const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/gemini_api";

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(function() {
    console.log("Connected to MongoDB");
    
    return Admin.countDocuments();
  })
  .then(function(count) {
    if (count === 0) {
      return Admin.create([
        { email: 'admin@odizo.com', password: 'admin123' },
        { email: 'admin@petcare.org', password: 'admin123' },
        { email: 'admin@petcare.com', password: 'odizo123' },
        { email: 'admin', password: 'admin' }
      ]).then(function() {
        console.log("Demo admin data inserted successfully");
      });
    } else {
      console.log("Admin data already exists");
    }
  })
  .then(function() {
    process.exit();
  })
  .catch(function(err) {
    console.error("Connection error", err);
    process.exit(1);
  });
