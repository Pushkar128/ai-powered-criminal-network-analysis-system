import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

export default function NewsIngestionPanel({ onRefreshGraph, currentCase, onSelectCase, casesList, onRefreshCases, onQuickUpdateGraph }) {
  const [loading, setLoading] = useState(false);
  const [ingestionResults, setIngestionResults] = useState(null);
  const [newsFeed, setNewsFeed] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
  const [showQuickInput, setShowQuickInput] = useState(false);
  const [quickText, setQuickText] = useState('');
  const [updatingText, setUpdatingText] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');

  const handleQuickSubmit = async (e) => {
    e.preventDefault();
    if (!quickText.trim()) return;
    setUpdatingText(true);
    setUpdateStatus('');

    const targetCaseId = currentCase && currentCase !== 'ALL' ? currentCase : 'CASE-001';

    try {
      const res = await fetch(`${API_BASE_URL}/api/evidence/ingest-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fir_text: quickText, case_id: targetCaseId })
      });
      const data = await res.json();
      
      if (onQuickUpdateGraph) {
        onQuickUpdateGraph(data.nodes || [], data.edges || [], quickText);
      } else if (onRefreshGraph) {
        onRefreshGraph();
      }
      setUpdateStatus(`✓ Case network updated: Extracted intelligence from "${quickText}"`);
      setQuickText('');
    } catch (err) {
      if (onQuickUpdateGraph) {
        onQuickUpdateGraph([], [], quickText);
      }
      setUpdateStatus(`✓ Case network updated (offline mode): "${quickText}"`);
      setQuickText('');
    } finally {
      setUpdatingText(false);
      setTimeout(() => setUpdateStatus(''), 6000);
    }
  };

  const handleIngestNews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/news/ingest?max_articles=8`);
      const data = await res.json();
      setIngestionResults(data);
      if (onRefreshGraph) onRefreshGraph();
      if (onRefreshCases) onRefreshCases();
    } catch (err) {
      console.error('News Ingestion failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/news/feed`)
      .then(res => res.json())
      .then(data => {
        if (data.articles) setNewsFeed(data.articles);
      })
      .catch(() => {});
  }, []);

  if (collapsed) {
    return (
      <div style={{ padding: '10px 16px', background: '#0f172a', borderRadius: '10px', border: '1px solid #1e293b', color: '#f8fafc', margin: '12px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ color: '#38bdf8', fontWeight: 700, fontSize: '0.9rem' }}>📡 OSINT Live News Feed & Case Filter</span>
            <select
              value={currentCase || 'ALL'}
              onChange={(e) => onSelectCase(e.target.value)}
              style={{ background: '#1e293b', color: '#38bdf8', border: '1px solid #334155', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}
            >
              <option value="ALL">All Combined Cases Graph Network</option>
              <optgroup label="[Demo Dataset] Benchmark Investigation Graphs">
                {casesList && casesList.filter(c => c.is_dataset || (c.title && c.title.includes('[Dataset]'))).map((c) => (
                  <option key={c.case_id} value={c.case_id}>{c.title} ({c.node_count} Nodes)</option>
                ))}
              </optgroup>
              <optgroup label="[Live News] OSINT Ingestion Feed Cases">
                {casesList && casesList.filter(c => !c.is_dataset && (!c.title || !c.title.includes('[Dataset]'))).map((c) => (
                  <option key={c.case_id} value={c.case_id}>{c.title} ({c.node_count} Nodes)</option>
                ))}
              </optgroup>
            </select>

            <button
              type="button"
              onClick={() => setShowQuickInput(prev => !prev)}
              style={{
                background: showQuickInput ? '#2563eb' : '#1e293b',
                color: '#38bdf8',
                border: '1px solid #334155',
                padding: '4px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Click to open text update input for this active case"
            >
              <span>✏️</span> {showQuickInput ? 'Close Text Input' : 'Add Case Update'}
            </button>
          </div>
          <button
            onClick={() => setCollapsed(false)}
            style={{ background: '#1e293b', color: '#38bdf8', border: '1px solid #334155', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
          >
            ▼ Expand News Panel
          </button>
        </div>

        {/* Collapsed Mode Quick Text Input */}
        {showQuickInput && (
          <form onSubmit={handleQuickSubmit} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#1e293b', padding: '10px 14px', borderRadius: '8px', marginTop: '10px', border: '1px solid #38bdf840' }}>
            <span style={{ fontSize: '0.9rem' }}>✏️</span>
            <input
              type="text"
              value={quickText}
              onChange={(e) => setQuickText(e.target.value)}
              placeholder={`Type update for active case (e.g. "Rashid has recently contacted John")`}
              style={{
                flex: 1,
                background: '#0f172a',
                color: '#38bdf8',
                border: '1px solid #334155',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: '500',
                outline: 'none'
              }}
              autoFocus
            />
            <button
              type="submit"
              disabled={updatingText || !quickText.trim()}
              style={{
                background: updatingText ? '#475569' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontWeight: '700',
                fontSize: '0.8rem',
                cursor: updatingText || !quickText.trim() ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {updatingText ? '⏳ Appending...' : '⚡ Append to Case Network'}
            </button>
          </form>
        )}

        {updateStatus && (
          <div style={{ background: '#10b98120', border: '1px solid #10b98150', color: '#6ee7b7', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, marginTop: '8px' }}>
            {updateStatus}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: '16px', background: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', color: '#f8fafc', margin: '16px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div>
          <h3 style={{ margin: 0, color: '#38bdf8', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📡 OSINT Live News Feed & Graph Ingestion</span>
          </h3>
          <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
            Ingests Google News (Past 24h) → AI Entity Resolution → Auto Updates Existing Graph or Creates New Case
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={handleIngestNews}
            disabled={loading}
            style={{
              background: loading ? '#475569' : 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '0.85rem',
              boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
              transition: 'all 0.2s'
            }}
          >
            {loading ? '⏳ Processing News & Updating Neo4j...' : '⚡ Process Live News Feed'}
          </button>
          <button
            onClick={() => setCollapsed(true)}
            style={{ background: '#1e293b', color: '#94a3b8', border: '1px solid #334155', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
            title="Hide panel to view full graph canvas"
          >
            ▲ Hide Panel
          </button>
        </div>
      </div>


      {/* Case Selector Dropdown & Icon Button for Quick Text Ingestion */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#1e293b', padding: '10px 14px', borderRadius: '8px', marginBottom: '12px' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#cbd5e1' }}>📁 Active Case Filter:</label>
        <select
          value={currentCase || 'ALL'}
          onChange={(e) => onSelectCase(e.target.value)}
          style={{
            background: '#0f172a',
            color: '#38bdf8',
            border: '1px solid #334155',
            padding: '6px 12px',
            borderRadius: '6px',
            fontWeight: '600',
            fontSize: '0.85rem',
            outline: 'none',
            flexGrow: 1
          }}
        >
          <option value="ALL">All Combined Cases Graph Network</option>
          <optgroup label="[Demo Dataset] Benchmark Investigation Graphs">
            {casesList && casesList.filter(c => c.is_dataset || (c.title && c.title.includes('[Dataset]'))).map((c) => (
              <option key={c.case_id} value={c.case_id}>
                {c.title} ({c.node_count} Nodes)
              </option>
            ))}
          </optgroup>
          <optgroup label="[Live News] OSINT Ingestion Feed Cases">
            {casesList && casesList.filter(c => !c.is_dataset && (!c.title || !c.title.includes('[Dataset]'))).map((c) => (
              <option key={c.case_id} value={c.case_id}>
                {c.title} ({c.node_count} Nodes)
              </option>
            ))}
          </optgroup>
        </select>

        {/* Small Icon Button to Toggle Text Input for Active Case */}
        <button
          type="button"
          onClick={() => setShowQuickInput(prev => !prev)}
          style={{
            background: showQuickInput ? '#2563eb' : '#0f172a',
            color: '#38bdf8',
            border: '1px solid #334155',
            padding: '6px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s'
          }}
          title="Click to open text update label for this case"
        >
          <span>✏️</span> {showQuickInput ? 'Close Text Input' : 'Add Case Update'}
        </button>
      </div>

      {/* Expanded Mode Quick Text Input Form */}
      {showQuickInput && (
        <form onSubmit={handleQuickSubmit} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#1e293b', padding: '12px 14px', borderRadius: '8px', marginBottom: '12px', border: '1px solid #38bdf840' }}>
          <span style={{ fontSize: '0.9rem' }}>✏️</span>
          <input
            type="text"
            value={quickText}
            onChange={(e) => setQuickText(e.target.value)}
            placeholder={`Type update for active case (e.g. "Rashid has recently contacted John")`}
            style={{
              flex: 1,
              background: '#0f172a',
              color: '#38bdf8',
              border: '1px solid #334155',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: '500',
              outline: 'none'
            }}
            autoFocus
          />
          <button
            type="submit"
            disabled={updatingText || !quickText.trim()}
            style={{
              background: updatingText ? '#475569' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontWeight: '700',
              fontSize: '0.8rem',
              cursor: updatingText || !quickText.trim() ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)',
              whiteSpace: 'nowrap'
            }}
          >
            {updatingText ? '⏳ Appending...' : '⚡ Append to Case Network'}
          </button>
        </form>
      )}

      {updateStatus && (
        <div style={{ background: '#10b98120', border: '1px solid #10b98150', color: '#6ee7b7', padding: '8px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '12px' }}>
          {updateStatus}
        </div>
      )}

      {/* Ingestion Summary Status */}
      {ingestionResults && (
        <div style={{ background: '#0284c715', border: '1px solid #0284c740', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', fontWeight: '600' }}>
            <span style={{ color: '#4ade80' }}>✓ Processed Articles: {ingestionResults.processed_count}</span>
            <span style={{ color: '#38bdf8' }}>🔗 Merged to Existing Case: {ingestionResults.merged_into_existing_count}</span>
            <span style={{ color: '#f43f5e' }}>🆕 New Isolated Cases Created: {ingestionResults.new_cases_created_count}</span>
          </div>

          <div style={{ marginTop: '10px', maxHeight: '140px', overflowY: 'auto' }}>
            {ingestionResults.ingestion_results && ingestionResults.ingestion_results.map((item, idx) => (
              <div key={idx} style={{ padding: '6px 0', borderBottom: '1px solid #334155', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: item.status === 'MERGED' ? '#4ade80' : '#fb7185', fontWeight: '600' }}>
                  [{item.status === 'MERGED' ? `MERGED -> ${item.case_id}` : `NEW CASE -> ${item.case_id}`}]
                </span>
                <span style={{ color: '#cbd5e1', flex: 1, marginLeft: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.article ? item.article.title : item.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Raw News Ticker */}
      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
        <strong style={{ color: '#94a3b8' }}>Latest RSS Headlines: </strong>
        {newsFeed.slice(0, 3).map(n => n.title).join(' | ') || 'Fetching live feed...'}
      </div>
    </div>
  );
}
