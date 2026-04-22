import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageWrapper, Card, Badge, Btn, BackBtn } from '../components/UI';
import { CHILDREN, SCREENING_HISTORY } from '../data/dummyData';

export default function ChildDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview'); // overview | history | details

  const child = CHILDREN.find(c => c.id === parseInt(id)) || CHILDREN[0];
  const history = SCREENING_HISTORY.filter(h => h.childId === child.id).sort((a,b) => new Date(b.date) - new Date(a.date));

  // Fake chart points
  const points = "0,80 50,65 100,75 150,40 200,20";

  return (
    <PageWrapper style={{ padding: '40px 24px' }}>
      <div className="container" style={{ maxWidth: 860 }}>
        <BackBtn onClick={() => navigate('/parent')} label="Back to Dashboard" />

        {/* Header */}
        <Card className="animate-fadeInUp" style={{ padding: 32, marginBottom: 28, display: 'flex', gap: 24, alignItems: 'center' }}>
          <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'var(--orange-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
            {child.avatar}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.8rem', color: 'var(--dark)' }}>{child.name}</h1>
                <div style={{ fontSize: '0.9rem', color: 'var(--muted)', marginTop: 4 }}>
                  {child.age} yrs • {child.gender} • Guardian: {child.guardian}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Badge risk={child.risk} style={{ marginBottom: 8 }} />
                <div style={{ fontSize: '0.8rem', color: 'var(--mid)', fontWeight: 600 }}>Score: {child.score}/20</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="tab-bar">
          <button className={`tab-btn ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>Overview</button>
          <button className={`tab-btn ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>Screening History</button>
          <button className={`tab-btn ${tab === 'details' ? 'active' : ''}`} onClick={() => setTab('details')}>Details</button>
        </div>

        {/* Tab Content */}
        <div className="animate-fadeIn">
          {tab === 'overview' && (
            <div className="grid-2">
              {/* Left */}
              <Card style={{ padding: 24 }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.1rem', marginBottom: 20 }}>Score Breakdown</h3>
                {[['Social', 'var(--green)', 90], ['Communication', 'var(--amber)', 60], ['Behavior', 'var(--green)', 85], ['Sensory', 'var(--red)', 30], ['Routine', 'var(--amber)', 50]].map(([l, c, w]) => (
                  <div key={l} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>
                      <span>{l}</span>
                    </div>
                    <div style={{ height: 8, background: 'var(--orange-pale)', borderRadius: 4 }}>
                      <div style={{ width: `${w}%`, height: '100%', background: c, borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
              </Card>

              {/* Right */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <Card style={{ padding: 24, flex: 1 }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.1rem', marginBottom: 16 }}>Risk Trend</h3>
                  <div style={{ height: 120, position: 'relative', borderBottom: '1px dashed var(--border)', borderLeft: '1px dashed var(--border)' }}>
                    <svg viewBox="0 0 200 100" style={{ width: '100%', height: '100%', overflow: 'visible' }} preserveAspectRatio="none">
                      <polyline points={points} fill="none" stroke="var(--orange)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      {points.split(' ').map((p, i) => {
                        const [x,y] = p.split(',');
                        return <circle key={i} cx={x} cy={y} r="4" fill="white" stroke="var(--orange)" strokeWidth="2" />;
                      })}
                    </svg>
                    <div style={{ position: 'absolute', bottom: -20, left: 0, fontSize: '0.65rem', color: 'var(--muted)' }}>Older</div>
                    <div style={{ position: 'absolute', bottom: -20, right: 0, fontSize: '0.65rem', color: 'var(--muted)' }}>Newer</div>
                  </div>
                </Card>
                <Btn size="lg" onClick={() => navigate(`/screening/${child.id}`)}>Start New Screening</Btn>
              </div>
            </div>
          )}

          {tab === 'history' && (
            <Card className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Score</th>
                    <th>Risk</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(h => (
                    <tr key={h.id}>
                      <td style={{ fontWeight: 600 }}>{new Date(h.date).toLocaleDateString()}</td>
                      <td>{h.score} / {h.total}</td>
                      <td><Badge risk={h.risk} /></td>
                      <td style={{ textAlign: 'right' }}><Btn size="sm" variant="ghost" onClick={() => navigate('/result')}>View Report</Btn></td>
                    </tr>
                  ))}
                  {history.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center', padding: 20 }}>No history found.</td></tr>}
                </tbody>
              </table>
            </Card>
          )}

          {tab === 'details' && (
            <Card style={{ padding: 28 }}>
              <div className="grid-2">
                <div>
                  <div className="form-group"><label className="form-label">Full Name</label><div style={{ fontWeight: 600 }}>{child.name}</div></div>
                  <div className="form-group"><label className="form-label">Date of Birth</label><div style={{ fontWeight: 600 }}>{new Date(child.dob).toLocaleDateString()}</div></div>
                  <div className="form-group"><label className="form-label">Gender</label><div style={{ fontWeight: 600 }}>{child.gender}</div></div>
                </div>
                <div>
                  <div className="form-group"><label className="form-label">Guardian Name</label><div style={{ fontWeight: 600 }}>{child.guardian}</div></div>
                  <div className="form-group"><label className="form-label">Total Screenings</label><div style={{ fontWeight: 600 }}>{history.length}</div></div>
                  <div className="form-group"><label className="form-label">Last Screened</label><div style={{ fontWeight: 600 }}>{new Date(child.lastScreen).toLocaleDateString()}</div></div>
                </div>
              </div>
              <div className="divider" />
              <Btn variant="outline" onClick={() => navigate('/add-child')}>Edit Details</Btn>
            </Card>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
