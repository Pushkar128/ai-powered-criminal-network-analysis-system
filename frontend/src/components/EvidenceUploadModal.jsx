import React, { useState } from 'react';

export default function EvidenceUploadModal({ isOpen, onClose, onRefreshGraph }) {
  const [activeTab, setActiveTab] = useState('text');
  const [firText, setFirText] = useState('');
  const [csvText, setCsvText] = useState('');
  const [caseId, setCaseId] = useState('CASE-RAW-001');
  const [fileType, setFileType] = useState('CDR');
  const [statusMsg, setStatusMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleIngestText = async () => {
    if (!firText.trim()) return;
    setLoading(true);
    setStatusMsg('Parsing raw FIR text via NLP engine...');
    try {
      const res = await fetch('http://127.0.0.1:8000/api/evidence/ingest-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fir_text: firText, case_id: caseId })
      });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        setStatusMsg(`Successfully extracted ${data.extracted_nodes_count} entities and created graph connections!`);
        setTimeout(() => {
          onRefreshGraph();
          onClose();
        }, 1200);
      }
    } catch (e) {
      setStatusMsg(`Parsing failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleIngestCSV = async () => {
    if (!csvText.trim()) return;
    setLoading(true);
    setStatusMsg('Ingesting CDR CSV dataset...');
    try {
      const res = await fetch('http://127.0.0.1:8000/api/evidence/ingest-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv_text: csvText, file_type: fileType, case_id: caseId })
      });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        setStatusMsg(`Ingested ${data.processed_rows} call detail/bank records into network graph!`);
        setTimeout(() => {
          onRefreshGraph();
          onClose();
        }, 1200);
      }
    } catch (e) {
      setStatusMsg(`Ingestion failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <h3 style={{ margin: 0, fontSize: '16px' }}>MHA Evidence Ingestion Engine</h3>
          <button className="btn-icon" onClick={onClose} style={{ color: '#fff' }}>✕</button>
        </div>

        <div className="modal-body">
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <button
              className={`btn ${activeTab === 'text' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('text')}
            >
              Parse Unstructured FIR / Text Report
            </button>
            <button
              className={`btn ${activeTab === 'csv' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('csv')}
            >
              Ingest Structured CDR / Bank CSV
            </button>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Target Case Register ID:</label>
            <input
              type="text"
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '4px', marginTop: '4px' }}
            />
          </div>

          {activeTab === 'text' ? (
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Paste Raw FIR Copy / Intelligence Statement:</label>
              <textarea
                rows="6"
                placeholder="Example: Accused Rashid Khan was spotted near Dharavi with phone +91 9876543210 driving vehicle MH-02-CD-9988..."
                value={firText}
                onChange={(e) => setFirText(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '6px', fontFamily: 'sans-serif', marginTop: '6px' }}
              />
              <button
                className="btn btn-primary"
                onClick={handleIngestText}
                disabled={loading}
                style={{ width: '100%', marginTop: '14px' }}
              >
                {loading ? 'Extracting NLP Entities...' : 'Extract Entities & Build Network Nodes'}
              </button>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>CSV Format Type:</label>
                <select
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '4px', marginTop: '4px' }}
                >
                  <option value="CDR">Call Detail Records (Caller, Receiver, Duration)</option>
                  <option value="FINANCIAL">Financial Transfers (Sender, Beneficiary, Amount)</option>
                </select>
              </div>

              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Paste Raw CSV Content:</label>
              <textarea
                rows="6"
                placeholder={"Caller,Receiver,Duration\n+919876543210,+919812345678,142\n+919812345678,+919988776655,80"}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '6px', fontFamily: 'monospace', marginTop: '6px' }}
              />
              <button
                className="btn btn-primary"
                onClick={handleIngestCSV}
                disabled={loading}
                style={{ width: '100%', marginTop: '14px' }}
              >
                {loading ? 'Ingesting Batch...' : 'Ingest CSV into Neo4j Graph'}
              </button>
            </div>
          )}

          {statusMsg && (
            <div style={{ marginTop: '14px', padding: '10px', background: 'var(--primary-blue-light)', color: 'var(--primary-blue)', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
              {statusMsg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
