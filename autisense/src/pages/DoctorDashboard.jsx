import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDoctor } from '../context/DoctorContext';
import {
  PageWrapper, SectionHeading, StatCard,
  Card, Badge, Btn, useToast
} from '../components/UI';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast, ToastComponent } = useToast();

  // ── Shared patient state from DoctorContext (fixes Bug 2 & Bug 3) ──────────
  const { patients, markReviewed } = useDoctor();

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalPatients  = patients.length;
  const highRisk       = patients.filter(p => p.risk === 'High').length;
  const pendingReviews = patients.filter(
    p => p.status === 'Pending' || p.status === 'Urgent'
  ).length;

  // ── BUG 2 FIX ─────────────────────────────────────────────────────────────
  // Old code: patients.filter(p => p.status === 'Urgent' || p.risk === 'High')
  //   → Rohan Das (risk:'High', status:'Reviewed') still appeared because
  //     p.risk === 'High' was always true regardless of review status.
  //
  // Fix: require BOTH a high/urgent status AND that the patient is not reviewed.
  const urgentCases = patients.filter(
    p => (p.status === 'Urgent' || p.risk === 'High') && p.status !== 'Reviewed'
  );

  // ── handleMarkReviewed ─────────────────────────────────────────────────────
  // Writes to shared DoctorContext so PatientDetailPage sees the same state.
  const handleMarkReviewed = (id) => {
    markReviewed(id);
    showToast('Patient marked as reviewed.', 'success');
  };

  return (
    <PageWrapper style={{ padding: '40px 24px' }}>
      {ToastComponent}
      <div className="container">

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 900,
            fontSize: '2.2rem',
            color: 'var(--dark)',
          }}>
            Welcome, {user?.name?.split(' ').slice(0, 2).join(' ') || 'Doctor'} 🩺
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginTop: 4 }}>
            You have {pendingReviews} pending review{pendingReviews !== 1 ? 's' : ''} today.
          </p>
        </div>

        {/* Stats */}
        <div className="grid-3" style={{ marginBottom: 40 }}>
          <StatCard icon="👥" value={totalPatients}  label="Total Patients"   bg="#eff6ff"           color="#2563eb"       />
          <StatCard icon="⚠️" value={highRisk}       label="High Risk Cases"  bg="var(--red-pale)"   color="var(--red)"    />
          <StatCard icon="⏳" value={pendingReviews}  label="Pending Reviews"  bg="var(--amber-pale)" color="var(--amber)"  />
        </div>

        {/* ── Urgent Cases (BUG 2 FIXED) ── */}
        {urgentCases.length > 0 && (
          <div className="animate-fadeInUp" style={{ marginBottom: 40 }}>
            <SectionHeading title="Urgent Attention Required" />
            <div className="grid-2">
              {urgentCases.map(p => (
                <Card
                  key={p.id}
                  style={{
                    border: '2px solid var(--red)',
                    padding: 20,
                    background: 'var(--red-pale)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <h3 style={{
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 800,
                      color: 'var(--dark)',
                      fontSize: '1.1rem',
                    }}>
                      {p.name}
                    </h3>
                    <div style={{
                      fontSize: '0.8rem',
                      color: 'var(--red)',
                      fontWeight: 700,
                      marginTop: 4,
                    }}>
                      High Risk Alert ({p.score}/20) • {p.age} yrs
                    </div>
                  </div>
                  <Btn
                    variant="danger"
                    size="sm"
                    onClick={() => navigate(`/doctor/patient/${p.id}`)}
                  >
                    Review Now
                  </Btn>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ── All Patients Table ── */}
        <SectionHeading title="All Patients" />
        <Card className="table-wrap animate-fadeInUp delay-1">
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Age</th>
                <th>Date Screened</th>
                <th>Risk &amp; Score</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td>{p.age} yrs</td>
                  <td>{new Date(p.date).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Badge risk={p.risk} />
                      <span style={{
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: 'var(--muted)',
                      }}>
                        {p.score}/20
                      </span>
                    </div>
                  </td>
                  <td>
                    {/* ── BUG 3 FIX: reads from shared DoctorContext state ── */}
                    <span className={`status-pill ${p.status.toLowerCase()}`}>
                      {p.status === 'Reviewed' ? '✅' : p.status === 'Pending' ? '⏳' : '🔴'} {p.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      {p.status !== 'Reviewed' && (
                        <Btn
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkReviewed(p.id)}
                        >
                          Mark Reviewed
                        </Btn>
                      )}
                      <Btn
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/doctor/patient/${p.id}`)}
                      >
                        View Details
                      </Btn>
                    </div>
                  </td>
                </tr>
              ))}
              {patients.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: 20, color: 'var(--muted)' }}>
                    No patients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>

      </div>
    </PageWrapper>
  );
}
