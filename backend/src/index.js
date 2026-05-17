const express = require('express');
const cors = require('cors');
require('dotenv').config();

const agendaRoutes = require('./routes/agendaRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    // Allow non-browser requests and local development when origin is missing.
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  }
}));
app.use(express.json());

// Routes
app.use('/api/agendas', agendaRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('API Agenda Ruangan is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
