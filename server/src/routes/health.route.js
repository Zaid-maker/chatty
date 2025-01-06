import express from 'express';
import { 
    getHealthStatus, 
    getSystemLogs, 
    getSystemMetrics,
    getProcessInfo,
    clearSystemMetrics 
} from '../controllers/health.controller.js';

const router = express.Router();

router.get('/', getHealthStatus);
router.get('/logs', getSystemLogs);
router.get('/metrics', getSystemMetrics);
router.get('/process', getProcessInfo);
router.post('/metrics/clear', clearSystemMetrics);

export default router;
