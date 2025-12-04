import express from 'express';
const router = express.Router();
import requireAuth from '../../middlewares/requireAuth.js';
import * as controller from './auth.controller.js';

// Sincroniza/lee el perfil del usuario autenticado
router.post('/sync-profile', requireAuth, controller.syncProfile);
router.get('/sync-profile', requireAuth, controller.syncProfile);

// Eliminar cuenta del usuario autenticado
router.delete('/delete-account', requireAuth, controller.deleteAccount);

export default router;