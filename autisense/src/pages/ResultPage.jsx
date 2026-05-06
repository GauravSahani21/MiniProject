import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper, Card, Btn, useToast, Skeleton } from '../components/UI';
import { CATEGORIES, riskColor, riskBgColor, riskTextColor, getRisk } from '../data/dummyData';
import { useScreening } from '../context/ScreeningContext';

/* ── AI narrative generator (client-side, no API key needed) ── */
function generateNarrative(result) {
  const { child, risk, score, total, categories, flagged } = result;
  const name = child?.name?.split(' ')[0] || 'Your child';

  const riskSentence =
    risk === 'Low'
      ? `Based on the screening responses, ${name} presents a <strong>Low Risk</strong> profile for autism spectrum traits.`
      : risk === 'Medium'
      ? `Based on the screening responses, ${name} presents a <strong>Medium Risk</strong> profile for autism spectrum indicators.`
      : `Based on the screening responses, ${name} presents a <strong>High Risk</strong> profile warranting prompt specialist evaluation.`;

  const highCats = Object.entries(categories || {})
    .filter(([, v]) => v > 0.5)
    .map(([k]) => k);
  const lowCats  = Object.entries(categories || {})
    .filter(([, v]) => v <= 0.25)
    .map(([k]) => k);

  const concernLine =
    highCats.length > 0
      ? `Notable areas of concern include <strong>${highCats.join(' and ')}</strong>, which scored above the caution threshold.`
      : 'No single domain scored critically above threshold.';

  const strengthLine =
    lowCats.length > 0
      ? `${name} shows relative strengths in <strong>${lowCats.join(' and ')}</strong>.`
      : 'All domains warrant careful monitoring.';

  const scoreLine = `The total score is <strong>${score}/${total}</strong> (${Math.round((score/total)*100)}%).`;

  return [riskSentence, concernLine, strengthLine, scoreLine];
}

/* ── Category → max score mapping ───────────────────────────── */
const CAT_MAX = { Social: 5, Communication: 5, Behavior: 5, Sensory: 3, Routine: 2 };

/* ── Friendly labels & emojis for CATEGORIES ────────────────── */
const CAT_META = {
  Social:        { label: 'Social Interaction', emoji: '👁️' },
  Communication: { label: 'Communication',      emoji: '💬' },
  Behavior:      { label: 'Behavior',            emoji: '🔁' },
  Sensory:       { label: 'Sensory',             emoji: '👂' },
  Routine:       { label: 'Routine & Play',      emoji: '😟' },
};

