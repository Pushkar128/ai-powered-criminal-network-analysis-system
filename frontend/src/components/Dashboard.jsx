import React from 'react';

export default function Dashboard({ onNavigate }) {
  const modules = [
    {
      id: 'graph-tab',
      code: 'MOD-01',
      tag: 'TOPOLOGY CANVAS',
      title: 'NETWORK GRAPH',
      desc: 'Interactive criminal network visualization and force-directed topology analysis.',
      icon: '🕸️'
    },

    {
      id: 'resolution-tab',
      code: 'MOD-03',
      tag: 'RECORD DISAMBIGUATION',
      title: 'ENTITY RESOLUTION',
      desc: 'Resolve duplicate, messy, and alias records into canonical master criminal entities.',
      icon: '🎯'
    },
    {
      id: 'path-tab',
      code: 'MOD-04',
      tag: 'RELATIONAL TRAVERSAL',
      title: 'PATH FINDER',
      desc: 'Discover hidden association chains and financial mule paths between target entities.',
      icon: '🛤️'
    },
    {
      id: 'kingpin-tab',
      code: 'MOD-05',
      tag: 'CENTRALITY & FLOWS',
      title: 'KINGPIN & DARK MONEY ANALYTICS',
      desc: 'Automated PageRank centrality calculation to pinpoint key syndicate handlers and money loops.',
      icon: '💰'
    },
    {
      id: 'facial-tab',
      code: 'MOD-06',
      tag: 'GEO-SPATIAL RADAR',
      title: 'FACIAL SCANNER & LIVE GPS',
      desc: '128-d facial landmark recognition & real-time OpenStreetMap GPS sighting alerts.',
      icon: '📷'
    }
  ];

  return (
    <div style={{ flex: 1, padding: '28px', overflowY: 'auto', background: '#f8fafc', color: '#0f172a' }}>
      
      {/* HEADER BANNER CARD */}
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '28px 32px',
        marginBottom: '28px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '24px',
        position: 'relative'
      }}>
        <div style={{ borderLeft: '4px solid #b91c1c', paddingLeft: '20px', flex: 1 }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#b91c1c', letterSpacing: '1px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#b91c1c', display: 'inline-block' }}></span>
            RESTRICTED INVESTIGATIVE PORTAL // CENTRAL COMMAND
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', margin: '0 0 12px 0', letterSpacing: '0.5px' }}>
            NEXUS – AI-POWERED CRIMINAL NETWORK ANALYSIS SYSTEM
          </h1>
          <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.6, maxWidth: '820px', margin: '0 0 20px 0' }}>
            Central operational launchpad for intelligence officers to analyze syndicated criminal networks, disambiguate entity records, trace multi-hop relationship chains, and conduct cross-jurisdictional forensic investigations.
          </p>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '11px', fontWeight: 700, color: '#64748b' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🛡️</span> NODE: SEC-AUTH-DELHI-MHA-09
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>📢</span> PROTOCOL: INDIAN EVIDENCE ACT § 65B COMPLIANT
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🔒</span> SESSION: ISOLATED CIPHER-CHAIN ACTIVE
            </span>
          </div>
        </div>

        {/* QUICK ACTION CARDS ON RIGHT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '260px', flexShrink: 0 }}>
          <div 
            onClick={() => onNavigate && onNavigate('upload')}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '12px 16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#b91c1c'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '18px', color: '#b91c1c' }}>📄</span>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>EVIDENCE UPLOAD ENGINE</div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>Raw CDR, Bank & Dossier Ingestion</div>
              </div>
            </div>
            <span style={{ color: '#64748b', fontSize: '14px' }}>›</span>
          </div>

          <div 
            onClick={() => onNavigate && onNavigate('audit')}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '12px 16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#b91c1c'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '18px', color: '#b91c1c' }}>🛡️</span>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>MHA AUDIT LOG</div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>Sec-65B Tamper-Evident Trail</div>
              </div>
            </div>
            <span style={{ color: '#64748b', fontSize: '14px' }}>›</span>
          </div>
        </div>
      </div>

      {/* CORE INVESTIGATION MODULES SECTION */}
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.5px' }}>
            <span style={{ color: '#b91c1c' }}>■</span> CORE INVESTIGATION MODULES
          </h3>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
            Direct access to operational analytical engines
          </p>
        </div>
        <div style={{ fontSize: '11px', color: '#b91c1c', fontWeight: 800, letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#b91c1c' }}></span>
          ALL 5 ENGINES SYNCHRONIZED
        </div>
      </div>

      {/* MODULES GRID (3x2) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        {modules.map((m) => (
          <div
            key={m.id}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease',
              minHeight: '190px'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                    {m.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', letterSpacing: '0.5px' }}>{m.tag}</div>
                    <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#16a34a' }}></span>
                      MODULE OPERATIONAL
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{m.code}</span>
              </div>

              <h4 style={{ fontSize: '16px', fontWeight: 900, color: '#0f172a', margin: '0 0 8px 0', letterSpacing: '0.5px' }}>
                {m.title}
              </h4>
              <p style={{ fontSize: '12.5px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                {m.desc}
              </p>
            </div>

            <div style={{ marginTop: '20px' }}>
              <button
                onClick={() => onNavigate && onNavigate(m.id)}
                style={{
                  width: '100%',
                  background: '#b91c1c',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px 16px',
                  fontSize: '12px',
                  fontWeight: 800,
                  letterSpacing: '0.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 6px rgba(185, 28, 28, 0.25)',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#991b1b'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#b91c1c'}
              >
                <span>OPEN MODULE</span>
                <span style={{ fontSize: '14px' }}>➔</span>
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
