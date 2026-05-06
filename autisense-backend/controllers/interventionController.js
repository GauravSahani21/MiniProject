import InterventionPlan from '../models/InterventionPlan.js';
import Child from '../models/Child.js';
import Screening from '../models/Screening.js';

const ML_BASE_URL = process.env.ML_API_URL || 'http://localhost:5001';

function inferFocusAreasFromAnswers01(answers01) {
  if (!Array.isArray(answers01) || answers01.length !== 20) {
    return {
      focusAreas: ['communication'],
      breakdown: { communication: 0.34, sensory: 0.33, behavior: 0.33 }
    };
  }

  const comm = (answers01.slice(4, 8).reduce((s, a) => s + (1 - a), 0) / 4);
  const sensory = (answers01.slice(12, 16).reduce((s, a) => s + a, 0) / 4);
  const behavior = (([1 - answers01[8], 1 - answers01[9], answers01[10], answers01[11]].reduce((s, v) => s + v, 0)) / 4);

  const breakdown = {
    communication: Number(comm.toFixed(3)),
    sensory: Number(sensory.toFixed(3)),
    behavior: Number(behavior.toFixed(3))
  };

  const ranked = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);
  return {
    focusAreas: [ranked[0][0], ranked[1][0]],
    breakdown
  };
}

function localWeeklyActivities({ age, riskLevel }) {
  const risk = String(riskLevel || 'Medium').toLowerCase();
  const a = Number(age) || 3;

  let base = [
    ['Mon', 'Turn-Taking Play', 'Play a simple turn-taking game (rolling ball / stacking blocks). Pause to invite eye contact or a sound/word before your turn.', 12, 'communication'],
    ['Tue', 'Sensory Texture Talk', 'Explore 2 safe textures (soft cloth, smooth spoon). Model words like “soft/smooth” and encourage pointing or copying.', 10, 'sensory'],
    ['Wed', 'Imitation Burst', 'Do short imitation bursts: clap, wave, stomp. Reward attempts immediately and keep it playful.', 8, 'behavior'],
    ['Thu', 'Picture Choice Practice', 'Offer 2 picture choices (snack/toy). Prompt pointing/word attempt before giving the chosen item.', 10, 'communication'],
    ['Fri', 'Calm Body Routine', 'Try a calm routine: deep pressure (if tolerated), slow counting, and a predictable “finished” cue.', 8, 'sensory'],
    ['Sat', 'First–Then Routine', 'Use “First activity, then reward” with a clear visual or gesture. Keep the “first” task very short.', 10, 'behavior'],
  ];

  if (a <= 3) {
    base = base.map(([d, n, desc, dur, f]) => [d, n, desc, Math.max(6, dur - 2), f]);
  }
  if (risk === 'high') {
    base = base.map(([d, n, desc, dur, f]) => [d, n, `${desc} Keep sessions shorter and repeat twice daily if possible.`, Math.max(6, dur - 2), f]);
  }

  return base.slice(0, 7).map(([day, name, description, durationMinutes, focusArea]) => ({
    day,
    name,
    description,
    durationMinutes,
    focusArea,
    done: false
  }));
}

function normalizeFocusAreas(arr) {
  const allowed = new Set(['communication', 'sensory', 'behavior']);
  return (Array.isArray(arr) ? arr : [])
    .map((x) => String(x || '').toLowerCase().trim())
    .filter((x) => allowed.has(x));
}

function normalizeActivities(items) {
  const allowed = new Set(['communication', 'sensory', 'behavior']);
  const list = Array.isArray(items) ? items : [];

  const out = [];
  for (const it of list) {
    const day = String(it?.day || '').trim();
    const name = String(it?.name || it?.activity || '').trim();
    const description = String(it?.description || it?.details || '').trim();
    const durationMinutes = Number(it?.durationMinutes ?? it?.duration ?? 10);
    const focusArea = String(it?.focusArea || it?.focus || '').toLowerCase().trim();

    if (!day || !name || !description) continue;
    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) continue;
    if (!allowed.has(focusArea)) continue;

    out.push({
      day,
      name,
      description,
      durationMinutes: Math.max(1, Math.min(240, Math.round(durationMinutes))),
      focusArea,
      done: false
    });
  }

  return out.slice(0, 49); // safety cap
}

function computeAdherence(activities) {
  const total = activities.length;
  if (!total) return 0;
  const done = activities.filter((a) => a.done).length;
  return Math.round((done / total) * 100);
}

async function callGenerateIntervention(payload) {
  const res = await fetch(`${ML_BASE_URL}/generate-intervention`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || `ML API error (${res.status})`);
  }
  return data;
}

