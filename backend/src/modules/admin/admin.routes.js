const express = require('express');
const router = express.Router();
const requireAuth = require('../../middlewares/requireAuth');
const requireRole = require('../../middlewares/requireRole');
const controller = require('./admin.controller');

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

module.exports = router;