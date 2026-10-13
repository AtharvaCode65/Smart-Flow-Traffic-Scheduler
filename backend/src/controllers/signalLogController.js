import SignalLog from '../models/SignalLog.js';

export async function getSignalLogs(_request, response, next) {
  try {
    const logs = await SignalLog.find().sort({ eventTimestamp: -1 }).limit(100).lean();
    response.status(200).json({ logs });
  } catch (error) {
    next(error);
  }
}
