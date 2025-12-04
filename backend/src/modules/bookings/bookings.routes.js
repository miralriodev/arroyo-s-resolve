import express from 'express';
const router = express.Router();
import requireAuth from '../../middlewares/requireAuth.js';
import requireRole from '../../middlewares/requireRole.js';
import * as controller from './bookings.controller.js';

router.post('/', requireAuth, controller.requestBooking);
router.post('/:id/confirm', requireAuth, requireRole(['host', 'admin']), controller.confirmBooking);
router.post('/:id/reject', requireAuth, requireRole(['host', 'admin']), controller.rejectBooking);
router.post('/:id/mark-paid', requireAuth, requireRole(['host', 'admin']), controller.markPaid);
router.get('/:id/contact', requireAuth, controller.getContact);

// Listar reservas del usuario autenticado
router.get('/', requireAuth, controller.listMine);

// Listar reservas de alojamientos del anfitrión
router.get('/host', requireAuth, requireRole(['host', 'admin']), controller.listHost);

export default router;
