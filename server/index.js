// ==========================
//  Import Dependencies
// ==========================
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: './config.env' });

// Initialize Express
const app = express();
app.use(express.json({ limit: '10mb' }));

// ==========================
//  Allowed Origins (Local + Vercel)
// ==========================
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:8000",

  // Patient & Doctor Vercel Apps
  "https://doctor-heart-shield.vercel.app",
  "https://patient-heart-shield.vercel.app",
  "https://admin-heart-shield.vercel.app"
];

// ==========================
//  CORS CONFIG
// ==========================
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Enable preflight ALL routes
app.options("*", cors());

// ==========================
//  Connect to MongoDB
// ==========================
require('./db/connection');

// ==========================
//  Static File Serving
// ==========================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==========================
//  Load Routes
// ==========================
const userRoutes = require('./routes/PatientRoute');
const doctorRoutes = require('./routes/doctorRoute');
const ecgRoutes = require('./routes/ecgRoutes');
const appointmentRoutes = require('./routes/appointmentRoute');
const notificationRoutes = require('./routes/notificationRoutes');
const dashboardRoutes = require('./routes/dashboardRoute');

app.use('/api/user', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/ecg', ecgRoutes);
app.use('/api/appointment', appointmentRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ==========================
//  Root Routes (Testing)
// ==========================
app.get('/', (req, res) => {
  res.send('API is working');
});

app.post('/createblog', (req, res) => {
  res.send('API is working');
});

// ==========================
//  Start Server
// ==========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
