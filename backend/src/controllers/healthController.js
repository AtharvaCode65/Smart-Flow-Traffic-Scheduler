import mongoose from 'mongoose';

export function getHealth(_request, response) {
  response.status(200).json({ status: 'ok', service: 'SmartFlow Express API' });
}

export function getTest(_request, response) {
  response.status(200).json({ message: 'Frontend can communicate with the SmartFlow Express API.' });
}

export function getDatabaseStatus(_request, response) {
  const connected = mongoose.connection.readyState === 1;
  response.status(connected ? 200 : 503).json({
    connected,
    state: connected ? 'connected' : 'unavailable',
    database: connected ? mongoose.connection.name : undefined,
  });
}
