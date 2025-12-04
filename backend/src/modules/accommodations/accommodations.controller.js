import * as service from './accommodations.service.js';

export const search = async (req, res, next) => {
  try {
    const results = await service.search(req.query);
    res.json(results);
  } catch (e) { next(e); }
};

export const getById = async (req, res, next) => {
  try {
    const acc = await service.getById(Number(req.params.id));
    if (!acc) return res.status(404).json({ error: 'No encontrado' });
    res.json(acc);
  } catch (e) { next(e); }
};

export const create = async (req, res, next) => {
  try {
    const acc = await service.create(req.user.id, req.body);
    res.status(201).json(acc);
  } catch (e) { next(e); }
};

export const update = async (req, res, next) => {
  try {
    const acc = await service.update(req.user.id, Number(req.params.id), req.body);
    res.json(acc);
  } catch (e) { next(e); }
};

export const getAvailability = async (req, res, next) => {
  try {
    const availability = await service.getAvailability(Number(req.params.id));
    res.json(availability);
  } catch (e) { next(e); }
};

export const setAvailability = async (req, res, next) => {
  try {
    const availability = await service.setAvailability(req.user.id, Number(req.params.id), req.body);
    res.json(availability);
  } catch (e) { next(e); }
};