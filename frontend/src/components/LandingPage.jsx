import React, { useState } from 'react';

export default function LandingPage({ onEnterPortal, onAdminLogin }) {
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('sih2026');
  const [loginError, setLoginError] = useState('');

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    if (username.trim() && password.trim()) {
      onAdminLogin(username.trim());
      setShowAdminModal(false);
    } else {
      setLoginError('Please enter valid admin credentials.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #090d16 100%)', color: '#f8fafc', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>
      
      {/* HEADER NAVBAR */}
      <header style={{ borderBottom: '1px solid #334155', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: '#1d4ed8', width: '42px', height: '42px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', boxShadow: '0 0 15px rgba(37, 99, 235, 0.4)' }}>
            🛡️
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '800', letterSpacing: '0.5px', color: '#ffffff' }}>
              NATIONAL CRIME RECORDS BUREAU (NCRB)
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>
              MINISTRY OF HOME AFFAIRS &bull; GOVT OF INDIA
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onEnterPortal}
            style={{
              background: '#1e293b',
              color: '#38bdf8',
              border: '1px solid #38bdf860',
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            🚀 Free Portal Access
          </button>
          <button
            onClick={() => setShowAdminModal(true)}
            style={{
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '8px 18px',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(220, 38, 38, 0.4)',
              transition: 'all 0.2s'
            }}
          >
            🔐 Admin / Command Center Sign In
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', textAlign: 'center', maxWidth: '1000px', margin: '0 auto' }}>
        
        <div style={{ background: '#1e293b', border: '1px solid #334155', color: '#38bdf8', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', letterSpacing: '1px', marginBottom: '20px', display: 'inline-block' }}>
          SIH 2026 PROBLEM STATEMENT #26189
        </div>

        <h1 style={{ fontSize: '2.8rem', fontWeight: '900', lineHeight: 1.2, marginBottom: '20px', background: 'linear-gradient(90deg, #ffffff 30%, #60a5fa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          AI-Powered Criminal Network Analysis & Intelligence System
        </h1>

        <p style={{ fontSize: '1.1rem', color: '#94a3b8', maxWidth: '780px', lineHeight: 1.6, marginBottom: '36px' }}>
          Advanced graph data science, real-time facial surveillance GPS heatmaps, Dark Money cycle detection, and OSINT news ingestion for law enforcement and intelligence command centers.
        </p>

        {/* ACTION BUTTONS */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '60px' }}>
          <button
            onClick={onEnterPortal}
            style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '14px 32px',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: '0 8px 25px rgba(37, 99, 235, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <span>🌐 Enter Intelligence Portal</span>
            <span style={{ fontSize: '18px' }}>➔</span>
          </button>

          <button
            onClick={() => setShowAdminModal(true)}
            style={{
              background: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #475569',
              padding: '14px 28px',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <span>🛡️ Admin Command Center Login</span>
          </button>
        </div>

        {/* CAPABILITY CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', width: '100%' }}>
          <div style={{ background: '#1e293b70', border: '1px solid #334155', borderRadius: '12px', padding: '24px', textAlign: 'left' }}>
            <div style={{ fontSize: '28px', marginBottom: '10px' }}>🕸️</div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', marginBottom: '8px' }}>Graph Network Topology</h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
              Multi-pivot radar mapping suspects, vehicles, CDR call logs, and hideout locations with threat scoring.
            </p>
          </div>

          <div style={{ background: '#1e293b70', border: '1px solid #334155', borderRadius: '12px', padding: '24px', textAlign: 'left' }}>
            <div style={{ fontSize: '28px', marginBottom: '10px' }}>📷</div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', marginBottom: '8px' }}>Live Facial Geo-Surveillance</h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
              Laptop camera facial landmark extraction & real-time OpenStreetMap GPS sighting alerts.
            </p>
          </div>

          <div style={{ background: '#1e293b70', border: '1px solid #334155', borderRadius: '12px', padding: '24px', textAlign: 'left' }}>
            <div style={{ fontSize: '28px', marginBottom: '10px' }}>🎯</div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', marginBottom: '8px' }}>Kingpin & Dark Money Analytics</h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
              PageRank centrality calculation to pinpoint key syndicate handlers and circular money laundering loops.
            </p>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid #334155', padding: '16px 32px', textAlign: 'center', fontSize: '12px', color: '#64748b', background: '#0f172a' }}>
        NCRB AI Criminal Network Analysis & Intelligence Portal &bull; Ministry of Home Affairs &bull; Section 65B Compliant
      </footer>

      {/* ADMIN LOGIN MODAL */}
      {showAdminModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', width: '400px', borderRadius: '14px', padding: '28px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🛡️ Admin Command Center Login
              </h3>
              <button onClick={() => setShowAdminModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>

            <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '20px' }}>
              Senior Police Officials & Command Center Admins gain real-time nationwide live suspect detection alerts and admin override controls.
            </p>

            <form onSubmit={handleAdminSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', fontWeight: 600, marginBottom: '6px' }}>
                  Admin Username:
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', fontWeight: 600, marginBottom: '6px' }}>
                  Admin Password:
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '13px', outline: 'none' }}
                />
              </div>

              {loginError && (
                <div style={{ color: '#ef4444', fontSize: '12px', marginBottom: '14px', fontWeight: 600 }}>
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)'
                }}
              >
                Sign In as Senior Admin ➔
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
