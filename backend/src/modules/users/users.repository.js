const prisma = require('../../config/prismaClient');

async function getUserById(id) {
  return prisma.user.findUnique({ where: { id } });
}

module.exports = { getUserById };