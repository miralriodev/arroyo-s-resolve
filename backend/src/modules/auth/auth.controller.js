// Capa de Controlador
const authService = require('./auth.service');

async function register(req, res) {
  try {
    const user = await authService.register(req.body);
    return res.status(201).json({ user });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function login(req, res) {
  return res.status(400).json({ error: 'Login del backend deshabilitado. Usa Supabase Auth en el cliente.' });
}

async function syncProfile(req, res) {
  try {
    const userId = req.user?.id;
    const profile = await authService.syncProfile(userId, req.body);
    return res.status(200).json({ profile });
  } catch (err) {
    const code = err.message === 'No autenticado' ? 401 : 400;
    return res.status(code).json({ error: err.message });
  }
}

module.exports = { register, login, syncProfile };