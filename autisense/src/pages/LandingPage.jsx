import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SectionHeading } from '../components/UI';

const STATS = [
  { val: '1 in 36', label: 'Children affected by autism', emoji: '👶' },
  { val: '94%',     label: 'Screening accuracy',          emoji: '🎯' },
  { val: '5 min',   label: 'Average screening time',      emoji: '⏱️' },
  { val: '2–3 yrs', label: 'Best age to detect early',    emoji: '🔬' },
];

const STEPS = [
  { num: '01', icon: '📝', title: 'Register & Add Child',  desc: 'Create a free account and add your child\'s profile in under 2 minutes.' },
  { num: '02', icon: '🧠', title: 'Complete M-CHAT Screening', desc: 'Answer 20 simple yes/no questions about your child\'s behaviour.' },
  { num: '03', icon: '📄', title: 'Get Instant AI Report',  desc: 'Receive a detailed risk analysis with next-step recommendations.' },
];

const FEATURES = [
  { icon: '🤖', title: 'AI Risk Prediction',   desc: 'Our trained model analyses responses against clinically validated autism markers.' },
  { icon: '💬', title: 'Chatbot 24/7',          desc: 'Ask any autism-related question to our AI assistant anytime, for free.' },
  { icon: '📊', title: 'Progress Tracking',     desc: 'Monitor your child\'s screening history over time with visual trends.' },
  { icon: '🩺', title: 'Doctor Dashboard',      desc: 'Doctors can review cases, add clinical notes, and track urgent patients.' },
  { icon: '📥', title: 'Instant PDF Reports',   desc: 'Download or share detailed screening reports with your healthcare provider.' },
  { icon: '🧩', title: 'Awareness Hub',         desc: 'Learn about early signs, therapies, and find support centres near you.' },
];

