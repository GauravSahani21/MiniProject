import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageWrapper, Card, Btn, Input, useToast, Container } from '../components/UI';

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

  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (e) => {
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

    setSubmitting(true);
    try {
      if (tab === 'login') {
        const res = await login(formData.email, formData.password, formData.role);
        if (res.ok) {
          showToast(`Welcome back, ${res.user.name}!`, 'success');
          setTimeout(() => navigate(from || dashboardPath(res.user)), 800);
        } else {
          setErrors({ email: res.error || 'Invalid credentials' });
        }
      } else {
        const res = await register(formData.name, formData.email, formData.password, formData.confirmPassword, formData.role);
        if (res.ok) {
          showToast(`Account created, ${res.user.name}!`, 'success');
          setTimeout(() => navigate(dashboardPath(res.user)), 800);
        } else {
          setErrors({ email: res.error || 'Registration failed' });
        }
      }
    } catch (err) {
      setErrors({ email: err.message || 'Something went wrong. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageWrapper style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      {ToastComponent}
      
      <Container style={{ maxWidth: 480 }}>
        <div className="animate-fadeInUp" style={{ marginBottom: 20 }}>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontSize: '0.9rem', fontWeight: 700, color: 'var(--muted)',
              cursor: 'pointer', background: 'none', border: 'none', padding: '8px 0',
              fontFamily: 'var(--font-body)', transition: 'var(--transition)'
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--orange-solid)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
          >
            ← Back to Home
          </button>
        </div>

        <Card premium p="48px" className="animate-fadeInUp delay-1">
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
               <span style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--orange)', boxShadow: '0 0 10px var(--orange-light)' }} />
               <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.8rem' }}>
                 <span style={{ color: 'var(--orange-solid)' }}>Auti</span><span style={{ color: 'var(--dark)' }}>Sense</span>
               </span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.5rem', color: 'var(--dark)', letterSpacing: '-0.02em' }}>
              {tab === 'login' ? 'Welcome Back 👋' : 'Create an Account 🧡'}
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--muted)', marginTop: 8, fontWeight: 500 }}>
              {tab === 'login' ? 'Sign in to access your child\'s profile.' : 'Join AutiSense to start early screening.'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="segmented-control" style={{ marginBottom: 24 }}>
            <button className={`segment-btn ${tab === 'login' ? 'active' : ''}`} onClick={() => handleTab('login')}>Sign In</button>
            <button className={`segment-btn ${tab === 'register' ? 'active' : ''}`} onClick={() => handleTab('register')}>Join Now</button>
          </div>

          {/* Role Selection */}
          <div style={{ marginBottom: 32 }}>
            <label className="form-label" style={{ marginBottom: 12, display: 'block', textAlign: 'center' }}>I am a...</label>
            <div className="segmented-control">
              <button type="button" className={`segment-btn ${formData.role === 'parent' ? 'active' : ''}`} onClick={() => setFormData({...formData, role: 'parent'})}>Parent</button>
              <button type="button" className={`segment-btn ${formData.role === 'doctor' ? 'active' : ''}`} onClick={() => setFormData({...formData, role: 'doctor'})}>Doctor</button>
              <button type="button" className={`segment-btn ${formData.role === 'admin' ? 'active' : ''}`} onClick={() => setFormData({...formData, role: 'admin'})}>Admin</button>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {tab === 'register' && (
              <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} error={errors.name} placeholder="e.g. Rahul Sharma" />
            )}
            
            <Input label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} placeholder="rahul@example.com" />

            <Input label="Password" name="password" type="password" value={formData.password} onChange={handleChange} error={errors.password} placeholder="••••••••" />
            
            {tab === 'register' && (
              <Input label="Confirm Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} placeholder="••••••••" />
            )}

            {tab === 'login' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: -8 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--muted)', cursor: 'pointer', fontWeight: 600 }}>
                  <input type="checkbox" style={{ accentColor: 'var(--orange-solid)', cursor: 'pointer', width: 16, height: 16 }} defaultChecked /> Remember me
                </label>
                <button type="button" onClick={() => showToast('Check your email for reset instructions!', 'info')} style={{ fontSize: '0.85rem', color: 'var(--orange-solid)', fontWeight: 700 }}>
                  Forgot?
                </button>
              </div>
            )}

            <Btn type="submit" size="lg" disabled={submitting} loading={submitting} style={{ marginTop: 12, width: '100%' }}>
              {tab === 'login' ? 'Sign In' : 'Create Account'}
            </Btn>
          </form>

          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', fontWeight: 500 }}>
              {tab === 'login' ? "Don't have an account?" : "Already have an account?"}
              {' '}
              <button 
                onClick={() => handleTab(tab === 'login' ? 'register' : 'login')}
                style={{ color: 'var(--orange-solid)', fontWeight: 800, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {tab === 'login' ? 'Join AutiSense' : 'Sign In instead'}
              </button>
            </p>
          </div>
        </Card>
      </Container>
    </PageWrapper>
  );
}
