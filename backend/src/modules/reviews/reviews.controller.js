import * as service from './reviews.service.js';

export const submitGuest = async (req, res, next) => {
  try {
    const pair = await service.submitGuest(req.user.id, Number(req.params.bookingId), req.body);
    res.json(pair);
  } catch (e) { next(e); }
};

export const submitHost = async (req, res, next) => {
  try {
    const pair = await service.submitHost(req.user.id, Number(req.params.bookingId), req.body);
    res.json(pair);
  } catch (e) { next(e); }
};

export const listReleasedByAccommodation = async (req, res, next) => {
  try {
    const reviews = await service.listReleasedByAccommodation(Number(req.params.id));
    res.json(reviews);
  } catch (e) { next(e); }
};