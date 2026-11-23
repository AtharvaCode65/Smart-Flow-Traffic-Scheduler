export default function errorHandler(error, _request, response, _next) {
  console.error(error);
  if (error.statusCode) {
    return response.status(error.statusCode).json({ error: error.message });
  }
  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: 'Validation failed.', details: Object.values(error.errors).map((item) => item.message) });
  }
  if (error.name === 'CastError') {
    return response.status(400).json({ error: 'Invalid database identifier.' });
  }
  return response.status(500).json({ error: 'An unexpected server error occurred.' });
}
