import Lane from '../models/Lane.js';

export async function getLanes(_request, response, next) {
  try {
    const lanes = await Lane.find().sort({ laneNumber: 1 }).lean();
    response.status(200).json({ lanes });
  } catch (error) {
    next(error);
  }
}
