const service = require('./bookings.service');

exports.requestBooking = async (req, res, next) => {
  try {
    const booking = await service.requestBooking(req.user.id, req.body);
    res.status(201).json(booking);
  } catch (e) { next(e); }
};

exports.confirmBooking = async (req, res, next) => {
  try {
    const booking = await service.confirmBooking(req.user.id, Number(req.params.id));
    res.json(booking);
  } catch (e) { next(e); }
};

exports.rejectBooking = async (req, res, next) => {
  try {
    const booking = await service.rejectBooking(req.user.id, Number(req.params.id));
    res.json(booking);
  } catch (e) { next(e); }
};

exports.markPaid = async (req, res, next) => {
  try {
    const booking = await service.markPaid(req.user.id, Number(req.params.id));
    res.json(booking);
  } catch (e) { next(e); }
};

exports.getContact = async (req, res, next) => {
  try {
    const contact = await service.getContact(req.user.id, Number(req.params.id));
    res.json(contact);
  } catch (e) { next(e); }
};

exports.listMine = async (req, res, next) => {
  try {
    const bookings = await service.listMyBookings(req.user.id, req.query);
    if (req.query.page || req.query.pageSize) {
      const total = await service.countMyBookings(req.user.id, req.query);
      res.set('X-Total-Count', String(total));
      if (req.query.page) res.set('X-Page', String(req.query.page));
      if (req.query.pageSize) res.set('X-Page-Size', String(req.query.pageSize));
    }
    res.json(bookings);
  } catch (e) { next(e); }
};

exports.listHost = async (req, res, next) => {
  try {
    const bookings = await service.listHostBookings(req.user.id, req.query);
    // Añadir total para paginación en cabecera si se solicita paginación
    if (req.query.page || req.query.pageSize) {
      const total = await service.countHostBookings(req.user.id, req.query);
      res.set('X-Total-Count', String(total));
      if (req.query.page) res.set('X-Page', String(req.query.page));
      if (req.query.pageSize) res.set('X-Page-Size', String(req.query.pageSize));
    }
    res.json(bookings);
  } catch (e) { next(e); }
};