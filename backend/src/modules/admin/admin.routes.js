import express from 'express';
const router = express.Router();
import requireAuth from '../../middlewares/requireAuth.js';
import requireRole from '../../middlewares/requireRole.js';
import * as controller from './admin.controller.js';

// Listar todas las reservas (admin)
router.get('/bookings', requireAuth, requireRole(['admin']), controller.listAllBookings);

// Operaciones sobre reservas (admin)
router.get('/bookings/:id', requireAuth, requireRole(['admin']), controller.getBookingById);
router.patch('/bookings/:id', requireAuth, requireRole(['admin']), controller.updateBooking);
router.patch('/bookings/:id/status', requireAuth, requireRole(['admin']), controller.updateBookingStatus);
router.patch('/bookings/:id/payment', requireAuth, requireRole(['admin']), controller.updateBookingPayment);

// Usuarios (admin)
router.get('/users', requireAuth, requireRole(['admin']), controller.listUsers);
router.patch('/users/:id/role', requireAuth, requireRole(['admin']), controller.updateUserRole);

export default router;