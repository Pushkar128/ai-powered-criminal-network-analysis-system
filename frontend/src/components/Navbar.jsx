import React, { useState } from 'react';

export default function Navbar({ nodesData, onSelectNode, isApiConnected, onOpenUpload, onOpenAudit, userRole, onGoHome }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const q = (searchQuery || '').toLowerCase().trim();
  const filteredMatches = q && Array.isArray(nodesData)
    ? nodesData.filter(n => {
        if (!n) return false;
        const nameStr = (n.name || n.label || n.title || '').toString().toLowerCase();
        const idStr = (n.id || '').toString().toLowerCase();
        const aliasStr = (n.alias || '').toString().toLowerCase();
        const phoneStr = (n.phone || '').toString().toLowerCase();
        return nameStr.includes(q) || idStr.includes(q) || aliasStr.includes(q) || phoneStr.includes(q);
      })
    : [];

  const handleSelect = (node) => {
    if (onSelectNode) onSelectNode(node);
    setSearchQuery('');
    setDropdownOpen(false);
  };

  return (
    <header style={{
      height: '60px',
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
      zIndex: 100,
      fontFamily: 'Inter, sans-serif'
    }}>
      
      {/* BRAND & LOGO */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={onGoHome} title="Return to NEXUS Central Launchpad">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#b91c1c', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>
            🛡️
          </div>
          <span style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', letterSpacing: '1px' }}>
            NEXUS
          </span>
        </div>
        <span style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.5px' }}>
          RESTRICTED
        </span>
      </div>

      {/* SEARCH BAR */}
      <div style={{ width: '420px', position: 'relative' }}>
        <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 12px', display: 'flex', alignItems: 'center', transition: 'all 0.2s ease' }}>
          <span style={{ color: '#64748b', fontSize: '14px', marginRight: '8px' }}>🔍</span>
          <input
            type="text"
            placeholder="Query suspect, alias, BTC address or node hash..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setDropdownOpen(true);
            }}
            onFocus={() => setDropdownOpen(true)}
            style={{ flex: 1, background: 'transparent', border: 'none', color: '#0f172a', fontSize: '12.5px', outline: 'none', fontWeight: '500' }}
          />
        </div>

        {dropdownOpen && searchQuery.trim() !== '' && (
          <div style={{ position: 'absolute', top: '44px', left: 0, right: 0, background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', maxHeight: '320px', overflowY: 'auto', zIndex: 1000, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            {filteredMatches.length > 0 ? (
              filteredMatches.map(m => (
                <div key={m.id} onClick={() => handleSelect(m)} style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>{m.name}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{m.id} &bull; {m.label || m.type}</div>
                  </div>
                  <span style={{ background: '#fee2e2', color: '#b91c1c', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>Threat: {m.threat_score || 50}</span>
                </div>
              ))
            ) : (
              <div style={{ padding: '12px', color: '#64748b', fontSize: '12px', textAlign: 'center' }}>No matching suspect entities found</div>
            )}
          </div>
        )}
      </div>

      {/* HEADER ACTIONS */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        
        <button 
          onClick={onOpenUpload} 
          style={{ background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <span style={{ color: '#b91c1c' }}>📄</span>
          Live Evidence Upload
        </button>

        <button 
          onClick={onOpenAudit} 
          style={{ background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <span style={{ color: '#b91c1c' }}>🛡️</span>
          MHA Audit Log
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '5px 12px', borderRadius: '20px', fontSize: '11px', color: '#166534', fontWeight: '800' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#16a34a' }}></span>
          <span>{isApiConnected ? 'Neo4j Live Engine' : 'Local Intelligence Engine'}</span>
        </div>

        {/* PROFILE DESK AVATAR */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '8px', borderLeft: '1px solid #e2e8f0' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a' }}>Senior Command Admin</div>
            <div style={{ fontSize: '9.5px', color: '#64748b', fontWeight: 600 }}>DIRECTORATE DESK</div>
          </div>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#b91c1c', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
            👤
          </div>
        </div>

      </div>
    </header>
  );
}



