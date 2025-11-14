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