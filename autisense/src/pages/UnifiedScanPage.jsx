import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper, Card, Btn, AnimatedCard, SectionHeading, Spinner, Container, Grid, GlassCard } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { UploadCloud, CheckCircle, AlertTriangle, Info, Image as ImageIcon, Sparkles, Camera, StopCircle, Scan, Activity, Eye, User, ShieldCheck, AlertCircle } from 'lucide-react';

export default function UnifiedScanPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  // Wizard state
  const [step, setStep] = useState(1);

  // Drawing Analysis State
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [drawingLoading, setDrawingLoading] = useState(false);
  const [drawingResult, setDrawingResult] = useState(null);
  const [drawingError, setDrawingError] = useState(null);
  const fileInputRef = useRef(null);

  // Face/Eye Scan State
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const isScanningRef = useRef(false); // Ref mirror of isScanning to avoid stale closures in RAF loop
  const [faceLoading, setFaceLoading] = useState(false); // Used for model load and analysis load
  const [faceResult, setFaceResult] = useState(null);
  const [faceError, setFaceError] = useState(null);
  const [activeMetrics, setActiveMetrics] = useState({ blink: 0, gaze: 0, head: 100 });
  const [faceMetricsObj, setFaceMetricsObj] = useState(null);

  // MediaPipe landmarker instance
  const landmarkerRef = useRef(null);
  const requestRef = useRef(null);
  
  // Metrics collection
  const metricsRef = useRef({
    framesProcessed: 0,
    blinkCount: 0,
    eyeContactFrames: 0,
    lastEyeState: 'open',
    expressionScore: 0,
    headMovement: 0,
    lastNosePos: null
  });

  // Combined Report State
  const [combinedLoading, setCombinedLoading] = useState(false);
  const [combinedReport, setCombinedReport] = useState(null);
  const [combinedError, setCombinedError] = useState(null);

  // Initialize MediaPipe when reaching Step 3
  useEffect(() => {
    async function initMediaPipe() {
      if (step === 3 && !landmarkerRef.current) {
        setFaceLoading(true);
        try {
          const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
          );
          landmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
              delegate: "GPU"
            },
            outputFaceBlendshapes: true,
            runningMode: "VIDEO",
            numFaces: 1
          });
          setFaceLoading(false);
        } catch (err) {
          console.error("MediaPipe initialization failed:", err);
          setFaceError("Failed to load Face Tracking AI models.");
          setFaceLoading(false);
        }
      }
    }
    initMediaPipe();
    
    return () => {
      stopScan();
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
      }
    };
  }, [step]);


  /* --- Step 2: Drawing Logic --- */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setDrawingError('Please upload an image file.');
        return;
      }
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setDrawingResult(null);
      setDrawingError(null);
    }
  };
  const startScan = async () => {
    if (!landmarkerRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480, facingMode: "user" } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        isScanningRef.current = true;
        setIsScanning(true);
        setFaceResult(null);
        setFaceError(null);
        
        // Reset metrics
        metricsRef.current = {
          framesProcessed: 0, blinkCount: 0, eyeContactFrames: 0,
          lastEyeState: 'open', expressionScore: 0, headMovement: 0,
          lastNosePos: null, startTime: Date.now()
        };
        processVideo();
      }
    } catch (err) {
      setFaceError("Webcam access denied. Please allow camera permissions to use this tool.");
    }
  };

  const stopScan = () => {
    isScanningRef.current = false;
    setIsScanning(false);
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  };

  const processVideo = () => {
    if (!isScanningRef.current || !videoRef.current || !landmarkerRef.current) return;
    
    const video = videoRef.current;
    if (video.currentTime > 0) {
      const results = landmarkerRef.current.detectForVideo(video, performance.now());
      const ctx = canvasRef.current?.getContext('2d');
      
      if (ctx && canvasRef.current) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        
        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
          const landmarks = results.faceLandmarks[0];
          const blendshapes = results.faceBlendshapes[0]?.categories || [];
          metricsRef.current.framesProcessed++;
          
          // Blink Detection
          const leftBlink = blendshapes.find(b => b.categoryName === 'eyeBlinkLeft')?.score || 0;
          const rightBlink = blendshapes.find(b => b.categoryName === 'eyeBlinkRight')?.score || 0;
          const isBlinking = leftBlink > 0.4 && rightBlink > 0.4;
          
          if (isBlinking && metricsRef.current.lastEyeState === 'open') {
            metricsRef.current.blinkCount++;
            metricsRef.current.lastEyeState = 'closed';
          } else if (!isBlinking) {
            metricsRef.current.lastEyeState = 'open';
          }
          
          // Eye Contact
          const lookLeft = blendshapes.find(b => b.categoryName === 'eyeLookOutLeft')?.score || 0;
          const lookRight = blendshapes.find(b => b.categoryName === 'eyeLookOutRight')?.score || 0;
          const lookUp = blendshapes.find(b => b.categoryName === 'eyeLookUpLeft')?.score || 0;
          const hasContact = lookLeft < 0.25 && lookRight < 0.25 && lookUp < 0.25;
          if (hasContact && !isBlinking) metricsRef.current.eyeContactFrames++;
          
          // Head Movement
          const noseTip = landmarks[1];
          if (metricsRef.current.lastNosePos) {
            const dx = noseTip.x - metricsRef.current.lastNosePos.x;
            const dy = noseTip.y - metricsRef.current.lastNosePos.y;
            metricsRef.current.headMovement += Math.sqrt(dx*dx + dy*dy);
          }
          metricsRef.current.lastNosePos = noseTip;

          if (metricsRef.current.framesProcessed % 10 === 0) {
            setActiveMetrics({
              blink: metricsRef.current.blinkCount,
              gaze: Math.round((metricsRef.current.eyeContactFrames / metricsRef.current.framesProcessed) * 100),
              head: Math.max(0, 100 - Math.round(metricsRef.current.headMovement * 200))
            });
          }

          ctx.fillStyle = hasContact ? '#22C55E' : '#FF6B2B';
          [33, 263, 1].forEach(idx => {
            const lm = landmarks[idx];
            ctx.beginPath();
            ctx.arc(lm.x * canvasRef.current.width, lm.y * canvasRef.current.height, 4, 0, 2 * Math.PI);
            ctx.fill();
          });
        }
      }
    }
    requestRef.current = requestAnimationFrame(processVideo);
  };

  const completeFaceAnalysis = async () => {
    stopScan();
    
    const m = metricsRef.current;
    const durationSec = Math.max(1, (Date.now() - m.startTime) / 1000);
    const eyeContactScore = Math.min(100, Math.round((m.eyeContactFrames / Math.max(1, m.framesProcessed)) * 100));
    const blinkRate = Math.round((m.blinkCount / durationSec) * 60);
    const headStability = Math.max(0, 100 - Math.min(100, Math.round(m.headMovement * 500 / durationSec)));
    
    const metricsPayload = {
      eyeContactScore,
      expressionScore: 75,
      blinkRate,
      headMovement: headStability,
      duration: Math.round(durationSec)
    };

    setFaceMetricsObj(metricsPayload);
    // Proceed to Step 4 to do the full analysis
    setStep(4);
  };

  /* --- Step 4: Combined Report Logic --- */
  const generateCombined = async () => {
    setCombinedLoading(true);
    setCombinedError(null);
    try {
      // 1. Analyze Drawing
      const reader = new FileReader();
      const base64Promise = new Promise((resolve, reject) => {
        reader.readAsDataURL(image);
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
      });
      const base64data = await base64Promise;

      const drawingRes = await fetch('http://localhost:5000/api/scan/analyze-drawing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64data }),
      });
      const drawingData = await drawingRes.json();
      if (!drawingRes.ok) throw new Error(drawingData.error || 'Failed to analyze drawing');
      setDrawingResult(drawingData);

      // 2. Analyze Face/Eye Metrics
      const faceRes = await fetch('http://localhost:5000/api/scan/analyze-face-eye', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token && { 'Authorization': `Bearer ${token}` }) },
        body: JSON.stringify(faceMetricsObj)
      });
      const faceData = await faceRes.json();
      if (!faceRes.ok) throw new Error(faceData.error || 'Face Analysis failed');
      setFaceResult(faceData);

      // 3. Generate Combined Report
      const combinedRes = await fetch('http://localhost:5000/api/scan/combined-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token && { 'Authorization': `Bearer ${token}` }) },
        body: JSON.stringify({
          drawingResult: drawingData,
          faceResult: faceData,
          faceMetrics: faceMetricsObj,
          childName: user?.name ? `Child of ${user.name}` : 'Unknown'
        })
      });
      const combinedData = await combinedRes.json();
      if (!combinedRes.ok) throw new Error(combinedData.error || 'Failed to generate report');
      setCombinedReport(combinedData);

    } catch (err) {
      setCombinedError(err.message);
    } finally {
      setCombinedLoading(false);
    }
  };


  /* --- UI Helpers --- */
  const renderProgressBar = () => {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 40, gap: 10 }}>
        {[1, 2, 3, 4].map(s => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ 
              width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: step >= s ? 'var(--orange-solid)' : 'var(--border)',
              color: step >= s ? 'white' : 'var(--muted)',
              fontWeight: 800, fontSize: '0.9rem',
              transition: 'var(--transition)'
            }}>
              {s}
            </div>
            {s < 4 && <div style={{ height: 2, width: 40, background: step > s ? 'var(--orange-solid)' : 'var(--border)' }} />}
          </div>
        ))}
      </div>
    );
  };

  return (
    <PageWrapper>
      <Container style={{ padding: '40px 0 80px' }}>
        
        {renderProgressBar()}

        {/* --- STEP 1: INTRO --- */}
        {step === 1 && (
          <AnimatedCard>
            <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--orange-pale)', borderRadius: 'var(--radius-full)', padding: '6px 18px', fontSize: '0.8rem', fontWeight: 800, color: 'var(--orange-solid)', marginBottom: 20 }}>
                <Sparkles size={14} /> UNIFIED AI SCREENING
              </div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 20 }}>Visual Screening Wizard</h1>
              <p style={{ fontSize: '1.1rem', color: 'var(--mid)', marginBottom: 40 }}>
                This 2-part screening combines psychological drawing analysis and real-time biometric face tracking to provide a comprehensive developmental assessment.
              </p>
              
              <Card premium p="32px" style={{ textAlign: 'left', marginBottom: 40 }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: 20 }}>What to expect:</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', gap: 12 }}><ImageIcon className="text-orange" /> <span style={{ fontWeight: 600 }}>Part 1: Upload a drawing your child has made recently.</span></div>
                  <div style={{ display: 'flex', gap: 12 }}><Camera className="text-orange" /> <span style={{ fontWeight: 600 }}>Part 2: Complete a short 30-second live face and eye scan using your webcam.</span></div>
                  <div style={{ display: 'flex', gap: 12 }}><Activity className="text-orange" /> <span style={{ fontWeight: 600 }}>Part 3: Receive a unified AI report detailing potential risks and recommendations.</span></div>
                </div>
              </Card>

              <Btn size="lg" onClick={() => setStep(2)}>Begin Screening →</Btn>
            </div>
          </AnimatedCard>
        )}

        {/* --- STEP 2: DRAWING --- */}
        {step === 2 && (
          <AnimatedCard>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
               <h2 style={{ fontSize: '2rem', fontWeight: 900 }}>Part 1: Drawing Analysis</h2>
               <p style={{ color: 'var(--muted)' }}>Upload your child's drawing to evaluate spatial and social patterns.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: drawingResult ? '1.2fr 0.8fr' : '1fr', gap: 40, maxWidth: drawingResult ? 1000 : 600, margin: '0 auto' }}>
              
              <Card premium p="32px">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)', padding: '40px 24px', textAlign: 'center', cursor: 'pointer',
                    background: previewUrl ? 'var(--cream)' : 'var(--orange-pale)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16
                  }}
                >
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" style={{ maxHeight: 300, objectFit: 'contain', borderRadius: 'var(--radius-md)' }} />
                  ) : (
                    <>
                      <UploadCloud size={40} className="text-orange" />
                      <div><p style={{ fontWeight: 800 }}>Click to upload image</p><p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>JPG, PNG (Max 10MB)</p></div>
                    </>
                  )}
                </div>
                {drawingError && <div style={{ marginTop: 16, color: 'var(--red)', fontWeight: 700, textAlign: 'center' }}>{drawingError}</div>}
                
                <Btn variant="primary" size="lg" onClick={() => setStep(3)} disabled={!image} style={{ width: '100%', marginTop: 24 }}>
                  Continue to Face Scan →
                </Btn>
              </Card>

            </div>
          </AnimatedCard>
        )}

        {/* --- STEP 3: FACE/EYE --- */}
        {step === 3 && (
          <AnimatedCard>
             <div style={{ textAlign: 'center', marginBottom: 40 }}>
               <h2 style={{ fontSize: '2rem', fontWeight: 900 }}>Part 2: Biometric Scan</h2>
               <p style={{ color: 'var(--muted)' }}>Ensure the child's face is clearly visible in the camera.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 40, maxWidth: 1100, margin: '0 auto' }}>
              <Card premium p="16px" style={{ position: 'relative' }}>
                <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', background: '#111', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} playsInline muted />
                  <canvas ref={canvasRef} width={640} height={480} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', transform: 'scaleX(-1)' }} />
                  
                  {faceLoading && !isScanning && (
                    <div className="glass" style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <Spinner size={32} />
                      <p style={{ marginTop: 20, fontWeight: 800 }}>Loading AI Models...</p>
                    </div>
                  )}
                  
                  {!isScanning && !faceLoading && !faceResult && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', opacity: 0.5 }}>
                      <Camera size={48} style={{ marginBottom: 16 }} />
                      <p style={{ fontWeight: 700 }}>Ready to scan</p>
                    </div>
                  )}
                </div>

                <div style={{ padding: '24px 16px 8px', display: 'flex', gap: 16, justifyContent: 'center' }}>
                  {!isScanning && !faceResult && (
                    <Btn onClick={startScan} disabled={faceLoading}>Start Scan</Btn>
                  )}
                  {isScanning && (
                    <>
                      <Btn variant="outline" onClick={stopScan} style={{ borderColor: 'var(--red)', color: 'var(--red)' }}>Stop</Btn>
                      <Btn onClick={completeFaceAnalysis}>Finish Scan & Continue</Btn>
                    </>
                  )}
                </div>
              </Card>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <Card premium p="24px">
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: 16 }}>Live Metrics</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}><span>Gaze Fixation</span> <span>{activeMetrics.gaze}%</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}><span>Blink Count</span> <span>{activeMetrics.blink}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}><span>Head Stability</span> <span>{activeMetrics.head}%</span></div>
                  </div>
                </Card>
              </div>
            </div>
          </AnimatedCard>
        )}

        {/* --- STEP 4: COMBINED REPORT --- */}
        {step === 4 && (
          <AnimatedCard>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
               <h2 style={{ fontSize: '2rem', fontWeight: 900 }}>Final Clinical Report</h2>
               <p style={{ color: 'var(--muted)' }}>Synthesize analysis of both drawing and biometric data.</p>
            </div>

            {!combinedReport && !combinedLoading && !combinedError && (
              <div style={{ textAlign: 'center', padding: 80 }}>
                <Activity size={48} className="text-orange" style={{ margin: '0 auto 20px' }} />
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: 16 }}>Ready to Analyze</h3>
                <p style={{ color: 'var(--muted)', marginBottom: 32 }}>We've collected the drawing and face scan metrics. Click below to begin the comprehensive AI analysis.</p>
                <Btn size="lg" onClick={generateCombined}>Generate Combined Report</Btn>
              </div>
            )}

            <Container style={{ maxWidth: 800 }}>
              {combinedLoading ? (
                <div style={{ textAlign: 'center', padding: 80 }}>
                  <Spinner size={48} />
                  <p style={{ marginTop: 24, fontWeight: 800, fontSize: '1.2rem' }}>AI is generating the combined report...</p>
                </div>
              ) : combinedReport ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <GlassCard premium p="40px" style={{ borderTop: `8px solid ${combinedReport.overallRisk === 'High' ? 'var(--red)' : combinedReport.overallRisk === 'Medium' ? 'var(--amber)' : 'var(--green)'}` }}>
                    <div style={{ textAlign: 'center', marginBottom: 32 }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Overall Assessment</div>
                      <div style={{ fontSize: '2.5rem', fontWeight: 900, color: combinedReport.overallRisk === 'High' ? 'var(--red)' : combinedReport.overallRisk === 'Medium' ? 'var(--amber)' : 'var(--green)' }}>
                        {combinedReport.overallRisk} Risk
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>Composite Score: {combinedReport.overallScore}/100</div>
                    </div>

                    <div style={{ background: 'white', padding: 24, borderRadius: 'var(--radius-md)', marginBottom: 24 }}>
                      <h4 style={{ fontWeight: 900, marginBottom: 12 }}>Clinical Summary</h4>
                      <p style={{ lineHeight: 1.7, color: 'var(--mid)', fontWeight: 500 }}>{combinedReport.summary}</p>
                    </div>

                    <div style={{ background: 'white', padding: 24, borderRadius: 'var(--radius-md)' }}>
                      <h4 style={{ fontWeight: 900, marginBottom: 12 }}>Recommendations</h4>
                      <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8, color: 'var(--mid)', fontWeight: 500 }}>
                        {combinedReport.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                      </ul>
                    </div>
                  </GlassCard>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    <Card p="24px">
                      <h4 style={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}><ImageIcon size={18} /> Drawing Results</h4>
                      <p style={{ fontSize: '0.9rem', color: 'var(--mid)' }}>Risk: <strong>{combinedReport.drawingResult?.prediction}</strong></p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: 8 }}>{combinedReport.drawingResult?.reasoning}</p>
                    </Card>
                    <Card p="24px">
                      <h4 style={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}><Camera size={18} /> Biometric Results</h4>
                      <p style={{ fontSize: '0.9rem', color: 'var(--mid)' }}>Risk: <strong>{combinedReport.faceResult?.riskLevel}</strong></p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: 8 }}>{combinedReport.faceResult?.reasoning}</p>
                    </Card>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 24 }}>
                    <Btn variant="outline" onClick={() => { setStep(1); setDrawingResult(null); setFaceResult(null); }}>Start New Screening</Btn>
                    <Btn onClick={() => navigate(user ? '/parent' : '/')}>Back to Dashboard</Btn>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--red)' }}>{combinedError}</div>
              )}
            </Container>
          </AnimatedCard>
        )}

      </Container>
    </PageWrapper>
  );
}
