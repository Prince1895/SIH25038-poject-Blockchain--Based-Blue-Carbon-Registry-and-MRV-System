// In server.js

const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const setupRoutes = require('./routes/setupRoutes');
const taskRoutes = require('./routes/taskRoutes');
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/setup', setupRoutes);
app.use('/api/tasks', taskRoutes)


// --- Routes ---
// A simple "health check" route
app.get('/', (req, res) => {
  res.send('Blue Carbon Registry Backend is running!');
});

// We will add other routes here later (e.g., for auth, tasks)

// --- Server Start ---
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});