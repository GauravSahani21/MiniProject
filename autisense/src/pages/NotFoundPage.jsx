import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper, Btn } from '../components/UI';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <PageWrapper style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div className="animate-fadeInUp" style={{ textAlign: 'center', maxWidth: 400 }}>
        
        <div className="animate-float" style={{ 
          fontFamily: 'var(--font-heading)', 
          fontWeight: 900, 
          fontSize: '8rem', 
          lineHeight: 1, 
          color: 'var(--orange)',
          textShadow: '0 12px 32px rgba(255,107,43,0.3)'
        }}>
          404
        </div>
        
        <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.8rem', color: 'var(--dark)', marginTop: 24, marginBottom: 8 }}>
          Page Not Found
        </h2>
        
        <p style={{ fontSize: '0.95rem', color: 'var(--mid)', marginBottom: 32 }}>
          Looks like this page took a detour 🗺️. The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <Btn size="lg" onClick={() => navigate('/')}>
          Go to Homepage
        </Btn>

      </div>
    </PageWrapper>
  );
}
