import express from 'express';
import {
  createScreening,
  getScreenings,
  getScreening
} from '../controllers/screeningController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', authorize('parent'), createScreening);
router.get('/', getScreenings);
router.get('/:id', getScreening);

export default router;
