import express from 'express';
const router = express.Router();

// Rutas de módulos
import authRoutes from '../modules/auth/auth.routes.js';
router.use('/auth', authRoutes);

import usersRoutes from '../modules/users/users.routes.js';
router.use('/users', usersRoutes);

import accommodationsRoutes from '../modules/accommodations/accommodations.routes.js';
router.use('/accommodations', accommodationsRoutes);

import bookingsRoutes from '../modules/bookings/bookings.routes.js';
router.use('/bookings', bookingsRoutes);

import reviewsRoutes from '../modules/reviews/reviews.routes.js';
router.use('/reviews', reviewsRoutes);

// Rutas administrativas
import adminRoutes from '../modules/admin/admin.routes.js';
router.use('/admin', adminRoutes);

export default router;
