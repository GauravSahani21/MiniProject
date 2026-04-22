import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageWrapper, Card, Btn, Input, Select, useToast } from '../components/UI';

export default function LoginPage() {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const { login, register, dashboardPath } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast, ToastComponent } = useToast();

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', role: 'parent'
  });
  const [errors, setErrors] = useState({});

  const from = location.state?.from?.pathname || null;

  const handleTab = (t) => {
    setTab(t);
    setErrors({});
    setFormData({ name: '', email: '', password: '', confirmPassword: '', role: 'parent' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let newErrs = {};
    if (!formData.email) newErrs.email = 'Email is required';
    if (!formData.password) newErrs.password = 'Password is required';
    
    if (tab === 'register') {
      if (!formData.name) newErrs.name = 'Full Name is required';
      if (!formData.confirmPassword) newErrs.confirmPassword = 'Required';
      if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
        newErrs.confirmPassword = 'Passwords do not match';
      }
    }

    if (Object.keys(newErrs).length > 0) {
      setErrors(newErrs);
      return;
    }

    if (tab === 'login') {
      const res = login(formData.email, formData.password, formData.role);
      if (res.ok) {
        showToast(`Welcome back, ${res.user.name}!`, 'success');
        setTimeout(() => navigate(from || dashboardPath(res.user)), 800);
      } else {
        setErrors({ email: res.error });
      }
    } else {
      const res = register(formData.name, formData.email, formData.password, formData.confirmPassword, formData.role);
      if (res.ok) {
        showToast(`Account created, ${res.user.name}!`, 'success');
        setTimeout(() => navigate(dashboardPath(res.user)), 800);
      } else {
        setErrors({ email: res.error });
      }
    }
  };

  return (
    <PageWrapper style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      {ToastComponent}
      <Card className="animate-fadeInUp" style={{ width: '100%', maxWidth: 440, padding: '36px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
             <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--orange)' }} />
             <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.4rem' }}>
               <span style={{ color: 'var(--orange)' }}>Auti</span><span style={{ color: 'var(--dark)' }}>Sense</span>
             </span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--dark)' }}>
            {tab === 'login' ? 'Welcome Back 👋' : 'Create an Account 🧡'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: 4 }}>
            {tab === 'login' ? 'Please enter your details to sign in.' : 'Join us to access early screening tools.'}
          </p>
        </div>

        {/* Tabs */}
        <div className="segmented-control" style={{ marginBottom: 16 }}>
          <button className={`segment-btn ${tab === 'login' ? 'active' : ''}`} onClick={() => handleTab('login')}>Login</button>
          <button className={`segment-btn ${tab === 'register' ? 'active' : ''}`} onClick={() => handleTab('register')}>Register</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 28 }}>
          <div className="segmented-control" style={{ marginBottom: 0 }}>
            <button type="button" className={`segment-btn ${formData.role === 'parent' ? 'active' : ''}`} onClick={() => setFormData({...formData, role: 'parent'})}>Parent</button>
            <button type="button" className={`segment-btn ${formData.role === 'doctor' ? 'active' : ''}`} onClick={() => setFormData({...formData, role: 'doctor'})}>Doctor</button>
            <button type="button" className={`segment-btn ${formData.role === 'admin' ? 'active' : ''}`} onClick={() => setFormData({...formData, role: 'admin'})}>Admin</button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {tab === 'register' && (
            <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} error={errors.name} placeholder="e.g. Priya Sharma" />
          )}
          
          <Input label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} placeholder="you@example.com" />

          <Input label="Password" name="password" type="password" value={formData.password} onChange={handleChange} error={errors.password} placeholder="••••••••" />
          
          {tab === 'register' && (
            <Input label="Confirm Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} placeholder="••••••••" />
          )}

          {tab === 'login' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: -4 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--mid)', cursor: 'pointer' }}>
                <input type="checkbox" style={{ accentColor: 'var(--orange)', cursor: 'pointer' }} defaultChecked /> Remember me
              </label>
              <button type="button" onClick={() => showToast('Password reset link sent to your email!', 'info')} style={{ fontSize: '0.82rem', color: 'var(--orange)', fontWeight: 600 }}>
                Forgot Password?
              </button>
            </div>
          )}

          <Btn type="submit" size="lg" style={{ marginTop: 8, width: '100%' }}>
            {tab === 'login' ? 'Sign In' : 'Create Account'}
          </Btn>
        </form>
      </Card>
    </PageWrapper>
  );
}
