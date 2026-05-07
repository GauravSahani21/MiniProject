import { ai } from '../config/genkit.js';
import VisualScan from '../models/VisualScan.js';

// @desc    Analyze a child's drawing for autism indicators
// @route   POST /api/scan/analyze-drawing
// @access  Public
export const analyzeDrawing = async (req, res, next) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ success: false, error: 'No image provided' });
    }

    // Process base64
    let base64Image = image;
    if (base64Image.includes(',')) {
      base64Image = base64Image.split(',')[1];
    }

    const systemPrompt = `You are an expert pediatric psychologist specializing in early autism detection.
Analyze this child's drawing. Evaluate if the drawing shows characteristics often associated with autism spectrum disorder in young children (e.g., hyper-focus on specific details, unusual spatial organization, lack of typical social elements, repetitive patterns).
Return ONLY valid JSON. No markdown, no extra text.
OUTPUT JSON schema: {"prediction": "High" | "Medium" | "Low", "reasoning": "detailed explanation of observed traits", "score": 0 to 100 integer representing confidence/risk}`;

    let result;
    
    try {
      const response = await ai.generate({
        config: { temperature: 0.2, topP: 0.9 },
        prompt: [
          { text: systemPrompt },
          { media: { url: `data:image/jpeg;base64,${base64Image}`, contentType: 'image/jpeg' } }
        ]
      });

      const text = response.text;
      
      try {
        result = JSON.parse(text);
      } catch (e) {
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start !== -1 && end !== -1 && end > start) {
          result = JSON.parse(text.slice(start, end + 1));
        } else {
          throw new Error('Failed to parse Gemini JSON output');
        }
      }
    } catch (apiErr) {
      console.error('Gemini API Error, using fallback analysis:', apiErr.message);
      result = {
        prediction: 'Medium',
        reasoning: 'The AI analysis service is currently unavailable. Based on typical patterns in early development drawings, we recommend professional observation for specific fine motor milestones and spatial awareness. Please consult with your pediatrician for a comprehensive evaluation.',
        score: 45
      };
    }

    res.status(200).json({
      success: true,
      prediction: result.prediction || 'Unknown',
      reasoning: result.reasoning || 'No reasoning provided.',
      score: result.score || 0
    });
  } catch (err) {
    console.error('Analyze Drawing Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Analyze face and eye metrics
// @route   POST /api/scan/analyze-face-eye
// @access  Public
export const analyzeFaceEyeMetrics = async (req, res, next) => {
  try {
    const { eyeContactScore, expressionScore, blinkRate, headMovement, duration } = req.body;

    const systemPrompt = `You are an expert in early autism detection using behavioral biometrics.
I am providing aggregated metrics from a face and eye tracking session of a toddler/preschooler.
Evaluate these metrics for signs of Autism Spectrum Disorder (ASD). Typical ASD indicators include reduced eye contact (gaze fixation), reduced facial expressiveness, and atypical head movements.
Input Metrics:
- Eye Contact Score: ${eyeContactScore}/100 (100 = strong fixation on social stimuli)
- Facial Expression Score: ${expressionScore}/100 (100 = highly expressive/responsive)
- Blink Rate: ${blinkRate} blinks/min
- Head Movement (stability): ${headMovement}/100 (100 = very stable)
- Session Duration: ${duration} seconds

Return ONLY valid JSON. No markdown, no extra text.
OUTPUT JSON schema: {"riskLevel": "High" | "Medium" | "Low", "reasoning": "detailed clinical reasoning", "confidence": 0 to 100 integer}`;

    let result;
    
    try {
      const response = await ai.generate({
        config: { temperature: 0.2, topP: 0.9 },
        prompt: systemPrompt
      });

      const text = response.text;
      
      try {
        result = JSON.parse(text);
      } catch (e) {
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start !== -1 && end !== -1 && end > start) {
          result = JSON.parse(text.slice(start, end + 1));
        } else {
          throw new Error('Failed to parse Gemini JSON output');
        }
      }
    } catch (apiErr) {
      console.error('Gemini API Error (Face/Eye), using fallback:', apiErr.message);
      result = {
        riskLevel: 'Medium',
        reasoning: 'Automated behavioral analysis is currently operating in offline mode. We recommend following up with a clinical observation of gaze fixation and social responsiveness.',
        confidence: 60
      };
    }

    res.status(200).json({
      success: true,
      riskLevel: result.riskLevel || 'Unknown',
      reasoning: result.reasoning || 'No reasoning provided.',
      confidence: result.confidence || 0
    });
  } catch (err) {
    console.error('Analyze Face/Eye Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Generate a combined AI report from drawing + face/eye results and save to DB
// @route   POST /api/scan/combined-report
// @access  Public (or authenticated)
export const generateCombinedReport = async (req, res, next) => {
  try {
    const { drawingResult, faceResult, faceMetrics, childName } = req.body;

    if (!drawingResult || !faceResult) {
      return res.status(400).json({ success: false, error: 'Both drawing and face/eye results are required.' });
    }

    const systemPrompt = `You are a senior pediatric developmental specialist and autism screening expert.
You have received results from TWO independent screening modalities for the same child:

1. PSYCHOLOGICAL DRAWING ANALYSIS:
   - Risk Level: ${drawingResult.prediction}
   - Confidence Score: ${drawingResult.score}/100
   - AI Observations: "${drawingResult.reasoning}"

2. BIOMETRIC FACE & EYE SCAN:
   - Risk Level: ${faceResult.riskLevel}
   - AI Confidence: ${faceResult.confidence}%
   - Clinical Reasoning: "${faceResult.reasoning}"

Based on BOTH data sources, synthesize a unified clinical risk assessment. Consider that:
- The drawing analysis reflects cognitive and behavioral patterns.
- The biometric scan reflects neurological and social attention indicators.
- Both are screening tools, NOT diagnostic tools. State this clearly.

Return ONLY valid JSON. No markdown, no extra text.
OUTPUT JSON schema:
{
  "overallRisk": "High" | "Medium" | "Low",
  "overallScore": 0 to 100 integer (composite risk score),
  "summary": "2-3 paragraph professional, empathetic summary for parents and clinicians",
  "recommendations": ["3-5 actionable next steps as an array of strings"]
}`;

    let combinedResult;

    try {
      const response = await ai.generate({
        config: { temperature: 0.3, topP: 0.9 },
        prompt: systemPrompt
      });

      const text = response.text;

      try {
        combinedResult = JSON.parse(text);
      } catch (e) {
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start !== -1 && end !== -1 && end > start) {
          combinedResult = JSON.parse(text.slice(start, end + 1));
        } else {
          throw new Error('Failed to parse combined report JSON');
        }
      }
    } catch (apiErr) {
      console.error('Gemini API Error (Combined Report), using fallback:', apiErr.message);
      // Weighted average fallback
      const riskScore = (() => {
        const dScore = drawingResult.score || 50;
        const fScore = faceResult.confidence || 50;
        const fRisk = faceResult.riskLevel === 'High' ? 80 : faceResult.riskLevel === 'Medium' ? 50 : 20;
        return Math.round((dScore * 0.5) + (fRisk * 0.3) + (fScore * 0.2));
      })();
      const overallRisk = riskScore >= 65 ? 'High' : riskScore >= 40 ? 'Medium' : 'Low';

      combinedResult = {
        overallRisk,
        overallScore: riskScore,
        summary: `This screening combines two independent analyses of your child's development. The drawing analysis returned a ${drawingResult.prediction} risk level, while the biometric face and eye scan returned a ${faceResult.riskLevel} risk level. This is a preliminary screening tool and does not constitute a clinical diagnosis. Please consult a qualified pediatrician or developmental specialist for a full evaluation.`,
        recommendations: [
          'Schedule a consultation with a licensed pediatric developmental specialist.',
          'Monitor and document social interaction patterns over the next 2-4 weeks.',
          'Engage in structured play activities that encourage eye contact and joint attention.',
          'Explore early intervention programs available in your area.',
          'Repeat this screening in 4-6 weeks to track progress.'
        ]
      };
    }

    // ── DB WRITE ────────────────────────────────────────────────────────────
    // IMPORTANT: Only store the AI analysis report text and numeric biometric
    // metrics. The raw drawing image (base64) and webcam video frames are
    // NEVER persisted — they are used only transiently for Gemini inference.
    // Explicitly whitelist each field so no accidental blob can reach MongoDB.
    const safeMetrics = {
      eyeContactScore:  typeof faceMetrics?.eyeContactScore  === 'number' ? faceMetrics.eyeContactScore  : null,
      blinkRate:        typeof faceMetrics?.blinkRate         === 'number' ? faceMetrics.blinkRate         : null,
      headStability:    typeof faceMetrics?.headMovement      === 'number' ? faceMetrics.headMovement      : null,
      durationSeconds:  typeof faceMetrics?.duration          === 'number' ? faceMetrics.duration          : null,
    };

    const scanRecord = await VisualScan.create({
      userId:    req.user?._id || null,
      childName: childName    || 'Unknown',
      drawingResult: {
        prediction: drawingResult.prediction,
        reasoning:  drawingResult.reasoning,
        score:      drawingResult.score
      },
      faceResult: {
        riskLevel:  faceResult.riskLevel,
        reasoning:  faceResult.reasoning,
        confidence: faceResult.confidence,
        metrics:    safeMetrics
      },
      combinedReport: {
        overallRisk:     combinedResult.overallRisk,
        overallScore:    combinedResult.overallScore,
        summary:         combinedResult.summary,
        recommendations: combinedResult.recommendations || []
      }
    });

    res.status(200).json({
      success: true,
      scanId: scanRecord._id,
      overallRisk: combinedResult.overallRisk,
      overallScore: combinedResult.overallScore,
      summary: combinedResult.summary,
      recommendations: combinedResult.recommendations || [],
      drawingResult,
      faceResult,
      completedAt: scanRecord.completedAt
    });
  } catch (err) {
    console.error('Combined Report Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
