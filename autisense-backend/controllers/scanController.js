import { ai } from '../config/genkit.js';

// @desc    Analyze a child's drawing for autism indicators
// @route   POST /api/scan/analyze-drawing
// @access  Public (or Private)
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

    const response = await ai.generate({
      config: { temperature: 0.2, topP: 0.9 },
      prompt: [
        { text: systemPrompt },
        { media: { url: `data:image/jpeg;base64,${base64Image}`, contentType: 'image/jpeg' } }
      ]
    });

    const text = response.text;
    let result;
    
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
// @access  Public (or Private)
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

    const response = await ai.generate({
      config: { temperature: 0.2, topP: 0.9 },
      prompt: systemPrompt
    });

    const text = response.text;
    let result;
    
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
