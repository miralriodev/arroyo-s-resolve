const express = require('express');
const router = express.Router();

const authController = require('./auth.controller');
const { validate } = require('../../middlewares/validate');
const requireAuth = require('../../middlewares/requireAuth');

const registerSchema = {
  email: { in: ['body'], isEmail: true, normalizeEmail: true, errorMessage: 'Email inválido' },
  password: { in: ['body'], isString: true, isLength: { options: { min: 6 } }, errorMessage: 'Password mínimo 6 caracteres' },
  name: { in: ['body'], isString: true, notEmpty: true, errorMessage: 'Nombre requerido' },
  full_name: { in: ['body'], optional: true, isString: true },
};

const loginSchema = {
  email: { in: ['body'], isEmail: true, normalizeEmail: true, errorMessage: 'Email inválido' },
  password: { in: ['body'], isString: true, notEmpty: true, errorMessage: 'Password requerido' },
};

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login); // Deprecated

const syncSchema = {
  full_name: { in: ['body'], optional: true, isString: true },
  avatar_url: { in: ['body'], optional: true, isString: true },
  role: { in: ['body'], optional: true, isIn: { options: [['visitor', 'host', 'admin']] }, errorMessage: 'Rol inválido' },
};

router.post('/sync-profile', requireAuth, validate(syncSchema), authController.syncProfile);

module.exports = router;