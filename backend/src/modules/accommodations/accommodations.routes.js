const express = require('express');
const router = express.Router();
const requireAuth = require('../../middlewares/requireAuth');
const requireRole = require('../../middlewares/requireRole');
const controller = require('./accommodations.controller');

router.get('/', controller.search);
router.get('/:id', controller.getById);

router.post('/', requireAuth, requireRole(['host', 'admin']), controller.create);
router.put('/:id', requireAuth, requireRole(['host', 'admin']), controller.update);

router.get('/:id/availability', controller.getAvailability);
router.post('/:id/availability', requireAuth, requireRole(['host', 'admin']), controller.setAvailability);

module.exports = router;