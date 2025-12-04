import * as service from './bookings.service.js';

export const requestBooking = async (req, res, next) => {
  try {
    const booking = await service.requestBooking(req.user.id, req.body);
    res.status(201).json(booking);
  } catch (e) { next(e); }
};

export const confirmBooking = async (req, res, next) => {
  try {
    const booking = await service.confirmBooking(req.user.id, Number(req.params.id));
    res.json(booking);
  } catch (e) { next(e); }
};

export const rejectBooking = async (req, res, next) => {
  try {
    const booking = await service.rejectBooking(req.user.id, Number(req.params.id));
    res.json(booking);
  } catch (e) { next(e); }
};

export const markPaid = async (req, res, next) => {
  try {
    const booking = await service.markPaid(req.user.id, Number(req.params.id));
    res.json(booking);
  } catch (e) { next(e); }
};

export const getContact = async (req, res, next) => {
  try {
    const contact = await service.getContact(req.user.id, Number(req.params.id));
    res.json(contact);
  } catch (e) { next(e); }
};

export const listMine = async (req, res, next) => {
  try {
    const bookings = await service.listMyBookings(req.user.id, req.query);
    res.json(bookings);
  } catch (e) { next(e); }
};

export const listHost = async (req, res, next) => {
  try {
    const bookings = await service.listHostBookings(req.user.id, req.query);
    res.json(bookings);
  } catch (e) { next(e); }
};
