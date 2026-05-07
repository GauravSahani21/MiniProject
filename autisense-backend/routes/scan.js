import express from 'express';
import { analyzeDrawing, analyzeFaceEyeMetrics, generateCombinedReport } from '../controllers/scanController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/analyze-drawing', analyzeDrawing);
router.post('/analyze-face-eye', analyzeFaceEyeMetrics);
router.post('/combined-report', generateCombinedReport); // Auth optional — saves userId if available

export default router;
