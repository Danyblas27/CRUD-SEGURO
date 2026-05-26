require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { getDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const generalLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 peticiones por IP cada 15 minutos
  message: { error: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo en 15 minutos.' }
});

// Rutas
app.use('/api/auth', require('./routes.auth'));
app.use('/api/products', require('./routes.products'));
app.use('/api', generalLimiter);
app.use('/api/auth', require('./routes.auth'));
app.use('/api/products', require('./routes.products'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', business: "Melody's Inventory API", version: '1.0.0' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Inicializar DB y arrancar servidor
getDb().then(() => {
  app.listen(PORT, () => {
    console.log(`🎵 Melody's API corriendo en http://localhost:${PORT}`);
    console.log(`   Usuario por defecto: admin / admin123`);
  });
});
