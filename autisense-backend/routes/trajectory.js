import express from 'express';
import { getTrajectory } from '../controllers/trajectoryController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.get('/:childId', authorize('parent', 'doctor', 'admin'), getTrajectory);

export default router;

