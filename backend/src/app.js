import cors from 'cors';
import express from 'express';
import healthRoutes from './routes/healthRoutes.js';
import laneRoutes from './routes/laneRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import signalLogRoutes from './routes/signalLogRoutes.js';
import trafficRoutes from './routes/trafficRoutes.js';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173').split(',').map((origin) => origin.trim());

app.use(cors({ origin(origin, callback) {
  if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
  return callback(new Error('Origin is not allowed by CORS.'));
}}));
app.use(express.json({ limit: '100kb' }));

app.use('/api', healthRoutes);
app.use('/api/lanes', laneRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/signals', signalLogRoutes);
app.use('/api/traffic', trafficRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
