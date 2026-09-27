export function notFound(req, res) {
  res.status(404).json({ message: 'Ruta no encontrada.' });
}

export function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Error interno del servidor.'
  });
}
