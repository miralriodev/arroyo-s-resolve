const bookingsService = require('../bookings/bookings.service');
const prisma = require('../../config/prismaClient');

exports.listAllBookings = async (req, res, next) => {
  try {
    const bookings = await bookingsService.listAllBookings(req.query);
    if (req.query.page || req.query.pageSize) {
      const total = await bookingsService.countAllBookings(req.query);
      res.set('X-Total-Count', String(total));
      if (req.query.page) res.set('X-Page', String(req.query.page));
      if (req.query.pageSize) res.set('X-Page-Size', String(req.query.pageSize));
    }
    res.json(bookings);
  } catch (e) { next(e); }
};

exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await bookingsService.adminGetBooking(Number(req.params.id));
    if (!booking) return res.status(404).json({ error: 'No encontrado' });
    res.json(booking);
  } catch (e) { next(e); }
};

exports.updateBooking = async (req, res, next) => {
  try {
    const updated = await bookingsService.adminUpdateBooking(Number(req.params.id), req.body || {});
    res.json(updated);
  } catch (e) { next(e); }
};

exports.updateBookingStatus = async (req, res, next) => {
  try {
    const updated = await bookingsService.adminSetStatus(Number(req.params.id), req.body?.status);
    res.json(updated);
  } catch (e) { next(e); }
};

exports.updateBookingPayment = async (req, res, next) => {
  try {
    const updated = await bookingsService.adminMarkPaid(Number(req.params.id), req.body?.paid);
    res.json(updated);
  } catch (e) { next(e); }
};

// Usuarios: listado y cambio de rol
exports.listUsers = async (req, res, next) => {
  try {
    const q = req.query?.q?.trim();
    const role = req.query?.role;
    const where = {};
    if (role) where.role = role;
    if (q) {
      where.OR = [
        { full_name: { contains: q, mode: 'insensitive' } },
        { user: { is: { email: { contains: q, mode: 'insensitive' } } } },
      ];
    }
    const page = Number(req.query.page) > 0 ? Number(req.query.page) : undefined;
    const pageSize = Number(req.query.pageSize) > 0 ? Number(req.query.pageSize) : undefined;
    const skip = page && pageSize ? (page - 1) * pageSize : undefined;
    const take = pageSize || undefined;
    const items = await prisma.profile.findMany({
      where,
      include: { user: true },
      orderBy: { created_at: 'desc' },
      skip,
      take,
    });
    if (page || pageSize) {
      const total = await prisma.profile.count({ where });
      res.set('X-Total-Count', String(total));
      if (page) res.set('X-Page', String(page));
      if (pageSize) res.set('X-Page-Size', String(pageSize));
    }
    res.json(items);
  } catch (e) { next(e); }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const id = req.params.id;
    const role = req.body?.role;
    if (!['visitor', 'host', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Rol inválido' });
    }
    const updated = await prisma.profile.update({ where: { id }, data: { role } });
    res.json(updated);
  } catch (e) { next(e); }
};