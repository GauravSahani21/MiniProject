import React, { useState, useEffect, useCallback } from 'react';

/* ════════════════════════════════════════════════════
   AutiSense — Shared UI Components
   ════════════════════════════════════════════════════ */

/* ── Container ────────────────────────────────────── */
export function Container({ children, className = '', style = {}, ...rest }) {
  return (
    <div className={`container ${className}`} style={style} {...rest}>
      {children}
    </div>
  );
}

/* ── Section ──────────────────────────────────────── */
export function Section({ children, className = '', style = {}, py = '80px', ...rest }) {
  return (
    <section className={className} style={{ paddingTop: py, paddingBottom: py, ...style }} {...rest}>
      {children}
    </section>
  );
}

/* ── Grid ─────────────────────────────────────────── */
export function Grid({ children, cols = 3, gap = '24px', className = '', style = {}, ...rest }) {
  return (
    <div 
      className={`grid-${cols} ${className}`} 
      style={{ gap, ...style }} 
      {...rest}
    >
      {children}
    </div>
  );
}

/* ── Card ─────────────────────────────────────────── */
export function Card({ children, className = '', style = {}, premium = true, p = '24px', ...rest }) {
  return (
    <div
      className={`${premium ? 'card-premium' : ''} ${className}`}
      style={{
        background: 'var(--white)',
        borderRadius: 'var(--radius-md)',
        padding: p,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

/* ── GlassCard ────────────────────────────────────── */
export function GlassCard({ children, className = '', style = {}, p = '32px', premium = true, ...rest }) {
  return (
    <div
      className={`glass ${premium ? 'premium' : ''} ${className}`}
      style={{
        borderRadius: 'var(--radius-lg)',
        padding: p,
        boxShadow: 'var(--shadow-lg)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

/* ── Button ───────────────────────────────────────── */
const BTN_BASE = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 12,
  borderRadius: 'var(--radius-full)',
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  cursor: 'pointer',
  border: 'none',
  transition: 'var(--transition)',
  whiteSpace: 'nowrap',
  letterSpacing: '0.02em',
};

const BTN_SIZES = {
  sm: { padding: '10px 22px', fontSize: '0.85rem' },
  md: { padding: '14px 32px', fontSize: '0.95rem' },
  lg: { padding: '18px 42px', fontSize: '1.05rem' },
};

const BTN_VARIANTS = {
  primary: {
    background: 'var(--orange)',
    color: 'white',
    boxShadow: '0 8px 24px rgba(255,107,43,0.25)',
  },
  outline: {
    background: 'transparent',
    color: 'var(--orange-solid)',
    border: '2px solid var(--orange-solid)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--mid)',
    border: '1.5px solid var(--border)',
  },
  danger: {
    background: 'var(--red)',
    color: 'white',
    boxShadow: '0 8px 24px rgba(239,68,68,0.20)',
  },
  success: {
    background: 'var(--green)',
    color: 'white',
    boxShadow: '0 8px 24px rgba(34,197,94,0.20)',
  },
};

export function Btn({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  type = 'button',
  style = {},
  className = '',
  icon,
}) {
  const [hovered, setHovered] = useState(false);

  const base = {
    ...BTN_BASE,
    ...BTN_SIZES[size],
    ...BTN_VARIANTS[variant],
    ...(disabled && {
      background: '#f1f5f9',
      color: '#94a3b8',
      cursor: 'not-allowed',
      boxShadow: 'none',
      border: '1px solid #e2e8f0',
    }),
    ...(hovered && !disabled && !loading && {
      transform: 'translateY(-4px) scale(1.03)',
      boxShadow: variant === 'primary' ? '0 12px 32px rgba(255,107,43,0.35)' : undefined,
    }),
    ...style,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
      style={base}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {loading ? <Spinner size={20} color={variant === 'primary' ? 'white' : 'var(--orange-solid)'} /> : icon}
      {children}
    </button>
  );
}

// Aliases
export { Btn as Button };

/* ── AnimatedCard ─────────────────────────────────── */
export function AnimatedCard({ children, delay = 0, style = {}, ...rest }) {
  return (
    <div 
      className="animate-fadeInUp" 
      style={{ animationDelay: `${delay}s`, ...style }} 
      {...rest}
    >
      {children}
    </div>
  );
}

/* ── Badge (Risk) ─────────────────────────────────── */
const BADGE_STYLES = {
  Low:    { bg: 'var(--green-pale)',  color: '#166534', icon: '✅' },
  Medium: { bg: 'var(--amber-pale)', color: '#92400E', icon: '⚠️' },
  High:   { bg: 'var(--red-pale)',   color: '#991B1B', icon: '🚨' },
};

export function Badge({ risk, style = {} }) {
  const s = BADGE_STYLES[risk] || BADGE_STYLES.Low;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '6px 16px',
      borderRadius: 'var(--radius-full)',
      fontSize: '0.8rem',
      fontWeight: 800,
      fontFamily: 'var(--font-heading)',
      background: s.bg,
      color: s.color,
      border: `1.5px solid rgba(0,0,0,0.03)`,
      ...style,
    }}>
      <span>{s.icon}</span>
      {risk} Risk
    </span>
  );
}

/* ── Input ────────────────────────────────────────── */
export function Input({
  label,
  error,
  className = '',
  style = {},
  inputRef,
  ...props
}) {
  const [focused, setFocused] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (error) {
      setShake(true);
      const t = setTimeout(() => setShake(false), 400);
      return () => clearTimeout(t);
    }
  }, [error]);

  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <input
        ref={inputRef}
        {...props}
        className={`form-input${error ? ' error' : ''}${shake ? ' shake' : ''} ${className}`}
        style={{
          borderColor: focused ? 'var(--orange-solid)' : error ? 'var(--red)' : undefined,
          boxShadow: focused ? '0 0 0 4px rgba(255,107,43,0.1)' : 'none',
          ...style,
        }}
        onFocus={e => { setFocused(true); props.onFocus?.(e); }}
        onBlur={e => { setFocused(false); props.onBlur?.(e); }}
      />
      {error && <span className="form-error">⚠ {error}</span>}
    </div>
  );
}

/* ── Select ───────────────────────────────────────── */
export function Select({ label, error, children, style = {}, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <select
        {...props}
        className={`form-select${error ? ' error' : ''}`}
        style={{
          borderColor: focused ? 'var(--orange-solid)' : error ? 'var(--red)' : undefined,
          boxShadow: focused ? '0 0 0 4px rgba(255,107,43,0.1)' : 'none',
          ...style,
        }}
        onFocus={e => { setFocused(true); props.onFocus?.(e); }}
        onBlur={e => { setFocused(false); props.onBlur?.(e); }}
      >
        {children}
      </select>
      {error && <span className="form-error">⚠ {error}</span>}
    </div>
  );
}

/* ── Toast ────────────────────────────────────────── */
const TOAST_COLORS = {
  success: { bg: '#10b981', icon: '✅' },
  error:   { bg: '#ef4444', icon: '❌' },
  info:    { bg: 'var(--orange-solid)', icon: 'ℹ️' },
};

function ToastItem({ id, message, type = 'success', onDismiss }) {
  const [visible, setVisible] = useState(true);
  const s = TOAST_COLORS[type] || TOAST_COLORS.info;

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); setTimeout(() => onDismiss(id), 300); }, 3500);
    return () => clearTimeout(t);
  }, [id, onDismiss]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      background: s.bg,
      color: 'white',
      padding: '16px 24px',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-xl)',
      fontSize: '0.9rem',
      fontWeight: 700,
      maxWidth: 380,
      animation: visible ? 'toastIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)' : 'fadeIn 0.3s ease reverse',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.3s ease',
    }}>
      <span style={{ fontSize: '1.2rem' }}>{s.icon}</span>
      {message}
      <button
        onClick={() => { setVisible(false); setTimeout(() => onDismiss(id), 300); }}
        style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', marginLeft: 'auto', fontSize: '1.1rem', opacity: 0.8, padding: 4 }}
      >✕</button>
    </div>
  );
}

