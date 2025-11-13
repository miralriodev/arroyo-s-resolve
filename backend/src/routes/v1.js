const express = require('express');
const router = express.Router();

// Rutas de módulos
const authRoutes = require('../modules/auth/auth.routes');
router.use('/auth', authRoutes);

const usersRoutes = require('../modules/users/users.routes');
router.use('/users', usersRoutes);

// Salud del API
router.get('/health', (req, res) => {
  res.json({ status: 'ok', version: 'v1' });
});

module.exports = router;