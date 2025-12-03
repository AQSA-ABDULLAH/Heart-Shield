const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from config.env
dotenv.config({ path: './config.env' });

// Express
const app = express();
app.use(express.json({ limit: '10mb' }));

// Routes
const userRoutes = require('./routes/PatientRoute.js');
const doctorRoutes = require('./routes/doctorRoute.js');
const ecgRoutes = require('./routes/ecgRoutes.js');
const appointmentRoutes = require('./routes/appointmentRoute.js');
const notificationRoutes = require('./routes/notificationRoutes.js')
const dashboardRoutes = require('./routes/dashboardRoute.js');

// Cors
app.use(cors());

// Connection to MongoDB
require('./db/connection.js');

// --- ADDED: Serve Static Files ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Load Routes
app.use('/api/user', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/ecg', ecgRoutes);
app.use('/api/appointment', appointmentRoutes);
app.use('/api/dashboard', dashboardRoutes);

// For Server Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running at port http://localhost:${PORT}`);
});

// For Testing
app.post('/createblog', (req, res) => {
  res.send('API is working');
});

app.get('/', (req, res) => {
  res.send('API is working');
});

