import express from 'express';
import { analyzeDrawing, analyzeFaceEyeMetrics } from '../controllers/scanController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public or Protected - Depending on if we want guests to try it
router.post('/analyze-drawing', analyzeDrawing);
router.post('/analyze-face-eye', analyzeFaceEyeMetrics);

export default router;
