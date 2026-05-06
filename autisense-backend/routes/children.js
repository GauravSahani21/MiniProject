import express from 'express';
import {
  getChildren,
  getChild,
  createChild,
  updateChild,
  deleteChild,
  getChildScreenings
} from '../controllers/childController.js';
import { protect, authorize } from '../middleware/auth.js';
import { check } from 'express-validator';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.use(protect);
router.use(authorize('parent'));

router.route('/')
  .get(getChildren)
  .post(
    [
      check('name', 'Name is required').not().isEmpty(),
      check('dob', 'Date of birth is required').not().isEmpty(),
      check('gender', 'Gender is required').isIn(['male', 'female']),
      check('guardian', 'Guardian name is required').not().isEmpty()
    ],
    validate,
    createChild
  );

router.route('/:childId')
  .get(getChild)
  .put(updateChild)
  .delete(deleteChild);

router.get('/:childId/screenings', getChildScreenings);

export default router;
