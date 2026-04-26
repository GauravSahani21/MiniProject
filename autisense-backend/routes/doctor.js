import express from 'express';
import {
  getAssignedPatients,
  getPatientScreenings,
  addRemarks,
  getDoctorStats
} from '../controllers/doctorController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('doctor'));

router.get('/patients', getAssignedPatients);
router.get('/patients/:childId/screenings', getPatientScreenings);
router.put('/screenings/:id/remarks', addRemarks);
router.get('/stats', getDoctorStats);

export default router;
