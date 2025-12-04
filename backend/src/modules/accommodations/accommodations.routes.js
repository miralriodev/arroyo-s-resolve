import express from 'express';
const router = express.Router();
import requireAuth from '../../middlewares/requireAuth.js';
import requireRole from '../../middlewares/requireRole.js';
import * as controller from './accommodations.controller.js';

router.get('/', controller.search);
router.get('/:id', controller.getById);

router.post('/', requireAuth, requireRole(['host', 'admin']), controller.create);
router.put('/:id', requireAuth, requireRole(['host', 'admin']), controller.update);

router.get('/:id/availability', controller.getAvailability);
router.post('/:id/availability', requireAuth, requireRole(['host', 'admin']), controller.setAvailability);

export default router;