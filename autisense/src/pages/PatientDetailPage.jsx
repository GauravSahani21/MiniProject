import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageWrapper, Card, Badge, Btn, useToast } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { trajectory as trajectoryApi, doctor as doctorApi, clinical as clinicalApi } from '../api';
import RiskTrajectoryChart, { trendMeta } from '../components/RiskTrajectoryChart';

function urgencyMeta(u) {
  const x = String(u || '').toLowerCase();
  if (x === 'high') return { label: 'High', bg: 'var(--red-pale)', color: 'var(--red)' };
  if (x === 'medium') return { label: 'Medium', bg: 'var(--amber-pale)', color: 'var(--amber)' };
  return { label: 'Low', bg: '#dcfce7', color: 'var(--green)' };
}

export default function PatientDetailPage() {
  const { id: childId } = useParams();
  const navigate      = useNavigate();
  const { showToast, ToastComponent } = useToast();
  const { token } = useAuth();
  const [tab, setTab] = useState('report');
  const [screenings, setScreenings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trajectoryData, setTrajectoryData] = useState(null);
  const [loadingTrajectory, setLoadingTrajectory] = useState(false);
  const [remarks, setRemarks] = useState('');

  const [nextAction, setNextAction] = useState(null);
  const [loadingNextAction, setLoadingNextAction] = useState(false);
  const [explainability, setExplainability] = useState(null);
  const [loadingExplainability, setLoadingExplainability] = useState(false);

  useEffect(() => {
    const fetchScreenings = async () => {
      if (!token || !childId) return;
      try {
        setLoading(true);
        const res = await doctorApi.getScreenings(childId, token);
        setScreenings(res.data || []);
      } catch (err) {
        showToast(err?.message || 'Failed to load patient screenings', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchScreenings();
  }, [token, childId]);

  useEffect(() => {
    const fetchTrajectory = async () => {
      if (!token || !childId) return;
      try {
        setLoadingTrajectory(true);
        const res = await trajectoryApi.getByChild(childId, token);
        setTrajectoryData(res.data);
      } catch (err) {
        setTrajectoryData(null);
      } finally {
        setLoadingTrajectory(false);
      }
    };
    fetchTrajectory();
  }, [token, childId]);

  const latestScreening = screenings[0] || null;
  const patient = useMemo(() => {
    if (!latestScreening) return null;
    const child = latestScreening.childId || {};
    const dob = child.dob ? new Date(child.dob) : null;
    const age = dob ? Math.max(0, new Date().getFullYear() - dob.getFullYear()) : '--';
    return {
      name: child.name || 'Unknown Child',
      age,
      risk: latestScreening.riskLevel || 'Low',
      date: latestScreening.screeningDate || latestScreening.createdAt,
      score: latestScreening.score || 0,
      status: latestScreening.status || 'pending',
    };
  }, [latestScreening]);

  useEffect(() => {
    const fetchClinical = async () => {
      if (!token || !childId || !latestScreening?._id) return;
      try {
        setLoadingNextAction(true);
        const res = await clinicalApi.getNextAction(childId, token);
        setNextAction(res.data);
      } catch (err) {
        setNextAction(null);
      } finally {
        setLoadingNextAction(false);
      }

      try {
        setLoadingExplainability(true);
        const res = await clinicalApi.getExplainability(latestScreening._id, token);
        setExplainability(res.data);
      } catch (err) {
        setExplainability(null);
      } finally {
        setLoadingExplainability(false);
      }
    };
    fetchClinical();
  }, [token, childId, latestScreening?._id]);

  const handleReferral = async () => {
    if (!patient || !nextAction) return;
    const note = [
      `Referral note (AutiSense CDS)`,
      `Child: ${patient.name}`,
      `Latest screening: ${new Date(patient.date).toLocaleDateString()}`,
      `Risk: ${patient.risk} | Score: ${patient.score}/20`,
      `Recommended action: ${nextAction.action || 'refer specialist'}`,
      `Urgency: ${nextAction.urgency || 'medium'}`,
      `Timeline: ${nextAction.timeline || ''}`,
      ``,
      `Reasoning:`,
      `${nextAction.reasoning || ''}`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(note);
      showToast('Referral note copied to clipboard.', 'success');
    } catch (e) {
      showToast('Unable to copy referral note.', 'error');
    }

    const subject = encodeURIComponent(`Referral - ${patient.name} (${patient.risk} risk)`);
    const body = encodeURIComponent(note);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleSave = () => {
    showToast('Clinical notes saved locally.', 'success');
  };

  const handleMarkReviewed = async () => {
    if (!latestScreening) return;
    try {
      await doctorApi.markReviewed(latestScreening._id, token);
      setScreenings(prev =>
        prev.map((s) =>
          s._id === latestScreening._id ? { ...s, status: 'reviewed' } : s
        )
      );
      showToast('Report marked as reviewed.', 'success');
    } catch (err) {
      showToast(err?.message || 'Failed to mark reviewed', 'error');
    }
  };
  if (loading) {
    return (
      <PageWrapper>
        <div style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--muted)' }}>
          Loading patient details...
        </div>
      </PageWrapper>
    );
  }
  if (!patient) {
    return (
      <PageWrapper>
        <div style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--muted)' }}>
          Patient not found.
        </div>
      </PageWrapper>
    );
  }
  const isReviewed = String(patient.status).toLowerCase() === 'reviewed';

  return (
    <PageWrapper style={{ paddingBottom: 40, paddingInline: 24 }}>
      {ToastComponent}
      <div className="container" style={{ maxWidth: 860 }}>
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
              <span className={`status-pill ${patient.status.toLowerCase()}`}>
                {isReviewed ? '✅' : patient.status === 'pending' ? '⏳' : '✅'} {patient.status}
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
            <>
              <Card style={{ padding: 24, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 800 }}>
                    Longitudinal Risk Trajectory
                  </h3>
                  {trajectoryData && (() => {
                    const trend = trendMeta(trajectoryData.trend);
                    return (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          background: trend.bg,
                          color: trend.color,
                          borderRadius: 'var(--radius-full)',
                          padding: '5px 10px',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                        }}
                      >
                        <span>{trend.icon}</span>
                        <span>{trend.label}</span>
                      </span>
                    );
                  })()}
                </div>
                {loadingTrajectory ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Loading trajectory...</p>
                ) : trajectoryData ? (
                  <RiskTrajectoryChart trajectoryData={trajectoryData} height={240} />
                ) : (
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                    Trajectory is unavailable for this patient right now.
                  </p>
                )}
              </Card>

              {/* ── Clinical Decision Support ── */}
              <Card style={{ padding: 24, marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.1rem', marginBottom: 14 }}>
                  Clinical Decision Support
                </h3>

                <div className="grid-2" style={{ gap: 14 }}>
                  {/* Next Best Action */}
                  <div style={{ border: '1px solid var(--border)', borderRadius: 16, padding: 16, background: 'var(--cream)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{ fontWeight: 900, color: 'var(--dark)' }}>Next Best Action</div>
                      {nextAction?.urgency && (() => {
                        const m = urgencyMeta(nextAction.urgency);
                        return (
                          <span style={{ background: m.bg, color: m.color, padding: '5px 10px', borderRadius: 999, fontWeight: 900, fontSize: '0.75rem' }}>
                            {m.label} urgency
                          </span>
                        );
                      })()}
                    </div>

                    {loadingNextAction ? (
                      <div style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>Generating recommendation...</div>
                    ) : nextAction ? (
                      <>
                        <div style={{ fontSize: '0.95rem', fontWeight: 900, color: 'var(--dark)', textTransform: 'capitalize' }}>
                          {nextAction.action || 'therapy focus'}
                        </div>
                        <div style={{ marginTop: 8, fontSize: '0.88rem', color: 'var(--mid)', lineHeight: 1.6 }}>
                          <strong>Timeline:</strong> {nextAction.timeline || '—'}
                        </div>
                        <div style={{ marginTop: 8, fontSize: '0.88rem', color: 'var(--mid)', lineHeight: 1.6 }}>
                          <strong>Reasoning:</strong> {nextAction.reasoning || '—'}
                        </div>
                        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                          <Btn size="sm" variant="outline" onClick={handleReferral}>
                            One-click Referral
                          </Btn>
                        </div>
                      </>
                    ) : (
                      <div style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>Recommendation unavailable right now.</div>
                    )}
                  </div>

                  {/* Explainability */}
                  <div style={{ border: '1px solid var(--border)', borderRadius: 16, padding: 16, background: 'var(--cream)' }}>
                    <div style={{ fontWeight: 900, color: 'var(--dark)', marginBottom: 10 }}>
                      Key factors that drove this result
                    </div>

                    {loadingExplainability ? (
                      <div style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>Calculating explainability...</div>
                    ) : explainability?.topFactors?.length ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {explainability.topFactors.map((f) => {
                          const pct = Number(f.contributionPercent || 0);
                          const level = pct >= 25 ? 'high' : pct >= 15 ? 'medium' : 'low';
                          const color = level === 'high' ? 'var(--red)' : level === 'medium' ? 'var(--amber)' : 'var(--green)';
                          return (
                            <div key={f.questionId} style={{ display: 'grid', gridTemplateColumns: '1fr 60px', gap: 10, alignItems: 'center' }}>
                              <div>
                                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--dark)' }}>
                                  Q{f.questionId}. {f.questionText}
                                </div>
                                <div style={{ marginTop: 6, height: 7, background: 'var(--border)', borderRadius: 999 }}>
                                  <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', borderRadius: 999, background: color }} />
                                </div>
                              </div>
                              <div style={{ textAlign: 'right', fontWeight: 900, color: 'var(--dark)', fontSize: '0.82rem' }}>
                                {pct}%
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>Explainability unavailable right now.</div>
                    )}
                  </div>
                </div>
              </Card>

              <Card style={{ padding: 24 }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.1rem', marginBottom: 16 }}>
                  Screening Snapshot
                </h3>
                <div style={{ fontSize: '0.88rem', lineHeight: 1.8 }}>
                  <div><strong>Latest score:</strong> {patient.score}/20</div>
                  <div><strong>Risk level:</strong> {patient.risk}</div>
                  <div><strong>Status:</strong> {patient.status}</div>
                  <div><strong>Total screenings:</strong> {screenings.length}</div>
                </div>
              </Card>
            </>
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
                <Btn onClick={handleSave} style={{ width: '100%' }}>
                  Save Remarks
                </Btn>
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
                  {screenings.map(h => (
                    <tr key={h._id}>
                      <td style={{ fontWeight: 600 }}>{new Date(h.screeningDate || h.createdAt).toLocaleDateString()}</td>
                      <td>{h.score} / 20</td>
                      <td><Badge risk={h.riskLevel} /></td>
                      <td style={{ textTransform: 'capitalize' }}>{h.status}</td>
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
