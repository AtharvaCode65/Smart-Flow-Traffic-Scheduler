import mongoose from 'mongoose';

const signalLogSchema = new mongoose.Schema({
  selectedLane: { type: Number, required: true, min: 1, max: 4 },
  signalState: { type: String, required: true, enum: ['red', 'yellow', 'green'] },
  reason: { type: String, trim: true, maxlength: 500 },
  eventTimestamp: { type: Date, default: Date.now },
}, { timestamps: true, versionKey: false });

export default mongoose.model('SignalLog', signalLogSchema);
