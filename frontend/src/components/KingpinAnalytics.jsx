import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

export default function KingpinAnalytics() {
  const [kingpins, setKingpins] = useState([]);
  const [moneyLoops, setMoneyLoops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/analytics/kingpins`)
      .then(res => res.json())
      .then(data => {
        if (data.kingpins) setKingpins(data.kingpins);
      })
      .catch(() => {});

    fetch(`${API_BASE_URL}/api/analytics/money-loops`)
      .then(res => res.json())
      .then(data => {
        if (data.money_loops) setMoneyLoops(data.money_loops);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);


  return (
    <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* PageRank Kingpin Radar */}
        <div className="glass-card" style={{ margin: 0 }}>
          <div style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            <h3 style={{ fontSize: '16px', color: 'var(--primary-navy)' }}>
              🎯 Kingpin Centrality Leaderboard (Graph Data Science)
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Automatically calculates PageRank & Betweenness Centrality to pinpoint key syndicate handlers.
            </p>
          </div>

          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>Calculating Centrality Metrics...</div>
          ) : (
            <div className="resolution-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Suspect Name</th>
                    <th>Type</th>
                    <th>Influence Score</th>
                    <th>PageRank</th>
                    <th>Degree</th>
                  </tr>
                </thead>
                <tbody>
                  {kingpins.map((k, idx) => (
                    <tr key={k.id || idx}>
                      <td style={{ fontWeight: 'bold' }}>#{idx + 1}</td>
                      <td style={{ fontWeight: '600', color: 'var(--primary-blue)' }}>{k.name}</td>
                      <td><span className="badge badge-med">{k.type}</span></td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--accent-red)' }}>{k.influence_score}</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{k.pagerank}</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{k.total_degree} edges</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Suspicious Money Laundering Cycle Detection */}
        <div className="glass-card" style={{ margin: 0 }}>
          <div style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            <h3 style={{ fontSize: '16px', color: 'var(--primary-navy)' }}>
              🔄 Dark Money Laundering & Cycle Detector
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Algorithmic detection of multi-hop circular fund placement through shell organizations.
            </p>
          </div>

          {moneyLoops.map((loop, idx) => (
            <div key={idx} style={{ background: '#fff5f5', border: '1px solid #fecaca', borderRadius: '8px', padding: '14px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="badge badge-high" style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' }}>
                  CRITICAL SUSPICIOUS CYCLE
                </span>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--accent-red)' }}>
                  {loop.total_amount || '₹ Multi-Lakh Transfer'}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-main)', marginBottom: '10px', fontWeight: 500 }}>
                {loop.description || 'Circular transfer cycle detected between accounts.'}
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {loop.loop_nodes && loop.loop_nodes.map((n, i) => (
                  <span key={i} style={{ background: '#ffffff', border: '1px solid var(--border-color)', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                    {i > 0 && '➔ '}{n.name} ({n.type})
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
