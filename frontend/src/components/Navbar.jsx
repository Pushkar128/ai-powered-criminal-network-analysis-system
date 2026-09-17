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

      <div className="search-container" style={{ width: '460px', position: 'relative' }}>
        <div className="search-input-wrapper" style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '5px 12px', display: 'flex', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
          <svg viewBox="0 0 24 24" style={{ width: '18px', height: '18px', color: '#38bdf8', marginRight: '8px', flexShrink: 0 }}><path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          <input
            type="text"
            placeholder="Search suspect name, alias, phone, vehicle, location..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setDropdownOpen(true);
            }}
            onFocus={() => setDropdownOpen(true)}
            style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', fontSize: '13px', outline: 'none', fontWeight: '500' }}
          />
          <button 
            style={{ 
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '6px', 
              padding: '5px 14px', 
              fontSize: '12px', 
              fontWeight: '700', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              boxShadow: '0 2px 6px rgba(37,99,235,0.4)',
              transition: 'all 0.2s ease'
            }}
          >
            <svg viewBox="0 0 24 24" style={{ width: '13px', height: '13px', fill: 'currentColor' }}><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
            Search
          </button>
        </div>

        {dropdownOpen && searchQuery.trim() !== '' && (
          <div className="search-dropdown" style={{ position: 'absolute', top: '46px', left: 0, right: 0, background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', maxHeight: '320px', overflowY: 'auto', zIndex: 1000, boxShadow: '0 12px 30px rgba(0,0,0,0.2)' }}>
            {filteredMatches.length > 0 ? (
              filteredMatches.map(m => (
                <div key={m.id} className="search-dropdown-item" onClick={() => handleSelect(m)} style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>{m.name}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{m.id} &bull; {m.label || m.type}</div>
                  </div>
                  <span className="badge badge-high" style={{ fontSize: '10px', padding: '3px 8px', fontWeight: 800 }}>Threat: {m.threat_score || 50}</span>
                </div>
              ))
            ) : (
              <div style={{ padding: '12px', color: '#64748b', fontSize: '12px', textAlign: 'center' }}>No matching suspect entities found</div>
            )}
          </div>
        )}
      </div>

      <div className="header-status" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {userRole === 'admin' && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(220, 38, 38, 0.2)', color: '#fca5a5', border: '1px solid #ef444490', padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.5px', boxShadow: '0 0 10px rgba(220,38,38,0.2)' }}>
            <svg viewBox="0 0 24 24" style={{ width: '13px', height: '13px', fill: 'currentColor' }}><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-5.45 9-12V5l-9-4z"/></svg>
            Senior Command Admin
          </span>
        )}

        <button 
          onClick={onGoHome} 
          style={{ background: '#1e293b', color: '#38bdf8', border: '1px solid #334155', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s ease' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#334155'; e.currentTarget.style.color = '#ffffff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.color = '#38bdf8'; }}
        >
          <svg viewBox="0 0 24 24" style={{ width: '14px', height: '14px', fill: 'currentColor' }}><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
          Home
        </button>

        <button 
          onClick={onOpenUpload} 
          style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: '#ffffff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(37,99,235,0.35)', transition: 'all 0.2s ease' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(37,99,235,0.5)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.35)'; }}
        >
          <svg viewBox="0 0 24 24" style={{ width: '14px', height: '14px', fill: 'currentColor' }}><path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/></svg>
          Evidence Upload
        </button>

        <button 
          onClick={onOpenAudit} 
          style={{ background: '#1e293b', color: '#f1f5f9', border: '1px solid #475569', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s ease' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#334155'; e.currentTarget.style.borderColor = '#64748b'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.borderColor = '#475569'; }}
        >
          <svg viewBox="0 0 24 24" style={{ width: '14px', height: '14px', fill: 'currentColor' }}><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-5.45 9-12V5l-9-4zm-1 6h2v2h-2V7zm0 4h2v6h-2v-6z"/></svg>
          MHA Audit Log
        </button>

        <div className="status-indicator" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b98160', padding: '5px 12px', borderRadius: '20px', fontSize: '11px', color: '#34d399', fontWeight: '800' }}>
          <span className="pulse-dot" style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></span>
          <span>{isApiConnected ? 'Neo4j Live Engine' : 'Local Intelligence Engine'}</span>
        </div>
      </div>
    </header>
  );
}


