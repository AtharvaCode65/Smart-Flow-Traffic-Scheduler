import { Router } from 'express';
import { addEmergencyVehicle, addTrafficVehicle, getTrafficState, resetTraffic, runNextSchedule } from '../controllers/trafficController.js';

const router = Router();
router.get('/state', getTrafficState);
router.post('/vehicles', addTrafficVehicle);
router.post('/emergency', addEmergencyVehicle);
router.post('/scheduler/next', runNextSchedule);
router.post('/reset', resetTraffic);
export default router;
