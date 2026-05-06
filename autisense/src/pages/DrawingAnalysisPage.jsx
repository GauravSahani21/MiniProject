import React, { useState, useRef } from 'react';
import { Card, Button, AnimatedCard } from '../components/UI';
import { UploadCloud, CheckCircle, AlertTriangle, Info, Image as ImageIcon } from 'lucide-react';
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
          const response = await fetch('http://localhost:5001/analyze-drawing', {
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
    <div className="page-container">
      <div className="page-header" style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 className="page-title">🎨 AI Drawing Analysis</h1>
        <p className="page-subtitle" style={{ maxWidth: 600, margin: '0 auto' }}>
          Upload a drawing created by the child. Our advanced AI will analyze the drawing for characteristics 
          often associated with autism spectrum disorder to provide an early risk assessment.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32, alignItems: 'center' }}>
        
        {/* Upload Section */}
        <AnimatedCard delay={0.1} style={{ width: '100%', maxWidth: 700 }}>
          <Card>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--dark)', marginBottom: 16 }}>Upload Drawing</h2>
            
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '40px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                background: previewUrl ? 'var(--bg)' : 'var(--slate-pale)',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 16
              }}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                style={{ display: 'none' }} 
              />
              
              {previewUrl ? (
                <div style={{ position: 'relative', width: '100%', maxHeight: 300, display: 'flex', justifyContent: 'center' }}>
                  <img src={previewUrl} alt="Preview" style={{ maxHeight: 300, maxWidth: '100%', objectFit: 'contain', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }} />
                  <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(255,255,255,0.9)', padding: '6px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--mid)', display: 'flex', alignItems: 'center', gap: 6, boxShadow: 'var(--shadow-sm)' }}>
                    <ImageIcon size={14} /> Change Image
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--orange-pale)', color: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UploadCloud size={32} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, color: 'var(--dark)', marginBottom: 4 }}>Click or drag image here</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--mid)' }}>Supports JPG, PNG, WEBP</p>
                  </div>
                </>
              )}
            </div>

            {error && (
              <div style={{ marginTop: 16, padding: '12px 16px', background: '#fee2e2', color: '#b91c1c', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem' }}>
                <AlertTriangle size={18} /> {error}
              </div>
            )}

            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
              <Button 
                variant="primary" 
                size="lg" 
                onClick={analyzeDrawing} 
                disabled={!image || loading}
                style={{ width: '100%', maxWidth: 300, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}
              >
                {loading ? (
                  <>
                    <div className="spinner" style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    Analyzing Image...
                  </>
                ) : (
                  'Analyze Drawing'
                )}
              </Button>
            </div>
          </Card>
        </AnimatedCard>

        {/* Results Section */}
        {result && (
          <AnimatedCard delay={0.2} style={{ width: '100%', maxWidth: 700 }}>
            <Card style={{ 
              borderTop: `4px solid ${result.prediction.toLowerCase() === 'high' ? 'var(--red)' : result.prediction.toLowerCase() === 'medium' ? 'var(--orange)' : 'var(--green)'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 24 }}>
                <div style={{ 
                  width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: result.prediction.toLowerCase() === 'high' ? '#fee2e2' : result.prediction.toLowerCase() === 'medium' ? 'var(--orange-pale)' : '#dcfce7',
                  color: result.prediction.toLowerCase() === 'high' ? '#dc2626' : result.prediction.toLowerCase() === 'medium' ? 'var(--orange-deep)' : '#16a34a'
                }}>
                  {result.prediction.toLowerCase() === 'low' ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--dark)', marginBottom: 4 }}>Analysis Result</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ 
                      padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 700,
                      background: result.prediction.toLowerCase() === 'high' ? '#fee2e2' : result.prediction.toLowerCase() === 'medium' ? 'var(--orange-pale)' : '#dcfce7',
                      color: result.prediction.toLowerCase() === 'high' ? '#dc2626' : result.prediction.toLowerCase() === 'medium' ? 'var(--orange-deep)' : '#16a34a'
                    }}>
                      {result.prediction} Risk
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--mid)', fontWeight: 600 }}>
                      Confidence Score: {result.score}%
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--slate-pale)', padding: 20, borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: 'var(--dark)', fontWeight: 600 }}>
                  <Info size={18} style={{ color: 'var(--blue)' }} /> 
                  Psychological Reasoning
                </div>
                <p style={{ color: 'var(--mid)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                  {result.reasoning}
                </p>
              </div>

              <div style={{ marginTop: 24, fontSize: '0.8rem', color: 'var(--mid)', textAlign: 'center' }}>
                Disclaimer: This AI analysis is an experimental tool and should not replace a professional clinical diagnosis.
              </div>
            </Card>
          </AnimatedCard>
        )}

      </div>
    </div>
  );
}
