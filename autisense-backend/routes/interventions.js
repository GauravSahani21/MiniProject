import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  generateInterventionPlan,
  getInterventionsByChild,
  updateAdherence
} from '../controllers/interventionController.js';

const router = express.Router();

router.use(protect);
router.use(authorize('parent'));

router.post('/generate', generateInterventionPlan);
router.get('/:childId', getInterventionsByChild);
router.put('/:id/adherence', updateAdherence);

export default router;

