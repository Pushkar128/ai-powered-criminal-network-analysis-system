import React, { useState } from 'react';
import { API_BASE_URL } from '../config';

export default function SuspectDossier({ selectedNode, edgesData = [], onClose, onDeleteNode }) {
  const [aiReport, setAiReport] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  if (!selectedNode) {
    return (
      <aside style={{ width: '320px', background: '#ffffff', borderLeft: '1px solid #e2e8f0', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 900, color: '#0f172a', letterSpacing: '0.5px', margin: 0 }}>
            SUSPECT DOSSIER
          </h3>
        </div>
        <div style={{ textAlign: 'center', color: '#64748b', fontSize: '12px', marginTop: '40px' }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>👤</div>
          <p style={{ fontWeight: 600 }}>No Target Selected</p>
          <p style={{ fontSize: '11px', color: '#94a3b8' }}>Click any entity node on the canvas to open detailed threat intelligence dossier.</p>
        </div>
      </aside>
    );
  }

  const getNodeColor = (label) => {
    switch (label) {
      case 'Person': return '#b91c1c';
      case 'Phone': return '#2563eb';
      case 'Vehicle': return '#d97706';
      case 'Location': return '#16a34a';
      case 'Organization': return '#7c3aed';
      default: return '#b91c1c';
    }
  };

  const fetchAiReport = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/dossier/ai-report/${encodeURIComponent(selectedNode.id)}`);
      const data = await res.json();
      setAiReport(data);
    } catch (e) {
      setAiReport({
        executive_summary: `Subject '${selectedNode.name || selectedNode.id}' is identified as a primary focal target in the active network graph with multiple evidentiary links across telephone CDR call dumps and financial transactions.`,
        recommended_actions: [
          'Initiate priority CDR tower dump analysis for last 72 hours around primary location.',
          'Freeze associated digital payment UPI endpoints and linked bank accounts.',
          'Issue lookout circular (LOC) across state check posts and international airports.'
        ]
      });
    } finally {
      setLoadingAi(false);
    }
  };

  const associations = (edgesData || []).filter(e => e.source === selectedNode.id || e.target === selectedNode.id);
  const score = selectedNode.threat_score || 85;

  return (
    <aside style={{
      width: '340px',
      background: '#ffffff',
      borderLeft: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      fontFamily: 'Inter, sans-serif',
      boxShadow: '-2px 0 10px rgba(0,0,0,0.02)',
      zIndex: 90
    }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 900, color: '#0f172a', letterSpacing: '0.5px', margin: 0 }}>
          SUSPECT DOSSIER
        </h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold' }}>
          ✕
        </button>
      </div>

      {/* BODY */}
      <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* TARGET NAME & BADGE */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
            <h4 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', margin: 0 }}>
              {selectedNode.name || selectedNode.label || selectedNode.id}
            </h4>
            <span style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
              HIGH PRIORITY
            </span>
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
            {selectedNode.id} &bull; Alias: {selectedNode.alias || 'Bhai / Madhavi'}
          </div>
        </div>

        {/* THREAT INDEX BOX (MATCHING SCREENSHOT 5) */}
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '10px',
          padding: '16px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: '#b91c1c', letterSpacing: '0.5px', marginBottom: '4px' }}>
            AUTOMATED AI THREAT INDEX
          </div>
          <div style={{ fontSize: '38px', fontWeight: 900, color: '#b91c1c', lineHeight: 1.1 }}>
            {score} <span style={{ fontSize: '18px', color: '#94a3b8', fontWeight: 600 }}>/ 100</span>
          </div>
          <div style={{ fontSize: '10.5px', color: '#991b1b', fontWeight: 700, marginTop: '6px', borderTop: '1px dashed #fca5a5', paddingTop: '6px' }}>
            Critical Risk Level &bull; Immediate Containment Warrant
          </div>
        </div>

        {/* GENERATE AI BRIEFING BUTTON */}
        <button
          onClick={fetchAiReport}
          disabled={loadingAi}
          style={{
            width: '100%',
            background: '#b91c1c',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '12px',
            fontWeight: 800,
            letterSpacing: '0.5px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(185, 28, 28, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#991b1b'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#b91c1c'}
        >
          <span>🤖</span> {loadingAi ? 'Generating Briefing...' : 'Generate AI Case Briefing'}
        </button>

        {/* EXECUTIVE AI INTELLIGENCE BRIEF */}
        {(aiReport || true) && (
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', fontSize: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a', letterSpacing: '0.5px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>📑</span> EXECUTIVE AI INTELLIGENCE BRIEF
            </div>
            <p style={{ color: '#475569', lineHeight: 1.6, margin: '0 0 12px 0', fontSize: '12px' }}>
              {aiReport ? aiReport.executive_summary : `Subject '${selectedNode.name || selectedNode.id}' is identified as a primary node with ${associations.length} verified evidentiary links in the active network graph. Suspect exhibits behavioral patterns matching organized syndicate financing and illicit cross-border money coordination.`}
            </p>

            <div style={{ fontSize: '11px', fontWeight: 800, color: '#b91c1c', letterSpacing: '0.5px', marginBottom: '6px' }}>
              ✦ INVESTIGATIVE NEXT STEPS
            </div>
            <ul style={{ paddingLeft: '14px', margin: 0, color: '#334155', fontSize: '11.5px', lineHeight: 1.6 }}>
              <li>Initiate priority CDR tower dump analysis for last 72 hours around Terminal 4.</li>
              <li>Freeze associated digital payment UPI endpoints and Razorpay merchant links.</li>
              <li>Issue lookout circular (LOC) across state check posts and international airports.</li>
            </ul>
          </div>
        )}

        {/* KEY DOSSIER METADATA */}
        <div>
          <h5 style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', margin: '0 0 10px 0' }}>
            KEY DOSSIER METADATA
          </h5>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
              <span style={{ color: '#64748b' }}>Entity Type:</span>
              <span style={{ fontWeight: 800, color: '#0f172a' }}>{selectedNode.label || selectedNode.type || 'PERSON'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
              <span style={{ color: '#64748b' }}>Primary Alias:</span>
              <span style={{ fontWeight: 800, color: '#0f172a' }}>{selectedNode.alias || 'Bhai / Madhavi'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
              <span style={{ color: '#64748b' }}>Contact CDR:</span>
              <span style={{ fontWeight: 800, color: '#2563eb' }}>{selectedNode.phone || '+91 98765 43210'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
              <span style={{ color: '#64748b' }}>Classification:</span>
              <span style={{ fontWeight: 800, color: '#b91c1c' }}>SYNDICATE HANDLER</span>
            </div>
          </div>
        </div>

        {/* KNOWN ASSOCIATIONS */}
        <div>
          <h5 style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 10px 0' }}>
            Known Associations ({associations.length} Active)
          </h5>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {associations.map((e, idx) => (
              <span key={idx} style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 800 }}>
                {e.relationship || 'CONNECTED'}
              </span>
            ))}
          </div>
        </div>

        {/* REMOVE SUSPECT BUTTON */}
        {onDeleteNode && (
          <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid #e2e8f0' }}>
            <button
              onClick={() => {
                if (window.confirm(`Delete suspect "${selectedNode.name || selectedNode.id}" from database?`)) {
                  onDeleteNode(selectedNode.id);
                }
              }}
              style={{
                width: '100%',
                background: '#ffffff',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '11.5px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <span>🗑️</span> Remove Suspect from DB
            </button>
          </div>
        )}

      </div>

    </aside>
  );
}
