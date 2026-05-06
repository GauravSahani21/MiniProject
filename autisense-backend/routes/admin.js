import express from 'express';
import {
  getAllUsers,
  toggleUserStatus,
  deleteUser,
  getAllScreenings,
  getStats,
  getMonthlyData,
  getActivityLog
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/users', getAllUsers);
router.put('/users/:id/toggle', toggleUserStatus);
router.delete('/users/:id', deleteUser);
router.get('/screenings', getAllScreenings);
router.get('/stats', getStats);
router.get('/monthly', getMonthlyData);
router.get('/activity', getActivityLog);

export default router;
