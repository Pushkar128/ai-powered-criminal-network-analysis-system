import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

export default function ChainOfCustodyAudit({ isOpen, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetch(`${API_BASE_URL}/api/audit/chain-of-custody`)

        .then(res => res.json())
        .then(data => {
          if (data.audit_logs) setLogs(data.audit_logs);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ width: '800px' }}>
        <div className="modal-header">
          <h3 style={{ margin: 0, fontSize: '16px' }}>🛡️ MHA Chain of Custody & Evidence Audit Log</h3>
          <button className="btn-icon" onClick={onClose} style={{ color: '#fff' }}>✕</button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Immutable evidentiary trail recording all data ingestions, entity resolutions, and investigator queries with SHA-256 digital signatures for court admissibility (Section 65B Indian Evidence Act compliance).
          </p>

          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>Loading Audit Trail...</div>
          ) : (
            <div className="resolution-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Log ID</th>
                    <th>Timestamp</th>
                    <th>Investigator / System</th>
                    <th>Action</th>
                    <th>Evidentiary Details</th>
                    <th>SHA-256 Hash</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>{log.id}</td>
                      <td style={{ fontSize: '12px' }}>{log.timestamp}</td>
                      <td style={{ fontWeight: '600' }}>{log.investigator}</td>
                      <td><span className="badge badge-high" style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>{log.action}</span></td>
                      <td style={{ fontSize: '12px' }}>{log.details}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)' }}>{log.hash}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
