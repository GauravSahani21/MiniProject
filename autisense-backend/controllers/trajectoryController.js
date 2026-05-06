import Screening from '../models/Screening.js';
import Child from '../models/Child.js';

function calculateTrend(scores) {
  if (scores.length < 2) return 'Stable';
  const first = scores[0];
  const last = scores[scores.length - 1];
  if (last > first) return 'Worsening';
  if (last < first) return 'Improving';
  return 'Stable';
}

function linearRegressionNextScore(scores) {
  if (!scores.length) return 0;
  if (scores.length === 1) return scores[0];

  const n = scores.length;
  const xMean = (n - 1) / 2;
  const yMean = scores.reduce((sum, y) => sum + y, 0) / n;

  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < n; i++) {
    numerator += (i - xMean) * (scores[i] - yMean);
    denominator += (i - xMean) ** 2;
  }

  const slope = denominator === 0 ? 0 : numerator / denominator;
  const intercept = yMean - slope * xMean;
  const next = intercept + slope * n;
  return Math.max(0, Math.min(20, Number(next.toFixed(2))));
}

function getConfidencePercent(screeningCount) {
  if (screeningCount >= 5) return 92;
  if (screeningCount >= 3) return 82;
  if (screeningCount === 2) return 68;
  if (screeningCount === 1) return 55;
  return 0;
}

// @desc    Get trajectory for child
// @route   GET /api/trajectory/:childId
// @access  Private (parent, doctor, admin)
export const getTrajectory = async (req, res, next) => {
  try {
    const { childId } = req.params;

    const child = await Child.findById(childId).select('parentId name');
    if (!child) {
      return res.status(404).json({
        success: false,
        error: 'Child not found',
      });
    }

    if (req.user.role === 'parent' && child.parentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this child trajectory',
      });
    }

    const screenings = await Screening.find({ childId })
      .sort({ screeningDate: 1 })
      .select('screeningDate score riskLevel');

    const pastScreenings = screenings.map((s) => ({
      date: s.screeningDate,
      score: s.score,
      riskLevel: s.riskLevel,
    }));

    if (!pastScreenings.length) {
      return res.status(200).json({
        success: true,
        data: {
          childId,
          pastScreenings: [],
          trend: 'Stable',
          predictedNextScore: null,
          confidencePercent: 0,
          message: 'Based on 0 screenings',
        },
      });
    }

    const scores = pastScreenings.map((s) => s.score);
    const trend = calculateTrend(scores);
    const predictedNextScore = linearRegressionNextScore(scores);
    const confidencePercent = getConfidencePercent(pastScreenings.length);

    return res.status(200).json({
      success: true,
      data: {
        childId,
        pastScreenings,
        trend,
        predictedNextScore,
        confidencePercent,
        message: `Based on ${pastScreenings.length} screening${pastScreenings.length > 1 ? 's' : ''}`,
      },
    });
  } catch (err) {
    next(err);
  }
};

