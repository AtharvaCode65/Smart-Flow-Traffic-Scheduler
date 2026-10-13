import mongoose from 'mongoose';

const laneSchema = new mongoose.Schema({
  laneNumber: { type: Number, required: true, min: 1, max: 4, unique: true },
  name: { type: String, required: true, enum: ['North', 'East', 'South', 'West'] },
  queueCount: { type: Number, default: 0, min: 0 },
  signalState: { type: String, default: 'red', enum: ['red', 'yellow', 'green'] },
}, { timestamps: true, versionKey: false });

export default mongoose.model('Lane', laneSchema);
