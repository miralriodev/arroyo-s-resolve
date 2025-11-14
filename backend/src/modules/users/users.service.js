const repo = require('./users.repository');

async function getMe(userId) {
  if (!userId) throw new Error('Usuario no autenticado');
  const user = await repo.getUserById(userId);
  if (!user) throw new Error('Usuario no encontrado');
  return { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt };
}

module.exports = { getMe };