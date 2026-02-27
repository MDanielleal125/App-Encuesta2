const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth');
const questionsRoutes = require('./routes/questions');
const surveysRoutes = require('./routes/surveys');
const adminRoutes = require('./routes/admin');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'API de Encuesta de Perfiles Técnicos',
    docs: 'Usa la aplicación web en http://localhost:3000 (arranca el frontend con: cd frontend && npm run dev)',
    health: '/api/health',
    auth: '/api/auth/login y /api/auth/register',
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/questions', questionsRoutes);
app.use('/api/surveys', surveysRoutes);
app.use('/api/admin', adminRoutes);

module.exports = app;

