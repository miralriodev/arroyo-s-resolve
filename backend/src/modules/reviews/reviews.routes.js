import express from 'express';
const router = express.Router();
import requireAuth from '../../middlewares/requireAuth.js';
import requireRole from '../../middlewares/requireRole.js';
import * as controller from './reviews.controller.js';

router.post('/:bookingId/guest', requireAuth, controller.submitGuest);
router.post('/:bookingId/host', requireAuth, requireRole(['host', 'admin']), controller.submitHost);
router.get('/accommodation/:id', controller.listReleasedByAccommodation);

export default router;