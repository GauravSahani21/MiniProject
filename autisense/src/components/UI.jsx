import React, { useState, useEffect, useCallback } from 'react';

/* ════════════════════════════════════════════════════
   AutiSense — Shared UI Components
   ════════════════════════════════════════════════════ */

/* ── Card ─────────────────────────────────────────── */
export function Card({ children, className = '', style = {}, ...rest }) {
  return (
    <div
      className={className}
      style={{
        background: 'var(--white)',
        borderRadius: 'var(--radius-lg)',
        border: '1.5px solid var(--border)',
        boxShadow: 'var(--shadow-md)',
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
  gap: 8,
  borderRadius: 'var(--radius-full)',
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  cursor: 'pointer',
  border: 'none',
  transition: 'all 0.2s ease',
  whiteSpace: 'nowrap',
};

const BTN_SIZES = {
  sm: { padding: '7px 18px', fontSize: '0.8rem' },
  md: { padding: '11px 26px', fontSize: '0.9rem' },
  lg: { padding: '14px 34px', fontSize: '1rem' },
};

const BTN_VARIANTS = {
  primary: {
    background: 'var(--orange)',
    color: 'white',
    boxShadow: '0 4px 18px rgba(255,107,43,0.30)',
  },
  outline: {
    background: 'transparent',
    color: 'var(--orange)',
    border: '2px solid var(--orange)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--mid)',
    border: '1.5px solid var(--border)',
  },
  danger: {
    background: 'var(--red)',
    color: 'white',
    boxShadow: '0 4px 14px rgba(239,68,68,0.28)',
  },
  success: {
    background: 'var(--green)',
    color: 'white',
    boxShadow: '0 4px 14px rgba(34,197,94,0.28)',
  },
};

export function Btn({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  style = {},
  className = '',
}) {
  const [hovered, setHovered] = useState(false);

  const base = {
    ...BTN_BASE,
    ...BTN_SIZES[size],
    ...BTN_VARIANTS[variant],
    ...(disabled && {
      background: '#d1c4bb',
      color: '#9a8a82',
      cursor: 'not-allowed',
      boxShadow: 'none',
      border: 'none',
    }),
    ...(hovered && !disabled && variant === 'primary' && {
      background: 'var(--orange-deep)',
      transform: 'translateY(-1px)',
      boxShadow: '0 6px 24px rgba(255,107,43,0.38)',
    }),
    ...(hovered && !disabled && variant === 'outline' && {
      background: 'var(--orange-pale)',
    }),
    ...(hovered && !disabled && variant === 'ghost' && {
      background: 'var(--orange-pale)',
      color: 'var(--orange)',
    }),
    ...style,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={base}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  );
}

/* ── Badge (Risk) ─────────────────────────────────── */
const BADGE_STYLES = {
  Low:    { bg: 'var(--green-pale)',  color: '#166534' },
  Medium: { bg: 'var(--amber-pale)', color: '#92400E' },
  High:   { bg: 'var(--red-pale)',   color: '#991B1B' },
};

export function Badge({ risk, style = {} }) {
  const s = BADGE_STYLES[risk] || BADGE_STYLES.Low;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '3px 12px',
      borderRadius: 'var(--radius-full)',
      fontSize: '0.74rem',
      fontWeight: 700,
      fontFamily: 'var(--font-heading)',
      background: s.bg,
      color: s.color,
      ...style,
    }}>
      <span style={{
        width: 6, height: 6,
        borderRadius: '50%',
        background: s.color,
        display: 'inline-block',
      }} />
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
          borderColor: focused ? 'var(--orange)' : error ? 'var(--red)' : undefined,
          boxShadow: focused ? '0 0 0 3px rgba(255,107,43,0.12)' : 'none',
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
          borderColor: focused ? 'var(--orange)' : error ? 'var(--red)' : undefined,
          boxShadow: focused ? '0 0 0 3px rgba(255,107,43,0.12)' : 'none',
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
  success: { bg: '#16a34a', icon: '✅' },
  error:   { bg: '#dc2626', icon: '❌' },
  info:    { bg: 'var(--orange)', icon: 'ℹ️' },
};

function ToastItem({ id, message, type = 'success', onDismiss }) {
  const [visible, setVisible] = useState(true);
  const s = TOAST_COLORS[type] || TOAST_COLORS.info;

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); setTimeout(() => onDismiss(id), 300); }, 3000);
    return () => clearTimeout(t);
  }, [id, onDismiss]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      background: s.bg,
      color: 'white',
      padding: '13px 20px',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-xl)',
      fontSize: '0.88rem',
      fontWeight: 600,
      maxWidth: 340,
      animation: visible ? 'toastIn 0.3s ease' : 'fadeIn 0.3s ease reverse',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.3s ease',
    }}>
      <span style={{ fontSize: '1.1rem' }}>{s.icon}</span>
      {message}
      <button
        onClick={() => { setVisible(false); setTimeout(() => onDismiss(id), 300); }}
        style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', marginLeft: 'auto', fontSize: '1rem', opacity: 0.7 }}
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
      top: 84,
      right: 20,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      {toasts.map(t => (
        <ToastItem key={t.id} {...t} onDismiss={dismiss} />
      ))}
    </div>
  );

  return { showToast, ToastComponent };
}

