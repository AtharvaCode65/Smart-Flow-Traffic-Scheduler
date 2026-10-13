import { Router } from 'express';
import { getDatabaseStatus, getHealth, getTest } from '../controllers/healthController.js';
const router = Router();
router.get('/health', getHealth);
router.get('/test', getTest);
router.get('/db-status', getDatabaseStatus);
export default router;
