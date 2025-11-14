const service = require('./auth.service')

async function syncProfile(req, res, next) {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'No autenticado' })
    const profile = await service.syncProfile(userId, req.body || {})
    res.json({ profile })
  } catch (err) { next(err) }
}

module.exports = { syncProfile }