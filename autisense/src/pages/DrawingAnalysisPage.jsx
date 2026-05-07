import React, { useState, useRef } from 'react';
import { Card, Btn, AnimatedCard, PageWrapper, SectionHeading, Spinner, Container, Grid } from '../components/UI';
import { UploadCloud, CheckCircle, AlertTriangle, Info, Image as ImageIcon, Sparkles, Wand2 } from 'lucide-react';
import '../index.css';

export default function DrawingAnalysisPage() {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file.');
        return;
      }
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file.');
        return;
      }
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const analyzeDrawing = async () => {
    if (!image) return;

    setLoading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(image);
      reader.onloadend = async () => {
        const base64data = reader.result;
        
        try {
          const response = await fetch('http://localhost:5000/api/scan/analyze-drawing', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image: base64data }),
          });

          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || 'Failed to analyze drawing');
          }

          setResult(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
    } catch (err) {
      setError('Error reading file. Please try again.');
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <Container style={{ padding: '60px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div className="animate-fadeInUp" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--orange-pale)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-full)', padding: '6px 18px',
            fontSize: '0.8rem', fontWeight: 800, color: 'var(--orange-solid)',
            marginBottom: 20
          }}>
            <Sparkles size={14} /> AI VISION ANALYSIS
          </div>
          <SectionHeading 
            title="Psychological Drawing Analysis" 
            subtitle="Our AI analyzes spatial organization, repetitive patterns, and social elements in child drawings to identify early autism indicators."
            center
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: result ? '1.2fr 0.8fr' : '1fr', gap: 40, alignItems: 'start', maxWidth: result ? 1200 : 800, margin: '0 auto' }}>
          
          {/* Upload Section */}
          <AnimatedCard delay={0.1}>
            <Card premium p="40px">
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--dark)', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 12 }}>
                <ImageIcon size={24} className="text-orange" />
                Upload Child's Drawing
              </h2>
              
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2.5px dashed var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '60px 24px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: previewUrl ? 'var(--cream)' : 'var(--orange-pale)',
                  transition: 'var(--transition)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 24,
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: 400
                }}
                onMouseEnter={e => { if(!previewUrl) e.currentTarget.style.borderColor = 'var(--orange-solid)'; }}
                onMouseLeave={e => { if(!previewUrl) e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                />
                
                {previewUrl ? (
                  <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center' }}>
                    <img src={previewUrl} alt="Preview" style={{ maxHeight: 500, maxWidth: '100%', objectFit: 'contain', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)' }} />
                    <div style={{ 
                      position: 'absolute', bottom: 16, right: 16, 
                      background: 'rgba(255,255,255,0.95)', padding: '10px 20px', 
                      borderRadius: 'var(--radius-full)', fontSize: '0.85rem', 
                      fontWeight: 800, color: 'var(--orange-solid)', 
                      display: 'flex', alignItems: 'center', gap: 8, 
                      boxShadow: 'var(--shadow-md)', backdropFilter: 'blur(8px)'
                    }}>
                      <Wand2 size={16} /> Tap to Replace
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ 
                      width: 100, height: 100, borderRadius: '50%', 
                      background: 'white', color: 'var(--orange-solid)', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: 'var(--shadow-lg)'
                    }}>
                      <UploadCloud size={44} />
                    </div>
                    <div>
                      <p style={{ fontWeight: 900, color: 'var(--dark)', fontSize: '1.2rem', marginBottom: 8 }}>Drop image here or click</p>
                      <p style={{ fontSize: '0.95rem', color: 'var(--muted)', fontWeight: 600 }}>Supports JPG, PNG, WEBP (Max 10MB)</p>
                    </div>
                  </>
                )}
              </div>

              {error && (
                <div className="animate-fadeIn" style={{ marginTop: 24, padding: '16px 24px', background: 'var(--red-pale)', color: 'var(--red)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.95rem', fontWeight: 700 }}>
                  <AlertTriangle size={24} /> {error}
                </div>
              )}

              <div style={{ marginTop: 40 }}>
                <Btn 
                  variant="primary" 
                  size="lg" 
                  onClick={analyzeDrawing} 
                  disabled={!image || loading}
                  loading={loading}
                  style={{ width: '100%' }}
                >
                  Perform AI Analysis
                </Btn>
              </div>
            </Card>
          </AnimatedCard>

          {/* Results Section */}
          {result && (
            <AnimatedCard delay={0.2}>
              <Card premium p="40px" style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -20, right: -20, fontSize: '6rem', opacity: 0.04 }}>✨</div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 40 }}>
                  <div style={{ 
                    width: 72, height: 72, borderRadius: '24px', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: result.prediction.toLowerCase() === 'high' ? 'var(--red-pale)' : result.prediction.toLowerCase() === 'medium' ? 'var(--amber-pale)' : 'var(--green-pale)',
                    color: result.prediction.toLowerCase() === 'high' ? 'var(--red)' : result.prediction.toLowerCase() === 'medium' ? 'var(--amber)' : 'var(--green)'
                  }}>
                    {result.prediction.toLowerCase() === 'low' ? <CheckCircle size={36} /> : <AlertTriangle size={36} />}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--dark)', marginBottom: 6 }}>Risk Assessment</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ 
                        padding: '6px 16px', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: 900,
                        background: result.prediction.toLowerCase() === 'high' ? 'var(--red)' : result.prediction.toLowerCase() === 'medium' ? 'var(--amber)' : 'var(--green)',
                        color: 'white'
                      }}>
                        {result.prediction} Risk
                      </span>
                      <span style={{ fontSize: '1rem', color: 'var(--muted)', fontWeight: 800 }}>
                        Confidence: {result.score}%
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ background: 'var(--cream)', padding: 32, borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--border)', marginBottom: 32 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, color: 'var(--dark)', fontWeight: 900, fontSize: '1.1rem' }}>
                    <Info size={22} className="text-blue" /> 
                    Psychological Insights
                  </div>
                  <p style={{ color: 'var(--mid)', fontSize: '1.05rem', lineHeight: 1.8, margin: 0, whiteSpace: 'pre-wrap', fontWeight: 500 }}>
                    {result.reasoning}
                  </p>
                </div>

                <Grid cols={2} gap="16px" style={{ marginBottom: 32 }}>
                  <div style={{ background: 'white', padding: '20px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border)' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.04em' }}>Spatial Score</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--dark)' }}>{result.score > 70 ? 'Detailed' : 'Organic'}</div>
                  </div>
                  <div style={{ background: 'white', padding: '20px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border)' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.04em' }}>Social Focus</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--dark)' }}>{result.prediction === 'Low' ? 'High' : 'Limited'}</div>
                  </div>
                </Grid>

                <div style={{ fontSize: '0.85rem', color: 'var(--muted)', textAlign: 'center', fontStyle: 'italic', fontWeight: 500, opacity: 0.8 }}>
                  Disclaimer: AI analysis is an experimental tool and does not constitute a clinical diagnosis.
                </div>
              </Card>
            </AnimatedCard>
          )}

        </div>
      </Container>
    </PageWrapper>
  );
}
