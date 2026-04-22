import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, StatCard, Badge, Input, Btn, useToast, RoleBadge } from '../components/UI';
import { ADMIN_USERS, MONTHLY_DATA } from '../data/dummyData';

export default function AdminPanel() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showToast, ToastComponent } = useToast();

  const [collapsed, setCollapsed] = useState(false);
  const [view, setView] = useState('dashboard'); // dashboard | users
  const [users, setUsers] = useState(ADMIN_USERS);
  const [search, setSearch] = useState('');

  const toggleStatus = (id) => {
    setUsers(u => u.map(x => {
      if (x.id !== id) return x;
      const newStatus = x.status === 'Active' ? 'Disabled' : 'Active';
      showToast(`User ${x.name} is now ${newStatus}`, newStatus === 'Active' ? 'success' : 'info');
      return { ...x, status: newStatus };
    }));
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalScreenings = MONTHLY_DATA.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="admin-layout page-enter">
      {ToastComponent}
      
      {/* Sidebar */}
      <div className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div style={{ padding: '24px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--orange)', flexShrink: 0 }} />
            <span className="nav-label" style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, color: 'white', fontSize: '1.2rem', whiteSpace: 'nowrap' }}>
              AutiSense
            </span>
          </div>
        </div>

        <button className={`sidebar-nav-item ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')} title="Dashboard">
          <span style={{ fontSize: '1.2rem', width: 24, textAlign: 'center' }}>📊</span>
          <span className="nav-label">Dashboard</span>
        </button>
        <button className={`sidebar-nav-item ${view === 'users' ? 'active' : ''}`} onClick={() => setView('users')} title="User Management">
          <span style={{ fontSize: '1.2rem', width: 24, textAlign: 'center' }}>👥</span>
          <span className="nav-label">User Management</span>
        </button>

        <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 12, paddingBottom: 12 }}>
          <button className="sidebar-nav-item" onClick={() => navigate('/')} title="Go to Website">
            <span style={{ fontSize: '1.2rem', width: 24, textAlign: 'center' }}>🌐</span>
            <span className="nav-label">View Website</span>
          </button>
          <button className="sidebar-nav-item" onClick={() => { logout(); navigate('/'); }} title="Logout">
            <span style={{ fontSize: '1.2rem', width: 24, textAlign: 'center' }}>🚪</span>
            <span className="nav-label">Logout</span>
          </button>
          
          {/* Collapse Toggle */}
          <button 
            onClick={() => setCollapsed(!collapsed)} 
            style={{ position: 'absolute', bottom: 16, right: collapsed ? 'auto' : 16, left: collapsed ? 16 : 'auto', width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}
          >
            {collapsed ? '»' : '«'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`admin-main ${collapsed ? 'sidebar-collapsed' : ''}`}>
        
        {view === 'dashboard' && (
          <div className="animate-fadeIn">
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '2rem', color: 'var(--dark)' }}>System Dashboard</h1>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Overview of AutiSense platform activity.</p>
            </div>

            <div className="grid-4" style={{ marginBottom: 32 }}>
              <StatCard icon="👥" value={users.length} label="Total Users" bg="#eff6ff" color="#2563eb" />
              <StatCard icon="📋" value={totalScreenings} label="Total Screenings" bg="var(--orange-pale)" color="var(--orange)" />
              <StatCard icon="⚠️" value={34} label="High Risk Cases" bg="var(--red-pale)" color="var(--red)" />
              <StatCard icon="🎯" value="94%" label="Model Accuracy" bg="var(--green-pale)" color="var(--green)" />
            </div>

            <div className="grid-2">
              <Card style={{ padding: 24 }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.1rem', marginBottom: 24 }}>Monthly Screenings</h3>
                <div className="bar-chart">
                  {MONTHLY_DATA.map(d => (
                    <div key={d.month} className="bar-chart-item">
                      <div className="bar-chart-bar" style={{ height: `${(d.count/30)*100}%` }} data-value={d.count} />
                      <div className="bar-label">{d.month}</div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card style={{ padding: 24 }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.1rem', marginBottom: 24 }}>Risk Distribution (All Time)</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {[['Low Risk', 60, 'var(--green)'], ['Medium Risk', 25, 'var(--amber)'], ['High Risk', 15, 'var(--red)']].map(([l, p, c]) => (
                    <div key={l}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: 6 }}>
                        <span>{l}</span><span>{p}%</span>
                      </div>
                      <div style={{ height: 8, background: 'var(--border)', borderRadius: 4 }}>
                        <div style={{ height: '100%', width: `${p}%`, background: c, borderRadius: 4 }} className="animate-slideRight" />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {view === 'users' && (
          <div className="animate-fadeIn">
            <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '2rem', color: 'var(--dark)' }}>User Management</h1>
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Manage parents, doctors, and system admins.</p>
              </div>
              <Input 
                placeholder="Search users..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                style={{ width: 280, marginBottom: 0 }} 
              />
            </div>

            <Card className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Email</th>
                    <th>Joined</th>
                    <th>Screenings</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id} style={{ opacity: u.status === 'Disabled' ? 0.6 : 1 }}>
                      <td style={{ fontWeight: 600 }}>{u.name}</td>
                      <td><RoleBadge role={u.role.toLowerCase()} /></td>
                      <td>{u.email}</td>
                      <td>{u.joined}</td>
                      <td>{u.screenings}</td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', fontWeight: 600, color: u.status === 'Active' ? 'var(--green)' : 'var(--muted)' }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: u.status === 'Active' ? 'var(--green)' : 'var(--muted)' }} />
                          {u.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Btn size="sm" variant={u.status === 'Active' ? 'ghost' : 'outline'} onClick={() => toggleStatus(u.id)}>
                          {u.status === 'Active' ? 'Disable' : 'Enable'}
                        </Btn>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>No users found matching "{search}".</td></tr>
                  )}
                </tbody>
              </table>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}
