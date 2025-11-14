const express = require('express')
const router = express.Router()
const requireAuth = require('../../middlewares/requireAuth')
const controller = require('./auth.controller')

// Sincroniza el perfil del usuario autenticado
router.post('/sync-profile', requireAuth, controller.syncProfile)

module.exports = router