const prisma = require('../../config/prismaClient');

async function ensureProfile(userId, { full_name, avatar_url, role } = {}) {
  return prisma.profile.upsert({
    where: { id: userId },
    update: { full_name, avatar_url, role },
    create: { id: userId, full_name, avatar_url, role },
  });
}

async function getProfileById(id) {
  return prisma.profile.findUnique({ where: { id } });
}

module.exports = {
  ensureProfile,
  getProfileById,
};