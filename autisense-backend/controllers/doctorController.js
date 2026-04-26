import Report from '../models/Report.js';
import Screening from '../models/Screening.js';

// All routes here are protected and authorized for 'doctor'

// @desc    Get assigned patients
// @route   GET /api/doctor/patients
// @access  Private (doctor)
export const getAssignedPatients = async (req, res, next) => {
  try {
    const reports = await Report.find({ sharedDoctorId: req.user._id })
      .populate('childId')
      .populate('parentId', 'name email phone');

    // Group by child
    const patientsMap = new Map();
    reports.forEach(report => {
      const childId = report.childId._id.toString();
      if (!patientsMap.has(childId)) {
        patientsMap.set(childId, {
          child: report.childId,
          parent: report.parentId,
          reports: []
        });
      }
      patientsMap.get(childId).reports.push({
        reportId: report._id,
        screeningId: report.screeningId,
        riskLevel: report.riskLevel,
        score: report.score,
        date: report.createdAt
      });
    });

    const patientsArray = Array.from(patientsMap.values());

    res.status(200).json({
      success: true,
      count: patientsArray.length,
      data: patientsArray
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get screenings for an assigned patient
// @route   GET /api/doctor/patients/:childId/screenings
// @access  Private (doctor)
export const getPatientScreenings = async (req, res, next) => {
  try {
    // Ensure the doctor has at least one shared report for this child
    const report = await Report.findOne({ 
      sharedDoctorId: req.user._id, 
      childId: req.params.childId 
    });

    if (!report) {
      return res.status(403).json({ success: false, error: 'Not authorized to view this patient' });
    }

    const screenings = await Screening.find({ childId: req.params.childId })
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

    // Verify report is shared with this doctor
    const report = await Report.findOne({ screeningId: req.params.id, sharedDoctorId: req.user._id });
    if (!report) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    screening.doctorRemarks = remarks;
    screening.reviewedBy = req.user._id;
    if (screening.status === 'pending') {
      screening.status = 'completed';
    }

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
    const reports = await Report.find({ sharedDoctorId: req.user._id });

    const totalPatients = new Set(reports.map(r => r.childId.toString())).size;
    const highRisk = reports.filter(r => r.riskLevel === 'High').length;
    
    // Check corresponding screenings for pending status
    const screeningIds = reports.map(r => r.screeningId);
    const pendingReviews = await Screening.countDocuments({
      _id: { $in: screeningIds },
      status: 'pending'
    });

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
