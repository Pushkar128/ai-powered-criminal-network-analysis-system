import React, { useState } from 'react';

export default function LandingPage({ onEnterPortal, onAdminLogin }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('sih2026');
  const [loginError, setLoginError] = useState('');

  const handlePortalClick = (role = 'public') => {
    const targetUrl = `${window.location.origin}${window.location.pathname}?mode=portal&role=${role}`;
    window.open(targetUrl, '_blank');
  };

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    if (username.trim() === 'admin' && password.trim() === 'sih2026') {
      if (onAdminLogin) {
        onAdminLogin('admin');
      } else {
        handlePortalClick('admin');
      }
    } else {
      setLoginError('Invalid credentials. Default: admin / sih2026');
    }
  };

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      background: '#f8fafc',
      color: '#0f172a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, -apple-system, sans-serif'
    }}>
      
      {/* SPLIT LAYOUT CONTAINER (MATCHING SCREENSHOT 3) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 440px',
        maxWidth: '1100px',
        width: '90%',
        gap: '60px',
        alignItems: 'center'
      }}>
        
        {/* LEFT COLUMN: NEXUS BRANDING */}
        <div style={{ textAlign: 'left' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#b91c1c', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '16px' }}>
              🛡️
            </div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#b91c1c', letterSpacing: '1px' }}>
              CRIMINAL INTELLIGENCE DIVISION
            </span>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h1 style={{ fontSize: '4rem', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '1px', lineHeight: 1.0 }}>
              NEXUS
            </h1>
            <div style={{ width: '80px', height: '4px', background: '#b91c1c', marginTop: '12px', borderRadius: '2px' }}></div>
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '14px', letterSpacing: '0.5px' }}>
            Criminal Network Analysis & Intelligence System
          </h2>

          <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.7, maxWidth: '480px', marginBottom: '32px' }}>
            Law enforcement intelligence platform for link analysis, entity resolution, and criminal network investigation. Built for Ministry of Home Affairs command centers.
          </p>

          <div style={{ display: 'flex', gap: '14px' }}>
            <button
              onClick={() => handlePortalClick('public')}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: '800',
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>🌐 Open Portal Preview</span>
              <span>↗</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: LOGIN CARD (MATCHING SCREENSHOT 3) */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '36px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          position: 'relative'
        }}>
          
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fee2e2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '10px', fontWeight: 800, padding: '4px 10px', borderRadius: '20px', letterSpacing: '0.5px', marginBottom: '12px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#b91c1c' }}></span>
              AUTHORIZED PERSONNEL ONLY
            </div>
            
            <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', margin: '0 0 6px 0' }}>
              Officer / Investigator Login
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
              Enter your credentials to access the intelligence portal.
            </p>
          </div>

          {loginError && (
            <div style={{ marginBottom: '16px', padding: '10px', background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '6px', color: '#b91c1c', fontSize: '12px', fontWeight: 700 }}>
              ⚠️ {loginError}
            </div>
          )}

          <form onSubmit={handleAdminSubmit}>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', letterSpacing: '0.5px', marginBottom: '6px' }}>
                USERNAME / OFFICER ID
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8', fontSize: '14px' }}>👤</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter officer badge ID or email"
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#0f172a',
                    outline: 'none',
                    fontWeight: '500'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', letterSpacing: '0.5px', marginBottom: '6px' }}>
                PASSWORD
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8', fontSize: '14px' }}>🔒</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#0f172a',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                background: '#b91c1c',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 20px',
                fontSize: '13px',
                fontWeight: 800,
                letterSpacing: '0.5px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(185, 28, 28, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#991b1b'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#b91c1c'}
            >
              <span>🔐</span> SIGN IN
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
