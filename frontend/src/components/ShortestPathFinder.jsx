import React, { useState } from 'react';

export default function ShortestPathFinder({ nodesData = [], edgesData = [] }) {
  const defaultSource = nodesData.length > 0 ? nodesData[0].id : 'P001';
  const defaultTarget = nodesData.length > 1 ? nodesData[1].id : 'ORG001';

  const [source, setSource] = useState(defaultSource);
  const [target, setTarget] = useState(defaultTarget);
  const [pathResult, setPathResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const tracePath = async () => {
    if (!source || !target) return;
    setLoading(true);
    setErrorMsg('');
    setPathResult(null);

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/path?source=${encodeURIComponent(source)}&target=${encodeURIComponent(target)}`);
      const data = await res.json();
      
      if (data.found && data.path && data.path.path_nodes) {
        setPathResult({
          nodes: data.path.path_nodes,
          hops: data.path.total_hops,
          bottleneck: data.path.critical_bottleneck_node
        });
      } else {
        // Fallback local BFS if backend path wasn't found in Neo4j traversal limits
        const queue = [[source]];
        const visited = new Set([source]);
        let found = null;

        while (queue.length > 0) {
          const path = queue.shift();
          const curr = path[path.length - 1];

          if (curr === target) {
            found = path;
            break;
          }

          const neighbors = [];
          edgesData.forEach(e => {
            if (e.source === curr) neighbors.push(e.target);
            if (e.target === curr) neighbors.push(e.source);
          });

          for (const n of neighbors) {
            if (!visited.has(n)) {
              visited.add(n);
              queue.push([...path, n]);
            }
          }
        }

        if (found) {
          const formattedNodes = found.map(id => {
            const nodeObj = nodesData.find(n => n.id === id) || { name: id, type: 'Entity' };
            return { id, label: nodeObj.name || id, type: nodeObj.type || nodeObj.label || 'Entity' };
          });
          setPathResult({ nodes: formattedNodes, hops: found.length - 1 });
        } else {
          setErrorMsg('No direct or indirect relationship chain found between these two entities.');
        }
      }
    } catch (e) {
      setErrorMsg('Failed to query path discovery API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="path-finder-panel glass-card">
      <div className="path-inputs">
        <div className="input-box">
          <label>Source Suspect / Entity:</label>
          <select value={source} onChange={(e) => setSource(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
            {nodesData.map(n => <option key={n.id} value={n.id}>{n.name} ({n.id})</option>)}
          </select>
        </div>
        <div className="path-icon" style={{ paddingBottom: '8px' }}>➔</div>
        <div className="input-box">
          <label>Target Suspect / Entity:</label>
          <select value={target} onChange={(e) => setTarget(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
            {nodesData.map(n => <option key={n.id} value={n.id}>{n.name} ({n.id})</option>)}
          </select>
        </div>
        <button className="btn btn-danger" onClick={tracePath} disabled={loading}>
          {loading ? 'Tracing...' : 'Trace Association Chain'}
        </button>
      </div>

      <div className="path-results-area">
        {pathResult ? (
          <div>
            <div style={{ color: 'var(--accent-green)', fontWeight: 'bold', marginBottom: '14px', fontSize: '14px' }}>
              ✔ Association Chain Discovered ({pathResult.hops} Hops):
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {pathResult.nodes.map((node, index) => (
                <React.Fragment key={node.id || index}>
                  <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '10px 14px', borderRadius: '8px', display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>{node.type || 'Entity'}</span>
                    <span style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>{node.label || node.name || node.id}</span>
                    <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--primary-blue)' }}>{node.id}</span>
                  </div>
                  {index < pathResult.nodes.length - 1 && (
                    <span style={{ color: 'var(--accent-red)', fontWeight: 'bold', fontSize: '16px' }}>➔ [LINK] ➔</span>
                  )}
                </React.Fragment>
              ))}
            </div>
            {pathResult.bottleneck && (
              <div style={{ marginTop: '14px', padding: '8px 12px', background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '6px', color: '#c2410c', fontSize: '12px', fontWeight: 600 }}>
                ⚠️ Critical Bottleneck Intermediary Handler: {pathResult.bottleneck}
              </div>
            )}
          </div>
        ) : errorMsg ? (
          <div style={{ color: 'var(--accent-red)', fontWeight: '600' }}>{errorMsg}</div>
        ) : (
          <div className="placeholder-msg">Select a Source and Target suspect from the dropdown to calculate the shortest criminal association chain.</div>
        )}
      </div>
    </div>
  );
}
