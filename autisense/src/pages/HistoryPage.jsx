import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper, Card, Badge, Btn, Select, BackBtn } from '../components/UI';
import { SCREENING_HISTORY, CHILDREN } from '../data/dummyData';

export default function HistoryPage() {
  const navigate = useNavigate();
  
  const [filterChild, setFilterChild] = useState('All');
  const [filterRisk, setFilterRisk] = useState('All');
  const [sortDate, setSortDate] = useState('Newest');

  // Since we only want to show history for the logged in parent's children
  // we filter SCREENING_HISTORY by CHILDREN ids.
  const baseHistory = SCREENING_HISTORY.filter(h => CHILDREN.find(c => c.id === h.childId));

  const filtered = baseHistory
    .filter(h => filterChild === 'All' || h.child === filterChild)
    .filter(h => filterRisk === 'All' || h.risk === filterRisk)
    .sort((a, b) => {
      if (sortDate === 'Newest') return new Date(b.date) - new Date(a.date);
      return new Date(a.date) - new Date(b.date);
    });

  const counts = {
    total: filtered.length,
    low: filtered.filter(h => h.risk === 'Low').length,
    medium: filtered.filter(h => h.risk === 'Medium').length,
    high: filtered.filter(h => h.risk === 'High').length,
  };

  return (
    <PageWrapper style={{ padding: '40px 24px' }}>
      <div className="container">
        <BackBtn onClick={() => navigate('/parent')} />
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '2rem', marginBottom: 24 }}>Screening History</h1>

        {/* Summary Cards */}
        <div className="grid-4" style={{ marginBottom: 32 }}>
          <Card style={{ padding: 20, textAlign: 'center', background: 'var(--cream)' }}>
            <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-heading)' }}>{counts.total}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>Total Screenings</div>
          </Card>
          <Card style={{ padding: 20, textAlign: 'center', background: 'var(--green-pale)' }}>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--green)', fontFamily: 'var(--font-heading)' }}>{counts.low}</div>
            <div style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 600 }}>Low Risk</div>
          </Card>
          <Card style={{ padding: 20, textAlign: 'center', background: 'var(--amber-pale)' }}>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--amber)', fontFamily: 'var(--font-heading)' }}>{counts.medium}</div>
            <div style={{ fontSize: '0.8rem', color: '#92400E', fontWeight: 600 }}>Medium Risk</div>
          </Card>
          <Card style={{ padding: 20, textAlign: 'center', background: 'var(--red-pale)' }}>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--red)', fontFamily: 'var(--font-heading)' }}>{counts.high}</div>
            <div style={{ fontSize: '0.8rem', color: '#991B1B', fontWeight: 600 }}>High Risk</div>
          </Card>
        </div>

        {/* Filters */}
        <Card style={{ padding: '20px 24px', marginBottom: 24, display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <Select label="Filter by Child" value={filterChild} onChange={e => setFilterChild(e.target.value)} style={{ marginBottom: 0 }}>
              <option value="All">All Children</option>
              {CHILDREN.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </Select>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <Select label="Filter by Risk" value={filterRisk} onChange={e => setFilterRisk(e.target.value)} style={{ marginBottom: 0 }}>
              <option value="All">All Risks</option>
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">High Risk</option>
            </Select>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <Select label="Sort by Date" value={sortDate} onChange={e => setSortDate(e.target.value)} style={{ marginBottom: 0 }}>
              <option value="Newest">Newest First</option>
              <option value="Oldest">Oldest First</option>
            </Select>
          </div>
        </Card>

        {/* Table */}
        <Card className="table-wrap animate-fadeInUp">
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
              {filtered.map((row, i) => (
                <tr key={row.id}>
                  <td style={{ fontWeight: 600 }}>{new Date(row.date).toLocaleDateString()}</td>
                  <td>{row.child}</td>
                  <td>{row.score} / {row.total}</td>
                  <td><Badge risk={row.risk} /></td>
                  <td><span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>{row.status}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <Btn size="sm" variant="ghost" onClick={() => navigate('/result')}>View Report</Btn>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: 10 }}>🔍</div>
                    <div style={{ fontWeight: 600 }}>No results found</div>
                    <div style={{ fontSize: '0.85rem' }}>Try adjusting your filters</div>
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
