const prisma = require('../../config/prismaClient');
const { Prisma } = require('@prisma/client');
const { ensureProfile } = require('../auth/auth.repository');

async function ensureCapacity(accommodationId, start, end, guests) {
  const dayMs = 86400000;
  const avail = await prisma.availability.findMany({
    where: { accommodationId, date: { gte: start, lte: end } },
  });
  const needGuests = guests ? Number(guests) : 1;
  for (let d = new Date(start); d <= end; d = new Date(d.getTime() + dayMs)) {
    const row = avail.find(a => a.date.toDateString() === d.toDateString());
    if (!row || (row.capacity - row.reserved) < needGuests) return false;
  }
  return true;
}

async function consumeCapacity(accommodationId, start, end, guests) {
  const dayMs = 86400000;
  for (let d = new Date(start); d <= end; d = new Date(d.getTime() + dayMs)) {
    await prisma.availability.update({
      where: { accommodationId_date: { accommodationId, date: d } },
      data: { reserved: { increment: guests || 1 } },
    });
  }
}

exports.requestBooking = async (userId, body) => {
  // Validación de entrada
  const acc = await prisma.accommodation.findUnique({ where: { id: Number(body.accommodationId) } });
  if (!acc) {
    const err = new Error('Alojamiento no encontrado');
    err.status = 404;
    throw err;
  }

  const start = new Date(body.start_date);
  const end = new Date(body.end_date);
  const invalidStart = isNaN(start.getTime());
  const invalidEnd = isNaN(end.getTime());
  if (invalidStart || invalidEnd) {
    const err = new Error('Fechas inválidas');
    err.status = 400;
    throw err;
  }
  if (end < start) {
    const err = new Error('La fecha de salida debe ser posterior a la de entrada');
    err.status = 400;
    throw err;
  }

  const guests = Number(body.guests) || 1;

  const canBook = await ensureCapacity(acc.id, start, end, guests);
  if (!canBook) {
    const err = new Error('Sin disponibilidad');
    err.status = 400;
    throw err;
  }

  let status = 'pending';
  let confirmed_at = null;

  if (acc.instant_book) {
    status = 'confirmed';
    confirmed_at = new Date();
    await consumeCapacity(acc.id, start, end, guests);
  }

  const nights = Math.max(1, Math.ceil((end - start) / 86400000));
  let amount;
  if (acc?.price && typeof acc.price.mul === 'function') {
    amount = acc.price.mul(nights);
  } else {
    const base = Number(body.amount ?? acc.price ?? 0) * nights;
    amount = new Prisma.Decimal(String(base.toFixed ? base.toFixed(2) : base));
  }

  // Asegurar que el perfil exista para cumplir la FK: upsert defensivo
  if (userId) {
    try {
      await ensureProfile(userId, {});
    } catch (e) {
      const err = new Error('Usuario no sincronizado');
      err.status = 401;
      throw err;
    }
  } else {
    const err = new Error('No autenticado');
    err.status = 401;
    throw err;
  }

  return prisma.booking.create({
    data: {
      userId,
      accommodationId: acc.id,
      start_date: start,
      end_date: end,
      guests,
      amount,
      status,
    },
  });
};

exports.confirmBooking = async (hostId, bookingId) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { accommodation: true },
  });
  if (!booking) {
    const err = new Error('Reserva no encontrada');
    err.status = 404;
    throw err;
  }
  if (booking.accommodation.hostId !== hostId) {
    const err = new Error('No autorizado');
    err.status = 403;
    throw err;
  }
  if (booking.status !== 'pending') {
    const err = new Error('Estado inválido');
    err.status = 400;
    throw err;
  }

  // Consumir capacidad según huéspedes de la reserva
  await consumeCapacity(booking.accommodationId, booking.start_date, booking.end_date, booking.guests || 1);

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
  if (!booking) {
    const err = new Error('Reserva no encontrada');
    err.status = 404;
    throw err;
  }
  if (booking.accommodation.hostId !== hostId) {
    const err = new Error('No autorizado');
    err.status = 403;
    throw err;
  }
  if (booking.status !== 'pending') {
    const err = new Error('Estado inválido');
    err.status = 400;
    throw err;
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'rejected' },
  });
};

