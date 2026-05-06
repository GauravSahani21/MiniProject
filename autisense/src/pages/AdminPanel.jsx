import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, StatCard, Badge, Input, Btn, useToast, RoleBadge } from '../components/UI';
import { admin } from '../api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function AdminPanel() {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const { showToast, ToastComponent } = useToast();

  const [collapsed, setCollapsed] = useState(false);
  const [view, setView] = useState('dashboard'); // dashboard | users | screenings

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [activities, setActivities] = useState([]);
  const [users, setUsers] = useState([]);
  const [screenings, setScreenings] = useState([]);

  // User Management States
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('All');
  const [userSort, setUserSort] = useState('Date Joined'); // Name, Date Joined, Role

  // Screening Overview States
  const [screeningRiskFilter, setScreeningRiskFilter] = useState('All');
  const [screeningStatusFilter, setScreeningStatusFilter] = useState('All');

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, monthlyRes, activityRes, usersRes, screeningsRes] = await Promise.all([
        admin.getStats(token),
        admin.getMonthly(token),
        admin.getActivityLog(token),
        admin.getUsers(token),
        admin.getAllScreenings(token)
      ]);

      setStats(statsRes.data);
      setMonthlyData(monthlyRes.data);
      setActivities(activityRes.data);
      setUsers(usersRes.data);
      setScreenings(screeningsRes.data);
    } catch (err) {
      showToast('Failed to load dashboard data: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUser = async (id) => {
    try {
      await admin.toggleUser(id, token);
      setUsers(u => u.map(x => {
        if (x._id !== id) return x;
        const newStatus = !x.isActive;
        showToast(`User is now ${newStatus ? 'Active' : 'Disabled'}`, newStatus ? 'success' : 'info');
        return { ...x, isActive: newStatus };
      }));
    } catch (err) {
      showToast('Failed to toggle user status', 'error');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    
    try {
      await admin.deleteUser(id, token);
      setUsers(u => u.filter(x => x._id !== id));
      showToast('User deleted successfully', 'success');
    } catch (err) {
      showToast('Failed to delete user', 'error');
    }
  };

  const exportUsersCSV = () => {
    const headers = ['Name', 'Email', 'Role', 'Status', 'Date Joined', 'Screenings Done'];
    const rows = filteredUsers.map(u => [
      `"${u.name}"`,
      `"${u.email}"`,
      `"${u.role}"`,
      u.isActive ? 'Active' : 'Disabled',
      `"${new Date(u.createdAt).toLocaleDateString()}"`,
      u.screeningCount || 0
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "users_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportScreeningsCSV = () => {
    const headers = ['Child Name', 'Parent Name', 'Date', 'Risk Level', 'Score', 'Status'];
    const rows = filteredScreenings.map(s => [
      `"${s.childId?.name || 'Unknown'}"`,
      `"${s.parentId?.name || 'Unknown'}"`,
      `"${new Date(s.screeningDate).toLocaleDateString()}"`,
      s.riskLevel || 'Unknown',
      s.totalScore || 0,
      s.status || 'Unknown'
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "screenings_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // User Filtering & Sorting
  let filteredUsers = users.filter(u => {
    const searchLower = userSearch.toLowerCase();
    const searchMatch = u.name.toLowerCase().includes(searchLower) || 
                        u.email.toLowerCase().includes(searchLower) ||
                        u.role.toLowerCase().includes(searchLower);
    const roleMatch = userRoleFilter === 'All' || u.role.toLowerCase() === userRoleFilter.toLowerCase();
    return searchMatch && roleMatch;
  });

  filteredUsers.sort((a, b) => {
    if (userSort === 'Name') return a.name.localeCompare(b.name);
    if (userSort === 'Role') return a.role.localeCompare(b.role);
    // Date Joined (newest first)
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // Screening Filtering
  let filteredScreenings = screenings.filter(s => {
    const riskMatch = screeningRiskFilter === 'All' || s.riskLevel === screeningRiskFilter;
    const statusMatch = screeningStatusFilter === 'All' || 
                       (s.status || '').toLowerCase() === screeningStatusFilter.toLowerCase();
    return riskMatch && statusMatch;
  });

  if (loading || !stats) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)', flexDirection: 'column', gap: 16 }}>
        <div style={{ width: 44, height: 44, border: '4px solid rgba(255,107,43,0.15)', borderTopColor: 'var(--orange)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--muted)', fontSize: '0.9rem' }}>Loading Admin Dashboard...</p>
      </div>
    );
  }

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
        <button className={`sidebar-nav-item ${view === 'screenings' ? 'active' : ''}`} onClick={() => setView('screenings')} title="Screening Overview">
          <span style={{ fontSize: '1.2rem', width: 24, textAlign: 'center' }}>📋</span>
          <span className="nav-label">Screenings</span>
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
        
        {/* DASHBOARD VIEW */}
        {view === 'dashboard' && (
          <div className="animate-fadeIn">
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '2rem', color: 'var(--dark)' }}>System Dashboard</h1>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Overview of AutiSense platform activity.</p>
            </div>

            <div className="grid-4" style={{ marginBottom: 32 }}>
              <StatCard icon="👥" value={stats.totalUsers} label="Total Users" bg="#eff6ff" color="#2563eb" />
              <StatCard icon="👶" value={stats.totalChildren} label="Total Children" bg="var(--green-pale)" color="var(--green)" />
              <StatCard icon="📋" value={stats.totalScreenings} label="Total Screenings" bg="var(--orange-pale)" color="var(--orange)" />
              <StatCard icon="⚠️" value={stats.highRiskCases} label="High Risk Cases" bg="var(--red-pale)" color="var(--red)" />
            </div>

            <div className="grid-2">
              {/* Monthly Chart */}
              <Card style={{ padding: 24 }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.1rem', marginBottom: 24 }}>Monthly Screenings</h3>
                <div style={{ height: 250, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted)' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted)' }} />
                      <Tooltip cursor={{ fill: 'rgba(255,107,43,0.05)' }} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)' }} />
                      <Bar dataKey="count" fill="var(--orange)" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Activity Log */}
              <Card style={{ padding: 24 }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.1rem', marginBottom: 24 }}>System Activity Log</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: 250, overflowY: 'auto', paddingRight: 8 }}>
                  {activities.map((act, index) => (
                    <div key={index} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ 
                        width: 32, height: 32, borderRadius: '50%', flexShrink: 0, 
                        background: act.type === 'user_registration' ? 'var(--blue)' : 'var(--green)', 
                        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' 
                      }}>
                        {act.type === 'user_registration' ? '👤' : '📋'}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--dark)', fontWeight: 600 }}>{act.message}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{new Date(act.date).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                  {activities.length === 0 && (
                    <div style={{ color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center', marginTop: 20 }}>No recent activity.</div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* USERS VIEW */}
        {view === 'users' && (
          <div className="animate-fadeIn">
            <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '2rem', color: 'var(--dark)' }}>User Management</h1>
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Manage parents, doctors, and system admins.</p>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <Btn variant="outline" size="sm" onClick={exportUsersCSV}>📥 Export CSV</Btn>
              </div>
            </div>

            <Card style={{ padding: 20, marginBottom: 24, display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap', background: 'var(--white)' }}>
              {/* BUG FIX: Added specific width and flex styles to ensure search bar is visible */}
              <div style={{ flex: '1 1 300px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Search Users</label>
                <Input 
                  placeholder="Search by name, email, or role..." 
                  value={userSearch} 
                  onChange={e => setUserSearch(e.target.value)} 
                  style={{ width: '100%', marginBottom: 0 }} 
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Filter by Role</label>
                <select className="form-select" value={userRoleFilter} onChange={e => setUserRoleFilter(e.target.value)} style={{ width: 140, marginBottom: 0 }}>
                  <option value="All">All Roles</option>
                  <option value="Parent">Parent</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Sort by</label>
                <select className="form-select" value={userSort} onChange={e => setUserSort(e.target.value)} style={{ width: 140, marginBottom: 0 }}>
                  <option value="Date Joined">Date Joined</option>
                  <option value="Name">Name</option>
                  <option value="Role">Role</option>
                </select>
              </div>
            </Card>

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
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u._id} style={{ opacity: u.isActive ? 1 : 0.6 }}>
                      <td style={{ fontWeight: 600 }}>{u.name}</td>
                      <td><RoleBadge role={u.role.toLowerCase()} /></td>
                      <td>{u.email}</td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>{u.screeningCount || 0}</td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', fontWeight: 600, color: u.isActive ? 'var(--green)' : 'var(--muted)' }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: u.isActive ? 'var(--green)' : 'var(--muted)' }} />
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <Btn size="sm" variant={u.isActive ? 'ghost' : 'outline'} onClick={() => handleToggleUser(u._id)}>
                            {u.isActive ? 'Disable' : 'Enable'}
                          </Btn>
                          <Btn size="sm" variant="danger" onClick={() => handleDeleteUser(u._id)}>
                            Delete
                          </Btn>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>No users found.</td></tr>
                  )}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {/* SCREENINGS VIEW */}
        {view === 'screenings' && (
          <div className="animate-fadeIn">
            <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '2rem', color: 'var(--dark)' }}>Screening Overview</h1>
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>View all screenings across the platform.</p>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <Btn variant="outline" size="sm" onClick={exportScreeningsCSV}>📥 Export CSV</Btn>
              </div>
            </div>

            <Card style={{ padding: 20, marginBottom: 24, display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap', background: 'var(--white)' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Risk Level</label>
                <select className="form-select" value={screeningRiskFilter} onChange={e => setScreeningRiskFilter(e.target.value)} style={{ width: 160, marginBottom: 0 }}>
                  <option value="All">All Risk Levels</option>
                  <option value="High">High Risk</option>
                  <option value="Medium">Medium Risk</option>
                  <option value="Low">Low Risk</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Status</label>
                <select className="form-select" value={screeningStatusFilter} onChange={e => setScreeningStatusFilter(e.target.value)} style={{ width: 160, marginBottom: 0 }}>
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Reviewed">Reviewed</option>
                </select>
              </div>
            </Card>

            <Card className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Child Name</th>
                    <th>Parent</th>
                    <th>Date</th>
                    <th>Risk Level</th>
                    <th>Score</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredScreenings.map(s => (
                    <tr key={s._id}>
                      <td style={{ fontWeight: 600 }}>{s.childId?.name || 'Unknown'}</td>
                      <td>{s.parentId?.name || 'Unknown'}</td>
                      <td>{new Date(s.screeningDate).toLocaleDateString()}</td>
                      <td><Badge risk={s.riskLevel} /></td>
                      <td style={{ fontWeight: 600, color: 'var(--muted)' }}>{s.totalScore}/20</td>
                      <td>
                        <span className={`status-pill ${(s.status || 'pending').toLowerCase()}`}>
                          {(s.status || 'pending') === 'reviewed' ? '✅ Reviewed' : '⏳ Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredScreenings.length === 0 && (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>No screenings found.</td></tr>
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
