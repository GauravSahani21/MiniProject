import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from './UI';

export default function Navbar() {
  const { user, logout, isAuthenticated, dashboardPath } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /* shadow on scroll */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  /* close menu on route change */
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const go = (path) => { navigate(path); setMenuOpen(false); };

  const isActive = (path) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path);

  const handleLogout = () => { logout(); navigate('/'); };

  /* ── link style helper ── */
  const linkStyle = (path) => ({
    padding: '7px 16px',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.86rem',
    fontWeight: 600,
    color: isActive(path) ? 'var(--orange)' : 'var(--dark)',
    background: isActive(path) ? 'var(--orange-pale)' : 'transparent',
    cursor: 'pointer',
    border: 'none',
    fontFamily: 'var(--font-body)',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  });

  const mobileLinkStyle = (path) => ({
    ...linkStyle(path),
    width: '100%',
    borderRadius: 'var(--radius-md)',
    padding: '11px 16px',
    justifyContent: 'flex-start',
  });

  /* ── public links ── */
  const publicLinks = (mobile = false) => {
    const s = mobile ? mobileLinkStyle : linkStyle;
    return (
      <>
        <button style={s('/awareness')} onClick={() => go('/awareness')}>
          🧩 Awareness
        </button>
        <button style={s('/drawing-analysis')} onClick={() => go('/drawing-analysis')}>
          🎨 Drawing Analysis
        </button>
        <button style={s('/login')} onClick={() => go('/login')}>
          Login
        </button>
        <button
          onClick={() => go('/login')}
          style={{
            padding: mobile ? '11px 16px' : '9px 22px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--orange)',
            color: 'white',
            fontSize: '0.86rem',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            boxShadow: '0 4px 16px rgba(255,107,43,0.30)',
            width: mobile ? '100%' : 'auto',
          }}
        >
          🧡 Start Screening
        </button>
      </>
    );
  };

  /* ── auth links ── */
  const authLinks = (mobile = false) => {
    const s = mobile ? mobileLinkStyle : linkStyle;
    const dash = dashboardPath();
    return (
      <>
        <button style={s('/awareness')} onClick={() => go('/awareness')}>
          🧩 Awareness
        </button>
        <button style={s('/drawing-analysis')} onClick={() => go('/drawing-analysis')}>
          🎨 Drawing Analysis
        </button>
        <button style={s(dash)} onClick={() => go(dash)}>
          Dashboard
        </button>
        {!mobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <RoleBadge role={user?.role} />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--mid)' }}>
              {user?.name}
            </span>
          </div>
        )}
        {mobile && (
          <div style={{ padding: '8px 16px', fontSize: '0.82rem', color: 'var(--mid)', fontWeight: 600 }}>
            👤 {user?.name} · <RoleBadge role={user?.role} />
          </div>
        )}
        <button
          onClick={handleLogout}
          style={{
            padding: mobile ? '11px 16px' : '8px 20px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--orange-pale)',
            color: 'var(--orange-deep)',
            fontSize: '0.84rem',
            fontWeight: 700,
            border: '1.5px solid var(--border)',
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            width: mobile ? '100%' : 'auto',
            textAlign: 'left',
          }}
        >
          🚪 Logout
        </button>
      </>
    );
  };

  return (
    <>
      <nav
        className="navbar"
        style={{
          boxShadow: scrolled ? '0 4px 24px rgba(255,107,43,0.10)' : 'var(--shadow-sm)',
        }}
      >
        {/* Logo */}
        <button
          className="navbar-logo"
          onClick={() => go('/')}
          aria-label="AutiSense Home"
        >
          <span className="navbar-logo-dot" />
          <span style={{ color: 'var(--orange)' }}>Auti</span>
          <span style={{ color: 'var(--dark)' }}>Sense</span>
        </button>

        {/* Desktop links */}
        <div className="navbar-links">
          {isAuthenticated ? authLinks(false) : publicLinks(false)}
        </div>

        {/* Hamburger */}
        <button
          className="hamburger"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span style={{ transform: menuOpen ? 'rotate(45deg) translate(5px,5px)' : 'none', transition: 'transform 0.25s' }} />
          <span style={{ opacity: menuOpen ? 0 : 1, transition: 'opacity 0.25s' }} />
          <span style={{ transform: menuOpen ? 'rotate(-45deg) translate(5px,-5px)' : 'none', transition: 'transform 0.25s' }} />
        </button>
      </nav>

      {/* Mobile menu */}
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        {isAuthenticated ? authLinks(true) : publicLinks(true)}
      </div>
    </>
  );
}