exports.markPaid = async (hostId, bookingId) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { accommodation: true },
  });
  if (!booking) {
    const err = new Error('Reserva no encontrada');
    err.status = 404;
    throw err;
  }
  if (booking.accommodation.hostId !== hostId) {
    const err = new Error('No autorizado');
    err.status = 403;
    throw err;
  }
  if (booking.status !== 'confirmed') {
    const err = new Error('La reserva debe estar confirmada');
    err.status = 400;
    throw err;
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: {
      payment_confirmed_by_host: true,
      payment_confirmed_at: new Date(),
    },
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

// Lista de reservas del usuario autenticado (con filtros y paginación)
exports.listMyBookings = async (userId, q = {}) => {
  if (!userId) {
    const err = new Error('No autenticado');
    err.status = 401;
    throw err;
  }
  const where = { userId };
  if (q.status) where.status = q.status;
  const page = Number(q.page) > 0 ? Number(q.page) : undefined;
  const pageSize = Number(q.pageSize) > 0 ? Number(q.pageSize) : undefined;
  const skip = page && pageSize ? (page - 1) * pageSize : undefined;
  const take = pageSize || undefined;
  return prisma.booking.findMany({
    where,
    include: { accommodation: true },
    orderBy: { created_at: 'desc' },
    skip,
    take,
  });
};

exports.countMyBookings = async (userId, q = {}) => {
  if (!userId) {
    const err = new Error('No autenticado');
    err.status = 401;
    throw err;
  }
  const where = { userId };
  if (q.status) where.status = q.status;
  return prisma.booking.count({ where });
};

// Lista de reservas para alojamientos del anfitrión
exports.listHostBookings = async (hostId, q = {}) => {
  if (!hostId) {
    const err = new Error('No autenticado');
    err.status = 401;
    throw err;
  }
  const where = {};
  if (q.status) where.status = q.status;
  const page = Number(q.page) > 0 ? Number(q.page) : undefined;
  const pageSize = Number(q.pageSize) > 0 ? Number(q.pageSize) : undefined;
  const skip = page && pageSize ? (page - 1) * pageSize : undefined;
  const take = pageSize || undefined;
  return prisma.booking.findMany({
    where: {
      ...where,
      accommodation: { is: { hostId } },
    },
    include: { accommodation: true, user: true },
    orderBy: { created_at: 'desc' },
    skip,
    take,
  });
};

exports.countHostBookings = async (hostId, q = {}) => {
  if (!hostId) {
    const err = new Error('No autenticado');
    err.status = 401;
    throw err;
  }
  const where = {};
  if (q.status) where.status = q.status;
  return prisma.booking.count({
    where: {
      ...where,
      accommodation: { is: { hostId } },
    },
  });
};

// Lista de reservas para administración (todas)
exports.listAllBookings = async (q = {}) => {
  const where = {};
  if (q.status) where.status = q.status;
  const page = Number(q.page) > 0 ? Number(q.page) : undefined;
  const pageSize = Number(q.pageSize) > 0 ? Number(q.pageSize) : undefined;
  const skip = page && pageSize ? (page - 1) * pageSize : undefined;
  const take = pageSize || undefined;
  return prisma.booking.findMany({
    where,
    include: { accommodation: { include: { host: true } }, user: true },
    orderBy: { created_at: 'desc' },
    skip,
    take,
  });
};

exports.countAllBookings = async (q = {}) => {
  const where = {};
  if (q.status) where.status = q.status;
  return prisma.booking.count({ where });
};

// Admin: obtener reserva por ID con relaciones
exports.adminGetBooking = async (id) => {
  return prisma.booking.findUnique({
    where: { id },
    include: { accommodation: { include: { host: true } }, user: true },
  });
};

// Admin: actualizar campos editables (restricción: no editar fechas/huéspedes si está confirmada)
exports.adminUpdateBooking = async (id, payload = {}) => {
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) {
    const err = new Error('Reserva no encontrada');
    err.status = 404;
    throw err;
  }
  const data = {};
  if (payload.amount !== undefined) {
    const amount = Number(payload.amount);
    if (!Number.isFinite(amount) || amount < 0) {
      const err = new Error('Monto inválido');
      err.status = 400;
      throw err;
    }
    data.amount = amount;
  }
  // Restringir edición de fechas/huéspedes si ya confirmada
  const editingDatesOrGuests = payload.start_date || payload.end_date || payload.guests !== undefined;
  if (editingDatesOrGuests) {
    if (booking.status === 'confirmed') {
      const err = new Error('No se pueden editar fechas o huéspedes para reservas confirmadas');
      err.status = 400;
      throw err;
    }
    const start = payload.start_date ? new Date(payload.start_date) : booking.start_date;
    const end = payload.end_date ? new Date(payload.end_date) : booking.end_date;
    const guests = payload.guests !== undefined ? Number(payload.guests) : booking.guests || 1;
    if (!(start instanceof Date) || isNaN(start) || !(end instanceof Date) || isNaN(end) || start > end) {
      const err = new Error('Fechas inválidas');
      err.status = 400;
      throw err;
    }
    if (!Number.isFinite(guests) || guests < 1) {
      const err = new Error('Número de huéspedes inválido');
      err.status = 400;
      throw err;
    }
    const ok = await ensureCapacity(booking.accommodationId, start, end, guests);
    if (!ok) {
      const err = new Error('Sin capacidad disponible');
      err.status = 409;
      throw err;
    }
    data.start_date = start;
    data.end_date = end;
    data.guests = guests;
  }
  return prisma.booking.update({ where: { id }, data });
};

