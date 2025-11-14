const service = require('./reviews.service');

exports.submitGuest = async (req, res, next) => {
  try {
    const pair = await service.submitGuest(req.user.id, Number(req.params.bookingId), req.body);
    res.json(pair);
  } catch (e) { next(e); }
};

exports.submitHost = async (req, res, next) => {
  try {
    const pair = await service.submitHost(req.user.id, Number(req.params.bookingId), req.body);
    res.json(pair);
  } catch (e) { next(e); }
};

exports.listReleasedByAccommodation = async (req, res, next) => {
  try {
    const reviews = await service.listReleasedByAccommodation(Number(req.params.id));
    res.json(reviews);
  } catch (e) { next(e); }
};