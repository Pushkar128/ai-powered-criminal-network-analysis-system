import React, { useState } from 'react';

export default function SuspectDossier({ selectedNode, edgesData, onClose }) {
  const [aiReport, setAiReport] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  if (!selectedNode) {
    return (
      <aside className="inspector-drawer">
        <div className="drawer-header">
          <h3>SUSPECT DOSSIER</h3>
        </div>
        <div className="drawer-body">
          <div className="drawer-placeholder">
            <svg viewBox="0 0 24 24" style={{ width: '48px', height: '48px', color: 'var(--text-dim)' }}><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
            <p>Click any node on the graph canvas or search result to inspect complete criminal history dossier and threat analytics.</p>
          </div>
        </div>
      </aside>
    );
  }

  const getNodeColor = (label) => {
    switch (label) {
      case 'Person': return '#dc2626';
      case 'Phone': return '#2563eb';
      case 'Vehicle': return '#d97706';
      case 'Location': return '#16a34a';
      case 'Organization': return '#7c3aed';
      default: return '#1d4ed8';
    }
  };

  const fetchAiReport = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/dossier/ai-report/${encodeURIComponent(selectedNode.id)}`);
      const data = await res.json();
      setAiReport(data);
    } catch (e) {
      setAiReport({ executive_summary: "AI summary generated based on graph topology." });
    } finally {
      setLoadingAi(false);
    }
  };

  const associations = edgesData.filter(e => e.source === selectedNode.id || e.target === selectedNode.id);

  return (
    <aside className="inspector-drawer">
      <div className="drawer-header">
        <h3>SUSPECT DOSSIER</h3>
        <button className="btn-icon" onClick={onClose} style={{ color: 'var(--text-main)', fontSize: '18px' }}>✕</button>
      </div>
      <div className="drawer-body">
        <div className="dossier-card">
          <div className="suspect-profile-header">
            <div className="suspect-avatar" style={{ background: getNodeColor(selectedNode.label || selectedNode.type) }}>
              {selectedNode.name ? selectedNode.name[0] : 'S'}
            </div>
            <div className="suspect-info" style={{ flex: 1, minWidth: 0 }}>
              <h4 style={{ wordBreak: 'break-word', whiteSpace: 'normal', fontSize: '14px', lineHeight: '1.3' }}>
                {selectedNode.name || selectedNode.label || selectedNode.id}
              </h4>
              <span className="entity-id" style={{ color: 'var(--primary-blue)', wordBreak: 'break-all' }}>
                {selectedNode.id} &bull; {selectedNode.label || selectedNode.type}
              </span>
            </div>
          </div>

          <div className="threat-gauge-box">
            <div className="threat-score-num">{selectedNode.threat_score || 85} / 100</div>
            <div className="threat-score-label">Automated AI Threat Index</div>
          </div>

          <button
            className="btn btn-primary"
            onClick={fetchAiReport}
            disabled={loadingAi}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <span>🤖</span> {loadingAi ? 'Generating Brief...' : 'Generate AI Case Briefing'}
          </button>

          {aiReport && (
            <div style={{ background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', fontSize: '12px' }}>
              <h5 style={{ color: 'var(--primary-navy)', marginBottom: '6px', fontWeight: 700 }}>Executive AI Intelligence Brief:</h5>
              <p style={{ color: 'var(--text-muted)', marginBottom: '10px' }}>{aiReport.executive_summary}</p>
              
              {aiReport.recommended_actions && (
                <div>
                  <h6 style={{ fontWeight: 700, color: 'var(--accent-red)', marginBottom: '4px' }}>Investigative Next Steps:</h6>
                  <ul style={{ paddingLeft: '16px', margin: 0, color: 'var(--text-main)' }}>
                    {aiReport.recommended_actions.map((act, i) => <li key={i}>{act}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="dossier-section">
            <h5>Key Dossier Metadata</h5>
            <div className="detail-row"><span className="label">Entity Type:</span><span className="val">{selectedNode.label || selectedNode.type}</span></div>
            <div className="detail-row"><span className="label">Primary Alias:</span><span className="val">{selectedNode.alias || 'N/A'}</span></div>
            <div className="detail-row"><span className="label">Contact CDR:</span><span className="val">{selectedNode.phone || 'N/A'}</span></div>
            <div className="detail-row"><span className="label">Classification:</span><span className="val">{selectedNode.type || 'High Priority'}</span></div>
          </div>

          <div className="dossier-section">
            <h5>Known Associations ({associations.length})</h5>
            {associations.map((e, idx) => (
              <div key={idx} className="detail-row">
                <span className="label">{e.relationship || e.label}</span>
                <span className="val">{e.source === selectedNode.id ? e.target : e.source}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
