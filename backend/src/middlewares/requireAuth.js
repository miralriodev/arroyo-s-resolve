const { expressjwt: jwt } = require('express-jwt');

// Supabase JWT validation
const secret = process.env.SUPABASE_JWT_SECRET || process.env.JWT_SECRET || 'change_me';
const baseMiddleware = jwt({
  secret,
  algorithms: ['HS256'],
  audience: 'authenticated',
});

function requireAuth(req, res, next) {
  baseMiddleware(req, res, (err) => {
    if (err) {
      return res.status(401).json({ error: 'Token inválido' });
    }
    const { sub, email, role } = req.auth || {};
    req.user = { id: sub, email, role };
    next();
  });
}

module.exports = requireAuth;