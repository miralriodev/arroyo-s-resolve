import express from 'express';
const router = express.Router();

import requireAuth from '../../middlewares/requireAuth.js';
import * as usersController from './users.controller.js';

router.get('/me', requireAuth, usersController.me);

export default router;