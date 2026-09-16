import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import NetworkTopology from './components/NetworkTopology';
import ShortestPathFinder from './components/ShortestPathFinder';
import EntityResolution from './components/EntityResolution';
import SuspectDossier from './components/SuspectDossier';
import NewsIngestionPanel from './components/NewsIngestionPanel';
import KingpinAnalytics from './components/KingpinAnalytics';
import EvidenceUploadModal from './components/EvidenceUploadModal';
import ChainOfCustodyAudit from './components/ChainOfCustodyAudit';
import FacialScannerGeoMap from './components/FacialScannerGeoMap';
import LandingPage from './components/LandingPage';
import { API_BASE_URL } from './config';

// INITIAL_NODES & EDGES...


const INITIAL_NODES = [
  { id: 'PER_1001', name: 'Rashid Khan @Bhai', label: 'Person', threat_score: 92, type: 'Suspect', alias: 'Shadow King', phone: '+91 9876543210', x: 260, y: 200 },
  { id: 'PER_1002', name: 'Vikram Singh', label: 'Person', threat_score: 85, type: 'Suspect', alias: 'Vicky', phone: '+91 9812345678', x: 120, y: 310 },
  { id: 'PER_1003', name: 'Anil Deshmukh', label: 'Person', threat_score: 64, type: 'Suspect', alias: 'Operator', phone: '+91 9988776655', x: 420, y: 310 },
  { id: 'PHN_9001', name: '+91 9876543210', label: 'Phone', threat_score: 40, type: 'CDR', x: 140, y: 110 },
  { id: 'PHN_9002', name: '+91 9812345678', label: 'Phone', threat_score: 30, type: 'CDR', x: 10, y: 220 },
  { id: 'VEH_4001', name: 'MH-02-CD-9988 (SUV)', label: 'Vehicle', threat_score: 75, type: 'Vehicle', x: 380, y: 100 },
  { id: 'LOC_7001', name: 'Dharavi Safehouse B-4', label: 'Location', threat_score: 80, type: 'Hideout', x: 200, y: 400 },
  { id: 'ORG_5002', name: 'Apex Global Logistics', label: 'Organization', threat_score: 88, type: 'Front Org', x: 520, y: 200 },
  { id: 'PER_1004', name: 'Sanjay Dutt @Sanju', label: 'Person', threat_score: 78, type: 'Suspect', x: 250, y: 50 },
  { id: 'PHN_9003', name: '+91 9123456789', label: 'Phone', threat_score: 50, type: 'CDR', x: 100, y: 20 }
];

const INITIAL_EDGES = [
  { source: 'PER_1001', target: 'PHN_9001', relationship: 'USES_PHONE', weight: 0.9 },
  { source: 'PER_1002', target: 'PHN_9002', relationship: 'USES_PHONE', weight: 0.9 },
  { source: 'PER_1001', target: 'PER_1002', relationship: 'CALL_FREQUENT', weight: 0.85 },
  { source: 'PER_1001', target: 'VEH_4001', relationship: 'SPOTTED_IN', weight: 0.95 },
  { source: 'PER_1002', target: 'LOC_7001', relationship: 'FREQUENTS', weight: 0.75 },
  { source: 'PER_1001', target: 'ORG_5002', relationship: 'BENEFICIAL_OWNER', weight: 0.99 },
  { source: 'PER_1003', target: 'ORG_5002', relationship: 'DIRECTOR', weight: 0.70 },
  { source: 'PER_1004', target: 'PHN_9003', relationship: 'USES_PHONE', weight: 0.80 },
  { source: 'PER_1004', target: 'PER_1001', relationship: 'FINANCIAL_TRANSFER', weight: 0.92 }
];

