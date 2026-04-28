import Child from '../models/Child.js';
import Screening from '../models/Screening.js';

// @desc    Get all children for current parent
// @route   GET /api/children
// @access  Private (parent)
export const getChildren = async (req, res, next) => {
  try {
    const children = await Child.find({ parentId: req.user._id, isActive: true });
    
    // Optional: add latest screening info if needed
    // For simplicity, returning the child array
    res.status(200).json({
      success: true,
      count: children.length,
      data: children
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single child
// @route   GET /api/children/:childId
// @access  Private (parent)
export const getChild = async (req, res, next) => {
  try {
    const childId = req.params.childId || req.params.id;
    const child = await Child.findOne({ _id: childId, parentId: req.user.id, isActive: true });

    if (!child) {
      return res.status(404).json({ success: false, error: 'Child not found' });
    }

    res.status(200).json({
      success: true,
      data: child
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new child
// @route   POST /api/children
// @access  Private (parent)
export const createChild = async (req, res, next) => {
  try {
    req.body.parentId = req.user._id;

    const child = await Child.create(req.body);

    res.status(201).json({
      success: true,
      data: child
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update child
// @route   PUT /api/children/:childId
// @access  Private (parent)
export const updateChild = async (req, res, next) => {
  try {
    const childId = req.params.childId || req.params.id;
    let child = await Child.findOne({ _id: childId, parentId: req.user.id });

    if (!child) {
      return res.status(404).json({ success: false, error: 'Child not found' });
    }

    const { name, dob, gender, guardian, medicalNotes } = req.body;
    child = await Child.findByIdAndUpdate(
      childId,
      { name, dob, gender, guardian, medicalNotes },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: child
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete child (Soft delete)
// @route   DELETE /api/children/:childId
// @access  Private (parent)
export const deleteChild = async (req, res, next) => {
  try {
    const childId = req.params.childId || req.params.id;
    const child = await Child.findOne({ _id: childId, parentId: req.user.id });

    if (!child) {
      return res.status(404).json({ success: false, error: 'Child not found' });
    }

    child.isActive = false;
    await child.save();

    res.status(200).json({
      success: true,
      message: 'Child removed'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get screenings for a specific child
// @route   GET /api/children/:childId/screenings
// @access  Private (parent)
export const getChildScreenings = async (req, res, next) => {
  try {
    const childId = req.params.childId || req.params.id;
    // Verify ownership
    const child = await Child.findOne({ _id: childId, parentId: req.user.id });
    if (!child) {
      return res.status(404).json({ success: false, error: 'Child not found' });
    }

    const screenings = await Screening.find({ childId }).sort({ screeningDate: -1 });

    res.status(200).json({
      success: true,
      count: screenings.length,
      data: screenings
    });
  } catch (err) {
    next(err);
  }
};
