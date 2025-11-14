const prisma = require('../../config/prismaClient');

async function getOrCreatePair(bookingId) {
  let pair = await prisma.reviewPair.findUnique({ where: { bookingId } });
  if (!pair) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { accommodation: true, user: true },
    });
    if (!booking) throw new Error('Reserva no encontrada');
    pair = await prisma.reviewPair.create({
      data: {
        bookingId,
        accommodationId: booking.accommodationId,
        guest_user_id: booking.userId,
        host_user_id: booking.accommodation.hostId,
      },
    });
  }
  return pair;
}

function maybeRelease(pair) {
  if (pair.guest_submitted_at && pair.host_submitted_at && !pair.released_at) {
    pair.released_at = new Date();
  }
  return pair;
}

exports.submitGuest = async (userId, bookingId, body) => {
  const pair = await getOrCreatePair(bookingId);
  if (pair.guest_user_id !== userId) throw new Error('No autorizado');
  const updated = await prisma.reviewPair.update({
    where: { bookingId },
    data: {
      guest_rating: Number(body.rating),
      guest_comment: body.comment,
      guest_submitted_at: new Date(),
    },
  });
  const released = maybeRelease(updated);
  if (released.released_at && !updated.released_at) {
    return prisma.reviewPair.update({ where: { bookingId }, data: { released_at: released.released_at } });
  }
  return updated;
};

exports.submitHost = async (hostId, bookingId, body) => {
  const pair = await getOrCreatePair(bookingId);
  if (pair.host_user_id !== hostId) throw new Error('No autorizado');
  const updated = await prisma.reviewPair.update({
    where: { bookingId },
    data: {
      host_rating: Number(body.rating),
      host_comment: body.comment,
      host_submitted_at: new Date(),
    },
  });
  const released = maybeRelease(updated);
  if (released.released_at && !updated.released_at) {
    return prisma.reviewPair.update({ where: { bookingId }, data: { released_at: released.released_at } });
  }
  return updated;
};

exports.listReleasedByAccommodation = async (accommodationId) => {
  return prisma.reviewPair.findMany({
    where: { accommodationId, released_at: { not: null } },
    orderBy: { created_at: 'desc' },
    select: {
      guest_rating: true,
      guest_comment: true,
      host_rating: true,
      host_comment: true,
      released_at: true,
    },
  });
};