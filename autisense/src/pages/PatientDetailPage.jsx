import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageWrapper, Card, Badge, Btn, useToast } from '../components/UI';
import { useDoctor } from '../context/DoctorContext';
import { SCREENING_HISTORY, CATEGORIES } from '../data/dummyData';

export default function PatientDetailPage() {
  const { id }        = useParams();
  const navigate      = useNavigate();
  const { showToast, ToastComponent } = useToast();
  const [tab, setTab] = useState('report'); // 'report' | 'notes' | 'history'
  const [saving, setSaving]   = useState(false);

  // ── BUG 3 FIX: read patient from shared DoctorContext, not from PATIENTS array ──
  // Previously this page called: const patient = PATIENTS.find(...)
  // and kept its own local copy via useState(patient.status).
  // When the doctor clicked "Mark as Reviewed" only the local copy changed.
  // Going back to the dashboard re-read the original PATIENTS array → still Pending.
  //
  // Fix: read from DoctorContext (same source as DoctorDashboard) and call
  // the shared markReviewed() action so both pages see the same status.
  const { patients, markReviewed } = useDoctor();
  const patient = patients.find(p => p.id === parseInt(id)) || patients[0];

  // Derive status from shared state — no local copy needed
  const isReviewed = patient?.status === 'Reviewed';

  const [remarks, setRemarks] = useState(patient?.remarks || '');

  // Past history for this patient
  const history = SCREENING_HISTORY.filter(h => h.child === patient?.name);
  if (history.length === 0 && patient) {
    history.push({
      id: 99,
      date:   patient.date,
      score:  patient.score,
      total:  20,
      risk:   patient.risk,
      status: patient.status,
      child:  patient.name,
    });
  }

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast('Clinical notes saved successfully.', 'success');
    }, 800);
  };

  // ── BUG 3 FIX: write through to DoctorContext ─────────────────────────────
  const handleMarkReviewed = () => {
    markReviewed(patient.id);   // updates shared state + persists to localStorage
    showToast('Report marked as reviewed.', 'success');
  };

  const catScores = { social: 3, comm: 3, behavior: 2, sensory: 2, routine: 1 };

  if (!patient) {
    return (
      <PageWrapper>
        <div style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--muted)' }}>
          Patient not found.{' '}
          <button
            onClick={() => navigate('/doctor')}
            style={{ color: 'var(--orange)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Go back
          </button>
        </div>
      </PageWrapper>
    );
  }

  return (
    // ── BUG 1 FIX ────────────────────────────────────────────────────────────
    // Old code: <PageWrapper style={{ padding: '40px 24px' }}>
    //   The inline padding: '40px 24px' overrides the PageWrapper's default
    //   paddingTop: 88px down to only 40px. Since the fixed navbar is 68px tall,
    //   the top 28px of page content (including the Back button) slides behind it.
    //
    // Fix: remove the conflicting padding shorthand and use paddingBottom only.
    //   PageWrapper still adds paddingTop: 88px (from its own style object) which
    //   correctly clears the fixed navbar. We add paddingBottom + paddingInline
    //   separately so the horizontal and bottom spacing is preserved.
    <PageWrapper style={{ paddingBottom: 40, paddingInline: 24 }}>
      {ToastComponent}
      <div className="container" style={{ maxWidth: 860 }}>

        {/* ── BUG 1 FIX: Back button now visible — no longer hidden behind navbar ── */}
        <button
          onClick={() => navigate('/doctor')}
          style={{
            display:        'inline-flex',
            alignItems:     'center',
            gap:            6,
            fontSize:       '0.85rem',
            fontWeight:     600,
            color:          'var(--mid)',
            cursor:         'pointer',
            marginBottom:   24,
            marginTop:      8,
            padding:        '8px 16px',
            background:     'var(--white)',
            border:         '1.5px solid var(--border)',
            borderRadius:   'var(--radius-full)',
            fontFamily:     'var(--font-body)',
            transition:     'all 0.2s ease',
            boxShadow:      'var(--shadow-sm)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color       = 'var(--orange)';
            e.currentTarget.style.borderColor = 'var(--orange)';
            e.currentTarget.style.background  = 'var(--orange-pale)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color       = 'var(--mid)';
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.background  = 'var(--white)';
          }}
        >
          ← Back to Patient List
        </button>

        {/* ── Patient Header Card ── */}
        <Card
          className="animate-fadeInUp"
          style={{
            padding:       32,
            marginBottom:  28,
            display:       'flex',
            justifyContent:'space-between',
            alignItems:    'flex-start',
            flexWrap:      'wrap',
            gap:           16,
          }}
        >
          <div>
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 900,
              fontSize:   '1.8rem',
              color:      'var(--dark)',
              marginBottom: 4,
            }}>
              {patient.name}
            </h1>
            <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
              {patient.age} yrs • Screened: {new Date(patient.date).toLocaleDateString()}
            </div>
          </div>

          <div style={{
            textAlign:     'right',
            display:       'flex',
            flexDirection: 'column',
            alignItems:    'flex-end',
          }}>
            <Badge risk={patient.risk} style={{ marginBottom: 8 }} />
            <div style={{ fontSize: '0.85rem', color: 'var(--dark)', fontWeight: 700 }}>
              Score: {patient.score}/20
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
              {/* ── BUG 3 FIX: status reads from shared context, updates everywhere ── */}
              <span className={`status-pill ${patient.status.toLowerCase()}`}>
                {isReviewed ? '✅' : patient.status === 'Pending' ? '⏳' : '🔴'} {patient.status}
              </span>
              {!isReviewed && (
                <Btn size="sm" variant="success" onClick={handleMarkReviewed}>
                  ✅ Mark as Reviewed
                </Btn>
              )}
            </div>
          </div>
        </Card>

        {/* ── Tabs ── */}
        <div className="tab-bar">
          <button
            className={`tab-btn ${tab === 'report' ? 'active' : ''}`}
            onClick={() => setTab('report')}
          >
            Screening Report
          </button>
          <button
            className={`tab-btn ${tab === 'notes' ? 'active' : ''}`}
            onClick={() => setTab('notes')}
          >
            Clinical Notes
          </button>
          <button
            className={`tab-btn ${tab === 'history' ? 'active' : ''}`}
            onClick={() => setTab('history')}
          >
            Patient History
          </button>
        </div>

        <div className="animate-fadeIn">

          {/* ── Tab: Screening Report ── */}
          {tab === 'report' && (
            <div className="grid-2">
              <Card style={{ padding: 24 }}>
                <h3 style={{
                  fontFamily:   'var(--font-heading)',
                  fontWeight:   800,
                  fontSize:     '1.1rem',
                  marginBottom: 20,
                }}>
                  Category Breakdown
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {CATEGORIES.map(c => {
                    const s   = catScores[c.key] ?? 0;
                    const pct = c.max > 0 ? (s / c.max) * 100 : 0;
                    const col = pct <= 33 ? 'var(--green)' : pct <= 66 ? 'var(--amber)' : 'var(--red)';
                    return (
                      <div key={c.key}>
                        <div style={{
                          display:        'flex',
                          justifyContent: 'space-between',
                          fontSize:       '0.8rem',
                          fontWeight:     600,
                          color:          'var(--dark)',
                          marginBottom:   6,
                        }}>
                          <span>{c.label}</span>
                          <span>{s}/{c.max}</span>
                        </div>
                        <div style={{ height: 6, background: 'var(--border)', borderRadius: 4 }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: col, borderRadius: 4 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <Card style={{ padding: 24 }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--red)', marginBottom: 12 }}>
                    ⚠️ Flagged Concerns
                  </h3>
                  <ul style={{ paddingLeft: 20, fontSize: '0.85rem', color: 'var(--mid)', lineHeight: 1.6 }}>
                    <li>Did not respond to name</li>
                    <li>Avoids eye contact</li>
                    <li>Repetitive hand flapping observed</li>
                  </ul>
                </Card>
                <Card style={{ padding: 24, flex: 1 }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--green)', marginBottom: 12 }}>
                    ✅ Strengths
                  </h3>
                  <ul style={{ paddingLeft: 20, fontSize: '0.85rem', color: 'var(--mid)', lineHeight: 1.6 }}>
                    <li>Smiles back when smiled at</li>
                    <li>Follows simple pointing</li>
                  </ul>
                </Card>
              </div>
            </div>
          )}

          {/* ── Tab: Clinical Notes ── */}
          {tab === 'notes' && (
            <div className="grid-2">
              <Card style={{ padding: 24 }}>
                <h3 style={{
                  fontFamily:   'var(--font-heading)',
                  fontWeight:   800,
                  fontSize:     '1.1rem',
                  marginBottom: 16,
                }}>
                  Add / Edit Remarks
                </h3>
                <textarea
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  className="form-textarea"
                  placeholder="Type your clinical observations and recommendations here..."
                  style={{ minHeight: 180, marginBottom: 16 }}
                />
                <Btn onClick={handleSave} disabled={saving} style={{ width: '100%' }}>
                  {saving ? 'Saving...' : 'Save Remarks'}
                </Btn>
              </Card>

              <Card style={{ padding: 24 }}>
                <h3 style={{
                  fontFamily:   'var(--font-heading)',
                  fontWeight:   800,
                  fontSize:     '1.1rem',
                  marginBottom: 16,
                }}>
                  Previous Notes
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ borderLeft: '3px solid var(--orange)', paddingLeft: 12 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 700, marginBottom: 4 }}>
                      12 Oct 2024 (Last Visit)
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--dark)' }}>
                      Routine screening. Parents reported some concerns with social play.
                      Recommended monitoring for 6 months.
                    </div>
                  </div>
                  <div style={{ borderLeft: '3px solid var(--border)', paddingLeft: 12 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 700, marginBottom: 4 }}>
                      05 Jun 2024
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--dark)' }}>
                      Initial consultation. No major red flags at this time.
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* ── Tab: Patient History ── */}
          {tab === 'history' && (
            <Card className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date Screened</th>
                    <th>Score</th>
                    <th>Risk Level</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(h => (
                    <tr key={h.id}>
                      <td style={{ fontWeight: 600 }}>{new Date(h.date).toLocaleDateString()}</td>
                      <td>{h.score} / {h.total}</td>
                      <td><Badge risk={h.risk} /></td>
                      <td>{h.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

        </div>
      </div>
    </PageWrapper>
  );
}
