const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected successfully!'))
    .catch(err => {
      console.error('MongoDB connection error:', err.message);
    });
} else {
  console.warn('⚠️ MONGODB_URI is missing. Database connection skipped.');
}

// Swagger API Docs
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');
if (fs.existsSync(path.join(__dirname, 'swagger.json'))) {
    const swaggerDocument = require('./swagger.json');
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    app.get('/swagger.json', (req, res) => res.json(swaggerDocument));
}

// Routes
const adminRoutes = require('./routes/adminRoutes');
const apiRoutes = require('./routes/apiRoutes');
const appointmentsRoutes = require('./routes/appointments');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chat');
const consultationsRoutes = require('./routes/consultations');
const favoriteVetsRoutes = require('./routes/favoriteVets');
const imagekitRoutes = require('./routes/imagekitRoutes');
const itemRoutes = require('./routes/itemRoutes');
const petRoutes = require('./routes/petRoutes');
const prescriptionsRoutes = require('./routes/prescriptions');
const vetsRoutes = require('./routes/vets');

// Mount all routes
app.use('/api/admin', adminRoutes);
app.use('/api/api', apiRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/consultations', consultationsRoutes);
app.use('/api/favoriteVets', favoriteVetsRoutes);
app.use('/api/imagekit', imagekitRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/prescriptions', prescriptionsRoutes);
app.use('/api/vets', vetsRoutes);

// Fallback health endpoints
app.get('/api/health', (req, res) => res.json({ success: true, message: 'Backend is running' }));
app.get('/', (req, res) => res.json({ message: 'PetCare Backend API Running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
