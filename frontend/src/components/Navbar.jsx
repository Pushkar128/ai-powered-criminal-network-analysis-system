import React, { useState } from 'react';

export default function Navbar({ nodesData, onSelectNode, isApiConnected, onOpenUpload, onOpenAudit, userRole, onGoHome }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const filteredMatches = searchQuery.trim()
    ? nodesData.filter(n =>
        n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.alias && n.alias.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  const handleSelect = (node) => {
    onSelectNode(node);
    setSearchQuery('');
    setDropdownOpen(false);
  };

  return (
    <header className="top-nav">
      <div className="brand" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }} onClick={onGoHome} title="Return to Home Landing Page">
        <div className="logo-badge" style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px rgba(37, 99, 235, 0.4)' }}>
          <svg viewBox="0 0 24 24" className="logo-icon" style={{ width: '20px', height: '20px', color: '#fff' }}><path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-5.45 9-12V5l-9-4zm0 2.18l7 3.12v4.7c0 4.54-3.14 8.78-7 9.82-3.86-1.04-7-5.28-7-9.82V6.3l7-3.12zM12 7a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6z"/></svg>
        </div>
        <div className="brand-text">
          <h1 style={{ fontSize: '14px', fontWeight: '800', letterSpacing: '0.5px', color: '#ffffff', margin: 0, lineHeight: 1.2 }}>
            NCRB INTELLIGENCE PORTAL
          </h1>
          <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0, fontWeight: 500, lineHeight: 1.2 }}>
            Ministry of Home Affairs &bull; Govt of India
          </p>
        </div>
      </div>

      <div className="search-container" style={{ width: '320px', position: 'relative' }}>
        <div className="search-input-wrapper" style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '4px 10px', display: 'flex', alignItems: 'center' }}>
          <svg className="search-icon" viewBox="0 0 24 24" style={{ width: '16px', height: '16px', color: '#94a3b8', marginRight: '6px' }}><path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          <input
            type="text"
            placeholder="Search suspect, alias, phone, vehicle..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setDropdownOpen(true);
            }}
            onFocus={() => setDropdownOpen(true)}
            style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', fontSize: '12px', outline: 'none' }}
          />
          <button style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', padding: '3px 8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>
            Pivot
          </button>
        </div>

        {dropdownOpen && searchQuery.trim() !== '' && (
          <div className="search-dropdown" style={{ position: 'absolute', top: '42px', left: 0, right: 0, background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', maxHeight: '300px', overflowY: 'auto', zIndex: 1000, boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
            {filteredMatches.length > 0 ? (
              filteredMatches.map(m => (
                <div key={m.id} className="search-dropdown-item" onClick={() => handleSelect(m)} style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '12px', color: '#0f172a' }}>{m.name}</div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>{m.id} &bull; {m.label || m.type}</div>
                  </div>
                  <span className="badge badge-high" style={{ fontSize: '10px', padding: '2px 6px' }}>{m.threat_score || 50}</span>
                </div>
              ))
            ) : (
              <div style={{ padding: '10px', color: '#64748b', fontSize: '12px', textAlign: 'center' }}>No matching suspect entities found</div>
            )}
          </div>
        )}
      </div>

      <div className="header-status" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {userRole === 'admin' && (
          <span style={{ background: 'rgba(220, 38, 38, 0.15)', color: '#fca5a5', border: '1px solid #ef444460', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 800 }}>
            🛡️ Senior Command Admin
          </span>
        )}

        <button onClick={onGoHome} style={{ background: '#1e293b', color: '#38bdf8', border: '1px solid #334155', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>🏠</span> Home
        </button>

        <button onClick={onOpenUpload} style={{ background: '#2563eb', color: '#ffffff', border: 'none', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 8px rgba(37,99,235,0.3)' }}>
          <span>📂</span> Evidence Upload
        </button>

        <button onClick={onOpenAudit} style={{ background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>🛡️</span> MHA Audit Log
        </button>

        <div className="status-indicator" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(22, 163, 74, 0.15)', border: '1px solid #4ade8050', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', color: '#4ade80', fontWeight: '700' }}>
          <span className="pulse-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px #4ade80' }}></span>
          <span>{isApiConnected ? 'Neo4j Live Engine' : 'Local Intelligence Engine'}</span>
        </div>
      </div>
    </header>
  );
}


