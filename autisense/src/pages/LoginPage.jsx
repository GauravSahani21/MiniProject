import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, Btn, Input, useToast, Container, GlassCard } from '../components/UI';

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
    <div className="login-grid">
      {ToastComponent}
      
      {/* Left Panel: Visual & Messaging */}
      <div className="visual-panel">
        <div className="animate-fadeInUp" style={{ maxWidth: 500 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
             <span style={{ width: 16, height: 16, borderRadius: '50%', background: 'white', boxShadow: '0 0 15px rgba(255,255,255,0.5)' }} />
             <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '2rem', color: 'white' }}>
               AutiSense
             </span>
          </div>
          
          <h1 style={{ fontSize: '3.2rem', fontWeight: 900, lineHeight: 1.2, marginBottom: 24, letterSpacing: '-0.02em', padding: '10px 0' }}>
            Nurturing every <br />
            <span style={{ opacity: 0.85 }}>milestone.</span>
          </h1>
          
          <p style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: 48, lineHeight: 1.6, fontWeight: 500 }}>
            Join thousands of parents and clinicians using AI-powered insights for early autism detection and personalized support.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              { icon: '🎯', text: '96.7% Screening Accuracy' },
              { icon: '🤖', text: 'AI-Powered Drawing Analysis' },
              { icon: '📈', text: 'Personalized Development Tracking' }
            ].map((item, i) => (
              <div key={i} className={`animate-fadeInUp delay-${i+2}`} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: '1.5rem', width: 48, height: 48, background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.icon}
                </span>
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <img 
          src="/screening-illustration.png"
          alt="Illustration"
          className="animate-pulse-soft"
          style={{
            position: 'absolute',
            bottom: '-5%',
            right: '-5%',
            width: '65%',
            opacity: 0.25,
            pointerEvents: 'none',
            mixBlendMode: 'screen'
          }}
        />
      </div>

      {/* Right Panel: Form */}
      <div className="form-panel">
        <Container style={{ maxWidth: 520, padding: 0 }}>
          <div className="animate-fadeInUp" style={{ marginBottom: 24 }}>
            <button
              onClick={() => navigate('/')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                fontSize: '0.95rem', fontWeight: 700, color: 'var(--muted)',
                cursor: 'pointer', background: 'none', border: 'none', padding: '8px 0',
                fontFamily: 'var(--font-body)', transition: 'var(--transition)'
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--orange-solid)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
            >
              ← Back to Home
            </button>
          </div>

          <GlassCard p="48px" className="animate-fadeInUp delay-1" style={{ border: '1.5px solid white' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '2rem', color: 'var(--dark)', letterSpacing: '-0.02em' }}>
                {tab === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p style={{ fontSize: '1rem', color: 'var(--muted)', marginTop: 8, fontWeight: 500 }}>
                {tab === 'login' ? 'Enter your credentials to continue' : 'Start your journey with AutiSense today'}
              </p>
            </div>

            <div className="segmented-control" style={{ marginBottom: 32 }}>
              <button className={`segment-btn ${tab === 'login' ? 'active' : ''}`} onClick={() => handleTab('login')}>Sign In</button>
              <button className={`segment-btn ${tab === 'register' ? 'active' : ''}`} onClick={() => handleTab('register')}>Register</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <label className="form-label" style={{ textAlign: 'center' }}>Logging in as</label>
                <div className="segmented-control">
                  {['parent', 'doctor', 'admin'].map(r => (
                    <button 
                      key={r}
                      type="button" 
                      className={`segment-btn ${formData.role === r ? 'active' : ''}`} 
                      onClick={() => setFormData({...formData, role: r})}
                      style={{ textTransform: 'capitalize' }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {tab === 'register' && (
                <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} error={errors.name} placeholder="Rahul Sharma" autoComplete="name" />
              )}
              
              <Input label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} placeholder="name@email.com" autoComplete="email" />

              <Input label="Password" name="password" type="password" value={formData.password} onChange={handleChange} error={errors.password} placeholder="••••••••" autoComplete={tab === 'login' ? 'current-password' : 'new-password'} />
              
              {tab === 'register' && (
                <Input label="Confirm Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} placeholder="••••••••" autoComplete="new-password" />
              )}

              {tab === 'login' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: -4 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--muted)', cursor: 'pointer', fontWeight: 600 }}>
                    <input type="checkbox" style={{ accentColor: 'var(--orange-solid)', cursor: 'pointer', width: 16, height: 16 }} defaultChecked /> Remember me
                  </label>
                  <button type="button" onClick={() => showToast('Check your email for instructions.', 'info')} style={{ fontSize: '0.85rem', color: 'var(--orange-solid)', fontWeight: 800 }}>
                    Forgot Password?
                  </button>
                </div>
              )}

              <Btn type="submit" size="lg" disabled={submitting} loading={submitting} style={{ marginTop: 8, width: '100%' }}>
                {tab === 'login' ? 'Sign In Now' : 'Create My Account'}
              </Btn>
            </form>

            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <p style={{ fontSize: '0.95rem', color: 'var(--muted)', fontWeight: 500 }}>
                {tab === 'login' ? "New to AutiSense?" : "Already have an account?"}
                {' '}
                <button 
                  onClick={() => handleTab(tab === 'login' ? 'register' : 'login')}
                  style={{ color: 'var(--orange-solid)', fontWeight: 800, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {tab === 'login' ? 'Create one here' : 'Sign In instead'}
                </button>
              </p>
            </div>
          </GlassCard>
        </Container>
      </div>
    </div>
  );
}
