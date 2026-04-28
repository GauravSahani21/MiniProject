import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { children as childrenApi, screenings as screeningsApi } from '../api';
import { PageWrapper, SectionHeading, StatCard, Card, Btn, Badge, ScoreBar, Modal, useToast, EmptyState } from '../components/UI';

export default function ParentDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { showToast, ToastComponent } = useToast();
  
  const [children, setChildren] = useState([]);
  const [allScreenings, setAllScreenings] = useState([]);
  const [recentScreenings, setRecentScreenings] = useState([]);
  const [deleteModal, setDeleteModal] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;
      try {
        const [childrenRes, screeningsRes] = await Promise.all([
          childrenApi.getAll(token),
          screeningsApi.getAll(token),
        ]);

        const loadedChildren = childrenRes.data || [];
        const loadedScreenings = screeningsRes.data || [];

        setChildren(loadedChildren);
        setAllScreenings(loadedScreenings);
        const sortedRecent = [...loadedScreenings]
          .sort((a, b) => new Date(b.screeningDate || b.createdAt) - new Date(a.screeningDate || a.createdAt))
          .slice(0, 5)
          .map((row) => ({
            _id: row._id,
            date: row.screeningDate || row.createdAt,
            childId: row.childId?._id || row.childId,
            childName: row.childId?.name || 'Unknown Child',
            score: row.score || 0,
            total: 20,
            risk: row.riskLevel || 'Low',
            status: row.status || 'completed'
          }));
        setRecentScreenings(sortedRecent);
      } catch (err) {
        showToast('Failed to load dashboard data', 'error');
      }
    };
    fetchDashboardData();
  }, [token]);

  const confirmDelete = async () => {
    try {
      await childrenApi.remove(deleteModal._id, token);
      setChildren(c => c.filter(x => x._id !== deleteModal._id));
      showToast(`${deleteModal.name} removed successfully.`, 'success');
      setDeleteModal(null);
    } catch (err) {
      showToast('Failed to remove child', 'error');
    }
  };

  const highRiskCount = allScreenings.filter(s => s.riskLevel === 'High').length;
  const latestScreening = [...allScreenings]
    .sort((a, b) => new Date(b.screeningDate || b.createdAt) - new Date(a.screeningDate || a.createdAt))[0];
  const lastScreening = latestScreening
    ? new Date(latestScreening.screeningDate || latestScreening.createdAt).toLocaleDateString()
    : '--';

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
          <StatCard icon="📋" value={allScreenings.length} label="Total Screenings" bg="#eff6ff" color="#2563eb" />
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
              <Card key={c._id} className={`animate-fadeInUp delay-${i+1}`} style={{ padding: '24px 28px', position: 'relative' }}>
                {/* Actions */}
                <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 6 }}>
                  <button onClick={() => navigate(`/parent/child/${c._id}/edit`)} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--cream)', color: 'var(--mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', border: '1px solid var(--border)' }}>✏️</button>
                  <button onClick={() => setDeleteModal(c)} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--red-pale)', color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', border: 'none' }}>🗑️</button>
                </div>

                <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 20 }}>
                  <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--orange-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
                    {c.avatar || '👶'}
                  </div>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--dark)' }}>{c.name}</h3>
                    <div style={{ fontSize: '0.82rem', color: 'var(--muted)', display: 'flex', gap: 10, marginTop: 4 }}>
                      <span>{c.dob ? new Date().getFullYear() - new Date(c.dob).getFullYear() : '--'} years old</span> • <span>{c.gender}</span> • <span>DOB: {c.dob ? new Date(c.dob).toLocaleDateString() : '--'}</span>
                    </div>
                  </div>
                </div>

                <div style={{ background: 'var(--cream)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--mid)' }}>Latest Screening ({c.lastScreen ? new Date(c.lastScreen).toLocaleDateString() : 'N/A'})</span>
                    <Badge risk={c.risk || 'Low'} />
                  </div>
                  <ScoreBar score={c.score || 0} total={c.total || 20} risk={c.risk || 'Low'} />
                  <div style={{ fontSize: '0.74rem', color: 'var(--muted)', textAlign: 'right', marginTop: 6, fontWeight: 700 }}>
                    Score: {c.score || 0} / {c.total || 20}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <Btn variant="primary" style={{ flex: 1 }} onClick={() => navigate(`/screening/${c._id}`)}>Screen Now</Btn>
                  <Btn variant="outline" style={{ flex: 1 }} onClick={() => navigate(`/report?childId=${c._id}`)}>View Reports</Btn>
                  <Btn variant="ghost" onClick={() => navigate(`/parent/child/${c._id}/details`)}>Details</Btn>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* History Preview */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <SectionHeading title="Recent Screenings" />
          <button onClick={() => navigate('/report')} style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--orange)', background: 'none', border: 'none', cursor: 'pointer' }}>View All →</button>
        </div>

        <Card className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Child</th>
                <th>Score</th>
                <th>Risk Level</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentScreenings.length > 0 ? recentScreenings.map((row, i) => (
                <tr key={row._id} className={`animate-fadeInUp delay-${i+2}`}>
                  <td style={{ fontWeight: 600 }}>{new Date(row.date).toLocaleDateString()}</td>
                  <td>{row.childName}</td>
                  <td>{row.score} / {row.total}</td>
                  <td><Badge risk={row.risk} /></td>
                  <td style={{ textTransform: 'capitalize' }}>{row.status}</td>
                  <td style={{ textAlign: 'right' }}>
                    <Btn size="sm" variant="ghost" onClick={() => navigate(`/report?childId=${row.childId}`)}>History</Btn>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" style={{ padding: 30, textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>No screenings found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </PageWrapper>
  );
}
