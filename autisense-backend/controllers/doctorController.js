import Screening from '../models/Screening.js';
import Child from '../models/Child.js';

// All routes here are protected and authorized for 'doctor'

// @desc    Get patients/screenings queue for doctor dashboard
// @route   GET /api/doctor/patients
// @access  Private (doctor)
export const getAssignedPatients = async (req, res, next) => {
  try {
    // Option B: show all screenings to all doctors for review.
    const screenings = await Screening.find({
      status: { $in: ['pending', 'reviewed', 'completed'] }
    })
      .populate('childId', 'name dob gender')
      .populate('parentId', 'name email')
      .sort({ screeningDate: -1 });

    const patientsArray = screenings.map((s) => {
      const childDob = s.childId?.dob ? new Date(s.childId.dob) : null;
      const childAge = childDob
        ? Math.max(0, new Date().getFullYear() - childDob.getFullYear())
        : null;

      return {
        screeningId: s._id,
        childId: s.childId?._id || null,
        childName: s.childId?.name || 'Unknown Child',
        childAge,
        childGender: s.childId?.gender || null,
        parentName: s.parentId?.name || 'Unknown Parent',
        parentEmail: s.parentId?.email || null,
        date: s.screeningDate || s.createdAt,
        score: s.score,
        riskLevel: s.riskLevel,
        status: s.status,
        answers: s.answers
      };
    });

    res.status(200).json({
      success: true,
      count: patientsArray.length,
      data: patientsArray
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get screenings for a patient (child)
// @route   GET /api/doctor/patients/:childId/screenings
// @access  Private (doctor)
export const getPatientScreenings = async (req, res, next) => {
  try {
    const child = await Child.findById(req.params.childId);
    if (!child) {
      return res.status(404).json({ success: false, error: 'Child not found' });
    }

    const screenings = await Screening.find({ childId: req.params.childId })
      .populate('childId', 'name dob gender')
      .populate('parentId', 'name email')
      .sort({ screeningDate: -1 });

    res.status(200).json({
      success: true,
      count: screenings.length,
      data: screenings
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add remarks to a screening
// @route   PUT /api/doctor/screenings/:id/remarks
// @access  Private (doctor)
export const addRemarks = async (req, res, next) => {
  try {
    const { remarks } = req.body;

    let screening = await Screening.findById(req.params.id);

    if (!screening) {
      return res.status(404).json({ success: false, error: 'Screening not found' });
    }

    screening.doctorRemarks = remarks;
    screening.reviewedBy = req.user._id;
    if (screening.status === 'pending') screening.status = 'reviewed';

    await screening.save();

    res.status(200).json({
      success: true,
      data: screening
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark screening as reviewed
// @route   PUT /api/doctor/screenings/:screeningId/review
// @access  Private (doctor)
export const markScreeningReviewed = async (req, res, next) => {
  try {
    const screening = await Screening.findById(req.params.screeningId);
    if (!screening) {
      return res.status(404).json({ success: false, error: 'Screening not found' });
    }

    screening.status = 'reviewed';
    screening.reviewedBy = req.user._id;
    await screening.save();

    res.status(200).json({
      success: true,
      data: screening
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get stats for doctor dashboard
// @route   GET /api/doctor/stats
// @access  Private (doctor)
export const getDoctorStats = async (req, res, next) => {
  try {
    const screenings = await Screening.find().select('childId riskLevel status');
    const totalPatients = new Set(screenings.map(s => s.childId.toString())).size;
    const highRisk = screenings.filter(s => s.riskLevel === 'High').length;
    const pendingReviews = screenings.filter(s => s.status === 'pending').length;

    res.status(200).json({
      success: true,
      data: {
        totalPatients,
        highRisk,
        pendingReviews
      }
    });
  } catch (err) {
    next(err);
  }
};
