function errorHandler(err, req, res, next) {
  const status = typeof err?.status === 'number' ? err.status : 500;
  const message = err?.message || 'Error interno';
  if (res.headersSent) {
    return next(err);
  }
  res.status(status).json({ error: message });
}

export default errorHandler;
