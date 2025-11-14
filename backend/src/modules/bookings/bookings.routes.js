const express = require('express');
const router = express.Router();
const requireAuth = require('../../middlewares/requireAuth');
const requireRole = require('../../middlewares/requireRole');
const controller = require('./bookings.controller');

router.post('/', requireAuth, controller.requestBooking);
router.post('/:id/confirm', requireAuth, requireRole(['host', 'admin']), controller.confirmBooking);
router.post('/:id/reject', requireAuth, requireRole(['host', 'admin']), controller.rejectBooking);
router.post('/:id/mark-paid', requireAuth, requireRole(['host', 'admin']), controller.markPaid);
router.get('/:id/contact', requireAuth, controller.getContact);

module.exports = router;