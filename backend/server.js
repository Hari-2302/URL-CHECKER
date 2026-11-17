require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const urlRoutes = require('./routes/urlRoutes');
const authRoutes = require('./routes/authRoutes');
const { seedDemoUser } = require('./controllers/authController');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/urlsafetychecker';

// Middleware
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', urlRoutes);
app.use('/api/auth', authRoutes);

// Health check
app.get('/', (req, res) => { res.json({ message: 'URL Safety Checker API is running with fast DB connection.' }); });

// Connect to MongoDB with connection pooling for low-latency queries
mongoose.connect(MONGODB_URI, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000
})
  .then(async () => {
    console.log('Connected to MongoDB (Fast Pooling Enabled)');
    await seedDemoUser();
    app.listen(PORT, () => { console.log('Server running on http://localhost:' + PORT); });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
