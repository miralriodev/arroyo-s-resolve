const service = require('./auth.service')

async function syncProfile(req, res, next) {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'No autenticado' })
    const profile = await service.syncProfile(userId, req.body || {})
    res.json({ profile })
  } catch (err) { next(err) }
}

async function deleteAccount(req, res, next) {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'No autenticado' })
    await service.deleteAccount(userId)
    res.status(200).json({ status: 'deleted' })
  } catch (err) { next(err) }
}

module.exports = { syncProfile, deleteAccount }