// @desc    Generate weekly intervention plan for a child
// @route   POST /api/interventions/generate
// @access  Private (parent)
export const generateInterventionPlan = async (req, res, next) => {
  try {
    const { childId } = req.body || {};
    if (!childId) {
      return res.status(400).json({ success: false, error: 'childId is required' });
    }

    const child = await Child.findOne({ _id: childId, parentId: req.user._id, isActive: true });
    if (!child) {
      return res.status(404).json({ success: false, error: 'Child not found' });
    }

    const latest = await Screening.findOne({ childId })
      .sort({ screeningDate: -1 })
      .select('riskLevel score answers screeningDate');

    if (!latest) {
      return res.status(400).json({ success: false, error: 'No screenings found for this child yet' });
    }

    const lastPlan = await InterventionPlan.findOne({ childId }).sort({ weekNumber: -1 }).select('weekNumber');
    const weekNumber = (lastPlan?.weekNumber || 0) + 1;

    const age =
      child.age ??
      (child.dob ? Math.max(1, new Date().getFullYear() - new Date(child.dob).getFullYear()) : 3);
    const gender = String(child.gender || 'male').toLowerCase().startsWith('f') ? 'f' : 'm';

    // Convert stored boolean answers into 0/1 array for weak-area inference
    const answers01 = (latest.answers || []).map((a) => (a?.answer ? 1 : 0));

    const mlPayload = {
      childId: String(child._id),
      riskLevel: latest.riskLevel,
      score: latest.score,
      age,
      gender,
      answers: answers01
    };

    let focusAreas = [];
    let activities = [];
    let tips = [];

    try {
      const ml = await callGenerateIntervention(mlPayload);
      focusAreas = normalizeFocusAreas(ml?.focusAreas);
      activities = normalizeActivities(ml?.weeklyActivities);
      tips = Array.isArray(ml?.tips) ? ml.tips.map((t) => String(t)).slice(0, 8) : [];
    } catch (e) {
      const inferred = inferFocusAreasFromAnswers01(answers01);
      focusAreas = inferred.focusAreas;
      activities = localWeeklyActivities({ age, riskLevel: latest.riskLevel });
      tips = [
        'Keep sessions short, predictable, and playful.',
        'Praise attempts immediately—small wins matter.',
        'Use simple visuals (pictures/gestures) to reduce frustration.',
        'Repeat the same routine daily for a week before changing.'
      ];
    }

    if (!focusAreas.length) {
      focusAreas = inferFocusAreasFromAnswers01(answers01).focusAreas;
    }
    if (!activities.length) {
      activities = localWeeklyActivities({ age, riskLevel: latest.riskLevel });
    }

    const adherenceScore = computeAdherence(activities);

    let plan;
    try {
      plan = await InterventionPlan.create({
        childId,
        weekNumber,
        activities,
        focusAreas,
        adherenceScore,
        outcomeNotes: ''
      });
    } catch (e) {
      // If a duplicate weekNumber happens (double-click / race), retry with next week.
      if (e?.code === 11000) {
        const retryLast = await InterventionPlan.findOne({ childId }).sort({ weekNumber: -1 }).select('weekNumber');
        const retryWeek = (retryLast?.weekNumber || weekNumber) + 1;
        plan = await InterventionPlan.create({
          childId,
          weekNumber: retryWeek,
          activities,
          focusAreas,
          adherenceScore,
          outcomeNotes: ''
        });
      } else {
        throw e;
      }
    }

    res.status(201).json({
      success: true,
      data: {
        ...plan.toObject(),
        tips
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all intervention plans for a child
// @route   GET /api/interventions/:childId
// @access  Private (parent)
export const getInterventionsByChild = async (req, res, next) => {
  try {
    const { childId } = req.params;

    const child = await Child.findOne({ _id: childId, parentId: req.user._id, isActive: true });
    if (!child) {
      return res.status(404).json({ success: false, error: 'Child not found' });
    }

    const plans = await InterventionPlan.find({ childId }).sort({ weekNumber: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: plans.length,
      data: plans
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update adherence and done state for a plan
// @route   PUT /api/interventions/:id/adherence
// @access  Private (parent)
export const updateAdherence = async (req, res, next) => {
  try {
    const plan = await InterventionPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Intervention plan not found' });
    }

    const child = await Child.findOne({ _id: plan.childId, parentId: req.user._id, isActive: true });
    if (!child) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const { activities, outcomeNotes } = req.body || {};

    if (Array.isArray(activities)) {
      // Expect: [{ index: number, done: boolean }]
      for (const patch of activities) {
        const idx = Number(patch?.index);
        if (!Number.isInteger(idx) || idx < 0 || idx >= plan.activities.length) continue;
        plan.activities[idx].done = !!patch?.done;
      }
      plan.adherenceScore = computeAdherence(plan.activities);
    }

    if (typeof outcomeNotes === 'string') {
      plan.outcomeNotes = outcomeNotes.slice(0, 2000);
    }

    await plan.save();

    res.status(200).json({
      success: true,
      data: plan
    });
  } catch (err) {
    next(err);
  }
};

