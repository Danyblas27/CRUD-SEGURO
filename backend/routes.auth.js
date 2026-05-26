const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { get, run } = require('./db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'melodys_secret_key_2024';

const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 10, // Límite de 10 intentos por IP cada 5 minutos
  message: { error: 'Demasiados intentos de inicio de sesión, por favor intenta en 5 minutos.' }
});

// POST /api/auth/login
router.post('/login', authLimiter, (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Usuario y contraseña requeridos' });

  const user = get('SELECT * FROM users WHERE username = ?', [username]);
  if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({
    token,
    user: { id: user.id, username: user.username, role: user.role },
  });
});

// POST /api/auth/register  (abierto para futura integración de roles)
router.post('/register', authLimiter, (req, res) => {
  const { username, password, role = 'viewer' } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Usuario y contraseña requeridos' });

  const exists = get('SELECT id FROM users WHERE username = ?', [username]);
  if (exists) return res.status(409).json({ error: 'El usuario ya existe' });

  const hashed = bcrypt.hashSync(password, 10);
  run(
    'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
    [username, hashed, role]
  );

  const newUser = get('SELECT id, username, role FROM users WHERE username = ?', [username]);
  res.status(201).json({ message: 'Usuario creado', user: newUser });
});

// GET /api/auth/me  — validar token
router.get('/me', authLimiter, (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'No autenticado' });
  const token = authHeader.split(' ')[1];
  try {
    const jwt_ = require('jsonwebtoken');
    const payload = jwt_.verify(token, JWT_SECRET);
    res.json({ id: payload.id, username: payload.username, role: payload.role });
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
});

module.exports = router;