// Admin: cambiar estado (solo transiciones desde pending)
exports.adminSetStatus = async (id, status) => {
  if (!['pending', 'confirmed', 'rejected'].includes(status)) {
    const err = new Error('Estado inválido');
    err.status = 400;
    throw err;
  }
  const booking = await prisma.booking.findUnique({ where: { id }, include: { accommodation: true } });
  if (!booking) {
    const err = new Error('Reserva no encontrada');
    err.status = 404;
    throw err;
  }
  if (booking.status === status) return booking;
  if (booking.status !== 'pending') {
    const err = new Error('Solo se permite cambiar estado desde pending');
    err.status = 400;
    throw err;
  }
  if (status === 'confirmed') {
    const ok = await ensureCapacity(booking.accommodationId, booking.start_date, booking.end_date, booking.guests || 1);
    if (!ok) {
      const err = new Error('Sin capacidad disponible');
      err.status = 409;
      throw err;
    }
    await consumeCapacity(booking.accommodationId, booking.start_date, booking.end_date, booking.guests || 1);
    return prisma.booking.update({ where: { id }, data: { status: 'confirmed', confirmed_at: new Date(), rejected_at: null } });
  }
  if (status === 'rejected') {
    return prisma.booking.update({ where: { id }, data: { status: 'rejected', rejected_at: new Date(), confirmed_at: null } });
  }
  // status === 'pending' (ya controlado arriba)
  return booking;
};

// Admin: marcar pago
exports.adminMarkPaid = async (id, paid) => {
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) {
    const err = new Error('Reserva no encontrada');
    err.status = 404;
    throw err;
  }
  const payment_confirmed_by_host = Boolean(paid);
  const payment_confirmed_at = payment_confirmed_by_host ? new Date() : null;
  return prisma.booking.update({ where: { id }, data: { payment_confirmed_by_host, payment_confirmed_at } });
};