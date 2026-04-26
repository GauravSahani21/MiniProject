import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CHILDREN, SCREENING_HISTORY } from '../data/dummyData';
import { PageWrapper, SectionHeading, StatCard, Card, Btn, Badge, ScoreBar, Modal, useToast, EmptyState } from '../components/UI';

export default function ParentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast, ToastComponent } = useToast();
  
  const [children, setChildren] = useState(CHILDREN);
  const [deleteModal, setDeleteModal] = useState(null);

  const confirmDelete = () => {
    setChildren(c => c.filter(x => x.id !== deleteModal.id));
    showToast(`${deleteModal.name} removed successfully.`, 'success');
    setDeleteModal(null);
  };

  const highRiskCount = children.filter(c => c.risk === 'High').length;
  const lastScreening = children.length > 0 ? [...children].sort((a,b) => new Date(b.lastScreen) - new Date(a.lastScreen))[0].lastScreen : '--';

  return (
    <PageWrapper>
      {ToastComponent}
      
      {/* Confirm Delete Modal */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Remove Child Profile">
        <p style={{ fontSize: '0.95rem', color: 'var(--dark)', marginBottom: 24 }}>
          Are you sure you want to remove <strong>{deleteModal?.name}</strong>? This action cannot be undone and will delete their screening history.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <Btn variant="ghost" onClick={() => setDeleteModal(null)}>Cancel</Btn>
          <Btn variant="danger" onClick={confirmDelete}>Remove Child</Btn>
        </div>
      </Modal>

      <div className="container" style={{ padding: '40px 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '2.2rem', color: 'var(--dark)' }}>
            Hello, {user?.name?.split(' ')[0] || 'there'} 👋
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginTop: 4 }}>
              Today is {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: 48 }}>
          <StatCard icon="👶" value={children.length} label="Children Tracked" bg="var(--orange-pale)" color="var(--orange-deep)" />
          <StatCard icon="📋" value={SCREENING_HISTORY.filter(h => children.find(c => c.id === h.childId)).length} label="Total Screenings" bg="#eff6ff" color="#2563eb" />
          <StatCard icon="⚠️" value={highRiskCount} label="High Risk Alerts" bg="var(--red-pale)" color="var(--red)" />
          <StatCard icon="📅" value={lastScreening} label="Last Screening" bg="#f5f3ff" color="#7c3aed" />
        </div>

        {/* Children Grid */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <SectionHeading title="Your Children" />
          <Btn size="sm" onClick={() => navigate('/add-child')}>+ Add Child</Btn>
        </div>

        {children.length === 0 ? (
          <Card style={{ padding: 40 }}>
            <EmptyState icon="👶" title="No children added yet" desc="Add your child's profile to start the clinically validated M-CHAT screening process." action={<Btn onClick={() => navigate('/add-child')}>Add Child Profile</Btn>} />
          </Card>
        ) : (
          <div className="grid-2" style={{ marginBottom: 48 }}>
            {children.map((c, i) => (
              <Card key={c.id} className={`animate-fadeInUp delay-${i+1}`} style={{ padding: '24px 28px', position: 'relative' }}>
                {/* Actions */}
                <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 6 }}>
                  <button onClick={() => navigate(`/child/${c.id}`)} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--cream)', color: 'var(--mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', border: '1px solid var(--border)' }}>✏️</button>
                  <button onClick={() => setDeleteModal(c)} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--red-pale)', color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', border: 'none' }}>🗑️</button>
                </div>

                <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 20 }}>
                  <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--orange-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
                    {c.avatar}
                  </div>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--dark)' }}>{c.name}</h3>
                    <div style={{ fontSize: '0.82rem', color: 'var(--muted)', display: 'flex', gap: 10, marginTop: 4 }}>
                      <span>{c.age} years old</span> • <span>{c.gender}</span> • <span>DOB: {new Date(c.dob).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div style={{ background: 'var(--cream)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--mid)' }}>Latest Screening ({new Date(c.lastScreen).toLocaleDateString()})</span>
                    <Badge risk={c.risk} />
                  </div>
                  <ScoreBar score={c.score} total={c.total} risk={c.risk} />
                  <div style={{ fontSize: '0.74rem', color: 'var(--muted)', textAlign: 'right', marginTop: 6, fontWeight: 700 }}>
                    Score: {c.score} / {c.total}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <Btn variant="primary" style={{ flex: 1 }} onClick={() => navigate(`/screening/${c.id}`)}>Screen Now</Btn>
                  <Btn variant="outline" style={{ flex: 1 }} onClick={() => navigate('/history')}>View Reports</Btn>
                  <Btn variant="ghost" onClick={() => navigate(`/child/${c.id}`)}>Details</Btn>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* History Preview */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <SectionHeading title="Recent Screenings" />
          <button onClick={() => navigate('/history')} style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--orange)', background: 'none', border: 'none', cursor: 'pointer' }}>View All →</button>
        </div>

        <Card className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Child</th>
                <th>Score</th>
                <th>Risk Level</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {SCREENING_HISTORY.filter(h => children.find(c => c.id === h.childId)).slice(0, 3).map((row, i) => (
                <tr key={row.id} className={`animate-fadeInUp delay-${i+2}`}>
                  <td style={{ fontWeight: 600 }}>{new Date(row.date).toLocaleDateString()}</td>
                  <td>{row.child}</td>
                  <td>{row.score} / {row.total}</td>
                  <td><Badge risk={row.risk} /></td>
                  <td style={{ textAlign: 'right' }}>
                    <Btn size="sm" variant="ghost" onClick={() => navigate('/history')}>History</Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {SCREENING_HISTORY.length === 0 && (
            <div style={{ padding: 30, textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>No screenings found.</div>
          )}
        </Card>
      </div>
    </PageWrapper>
  );
}