/* ── useToast hook ────────────────────────────────── */
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const ToastComponent = (
    <div style={{
      position: 'fixed',
      top: 100,
      right: 32,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      {toasts.map(t => (
        <ToastItem key={t.id} {...t} onDismiss={dismiss} />
      ))}
    </div>
  );

  return { showToast, ToastComponent };
}

/* ── Modal ────────────────────────────────────────── */
export function Modal({ open, onClose, title, children, width = 520 }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(30,20,16,0.65)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backdropFilter: 'blur(5px)',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          width: '100%',
          maxWidth: width,
          boxShadow: 'var(--shadow-xl)',
          animation: 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 32px',
          borderBottom: '1.5px solid var(--border)',
        }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.15rem', color: 'var(--dark)' }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              width: 36, height: 36,
              borderRadius: '50%',
              background: 'var(--orange-pale)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem',
              color: 'var(--orange-solid)',
              fontWeight: 800,
              transition: 'var(--transition)',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'rotate(90deg)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'rotate(0deg)'}
          >✕</button>
        </div>
        {/* Body */}
        <div style={{ padding: '32px' }}>{children}</div>
      </div>
    </div>
  );
}

/* ── StatCard ─────────────────────────────────────── */
export function StatCard({ icon, value, label, color = 'var(--orange-solid)', bg, style = {} }) {
  return (
    <Card p="28px" style={style}>
      <div style={{
        width: 52, height: 52,
        borderRadius: 'var(--radius-sm)',
        background: bg || 'var(--orange-pale)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.6rem',
        marginBottom: 18,
      }}>
        {icon}
      </div>
      <div style={{
        fontFamily: 'var(--font-heading)',
        fontWeight: 900,
        fontSize: '2.2rem',
        color,
        lineHeight: 1,
        marginBottom: 6,
      }}>
        {value}
      </div>
      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </div>
    </Card>
  );
}

