const jwt = require('jsonwebtoken')
const prisma = require('../config/prismaClient')

/**
 * Autenticación basada en Supabase JWT.
 * - Lee el token Bearer del header.
 * - Decodifica el JWT para extraer `sub` (user id).
 * - Busca el perfil en la BD para obtener `role`.
 * - Adjunta `req.user = { id, role }`.
 */
module.exports = async function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
    if (!token) return res.status(401).json({ error: 'No autenticado' })

    // Intento tolerante: decodificar sin verificar para obtener el `sub`
    const decoded = jwt.decode(token)
    const userId = decoded?.sub
    if (!userId) return res.status(401).json({ error: 'Token inválido' })

    // Cargar rol desde perfiles
    const profile = await prisma.profile.findUnique({ where: { id: userId } })
    req.user = { id: userId, role: profile?.role || null }
    return next()
  } catch (err) {
    console.error('requireAuth error:', err)
    return res.status(401).json({ error: 'No autenticado' })
  }
}