export default function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialRole = urlParams.get('role') || 'public';
  const initialView = urlParams.get('mode') === 'portal' || urlParams.has('role') ? 'main' : 'landing';

  const [view, setView] = useState(initialView); // 'landing' | 'main'
  const [userRole, setUserRole] = useState(initialRole); // 'public' | 'admin'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('graph-tab');
  const [nodesData, setNodesData] = useState(INITIAL_NODES);
  const [edgesData, setEdgesData] = useState(INITIAL_EDGES);
  const [selectedNode, setSelectedNode] = useState(null);
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [threatFilter, setThreatFilter] = useState(0);
  const [isApiConnected, setIsApiConnected] = useState(false);
  const [selectedCase, setSelectedCase] = useState('ALL');
  const [casesList, setCasesList] = useState([]);
  
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [auditModalOpen, setAuditModalOpen] = useState(false);

  // Global Admin Alert state for real-time suspect detection
  const [globalAdminAlert, setGlobalAdminAlert] = useState(null);
  const prevAdminSightingsCount = React.useRef(0);

  const fetchGraphData = (caseId = selectedCase) => {
    const url = caseId && caseId !== 'ALL' 
      ? `${API_BASE_URL}/api/graph?case_id=${encodeURIComponent(caseId)}` 
      : `${API_BASE_URL}/api/graph`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.nodes && data.nodes.length > 0) setNodesData(data.nodes);
        if (data.edges && data.edges.length > 0) setEdgesData(data.edges);
        setIsApiConnected(true);
      })
      .catch(() => setIsApiConnected(false));
  };

  const fetchCases = () => {
    fetch(`${API_BASE_URL}/api/cases`)
      .then(res => res.json())
      .then(data => {
        if (data.cases) setCasesList(data.cases);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchGraphData(selectedCase);
    fetchCases();
  }, [selectedCase]);

  // Global polling for Admin live suspect alert notifications
  useEffect(() => {
    if (userRole !== 'admin') return;

    const checkAdminSightings = () => {
      fetch(`${API_BASE_URL}/api/surveillance/heatmap`)
        .then(res => res.json())
        .then(data => {
          if (data.sightings) {
            if (prevAdminSightingsCount.current > 0 && data.sightings.length > prevAdminSightingsCount.current) {
              const latest = data.sightings[0];
              setGlobalAdminAlert(latest);
              setTimeout(() => setGlobalAdminAlert(null), 8000);
            }
            prevAdminSightingsCount.current = data.sightings.length;
          }
        })
        .catch(() => {});
    };

    checkAdminSightings();
    const interval = setInterval(checkAdminSightings, 3000);
    return () => clearInterval(interval);
  }, [userRole]);

  // Handle entering portal as free public user
  const handleEnterPortal = () => {
    setUserRole('public');
    setView('main');
  };

  // Handle admin sign in
  const handleAdminLogin = (username) => {
    setUserRole('admin');
    setView('main');
  };

  if (view === 'landing') {
    return (
      <LandingPage
        onEnterPortal={handleEnterPortal}
        onAdminLogin={handleAdminLogin}
      />
    );
  }

  return (
    <div className="app-container">
      {/* GLOBAL ADMIN ALERT TOAST (Visible across all tabs when logged in as Admin) */}
      {userRole === 'admin' && globalAdminAlert && (
        <div style={{
          position: 'fixed',
          top: '70px',
          right: '24px',
          zIndex: 99999,
          background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
          color: '#ffffff',
          padding: '16px 20px',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(220, 38, 38, 0.5)',
          border: '2px solid #fca5a5',
          maxWidth: '420px',
          animation: 'bounce 0.5s ease'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
            <div style={{ fontSize: '14px', fontWeight: '800', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🚨 ADMIN CRITICAL ALERT: SUSPECT DETECTED</span>
            </div>
            <button
              onClick={() => setGlobalAdminAlert(null)}
              style={{ background: 'none', border: 'none', color: '#fff', fontSize: '16px', cursor: 'pointer', lineHeight: 1 }}
            >
              ✕
            </button>
          </div>
          <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '4px' }}>
            Target: {globalAdminAlert.name === 'Target Suspect' ? 'Rashid Khan @Bhai' : globalAdminAlert.name}
          </div>
          <div style={{ fontSize: '12px', color: '#fee2e2' }}>
            Location: {globalAdminAlert.location_name}
          </div>
          <div style={{ fontSize: '11px', color: '#fef2f2', marginTop: '6px', fontWeight: 600 }}>
            Confidence: {(globalAdminAlert.confidence * 100).toFixed(1)}% &bull; Live GPS Sync Active
          </div>
          <button
            onClick={() => {
              setActiveTab('facial-tab');
              setGlobalAdminAlert(null);
            }}
            style={{
              marginTop: '10px',
              width: '100%',
              background: '#ffffff',
              color: '#dc2626',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              fontWeight: '800',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            🗺️ View Real-time OpenStreetMap & Live Pin ➔
          </button>
        </div>
      )}

      <Navbar
        nodesData={nodesData}
        onSelectNode={(node) => setSelectedNode(node)}
        isApiConnected={isApiConnected}
        onOpenUpload={() => setUploadModalOpen(true)}
        onOpenAudit={() => setAuditModalOpen(true)}
        userRole={userRole}
        onGoHome={() => {
          window.history.pushState({}, '', window.location.pathname);
          setView('landing');
        }}
      />

      <div className="main-body">
        <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-section">
            <h3>Intelligence Modules</h3>
            <div className="module-nav">
              <button
                className={`nav-btn ${activeTab === 'graph-tab' ? 'active' : ''}`}
                onClick={() => setActiveTab('graph-tab')}
              >
                Network Topology Visualizer
              </button>
              <button
                className={`nav-btn ${activeTab === 'kingpin-tab' ? 'active' : ''}`}
                onClick={() => setActiveTab('kingpin-tab')}
              >
                Kingpin & Dark Money Analytics
              </button>
              <button
                className={`nav-btn ${activeTab === 'path-tab' ? 'active' : ''}`}
                onClick={() => setActiveTab('path-tab')}
              >
                Shortest Path & Bottlenecks
              </button>
              <button
                className={`nav-btn ${activeTab === 'resolution-tab' ? 'active' : ''}`}
                onClick={() => setActiveTab('resolution-tab')}
              >
                Entity Resolution & Merges
              </button>
              <button
                className={`nav-btn ${activeTab === 'facial-tab' ? 'active' : ''}`}
                onClick={() => setActiveTab('facial-tab')}
                style={{ color: 'var(--primary-blue)', fontWeight: 600 }}
              >
                📷 Facial Scanner & Geo-Map
              </button>
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Graph Filters & Legend</h3>
            <div className="filter-group">
              <label>Filter Entity Type:</label>
              <select value={entityFilter} onChange={(e) => setEntityFilter(e.target.value)}>
                <option value="ALL">All Entities</option>
                <option value="Person">Suspects / Persons</option>
                <option value="Phone">Phone Numbers / CDR</option>
                <option value="Vehicle">Vehicles</option>
                <option value="Location">Locations / Hideouts</option>
                <option value="Organization">Front Orgs / Syndicates</option>
                <option value="NewsEvent">OSINT News Events</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Threat Level Threshold: {threatFilter}+</label>
              <input
                type="range"
                min="0"
                max="90"
                step="5"
                value={threatFilter}
                onChange={(e) => setThreatFilter(parseInt(e.target.value))}
              />
            </div>

            <div className="entity-legend">
              <div className="legend-item"><span className="dot dot-person"></span> Suspect / Person</div>
              <div className="legend-item"><span className="dot dot-phone"></span> CDR / Phone</div>
              <div className="legend-item"><span className="dot dot-vehicle"></span> Vehicle</div>
              <div className="legend-item"><span className="dot dot-location"></span> Location</div>
              <div className="legend-item"><span className="dot dot-org"></span> Syndicate / Org</div>
            </div>
          </div>
        </aside>

        <main className="workspace">
          {activeTab === 'graph-tab' && (
            <section className="tab-content active">
              <div className="workspace-header">
                <div className="view-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {sidebarCollapsed && (
                    <button
                      onClick={() => setSidebarCollapsed(false)}
                      style={{
                        background: '#2563eb',
                        color: '#ffffff',
                        border: 'none',
                        padding: '6px 14px',
                        borderRadius: '6px',
                        fontWeight: '700',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 8px rgba(37, 99, 235, 0.4)'
                      }}
                      title="Show Sidebar Modules & Filters"
                    >
                      <span>⬅️</span> Show Sidebar Controls
                    </button>
                  )}
                  <div>
                    <h2>National Criminal Network Topology Canvas</h2>
                    <span className="sub-title">Interactive Risk-Weighted Association & Syndicate Mapping</span>
                  </div>
                </div>

                {!sidebarCollapsed && (
                  <button
                    onClick={() => setSidebarCollapsed(true)}
                    style={{
                      background: '#1e293b',
                      color: '#38bdf8',
                      border: '1px solid #334155',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontWeight: '600',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    title="Expand canvas to full width by hiding sidebar"
                  >
                    <span>⚡</span> Expand Full Canvas (Hide Sidebar)
                  </button>
                )}
              </div>

              {/* Live News Ingestion Panel */}
              <NewsIngestionPanel
                onRefreshGraph={() => fetchGraphData(selectedCase)}
                currentCase={selectedCase}
                onSelectCase={(cId) => setSelectedCase(cId)}
                casesList={casesList}
                onRefreshCases={fetchCases}
              />

              <NetworkTopology
                nodesData={nodesData}
                edgesData={edgesData}
                selectedNode={selectedNode}
                onSelectNode={(node) => setSelectedNode(node)}
                entityFilter={entityFilter}
                threatFilter={threatFilter}
              />
            </section>
          )}

          {activeTab === 'facial-tab' && (
            <section className="tab-content active">
              <div className="workspace-header">
                <div className="view-title">
                  <h2>Facial Scanner & Live GPS Geographical Map</h2>
                  <span className="sub-title">Laptop Camera Target Recognition & Real-time Sighting Heatmaps</span>
                </div>
              </div>
              <FacialScannerGeoMap nodesData={nodesData} />
            </section>
          )}

          {activeTab === 'kingpin-tab' && (
            <section className="tab-content active">
              <div className="workspace-header">
                <div className="view-title">
                  <h2>Kingpin Analytics & Suspicious Dark Money Loops</h2>
                  <span className="sub-title">Automated Graph Centrality & Transaction Cycle Algorithms</span>
                </div>
              </div>
              <KingpinAnalytics />
            </section>
          )}

          {activeTab === 'path-tab' && (
            <section className="tab-content active">
              <div className="workspace-header">
                <div className="view-title">
                  <h2>Shortest Path & Critical Bottleneck Finder</h2>
                  <span className="sub-title">Trace hidden intermediaries and communication bridges</span>
                </div>
              </div>
              <ShortestPathFinder nodesData={nodesData} edgesData={edgesData} />
            </section>
          )}

          {activeTab === 'resolution-tab' && (
            <section className="tab-content active">
              <div className="workspace-header">
                <div className="view-title">
                  <h2>Entity Resolution & Cluster Audit</h2>
                  <span className="sub-title">Deduplicated master entity records</span>
                </div>
              </div>
              <EntityResolution />
            </section>
          )}
        </main>

        <SuspectDossier
          selectedNode={selectedNode}
          edgesData={edgesData}
          onClose={() => setSelectedNode(null)}
        />
      </div>

      {/* Modals */}
      <EvidenceUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onRefreshGraph={() => fetchGraphData(selectedCase)}
      />

      <ChainOfCustodyAudit
        isOpen={auditModalOpen}
        onClose={() => setAuditModalOpen(false)}
      />
    </div>
  );
}
