const express = require('express');
const router = express.Router();

// Rutas de módulos
const authRoutes = require('../modules/auth/auth.routes');
router.use('/auth', authRoutes);

const usersRoutes = require('../modules/users/users.routes');
router.use('/users', usersRoutes);

const accommodationsRoutes = require('../modules/accommodations/accommodations.routes');
router.use('/accommodations', accommodationsRoutes);

const bookingsRoutes = require('../modules/bookings/bookings.routes');
router.use('/bookings', bookingsRoutes);

const reviewsRoutes = require('../modules/reviews/reviews.routes');
router.use('/reviews', reviewsRoutes);

// Salud del API
router.get('/health', (req, res) => {
  res.json({ status: 'ok', version: 'v1' });
});

module.exports = router;