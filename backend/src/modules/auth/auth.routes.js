const express = require('express')
const router = express.Router()
const requireAuth = require('../../middlewares/requireAuth')
const controller = require('./auth.controller')

// Sincroniza/lee el perfil del usuario autenticado
router.post('/sync-profile', requireAuth, controller.syncProfile)
router.get('/sync-profile', requireAuth, controller.syncProfile)

// Eliminar cuenta del usuario autenticado
router.delete('/delete-account', requireAuth, controller.deleteAccount)

module.exports = router
