import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

export default function NewsIngestionPanel({ onRefreshGraph, currentCase, onSelectCase, casesList, onRefreshCases }) {
  const [loading, setLoading] = useState(false);
  const [ingestionResults, setIngestionResults] = useState(null);
  const [newsFeed, setNewsFeed] = useState([]);
  const [collapsed, setCollapsed] = useState(false);

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
      <div style={{ padding: '10px 16px', background: '#0f172a', borderRadius: '10px', border: '1px solid #1e293b', color: '#f8fafc', margin: '12px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#38bdf8', fontWeight: 700, fontSize: '0.9rem' }}>📡 OSINT Live News Feed & Case Filter</span>
          <select
            value={currentCase || 'ALL'}
            onChange={(e) => onSelectCase(e.target.value)}
            style={{ background: '#1e293b', color: '#38bdf8', border: '1px solid #334155', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}
          >
            <option value="ALL">🌐 All Cases Combined Network</option>
            {casesList && casesList.map((c) => (
              <option key={c.case_id} value={c.case_id}>{c.title} ({c.node_count} Nodes)</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setCollapsed(false)}
          style={{ background: '#1e293b', color: '#38bdf8', border: '1px solid #334155', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
        >
          ▼ Expand News Panel
        </button>
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


      {/* Case Selector Dropdown */}
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
          <option value="ALL">🌐 View All Cases Combined Network</option>
          {casesList && casesList.map((c) => (
            <option key={c.case_id} value={c.case_id}>
              {c.title} ({c.node_count} Nodes)
            </option>
          ))}
        </select>
      </div>

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
