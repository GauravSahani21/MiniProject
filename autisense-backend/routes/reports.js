import express from 'express';
import {
  getReport,
  getMyReports,
  shareWithDoctor,
  updateAiAnalysis
} from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', authorize('parent'), getMyReports);
router.get('/:screeningId', getReport);
router.put('/:id/share', authorize('parent'), shareWithDoctor);
router.put('/:id/analysis', updateAiAnalysis);

export default router;
