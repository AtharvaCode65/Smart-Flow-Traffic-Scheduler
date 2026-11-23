import Vehicle from '../models/Vehicle.js';
import Lane from '../models/Lane.js';
import { getDirection } from '../utils/lane.js';

export async function getVehicles(_request, response, next) {
  try {
    const vehicles = await Vehicle.find().sort({ createdAt: -1 }).lean();
    response.status(200).json({ vehicles });
  } catch (error) {
    next(error);
  }
}

export async function createVehicle(request, response, next) {
  try {
    const { laneNumber, vehicleType, arrivalTime, emergency = false } = request.body;
    if (!Number.isInteger(laneNumber) || laneNumber < 1 || laneNumber > 4) {
      return response.status(400).json({ error: 'laneNumber must be an integer from 1 to 4.' });
    }
    if (typeof vehicleType !== 'string' || !vehicleType.trim()) {
      return response.status(400).json({ error: 'vehicleType is required.' });
    }
    if (typeof arrivalTime !== 'number' || arrivalTime < 0) {
      return response.status(400).json({ error: 'arrivalTime must be a non-negative number.' });
    }
    if (typeof emergency !== 'boolean') {
      return response.status(400).json({ error: 'emergency must be true or false.' });
    }

    const direction = getDirection(laneNumber);
    const vehicle = await Vehicle.create({ laneNumber, direction, vehicleType: vehicleType.trim(), arrivalTime, emergency });
    await Lane.findOneAndUpdate(
      { laneNumber },
      { $set: { name: direction }, $inc: { queueCount: 1 } },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
    );
    return response.status(201).json({ message: 'Vehicle record created.', vehicle });
  } catch (error) {
    return next(error);
  }
}
