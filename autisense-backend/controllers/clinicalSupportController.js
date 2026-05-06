import Child from '../models/Child.js';
import Screening from '../models/Screening.js';

const ML_BASE_URL = process.env.ML_API_URL || 'http://localhost:5001';

async function callMl(endpoint, payload) {
  const res = await fetch(`${ML_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `ML API error (${res.status})`);
  return data;
}

// @desc    AI generated next best action for a child
// @route   GET /api/clinical/next-action/:childId
// @access  Private (doctor)
export const getNextBestAction = async (req, res, next) => {
  try {
    const { childId } = req.params;

    const child = await Child.findById(childId).select('name dob gender');
    if (!child) {
      return res.status(404).json({ success: false, error: 'Child not found' });
    }

    const screenings = await Screening.find({ childId })
      .sort({ screeningDate: -1 })
      .select('screeningDate score riskLevel status');

    if (!screenings.length) {
      return res.status(400).json({ success: false, error: 'No screenings found for this child' });
    }

    const latest = screenings[0];
    const history = screenings
      .slice(0, 8)
      .map((s) => ({
        date: s.screeningDate,
        score: s.score,
        riskLevel: s.riskLevel,
        status: s.status
      }))
      .reverse();

    const age =
      child.age ??
      (child.dob ? Math.max(1, new Date().getFullYear() - new Date(child.dob).getFullYear()) : 3);
    const gender = String(child.gender || 'male').toLowerCase().startsWith('f') ? 'f' : 'm';

    const ml = await callMl('/next-action', {
      childId: String(child._id),
      child: { name: child.name, age, gender },
      riskLevel: latest.riskLevel,
      score: latest.score,
      screeningHistory: history
    });

    res.status(200).json({ success: true, data: ml });
  } catch (err) {
    next(err);
  }
};

// @desc    Explainability for a screening (top contributing questions)
// @route   GET /api/clinical/explainability/:screeningId
// @access  Private (doctor)
export const getExplainability = async (req, res, next) => {
  try {
    const { screeningId } = req.params;

    const screening = await Screening.findById(screeningId).select('answers riskLevel score screeningDate');
    if (!screening) {
      return res.status(404).json({ success: false, error: 'Screening not found' });
    }

    const ordered = (screening.answers || [])
      .slice()
      .sort((a, b) => Number(a.questionId) - Number(b.questionId));
    const answers01 = ordered.map((a) => (a?.answer ? 1 : 0));

    const ml = await callMl('/explain', {
      answers: answers01,
      riskLevel: screening.riskLevel,
      score: screening.score
    });

    res.status(200).json({
      success: true,
      data: {
        screeningId,
        riskLevel: screening.riskLevel,
        score: screening.score,
        screeningDate: screening.screeningDate,
        ...ml
      }
    });
  } catch (err) {
    next(err);
  }
};

