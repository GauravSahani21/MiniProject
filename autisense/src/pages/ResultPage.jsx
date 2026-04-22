import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper, Card, Btn, useToast, Skeleton } from '../components/UI';
import { CHILDREN, CATEGORIES, riskColor, riskBgColor, riskTextColor } from '../data/dummyData';

export default function ResultPage() {
  const navigate = useNavigate();
  const { showToast, ToastComponent } = useToast();
  const [loadingAI, setLoadingAI] = useState(true);

  // Hardcode Meera's result for demo purposes
  const child = CHILDREN[1]; 
  const score = child.score;
  const risk = child.risk;
  const cColor = riskColor(risk);
  const cBg = riskBgColor(risk);
  const cText = riskTextColor(risk);

  useEffect(() => {
    const t = setTimeout(() => setLoadingAI(false), 1500);
    return () => clearTimeout(t);
  }, []);

  const dlPdf = () => showToast('Report downloaded as PDF!', 'success');
  const shareDoc = () => showToast('Report shared securely with Dr. Gupta', 'success');

  const riskEmoji = risk === 'Low' ? '✅' : risk === 'Medium' ? '⚠️' : '🔴';
  
  // Fake category scores based on total score
  const catScores = { social: 3, comm: 3, behavior: 2, sensory: 2, routine: 1 };

  return (
    <PageWrapper style={{ padding: '40px 24px' }}>
      {ToastComponent}
      <div className="container" style={{ maxWidth: 960 }}>
        
        {/* Header */}
        <Card className="animate-fadeInUp" style={{ padding: 32, marginBottom: 24, textAlign: 'center', background: cBg, border: `1.5px solid ${cColor}` }}>
          <div style={{ fontSize: '3rem', marginBottom: 8 }}>{riskEmoji}</div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '2rem', color: cText, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {risk} Risk
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--dark)', marginTop: 8, fontWeight: 600 }}>
            {child.name} • {child.age} yrs • Screened {new Date().toLocaleDateString()}
          </p>
          
          <div style={{ maxWidth: 500, margin: '24px auto 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, color: 'var(--dark)', marginBottom: 8 }}>
              <span>Total Score</span>
              <span>{score} / 20</span>
            </div>
            {/* 3 Zone Bar */}
            <div style={{ height: 12, background: 'var(--border)', borderRadius: 6, position: 'relative', overflow: 'hidden', display: 'flex' }}>
               <div style={{ width: '30%', background: 'var(--green)', borderRight: '2px solid white' }} />
               <div style={{ width: '35%', background: 'var(--amber)', borderRight: '2px solid white' }} />
               <div style={{ width: '35%', background: 'var(--red)' }} />
               {/* Marker */}
               <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${(score/20)*100}%`, width: 4, background: 'var(--dark)', boxShadow: '0 0 0 2px white', transition: 'left 1s ease', animation: 'fadeIn 1.5s ease' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--muted)', marginTop: 6, textTransform: 'uppercase', fontWeight: 700 }}>
              <span style={{ width: '30%' }}>Low (0-6)</span>
              <span style={{ width: '35%', textAlign: 'center' }}>Medium (7-13)</span>
              <span style={{ width: '35%', textAlign: 'right' }}>High (14-20)</span>
            </div>
          </div>
        </Card>

        {/* 2 Col Grid */}
        <div className="grid-2" style={{ marginBottom: 24 }}>
          {/* AI Analysis */}
          <Card className="animate-fadeInUp delay-1" style={{ padding: 28, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                🤖 Claude AI Analysis
              </h2>
              <span style={{ fontSize: '0.65rem', background: 'var(--orange-pale)', color: 'var(--orange-deep)', padding: '3px 8px', borderRadius: 4, fontWeight: 700, textTransform: 'uppercase' }}>AI Generated</span>
            </div>
            
            {loadingAI ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                <Skeleton height={14} width="100%" />
                <Skeleton height={14} width="95%" />
                <Skeleton height={14} width="80%" />
                <br/>
                <Skeleton height={14} width="100%" />
                <Skeleton height={14} width="85%" />
              </div>
            ) : (
              <div className="animate-fadeIn" style={{ fontSize: '0.9rem', color: 'var(--mid)', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p>Based on the responses provided, Meera presents a <strong>Medium Risk</strong> profile for autism spectrum indicators.</p>
                <p>While she demonstrates good social interaction foundations such as making eye contact and pointing to show interest, there are notable flags in repetitive behaviours and sensory sensitivities.</p>
                <p>Specifically, the reported sensitivity to loud noises and a rigid adherence to daily routines warrant closer monitoring by a developmental specialist.</p>
              </div>
            )}
          </Card>

          {/* Categories */}
          <Card className="animate-fadeInUp delay-2" style={{ padding: 28 }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.2rem', marginBottom: 24 }}>Category Breakdown</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {CATEGORIES.map(c => {
                const s = catScores[c.key];
                const pct = (s / c.max) * 100;
                const col = pct <= 33 ? 'var(--green)' : pct <= 66 ? 'var(--amber)' : 'var(--red)';
                return (
                  <div key={c.key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark)', marginBottom: 6 }}>
                      <span>{c.label}</span>
                      <span>{s}/{c.max}</span>
                    </div>
                    <div style={{ height: 8, background: 'var(--border)', borderRadius: 4 }}>
                      <div className="score-bar-fill" style={{ width: `${pct}%`, background: col, borderRadius: 4 }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Text details */}
        <div className="grid-3" style={{ marginBottom: 32 }}>
          <Card className="animate-fadeInUp delay-3" style={{ padding: 24 }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--red)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              ⚠️ Flagged Concerns
            </h3>
            <ul style={{ paddingLeft: 20, fontSize: '0.85rem', color: 'var(--mid)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>Sensitivity to loud sounds</li>
              <li>Upset by small changes in routine</li>
              <li>Occasional repetitive hand movements</li>
            </ul>
          </Card>
          
          <Card className="animate-fadeInUp delay-4" style={{ padding: 24 }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--green)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              ✅ Strengths Observed
            </h3>
            <ul style={{ paddingLeft: 20, fontSize: '0.85rem', color: 'var(--mid)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>Consistent eye contact</li>
              <li>Responds to own name</li>
              <li>Brings objects to show parents</li>
            </ul>
          </Card>

          <Card className="animate-fadeInUp delay-5" style={{ padding: 24 }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--dark)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              ℹ️ What This Means
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--mid)', lineHeight: 1.6 }}>
              A Medium Risk result means your child displays some traits associated with autism. It is <strong>not a diagnosis</strong>, but indicates that a professional evaluation is the safe next step.
            </p>
          </Card>
        </div>

        {/* 3 Step Rec */}
        <div className="animate-fadeInUp delay-6" style={{ background: 'var(--dark)', borderRadius: 'var(--radius-lg)', padding: '32px 40px', marginBottom: 32, color: 'white' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.2rem', marginBottom: 24, textAlign: 'center' }}>Recommended Next Steps</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>📥</div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 6 }}>1. Save Report</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Download the PDF to keep a record.</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>🩺</div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 6 }}>2. Visit Pediatrician</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Share this report with your doctor.</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>📅</div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 6 }}>3. Follow Up</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Screen again in 6 months.</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="animate-fadeInUp delay-6" style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
          <Btn size="lg" onClick={dlPdf}>📥 Download PDF</Btn>
          <Btn size="lg" variant="outline" onClick={shareDoc}>🩺 Share with Doctor</Btn>
          <Btn size="lg" variant="ghost" onClick={() => navigate('/screening')}>🔄 Screen Again</Btn>
          <Btn size="lg" variant="ghost" onClick={() => navigate('/parent')}>← Dashboard</Btn>
        </div>

      </div>
    </PageWrapper>
  );
}