const TESTIMONIALS = [
  { name: 'Priya Sharma', role: 'Parent, Bengaluru', initials: 'PS', stars: 5, quote: 'AutiSense helped me spot early signs in my son Arjun. The screening was simple and the report was so clear. We caught it early and he\'s thriving now!' },
  { name: 'Sunita Patel', role: 'Parent, Ahmedabad', initials: 'SP', stars: 5, quote: 'I was worried for months but didn\'t know where to start. This tool guided me step by step. Highly recommended for every parent!' },
  { name: 'Dr. Ramesh Gupta', role: 'Developmental Paediatrician', initials: 'RG', stars: 5, quote: 'As a doctor, I recommend AutiSense as a first-step tool for parents. The M-CHAT based screening is clinically sound and the reports are well structured.' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ background: 'var(--cream)', overflowX: 'hidden' }}>

      {/* ── HERO ──────────────────────────────────────── */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', paddingTop: 88, overflow: 'hidden' }}>
        {/* Blobs */}
        <div className="blob" style={{ width: 520, height: 520, background: 'var(--orange)', top: -80, right: -100 }} />
        <div className="blob" style={{ width: 340, height: 340, background: 'var(--yellow)', bottom: 80, left: -80 }} />
        <div className="blob" style={{ width: 200, height: 200, background: 'var(--orange-light)', top: '40%', left: '30%' }} />

        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center', padding: '60px 24px' }}>
          {/* Left */}
          <div>
            <div className="animate-fadeInUp" style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              background: 'var(--orange-pale)', border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-full)', padding: '5px 16px',
              fontSize: '0.76rem', fontWeight: 700, color: 'var(--orange)',
              marginBottom: 22,
            }}>
              🔴 AI-Powered · Clinically Validated
            </div>

            <h1 className="animate-fadeInUp delay-1" style={{
              fontFamily: 'var(--font-heading)', fontWeight: 900,
              fontSize: 'clamp(2rem, 4vw, 3.2rem)', lineHeight: 1.15,
              color: 'var(--dark)', marginBottom: 20,
            }}>
              Catching{' '}
              <span style={{ color: 'var(--orange)', position: 'relative', display: 'inline-block' }}>
                Autism Early
                <svg viewBox="0 0 200 12" style={{ position: 'absolute', bottom: -6, left: 0, width: '100%', height: 10 }}>
                  <path d="M0,6 Q50,0 100,6 Q150,12 200,6" stroke="var(--yellow)" strokeWidth="3" fill="none" strokeLinecap="round" />
                </svg>
              </span>
              <br />Changes Everything
            </h1>

            <p className="animate-fadeInUp delay-2" style={{ fontSize: '1rem', color: 'var(--mid)', lineHeight: 1.7, marginBottom: 32, maxWidth: 480 }}>
              AutiSense uses the clinically validated M-CHAT assessment to screen preschool children (ages 2–6) for early autism indicators — in under 5 minutes, from anywhere.
            </p>

            <div className="animate-fadeInUp delay-3" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
              <button
                onClick={() => navigate('/login')}
                style={{
                  padding: '13px 28px', borderRadius: 'var(--radius-full)',
                  background: 'var(--orange)', color: 'white',
                  fontSize: '0.95rem', fontWeight: 700, border: 'none', cursor: 'pointer',
                  boxShadow: '0 6px 24px rgba(255,107,43,0.35)',
                  fontFamily: 'var(--font-body)', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.target.style.background = 'var(--orange-deep)'; e.target.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.target.style.background = 'var(--orange)'; e.target.style.transform = 'translateY(0)'; }}
              >
                🧡 Start Free Screening
              </button>
              <button
                onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}
                style={{
                  padding: '13px 28px', borderRadius: 'var(--radius-full)',
                  background: 'white', color: 'var(--dark)',
                  fontSize: '0.95rem', fontWeight: 700,
                  border: '1.5px solid var(--border)', cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                }}
              >
                Learn More ↓
              </button>
            </div>

            {/* Stat pills */}
            <div className="animate-fadeInUp delay-4" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {STATS.slice(0, 3).map(s => (
                <div key={s.val} style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  background: 'white', border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius-full)', padding: '6px 16px',
                  fontSize: '0.82rem', fontWeight: 700, color: 'var(--dark)',
                  boxShadow: 'var(--shadow-sm)',
                }}>
                  <span>{s.emoji}</span>
                  <span style={{ color: 'var(--orange)' }}>{s.val}</span>
                  <span style={{ color: 'var(--muted)', fontWeight: 400 }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — phone mockup */}
          <div className="animate-fadeInUp delay-2" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="animate-float" style={{
              width: 260, background: 'var(--dark)', borderRadius: 36,
              padding: '12px 8px', boxShadow: '0 32px 80px rgba(30,20,16,0.30)',
            }}>
              <div style={{ background: 'var(--cream)', borderRadius: 28, overflow: 'hidden' }}>
                {/* Status bar */}
                <div style={{ background: 'var(--dark)', padding: '10px 18px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'white', fontSize: '0.7rem', fontWeight: 700 }}>9:41</span>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <div style={{ width: 14, height: 7, borderRadius: 2, border: '1.5px solid white', position: 'relative' }}>
                      <div style={{ position: 'absolute', left: 1, top: 1, bottom: 1, width: '70%', background: 'white', borderRadius: 1 }} />
                    </div>
                  </div>
                </div>
                {/* App content */}
                <div style={{ padding: '18px 14px', background: 'var(--cream)' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--orange)', marginBottom: 10 }}>AutiSense Report</div>
                  {/* Risk card */}
                  <div style={{ background: '#dcfce7', borderRadius: 12, padding: '12px', marginBottom: 10, textAlign: 'center' }}>
                    <div style={{ fontSize: '1.6rem', marginBottom: 4 }}>✅</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#166534', fontFamily: 'var(--font-heading)' }}>LOW RISK</div>
                    <div style={{ fontSize: '0.6rem', color: '#166534', marginTop: 2 }}>Score: 4 / 20</div>
                  </div>
                  {/* Mini bars */}
                  {[['Social', 80], ['Communication', 60], ['Behavior', 40]].map(([l, w]) => (
                    <div key={l} style={{ marginBottom: 7 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.58rem', color: 'var(--mid)', marginBottom: 3 }}>
                        <span>{l}</span><span style={{ color: 'var(--green)', fontWeight: 700 }}>Good</span>
                      </div>
                      <div style={{ height: 5, background: 'rgba(34,197,94,0.15)', borderRadius: 3 }}>
                        <div style={{ height: '100%', width: `${w}%`, background: 'var(--green)', borderRadius: 3 }} />
                      </div>
                    </div>
                  ))}
                  <div style={{ background: 'var(--orange)', color: 'white', borderRadius: 8, padding: '7px', textAlign: 'center', fontSize: '0.6rem', fontWeight: 700, marginTop: 10 }}>
                    📥 Download Report
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────── */}
      <section id="how" style={{ padding: '90px 0', background: 'white' }}>
        <div className="container">
          <SectionHeading label="How It Works" title="Three Simple Steps" subtitle="Get your child screened in minutes with our guided, clinically validated process." center />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 28 }}>
            {STEPS.map((s, i) => (
              <div key={i} className={`animate-fadeInUp delay-${i + 1}`} style={{
                background: 'var(--cream)', borderRadius: 'var(--radius-lg)',
                padding: '36px 28px', position: 'relative', overflow: 'hidden',
                border: '1.5px solid var(--border)',
              }}>
                <div style={{
                  position: 'absolute', top: -8, right: 12,
                  fontSize: '5rem', fontWeight: 900, fontFamily: 'var(--font-heading)',
                  color: 'rgba(255,107,43,0.06)', lineHeight: 1, userSelect: 'none',
                }}>{s.num}</div>
                <div style={{ fontSize: '2.4rem', marginBottom: 16 }}>{s.icon}</div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--dark)', marginBottom: 10 }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--mid)', lineHeight: 1.65 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────── */}
      <section style={{ padding: '90px 0', background: 'linear-gradient(135deg, #1E1410 0%, #2d1f15 100%)' }}>
        <div className="container">
          <SectionHeading label="Features" title="Everything You Need" subtitle="Powerful tools for parents, doctors, and healthcare administrators." center light />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {FEATURES.map((f, i) => (
              <div key={i} className={`animate-fadeInUp delay-${(i % 3) + 1}`} style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 'var(--radius-lg)', padding: '28px 24px',
                transition: 'all 0.25s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,107,43,0.12)'; e.currentTarget.style.borderColor = 'rgba(255,107,43,0.30)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              >
                <div style={{ fontSize: '2rem', marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1rem', color: 'white', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BANNER ──────────────────────────────── */}
      <section style={{ padding: '60px 0', background: 'var(--orange)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, textAlign: 'center' }}>
            {STATS.map((s, i) => (
              <div key={i} className={`animate-fadeInUp delay-${i + 1}`}>
                <div style={{ fontSize: '2.2rem', fontFamily: 'var(--font-heading)', fontWeight: 900, color: 'white', marginBottom: 6 }}>{s.val}</div>
                <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────── */}
      <section style={{ padding: '90px 0', background: 'white' }}>
        <div className="container">
          <SectionHeading label="Testimonials" title="Parents Trust AutiSense" subtitle="Real stories from families who detected early and made a difference." center />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{ background: 'var(--cream)', borderRadius: 'var(--radius-lg)', padding: 28, border: '1.5px solid var(--border)' }}>
                <div style={{ color: 'var(--yellow)', fontSize: '1rem', marginBottom: 14 }}>{'★'.repeat(t.stars)}</div>
                <p style={{ fontSize: '0.88rem', color: 'var(--mid)', lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>"{t.quote}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%',
                    background: 'var(--orange)', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.9rem',
                  }}>{t.initials}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--dark)' }}>{t.name}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────── */}
      <section style={{ padding: '80px 0', background: 'linear-gradient(135deg, var(--orange) 0%, var(--orange-deep) 100%)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '2.2rem', color: 'white', marginBottom: 14 }}>
            Start Your Child's Screening Today
          </h2>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.85)', marginBottom: 32 }}>
            Free. Clinically validated. Results in 5 minutes.
          </p>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '14px 36px', borderRadius: 'var(--radius-full)',
              background: 'white', color: 'var(--orange)',
              fontSize: '1rem', fontWeight: 800, border: 'none',
              cursor: 'pointer', fontFamily: 'var(--font-heading)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.20)',
            }}
          >🧡 Start Free Screening</button>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────── */}
      <footer style={{ background: 'var(--dark)', padding: '60px 0 28px' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 40, marginBottom: 48 }}>
            {/* Brand */}
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.4rem', color: 'white', marginBottom: 14 }}>
                <span style={{ color: 'var(--orange)' }}>Auti</span>Sense
              </div>
              <p style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: 240 }}>
                AI-powered early autism detection for preschool children. Clinically validated M-CHAT screening in minutes.
              </p>
            </div>
            {/* Links */}
            {[
              { heading: 'Platform', links: ['Start Screening', 'Parent Dashboard', 'Doctor Portal', 'Admin Panel'] },
              { heading: 'Learn', links: ['What is Autism?', 'Early Signs', 'M-CHAT Guide', 'Therapy Options'] },
              { heading: 'Support', links: ['FAQ', 'Contact Us', 'Privacy Policy', 'Terms of Service'] },
            ].map(col => (
              <div key={col.heading}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
                  {col.heading}
                </div>
                {col.links.map(l => (
                  <div key={l} style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: 10, cursor: 'pointer', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color = 'var(--orange)'}
                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.6)'}
                  >{l}</div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)' }}>© 2024 AutiSense. MCA Final Year Project.</div>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)' }}>Built with 🧡 for early detection</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