/* ── PageWrapper ──────────────────────────────────── */
export function PageWrapper({ children, style = {}, className = '' }) {
  return (
    <div
      className={`page-wrapper animate-fadeIn ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

/* ── Spinner ──────────────────────────────────────── */
export function Spinner({ size = 32, color = 'var(--orange-solid)' }) {
  return (
    <div style={{
      width: size, height: size,
      border: `3.5px solid rgba(255,107,43,0.15)`,
      borderTopColor: color,
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
      display: 'inline-block',
    }} />
  );
}

/* ── Skeleton ─────────────────────────────────────── */
export function Skeleton({ width = '100%', height = 20, radius = 10, style = {} }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: radius, ...style }}
    />
  );
}

/* ── Score Bar / ProgressBar ───────────────────────── */
export function ScoreBar({ score, total, risk, height = 10 }) {
  const pct = total > 0 ? (score / total) * 100 : 0;
  const color =
    risk === 'Low' ? 'var(--green)' :
    risk === 'Medium' ? 'var(--amber)' :
    'var(--red)';

  return (
    <div className="score-bar-track" style={{ height }}>
      <div
        className="score-bar-fill"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

export function ProgressBar({ pct, color = 'var(--orange-solid)', height = 10, style = {} }) {
  return (
    <div className="score-bar-track" style={{ height, ...style }}>
      <div
        className="score-bar-fill"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

/* ── Empty State ──────────────────────────────────── */
export function EmptyState({ icon = '📭', title, desc, action }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 40px',
      textAlign: 'center',
      gap: 16,
    }}>
      <div style={{ fontSize: '4rem', marginBottom: 8 }}>{icon}</div>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.4rem', color: 'var(--dark)' }}>
        {title}
      </h3>
      {desc && <p style={{ fontSize: '0.95rem', color: 'var(--muted)', maxWidth: 360, lineHeight: 1.7 }}>{desc}</p>}
      {action && <div style={{ marginTop: 12 }}>{action}</div>}
    </div>
  );
}

/* ── Section Heading ──────────────────────────────── */
export function SectionHeading({ label, title, subtitle, center = false, light = false, style = {} }) {
  return (
    <div style={{ textAlign: center ? 'center' : 'left', marginBottom: 48, ...style }}>
      {label && (
        <div className="section-label" style={{ justifyContent: center ? 'center' : 'flex-start' }}>
          {label}
        </div>
      )}
      <h2 style={{
        fontFamily: 'var(--font-heading)',
        fontWeight: 900,
        fontSize: '2.4rem',
        color: light ? 'white' : 'var(--dark)',
        marginBottom: subtitle ? 14 : 0,
        letterSpacing: '-0.02em',
      }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{ 
          fontSize: '1.05rem', 
          color: light ? 'rgba(255,255,255,0.8)' : 'var(--mid)', 
          lineHeight: 1.65, 
          maxWidth: center ? 600 : '100%', 
          margin: center ? '0 auto' : 0 
        }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* ── Divider ──────────────────────────────────────── */
export function Divider({ style = {} }) {
  return <div style={{ width: '100%', height: '1.5px', background: 'var(--border)', margin: '32px 0', ...style }} />;
}

/* ── Back Button ──────────────────────────────────── */
export function BackBtn({ onClick, label = 'Back' }) {
  return (
    <button 
      className="back-btn" 
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        fontSize: '0.95rem',
        fontWeight: 700,
        color: 'var(--mid)',
        transition: 'var(--transition)',
      }}
      onMouseEnter={e => e.currentTarget.style.color = 'var(--orange-solid)'}
      onMouseLeave={e => e.currentTarget.style.color = 'var(--mid)'}
    >
      <span style={{ fontSize: '1.2rem' }}>←</span> {label}
    </button>
  );
}

/* ── Role Badge ───────────────────────────────────── */
const ROLE_STYLES = {
  parent: { bg: 'var(--orange-pale)', color: 'var(--orange-deep)' },
  doctor: { bg: '#eff6ff',           color: '#1d4ed8'             },
  admin:  { bg: '#f5f3ff',           color: '#6d28d9'             },
};
export function RoleBadge({ role }) {
  const s = ROLE_STYLES[role] || ROLE_STYLES.parent;
  const labels = { parent: '👨‍👩‍👧 Parent', doctor: '🩺 Doctor', admin: '⚙️ Admin' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '4px 14px',
      borderRadius: 'var(--radius-full)',
      fontSize: '0.8rem', fontWeight: 800,
      fontFamily: 'var(--font-heading)',
      background: s.bg, color: s.color,
      border: '1.5px solid rgba(0,0,0,0.03)',
    }}>
      {labels[role] || role}
    </span>
  );
}
