const express = require('express');
const router = express.Router();

const requireAuth = require('../../middlewares/requireAuth');
const usersController = require('./users.controller');

router.get('/me', requireAuth, usersController.me);

module.exports = router;