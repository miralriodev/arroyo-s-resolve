import prisma from '../../config/prismaClient.js';

export async function getUserById(id) {
  return prisma.user.findUnique({ where: { id } });
}