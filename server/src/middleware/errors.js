export function notFound(_req, res) {
  res.status(404).json({ message: 'API route not found' });
}
export function errorHandler(err, _req, res, _next) {
  console.error(err);
  if (err.name === 'ValidationError') return res.status(400).json({ message: err.message });
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid resource ID' });
  res.status(500).json({ message: 'An unexpected server error occurred' });
}
