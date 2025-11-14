const prisma = require('../../config/prismaClient');

async function ensureCapacity(accommodationId, start, end, guests) {
  const dayMs = 86400000;
  const avail = await prisma.availability.findMany({
    where: { accommodationId, date: { gte: start, lte: end } },
  });
  for (let d = new Date(start); d <= end; d = new Date(d.getTime() + dayMs)) {
    const row = avail.find(a => a.date.toDateString() === d.toDateString());
    if (!row || (row.capacity - row.reserved) < guests) return false;
  }
  return true;
}

async function consumeCapacity(accommodationId, start, end, guests) {
  const dayMs = 86400000;
  for (let d = new Date(start); d <= end; d = new Date(d.getTime() + dayMs)) {
    await prisma.availability.update({
      where: { accommodationId_date: { accommodationId, date: d } },
      data: { reserved: { increment: guests } },
    });
  }
}

exports.requestBooking = async (userId, body) => {
  const acc = await prisma.accommodation.findUnique({ where: { id: Number(body.accommodationId) } });
  if (!acc) throw new Error('Alojamiento no encontrado');

  const start = new Date(body.start_date);
  const end = new Date(body.end_date);
  const guests = Number(body.guests) || 1;

  const canBook = await ensureCapacity(acc.id, start, end, guests);
  if (!canBook) throw new Error('Sin disponibilidad');

  let status = 'pending';
  let confirmed_at = null;

  if (acc.instant_book) {
    status = 'confirmed';
    confirmed_at = new Date();
    await consumeCapacity(acc.id, start, end, guests);
  }

  const nights = Math.max(1, Math.ceil((end - start) / 86400000));
  const amount = Number(body.amount ?? acc.price ?? 0) * nights;

  return prisma.booking.create({
    data: {
      userId,
      accommodationId: acc.id,
      start_date: start,
      end_date: end,
      guests,
      amount,
      status,
      confirmed_at,
    },
  });
};

exports.confirmBooking = async (hostId, bookingId) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { accommodation: true },
  });
  if (!booking) throw new Error('Reserva no encontrada');
  if (booking.accommodation.hostId !== hostId) throw new Error('No autorizado');
  if (booking.status !== 'pending') throw new Error('Estado inválido');

  await consumeCapacity(booking.accommodationId, booking.start_date, booking.end_date, booking.guests);

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'confirmed', confirmed_at: new Date() },
  });
};

exports.rejectBooking = async (hostId, bookingId) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { accommodation: true },
  });
  if (!booking) throw new Error('Reserva no encontrada');
  if (booking.accommodation.hostId !== hostId) throw new Error('No autorizado');
  if (booking.status !== 'pending') throw new Error('Estado inválido');

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'rejected', rejected_at: new Date() },
  });
};

exports.markPaid = async (hostId, bookingId) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { accommodation: true },
  });
  if (!booking) throw new Error('Reserva no encontrada');
  if (booking.accommodation.hostId !== hostId) throw new Error('No autorizado');
  if (booking.status !== 'confirmed') throw new Error('La reserva debe estar confirmada');

  return prisma.booking.update({
    where: { id: bookingId },
    data: { payment_confirmed_by_host: true, payment_confirmed_at: new Date() },
  });
};

exports.getContact = async (userId, bookingId) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { accommodation: { include: { host: true } }, user: true },
  });
  if (!booking) throw new Error('Reserva no encontrada');

  // El acceso a contactos solo si el usuario es parte de la reserva y está confirmada
  const isGuest = booking.userId === userId;
  const isHost = booking.accommodation.hostId === userId;
  if (!isGuest && !isHost) throw new Error('No autorizado');
  if (booking.status !== 'confirmed') throw new Error('La reserva no está confirmada');

  const host = booking.accommodation.host;
  const guest = booking.user;

  return {
    host: { name: host?.full_name, phone: host?.phone, email: host?.contact_email },
    guest: { name: guest?.full_name, phone: guest?.phone, email: guest?.contact_email },
  };
};