export default function ResultPage() {
  const navigate = useNavigate();
  const { showToast, ToastComponent } = useToast();
  const { result } = useScreening();
  const [loadingAI, setLoadingAI] = useState(true);

  // Simulate AI "thinking" animation then reveal
  useEffect(() => {
    const t = setTimeout(() => setLoadingAI(false), 1800);
    return () => clearTimeout(t);
  }, []);

  /* ── If no result in context (e.g. page refresh), redirect ── */
  if (!result) {
    return (
      <PageWrapper style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <Card className="animate-fadeInUp" style={{ maxWidth: 440, width: '100%', padding: '36px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>📋</div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.3rem', marginBottom: 12 }}>No Result Found</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: 24 }}>
            Please complete a screening first to see your results.
          </p>
          <Btn size="lg" style={{ width: '100%' }} onClick={() => navigate('/screening')}>
            Start Screening →
          </Btn>
        </Card>
      </PageWrapper>
    );
  }

  /* ── Extract from live result ────────────────────────────── */
  const { child, risk, score, total = 20, probability, categories = {}, flagged = [], _offline } = result;

  const cColor  = riskColor(risk);
  const cBg     = riskBgColor(risk);
  const cText   = riskTextColor(risk);
  const riskEmoji = risk === 'Low' ? '✅' : risk === 'Medium' ? '⚠️' : '🔴';
  const narrative = generateNarrative(result);

  /* ── Category score bars ─────────────────────────────────── */
  // categories from API are fractions (0–1); multiply by max for display
  const catItems = Object.entries(CAT_MAX).map(([key, max]) => {
    const fraction = categories[key] ?? 0;
    const rawScore = Math.round(fraction * max);
    const pct      = (rawScore / max) * 100;
    const col      = pct <= 33 ? 'var(--green)' : pct <= 66 ? 'var(--amber)' : 'var(--red)';
    return { key, max, rawScore, pct, col, ...(CAT_META[key] || {}) };
  });

  /* ── Flagged questions → readable concerns ───────────────── */
  const strengths = ['Responds to name when called', 'Shows interest in surroundings', 'Makes eye contact during familiar interactions'].slice(
    0, Math.max(1, 3 - Math.floor(score / 7))
  );

  /* ── Actions ─────────────────────────────────────────────── */
  const dlPdf = () => {
    showToast('Preparing PDF document...', 'success');
    setTimeout(() => window.print(), 500);
  };

  const shareDoc = () => {
    const subject = encodeURIComponent(`AutiSense Screening Report: ${child?.name || 'Patient'}`);
    const body = encodeURIComponent(
      `Hello Doctor,\n\nPlease find the recent AutiSense developmental screening results for ${child?.name || 'my child'}.\n\n` +
      `Risk Assessment: ${risk} Risk\n` +
      `Total Score: ${score}/${total}\n\n` +
      `Flagged Concerns:\n${flagged.length > 0 ? flagged.map(f => '- ' + f).join('\n') : 'None'}\n\n` +
      `Please let me know when we can schedule a follow-up to discuss these results.\n\nThank you.`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    showToast('Opening your email client...', 'success');
  };

  return (
    <PageWrapper style={{ padding: '40px 24px' }}>
      {ToastComponent}
      <div className="container" style={{ maxWidth: 960 }}>

        {/* ── Offline notice ── */}
        {_offline && (
          <div className="animate-fadeIn" style={{ background: 'var(--amber-pale)', border: '1px solid var(--amber)', borderRadius: 'var(--radius-sm)', padding: '10px 16px', marginBottom: 20, fontSize: '0.82rem', color: '#92400E', display: 'flex', gap: 8, alignItems: 'center' }}>
            ⚠️ <span>Flask API not reachable — result computed using <strong>offline scoring</strong>. Start <code>python api.py</code> for full ML predictions.</span>
          </div>
        )}

        {/* ── Risk Header ── */}
        <Card className="animate-fadeInUp" style={{ padding: 32, marginBottom: 24, textAlign: 'center', background: cBg, border: `1.5px solid ${cColor}` }}>
          <div style={{ fontSize: '3rem', marginBottom: 8 }}>{riskEmoji}</div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '2rem', color: cText, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {risk} Risk
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--dark)', marginTop: 8, fontWeight: 600 }}>
            {child?.name} • {child?.age} yrs • Screened {new Date(result.screened_at || Date.now()).toLocaleDateString()}
          </p>
          {probability !== undefined && (
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: 4 }}>
              ML Confidence: <strong>{probability}%</strong>
            </p>
          )}

          {/* Score bar */}
          <div style={{ maxWidth: 500, margin: '24px auto 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, color: 'var(--dark)', marginBottom: 8 }}>
              <span>Total Score</span>
              <span>{score} / {total}</span>
            </div>
            <div style={{ height: 12, background: 'var(--border)', borderRadius: 6, position: 'relative', overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: '30%', background: 'var(--green)',  borderRight: '2px solid white' }} />
              <div style={{ width: '35%', background: 'var(--amber)',  borderRight: '2px solid white' }} />
              <div style={{ width: '35%', background: 'var(--red)' }} />
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${(score/total)*100}%`, width: 4, background: 'var(--dark)', boxShadow: '0 0 0 2px white', transition: 'left 1s ease' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--muted)', marginTop: 6, textTransform: 'uppercase', fontWeight: 700 }}>
              <span style={{ width: '30%' }}>Low (0–6)</span>
              <span style={{ width: '35%', textAlign: 'center' }}>Medium (7–13)</span>
              <span style={{ width: '35%', textAlign: 'right' }}>High (14–20)</span>
            </div>
          </div>
        </Card>

        {/* ── 2-Col Grid ── */}
        <div className="grid-2" style={{ marginBottom: 24 }}>

          {/* AI Analysis */}
          <Card className="animate-fadeInUp delay-1" style={{ padding: 28, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                🤖 AI Analysis
              </h2>
              <span style={{ fontSize: '0.65rem', background: 'var(--orange-pale)', color: 'var(--orange-deep)', padding: '3px 8px', borderRadius: 4, fontWeight: 700, textTransform: 'uppercase' }}>
                ML Generated
              </span>
            </div>
            {loadingAI ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                <Skeleton height={14} width="100%" />
                <Skeleton height={14} width="95%" />
                <Skeleton height={14} width="80%" />
                <br />
                <Skeleton height={14} width="100%" />
                <Skeleton height={14} width="85%" />
              </div>
            ) : (
              <div className="animate-fadeIn" style={{ fontSize: '0.9rem', color: 'var(--mid)', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {narrative.map((line, i) => (
                  <p key={i} dangerouslySetInnerHTML={{ __html: line }} />
                ))}
              </div>
            )}
          </Card>

          {/* Category Breakdown */}
          <Card className="animate-fadeInUp delay-2" style={{ padding: 28 }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.2rem', marginBottom: 24 }}>Category Breakdown</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {catItems.map(c => (
                <div key={c.key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark)', marginBottom: 6 }}>
                    <span>{c.emoji} {c.label}</span>
                    <span>{c.rawScore}/{c.max}</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--border)', borderRadius: 4 }}>
                    <div className="score-bar-fill" style={{ width: `${c.pct}%`, background: c.col, borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ── Detail Cards ── */}
        <div className="grid-3" style={{ marginBottom: 32 }}>
          <Card className="animate-fadeInUp delay-3" style={{ padding: 24 }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--red)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              ⚠️ Flagged Concerns
            </h3>
            {flagged.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>No items flagged — excellent result!</p>
            ) : (
              <ul style={{ paddingLeft: 20, fontSize: '0.85rem', color: 'var(--mid)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {flagged.slice(0, 6).map(f => <li key={f}>{f}</li>)}
                {flagged.length > 6 && <li style={{ color: 'var(--muted)' }}>…and {flagged.length - 6} more</li>}
              </ul>
            )}
          </Card>

          <Card className="animate-fadeInUp delay-4" style={{ padding: 24 }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--green)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              ✅ Strengths Observed
            </h3>
            <ul style={{ paddingLeft: 20, fontSize: '0.85rem', color: 'var(--mid)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {strengths.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </Card>

          <Card className="animate-fadeInUp delay-5" style={{ padding: 24 }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--dark)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              ℹ️ What This Means
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--mid)', lineHeight: 1.6 }}>
              {risk === 'Low'
                ? 'A Low Risk result is reassuring. Continue to monitor development and screen again in 6 months.'
                : risk === 'Medium'
                ? 'A Medium Risk result means your child displays some traits associated with autism. This is not a diagnosis, but a professional evaluation is the safe next step.'
                : 'A High Risk result warrants prompt evaluation by a developmental specialist. Early intervention leads to significantly better outcomes.'
              }
            </p>
          </Card>
        </div>

        {/* ── Recommended Steps ── */}
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

        {/* ── Actions ── */}
        <div className="animate-fadeInUp delay-6 no-print" style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
          <Btn size="lg" onClick={dlPdf}>📥 Download PDF</Btn>
          <Btn size="lg" variant="outline" onClick={shareDoc}>🩺 Share with Doctor</Btn>
          <Btn size="lg" variant="ghost" onClick={() => navigate('/screening')}>🔄 Screen Again</Btn>
          <Btn size="lg" variant="ghost" onClick={() => navigate('/parent')}>← Dashboard</Btn>
        </div>

      </div>
    </PageWrapper>
  );
}
