const schedulerBaseUrl = () => (process.env.CPP_SCHEDULER_URL || 'http://localhost:18080').replace(/\/$/, '');

async function callCppScheduler(path, method = 'GET', body) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    // path is supplied only by this module, never from a request parameter.
    const response = await fetch(`${schedulerBaseUrl()}${path}`, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined, signal: controller.signal });
    const result = await response.json().catch(() => ({ error: 'C++ scheduler returned invalid JSON.' }));
    if (!response.ok) { const error = new Error(result.error || 'C++ scheduler request failed.'); error.statusCode = response.status; throw error; }
    return result;
  } catch (cause) {
    if (cause.name === 'AbortError') { const error = new Error('C++ scheduler request timed out.'); error.statusCode = 504; throw error; }
    if (!cause.statusCode) { const error = new Error('C++ scheduler is unavailable.'); error.statusCode = 503; throw error; }
    throw cause;
  } finally { clearTimeout(timeout); }
}

function validateVehicle(body, forceEmergency = false) {
  const vehicle = { id: body.id, laneNumber: body.laneNumber, type: body.type || body.vehicleType, arrivalTime: body.arrivalTime, emergency: forceEmergency || body.emergency };
  if (!Number.isInteger(vehicle.id) || vehicle.id <= 0) throw Object.assign(new Error('id must be a positive integer.'), { statusCode: 400 });
  if (!Number.isInteger(vehicle.laneNumber) || vehicle.laneNumber < 1 || vehicle.laneNumber > 4) throw Object.assign(new Error('laneNumber must be an integer from 1 to 4.'), { statusCode: 400 });
  if (typeof vehicle.type !== 'string' || !vehicle.type.trim()) throw Object.assign(new Error('type is required.'), { statusCode: 400 });
  if (!Number.isInteger(vehicle.arrivalTime) || vehicle.arrivalTime < 0) throw Object.assign(new Error('arrivalTime must be a non-negative integer.'), { statusCode: 400 });
  if (typeof vehicle.emergency !== 'boolean') throw Object.assign(new Error('emergency must be true or false.'), { statusCode: 400 });
  return vehicle;
}

const send = (action, successStatus = 200) => async (request, response, next) => { try { response.status(successStatus).json(await action(request)); } catch (error) { next(error); } };
export const getTrafficState = send(() => callCppScheduler('/api/status'));
export const addTrafficVehicle = send((request) => callCppScheduler('/api/vehicles', 'POST', validateVehicle(request.body)), 201);
export const addEmergencyVehicle = send((request) => callCppScheduler('/api/vehicles', 'POST', validateVehicle(request.body, true)), 201);
export const runNextSchedule = send(() => callCppScheduler('/api/schedule', 'POST'));
export const resetTraffic = send(() => callCppScheduler('/api/reset', 'POST'));
