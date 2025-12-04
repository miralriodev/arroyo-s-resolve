import prisma from '../../config/prismaClient.js';

export async function ensureProfile(userId, { full_name, avatar_url, role } = {}) {
  const updateData = {}
  const createData = { id: userId }
  if (typeof full_name !== 'undefined') { updateData.full_name = full_name; createData.full_name = full_name }
  if (typeof avatar_url !== 'undefined') { updateData.avatar_url = avatar_url; createData.avatar_url = avatar_url }
  if (typeof role !== 'undefined') { updateData.role = role; createData.role = role }
  return prisma.profile.upsert({
    where: { id: userId },
    update: updateData,
    create: createData,
  })
}

export async function getProfileById(id) {
  return prisma.profile.findUnique({ where: { id } });
}
