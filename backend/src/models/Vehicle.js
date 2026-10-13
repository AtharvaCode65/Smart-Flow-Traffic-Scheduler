import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  laneNumber: { type: Number, required: true, min: 1, max: 4, index: true },
  direction: { type: String, required: true, enum: ['North', 'East', 'South', 'West'] },
  vehicleType: { type: String, required: true, trim: true, enum: ['Car', 'Bus', 'Ambulance', 'Bike', 'Truck'] },
  arrivalTime: { type: Number, required: true, min: 0 },
  emergency: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });

export default mongoose.model('Vehicle', vehicleSchema);
