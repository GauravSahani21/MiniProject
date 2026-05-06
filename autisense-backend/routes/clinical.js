import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getNextBestAction,
  getExplainability
} from '../controllers/clinicalSupportController.js';

const router = express.Router();

router.use(protect);
router.use(authorize('doctor'));

router.get('/next-action/:childId', getNextBestAction);
router.get('/explainability/:screeningId', getExplainability);

export default router;

