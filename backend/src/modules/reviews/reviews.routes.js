const express = require('express');
const router = express.Router();
const requireAuth = require('../../middlewares/requireAuth');
const requireRole = require('../../middlewares/requireRole');
const controller = require('./reviews.controller');

router.post('/:bookingId/guest', requireAuth, controller.submitGuest);
router.post('/:bookingId/host', requireAuth, requireRole(['host', 'admin']), controller.submitHost);
router.get('/accommodation/:id', controller.listReleasedByAccommodation);

module.exports = router;