const service = require('./accommodations.service');

exports.search = async (req, res, next) => {
  try {
    const results = await service.search(req.query);
    res.json(results);
  } catch (e) { next(e); }
};

exports.getById = async (req, res, next) => {
  try {
    const acc = await service.getById(Number(req.params.id));
    if (!acc) return res.status(404).json({ error: 'No encontrado' });
    res.json(acc);
  } catch (e) { next(e); }
};

exports.create = async (req, res, next) => {
  try {
    const acc = await service.create(req.user.id, req.body);
    res.status(201).json(acc);
  } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try {
    const acc = await service.update(req.user.id, Number(req.params.id), req.body);
    res.json(acc);
  } catch (e) { next(e); }
};

exports.getAvailability = async (req, res, next) => {
  try {
    const data = await service.getAvailability(Number(req.params.id), req.query);
    res.json(data);
  } catch (e) { next(e); }
};

exports.setAvailability = async (req, res, next) => {
  try {
    const data = await service.setAvailability(req.user.id, Number(req.params.id), req.body);
    res.status(201).json(data);
  } catch (e) { next(e); }
};