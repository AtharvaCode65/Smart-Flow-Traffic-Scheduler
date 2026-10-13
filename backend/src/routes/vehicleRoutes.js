import { Router } from 'express';
import { createVehicle, getVehicles } from '../controllers/vehicleController.js';
const router = Router();
router.route('/').get(getVehicles).post(createVehicle);
export default router;