/* ── Modal ────────────────────────────────────────── */
export function Modal({ open, onClose, title, children, width = 480 }) {
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
        background: 'rgba(30,20,16,0.55)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backdropFilter: 'blur(3px)',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: 'var(--radius-xl)',
          width: '100%',
          maxWidth: width,
          boxShadow: 'var(--shadow-xl)',
          animation: 'scaleIn 0.25s ease',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
        }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.05rem', color: 'var(--dark)' }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              width: 30, height: 30,
              borderRadius: '50%',
              background: 'var(--orange-pale)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.85rem',
              color: 'var(--orange)',
              fontWeight: 700,
            }}
          >✕</button>
        </div>
        {/* Body */}
        <div style={{ padding: '24px' }}>{children}</div>
      </div>
    </div>
  );
}

/* ── StatCard ─────────────────────────────────────── */
export function StatCard({ icon, value, label, color = 'var(--orange)', bg, style = {} }) {
  return (
    <Card style={{ padding: '22px 24px', ...style }}>
      <div style={{
        width: 44, height: 44,
        borderRadius: 'var(--radius-md)',
        background: bg || 'var(--orange-pale)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.4rem',
        marginBottom: 14,
      }}>
        {icon}
      </div>
      <div style={{
        fontFamily: 'var(--font-heading)',
        fontWeight: 900,
        fontSize: '1.9rem',
        color,
        lineHeight: 1,
        marginBottom: 5,
      }}>
        {value}
      </div>
      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </div>
    </Card>
  );
}

/* ── PageWrapper ──────────────────────────────────── */
export function PageWrapper({ children, style = {} }) {
  return (
    <div
      className="page-enter"
      style={{
        paddingTop: 88,
        minHeight: '100vh',
        background: 'var(--cream)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ── Spinner ──────────────────────────────────────── */
export function Spinner({ size = 28, color = 'var(--orange)' }) {
  return (
    <div style={{
      width: size, height: size,
      border: `3px solid rgba(255,107,43,0.15)`,
      borderTopColor: color,
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
      display: 'inline-block',
    }} />
  );
}

/* ── Skeleton ─────────────────────────────────────── */
export function Skeleton({ width = '100%', height = 18, radius = 8, style = {} }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: radius, ...style }}
    />
  );
}

/* ── Score Bar ────────────────────────────────────── */
export function ScoreBar({ score, total, risk, height = 8 }) {
  const pct = total > 0 ? (score / total) * 100 : 0;
  const color =
    risk === 'Low' ? 'var(--green)' :
    risk === 'Medium' ? 'var(--amber)' :
    'var(--red)';

  return (
    <div className="score-bar-track" style={{ height }}>
      <div
        className="score-bar-fill"
        style={{ width: `${pct}%`, background: color, height }}
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
      padding: '64px 32px',
      textAlign: 'center',
      gap: 12,
    }}>
      <div style={{ fontSize: '3.5rem' }}>{icon}</div>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--dark)' }}>
        {title}
      </h3>
      {desc && <p style={{ fontSize: '0.85rem', color: 'var(--muted)', maxWidth: 300 }}>{desc}</p>}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}

/* ── Section Heading ──────────────────────────────── */
export function SectionHeading({ label, title, subtitle, center = false, light = false }) {
  return (
    <div style={{ textAlign: center ? 'center' : 'left', marginBottom: 36 }}>
      {label && (
        <div className="section-label" style={{ justifyContent: center ? 'center' : 'flex-start' }}>
          {label}
        </div>
      )}
      <h2 style={{
        fontFamily: 'var(--font-heading)',
        fontWeight: 900,
        fontSize: '2rem',
        color: light ? 'white' : 'var(--dark)',
        marginBottom: subtitle ? 10 : 0,
      }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{ fontSize: '0.95rem', color: light ? 'rgba(255,255,255,0.75)' : 'var(--mid)', lineHeight: 1.6, maxWidth: center ? 520 : '100%', margin: center ? '0 auto' : 0 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* ── Divider ──────────────────────────────────────── */
export function Divider({ style = {} }) {
  return <div className="divider" style={style} />;
}

/* ── Back Button ──────────────────────────────────── */
export function BackBtn({ onClick, label = 'Back' }) {
  return (
    <button className="back-btn" onClick={onClick}>
      ← {label}
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
      padding: '3px 12px',
      borderRadius: 'var(--radius-full)',
      fontSize: '0.74rem', fontWeight: 700,
      fontFamily: 'var(--font-heading)',
      background: s.bg, color: s.color,
    }}>
      {labels[role] || role}
    </span>
  );
}
