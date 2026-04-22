import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageWrapper, Card, Badge, Btn, BackBtn, useToast } from '../components/UI';
import { PATIENTS, SCREENING_HISTORY, CATEGORIES } from '../data/dummyData';

export default function PatientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast, ToastComponent } = useToast();
  const [tab, setTab] = useState('report'); // report | notes | history

  const patient = PATIENTS.find(p => p.id === parseInt(id)) || PATIENTS[0];
  const [remarks, setRemarks] = useState(patient.remarks || '');
  const [saving, setSaving] = useState(false);

  // Fake past history specifically for this doctor view
  const history = SCREENING_HISTORY.filter(h => h.child === patient.name);
  if (history.length === 0) {
    history.push({ id: 99, date: patient.date, score: patient.score, total: 20, risk: patient.risk, status: 'Completed', child: patient.name });
  }

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast('Clinical notes saved successfully.', 'success');
    }, 800);
  };

  const catScores = { social: 3, comm: 3, behavior: 2, sensory: 2, routine: 1 };

  return (
    <PageWrapper style={{ padding: '40px 24px' }}>
      {ToastComponent}
      <div className="container" style={{ maxWidth: 860 }}>
        <BackBtn onClick={() => navigate('/doctor')} label="Back to Patient List" />

        {/* Header */}
        <Card className="animate-fadeInUp" style={{ padding: 32, marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.8rem', color: 'var(--dark)', marginBottom: 4 }}>{patient.name}</h1>
            <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
              {patient.age} yrs • Screened: {new Date(patient.date).toLocaleDateString()}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <Badge risk={patient.risk} style={{ marginBottom: 8 }} />
            <div style={{ fontSize: '0.85rem', color: 'var(--dark)', fontWeight: 700 }}>Score: {patient.score}/20</div>
            <span className={`status-pill ${patient.status.toLowerCase()}`} style={{ marginTop: 6 }}>
               {patient.status === 'Reviewed' ? '✅' : patient.status === 'Pending' ? '⏳' : '🔴'} {patient.status}
            </span>
          </div>
        </Card>

        {/* Tabs */}
        <div className="tab-bar">
          <button className={`tab-btn ${tab === 'report' ? 'active' : ''}`} onClick={() => setTab('report')}>Screening Report</button>
          <button className={`tab-btn ${tab === 'notes' ? 'active' : ''}`} onClick={() => setTab('notes')}>Clinical Notes</button>
          <button className={`tab-btn ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>Patient History</button>
        </div>

        <div className="animate-fadeIn">
          {tab === 'report' && (
            <div className="grid-2">
              <Card style={{ padding: 24 }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.1rem', marginBottom: 20 }}>Category Breakdown</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {CATEGORIES.map(c => {
                    const s = catScores[c.key];
                    const pct = (s / c.max) * 100;
                    const col = pct <= 33 ? 'var(--green)' : pct <= 66 ? 'var(--amber)' : 'var(--red)';
                    return (
                      <div key={c.key}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: 'var(--dark)', marginBottom: 6 }}>
                          <span>{c.label}</span>
                          <span>{s}/{c.max}</span>
                        </div>
                        <div style={{ height: 6, background: 'var(--border)', borderRadius: 4 }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: col, borderRadius: 4 }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <Card style={{ padding: 24 }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--red)', marginBottom: 12 }}>⚠️ Flagged Concerns</h3>
                  <ul style={{ paddingLeft: 20, fontSize: '0.85rem', color: 'var(--mid)', lineHeight: 1.6 }}>
                    <li>Did not respond to name</li>
                    <li>Avoids eye contact</li>
                    <li>Repetitive hand flapping observed</li>
                  </ul>
                </Card>
                <Card style={{ padding: 24, flex: 1 }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--green)', marginBottom: 12 }}>✅ Strengths</h3>
                  <ul style={{ paddingLeft: 20, fontSize: '0.85rem', color: 'var(--mid)', lineHeight: 1.6 }}>
                    <li>Smiles back when smiled at</li>
                    <li>Follows simple pointing</li>
                  </ul>
                </Card>
              </div>
            </div>
          )}

          {tab === 'notes' && (
            <div className="grid-2">
              <Card style={{ padding: 24 }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.1rem', marginBottom: 16 }}>Add / Edit Remarks</h3>
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
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.1rem', marginBottom: 16 }}>Previous Notes</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ borderLeft: '3px solid var(--orange)', paddingLeft: 12 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 700, marginBottom: 4 }}>12 Oct 2024 (Last Visit)</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--dark)' }}>Routine screening. Parents reported some concerns with social play. Recommended monitoring for 6 months.</div>
                  </div>
                  <div style={{ borderLeft: '3px solid var(--border)', paddingLeft: 12 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 700, marginBottom: 4 }}>05 Jun 2024</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--dark)' }}>Initial consultation. No major red flags at this time.</div>
                  </div>
                </div>
              </Card>
            </div>
          )}

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
