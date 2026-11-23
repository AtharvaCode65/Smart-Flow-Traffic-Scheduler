import { Router } from 'express';
import { getSignalLogs } from '../controllers/signalLogController.js';
const router = Router();
router.get('/logs', getSignalLogs);
export default router;
