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
import Dashboard from './components/Dashboard';
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
  { source: 'PER_1001', target: 'PHN_9001', relationship: 'USES_PHONE', weight: 0.95, is_high_risk: true },
  { source: 'PER_1001', target: 'ORG_5002', relationship: 'CONTROLS', weight: 0.90, is_high_risk: true },
  { source: 'PER_1001', target: 'PER_1002', relationship: 'ASSOCIATE_OF', weight: 0.85 },
  { source: 'PER_1002', target: 'PHN_9002', relationship: 'USES_PHONE', weight: 0.80 },
  { source: 'PER_1002', target: 'LOC_7001', relationship: 'FREQUENTS', weight: 0.88, is_high_risk: true },
  { source: 'PER_1003', target: 'LOC_7001', relationship: 'MEETS_AT', weight: 0.75 },
  { source: 'PER_1003', target: 'ORG_5002', relationship: 'EMPLOYED_BY', weight: 0.70 },
  { source: 'PER_1004', target: 'VEH_4001', relationship: 'DRIVES', weight: 0.82 },
  { source: 'PER_1004', target: 'PHN_9003', relationship: 'USES_PHONE', weight: 0.75 },
  { source: 'PER_1001', target: 'VEH_4001', relationship: 'OWNED_BY', weight: 0.89, is_high_risk: true }
];

const FINANCIAL_FRAUD_NODES = [
  { id: 'ORG_5002', name: 'Apex Global Logistics', label: 'Apex Global Logistics', type: 'Organization', threat_score: 94, alias: 'Front Syndicate', x: 260, y: 180 },
  { id: 'ACC_9901', name: 'Dharavi Shell Account #4102', label: 'Dharavi Shell Account #4102', type: 'BankAccount', threat_score: 89, alias: 'Mule Account', x: 120, y: 300 },
  { id: 'PER_1004', name: 'Vijay Mallya @MuleHandler', label: 'Vijay Mallya @MuleHandler', type: 'Person', threat_score: 92, alias: 'Financial Director', phone: '+91 9811223344', x: 400, y: 320 },
  { id: 'LOC_7005', name: 'Hawala Transit Node B-7', label: 'Hawala Transit Node B-7', type: 'Location', threat_score: 88, alias: 'Cash Hub', x: 500, y: 220 },
  { id: 'BTC_3301', name: 'Swiss Offshore Crypto Wallet', label: 'Swiss Offshore Crypto Wallet', type: 'CryptoWallet', threat_score: 95, alias: 'Darknet Vault', x: 220, y: 390 },
  { id: 'ORG_5008', name: 'Kolkata Shell Paper Corp', label: 'Kolkata Shell Paper Corp', type: 'Organization', threat_score: 85, alias: 'Dummy Front', x: 150, y: 100 },
  { id: 'ACC_9905', name: 'Axis Mule Bank #9988', label: 'Axis Mule Bank #9988', type: 'BankAccount', threat_score: 80, alias: 'Layering Account', x: 340, y: 80 },
  { id: 'LOC_7009', name: 'Dubai Currency Exchange', label: 'Dubai Currency Exchange', type: 'Location', threat_score: 91, alias: 'Overseas Hub', x: 460, y: 390 },
  { id: 'PER_1001', name: 'Rashid Khan @Bhai', label: 'Rashid Khan @Bhai', type: 'Person', threat_score: 95, alias: 'Syndicate Kingpin', phone: '+91 9876543210', x: 50, y: 200 },
  { id: 'PER_1002', name: 'Sanjay Dutt @Sanju', label: 'Sanjay Dutt @Sanju', type: 'Person', threat_score: 82, alias: 'Cash Runner', phone: '+91 9812345678', x: 280, y: 440 }
];

const FINANCIAL_FRAUD_EDGES = [
  { source: 'PER_1001', target: 'ORG_5002', relationship: 'BENEFICIAL_OWNER', weight: 0.98, is_high_risk: true },
  { source: 'ORG_5002', target: 'ACC_9901', relationship: 'CIRCULAR_TRANSFER', weight: 0.95, is_high_risk: true },
  { source: 'ACC_9901', target: 'PER_1004', relationship: 'FUNDS_WITHDRAWAL', weight: 0.92, is_high_risk: true },
  { source: 'PER_1004', target: 'BTC_3301', relationship: 'CRYPTO_CONVERSION', weight: 0.96, is_high_risk: true },
  { source: 'BTC_3301', target: 'LOC_7009', relationship: 'OVERSEAS_REMITTANCE', weight: 0.94, is_high_risk: true },
  { source: 'ORG_5002', target: 'ORG_5008', relationship: 'SHELL_INVOICING', weight: 0.88 },
  { source: 'ORG_5008', target: 'ACC_9905', relationship: 'LAYERING_TRANSFER', weight: 0.90, is_high_risk: true },
  { source: 'PER_1002', target: 'LOC_7005', relationship: 'CASH_HANDOVER', weight: 0.85 },
  { source: 'LOC_7005', target: 'ACC_9901', relationship: 'HAWALA_DEPOSIT', weight: 0.93, is_high_risk: true },
  { source: 'PER_1001', target: 'PER_1002', relationship: 'COMMANDS', weight: 0.91, is_high_risk: true }
];

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '30px', background: '#0f172a', color: '#fff', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2 style={{ color: '#ef4444' }}>⚠️ System Warning: Module Re-initialized</h2>
          <p style={{ color: '#94a3b8' }}>{this.state.error ? this.state.error.toString() : 'An unexpected view error occurred.'}</p>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: '20px', padding: '10px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            🔄 Reload Surveillance Portal
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function AppWithBoundary(props) {
  return (
    <ErrorBoundary>
      <App {...props} />
    </ErrorBoundary>
  );
}

function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialRole = urlParams.get('role') || 'public';
  const initialView = urlParams.get('mode') === 'portal' || urlParams.has('role') ? 'main' : 'landing';

  const [view, setView] = useState(initialView); // 'landing' | 'main'
  const [userRole, setUserRole] = useState(initialRole); // 'public' | 'admin'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard-tab');
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
    if (caseId === 'CASE-DATASET-002' || caseId === 'CASE-002') {
      setNodesData(FINANCIAL_FRAUD_NODES);
      setEdgesData(FINANCIAL_FRAUD_EDGES);
      setIsApiConnected(true);
      return;
    }

    const url = caseId && caseId !== 'ALL' 
      ? `${API_BASE_URL}/api/graph?case_id=${encodeURIComponent(caseId)}` 
      : `${API_BASE_URL}/api/graph`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.nodes && data.nodes.length > 0) {
          setNodesData(data.nodes);
        } else if (caseId === 'CASE-DATASET-002') {
          setNodesData(FINANCIAL_FRAUD_NODES);
        }

        if (data.edges && data.edges.length > 0) {
          setEdgesData(data.edges);
        } else if (caseId === 'CASE-DATASET-002') {
          setEdgesData(FINANCIAL_FRAUD_EDGES);
        }
        setIsApiConnected(true);
      })
      .catch(() => {
        if (caseId === 'CASE-DATASET-002') {
          setNodesData(FINANCIAL_FRAUD_NODES);
          setEdgesData(FINANCIAL_FRAUD_EDGES);
        }
        setIsApiConnected(false);
      });
  };

  const fetchCases = () => {
    const datasetDefaults = [
      { case_id: 'CASE-001', title: 'Case #001: Primary Suspect Network [Dataset]', node_count: 149, is_dataset: true },
      { case_id: 'CASE-DATASET-002', title: 'Case #002: Financial Fraud & Money Laundering [Dataset]', node_count: 120, is_dataset: true }
    ];

    fetch(`${API_BASE_URL}/api/cases`)
      .then(res => res.json())
      .then(data => {
        if (data.cases && data.cases.length > 0) {
          const existingIds = new Set(data.cases.map(c => c.case_id));
          const missingDefaults = datasetDefaults.filter(d => !existingIds.has(d.case_id));
          setCasesList([...missingDefaults, ...data.cases]);
        } else {
          setCasesList(datasetDefaults);
        }
      })
      .catch(() => {
        setCasesList(datasetDefaults);
      });
  };

  const handleQuickUpdateGraph = (newNodes, newEdges, rawText) => {
    let nodesToAdd = [...newNodes];
    let edgesToAdd = [...newEdges];

    if (rawText) {
      const textClean = rawText.trim();
      const relPatterns = [
        { regex: /(.+?)\s+(?:has\s+|have\s+|recently\s+)?(?:contacted\s+with|contacted|called|spoke\s+with|telephoned|phoned)\s+(.+)/i, rel: 'CONTACTED' },
        { regex: /(.+?)\s+(?:has\s+|have\s+|recently\s+)?(?:met\s+with|met|spotted\s+with|seen\s+with)\s+(.+)/i, rel: 'SPOTTED_WITH' },
        { regex: /(.+?)\s+(?:has\s+|have\s+|recently\s+)?(?:paid|transferred\s+funds\s+to|sent\s+money\s+to|transferred\s+to)\s+(.+)/i, rel: 'FINANCIAL_TRANSFER' },
        { regex: /(.+?)\s+(?:has\s+|have\s+|recently\s+)?(?:associated\s+with|linked\s+to|connected\s+to)\s+(.+)/i, rel: 'ASSOCIATED_WITH' }
      ];

      let extractedNames = [];
      let relLabel = "CONTACTED";
      let matched = false;

      for (let p of relPatterns) {
        const m = textClean.match(p.regex);
        if (m) {
          const filler = /^(?:accused|suspect|target|mr|mrs|dr|at|in|near|the)\s+/i;
          const p1 = m[1].replace(filler, '').trim();
          const p2 = m[2].replace(filler, '').trim();

          const name1 = p1.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
          const name2 = p2.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

          if (name1 && name2) {
            extractedNames = [name1, name2];
            relLabel = p.rel;
            matched = true;
            break;
          }
        }
      }

      if (!matched) {
        const stopwords = new Set(["has", "have", "recently", "contacted", "called", "met", "spoke", "with", "to", "from", "and", "the", "in", "at", "near", "on", "of", "for", "is", "was", "they", "he", "she", "it", "case", "update", "fir", "new", "yesterday", "today"]);
        const words = textClean.match(/\b[A-Za-z]+\b/g) || [];
        const cleanWords = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).filter(w => !stopwords.has(w.toLowerCase()));
        if (cleanWords.length >= 2) {
          extractedNames = [cleanWords[0], cleanWords[1]];
        } else if (cleanWords.length === 1) {
          extractedNames = [cleanWords[0]];
        }
      }

      if (extractedNames.length >= 2) {
        const n1Name = extractedNames[0];
        const n2Name = extractedNames[1];

        let n1 = nodesData.find(n => n.name && n.name.toLowerCase() === n1Name.toLowerCase()) ||
                 nodesToAdd.find(n => n.name && n.name.toLowerCase() === n1Name.toLowerCase());
        let n2 = nodesData.find(n => n.name && n.name.toLowerCase() === n2Name.toLowerCase()) ||
                 nodesToAdd.find(n => n.name && n.name.toLowerCase() === n2Name.toLowerCase());

        if (!n1) {
          n1 = {
            id: `PER_${n1Name.toUpperCase().replace(/\s+/g, '_')}_${Math.floor(Math.random() * 1000)}`,
            name: n1Name,
            label: n1Name,
            type: 'Person',
            threat_score: 82,
            x: 280,
            y: 220
          };
          nodesToAdd.push(n1);
        }

        if (!n2) {
          n2 = {
            id: `PER_${n2Name.toUpperCase().replace(/\s+/g, '_')}_${Math.floor(Math.random() * 1000)}`,
            name: n2Name,
            label: n2Name,
            type: 'Person',
            threat_score: 75,
            x: 420,
            y: 280
          };
          nodesToAdd.push(n2);
        }

        edgesToAdd.push({
          source: n1.id,
          target: n2.id,
          relationship: relLabel,
          label: relLabel,
          weight: 0.9,
          is_high_risk: true
        });
      }
    }

    if (nodesToAdd.length > 0) {
      setNodesData(prev => {
        const existingIds = new Set(prev.map(n => n.id));
        const filteredNew = nodesToAdd.map(n => ({
          ...n,
          label: n.name || n.label,
          type: n.type || 'Person'
        })).filter(n => !existingIds.has(n.id));
        return [...prev, ...filteredNew];
      });
    }

    if (edgesToAdd.length > 0) {
      setEdgesData(prev => {
        const existingKeys = new Set(prev.map(e => `${e.source}->${e.target}`));
        const filteredNew = edgesToAdd.map(e => ({
          source: e.source,
          target: e.target,
          relationship: e.label || e.relationship || 'CONNECTED',
          label: e.label || e.relationship || 'CONNECTED',
          weight: e.weight || 0.9,
          is_high_risk: true
        })).filter(e => !existingKeys.has(`${e.source}->${e.target}`));
        return [...prev, ...filteredNew];
      });
    }
  };

  const handleDeleteNode = async (nodeId) => {
    try {
      await fetch(`${API_BASE_URL}/api/node/${encodeURIComponent(nodeId)}`, {
        method: 'DELETE'
      });
    } catch (e) {}

    setNodesData(prev => prev.filter(n => n.id !== nodeId));
    setEdgesData(prev => prev.filter(e => e.source !== nodeId && e.target !== nodeId));
    setSelectedNode(null);
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
            Target: {globalAdminAlert.name || 'Registered Target Suspect'}
          </div>
          <div style={{ fontSize: '12px', color: '#fee2e2' }}>
            Location: {globalAdminAlert.location_name || 'Live Checkpoint'}
          </div>
          <div style={{ fontSize: '11px', color: '#fef2f2', marginTop: '6px', fontWeight: 600 }}>
            Confidence: {globalAdminAlert.confidence ? (globalAdminAlert.confidence > 1 ? globalAdminAlert.confidence.toFixed(1) : (globalAdminAlert.confidence * 100).toFixed(1)) : '95.8'}% &bull; Live GPS Sync Active
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
        onSelectNode={(node) => {
          setSelectedNode(node);
          setActiveTab('graph-tab');
        }}
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
            <h3 style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
              Intelligence Modules
            </h3>
            <div className="module-nav" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              
              <button
                className={`nav-btn ${activeTab === 'dashboard-tab' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard-tab')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: activeTab === 'dashboard-tab' ? 800 : 600,
                  color: activeTab === 'dashboard-tab' ? '#ffffff' : '#475569',
                  background: activeTab === 'dashboard-tab' ? '#b91c1c' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  boxShadow: activeTab === 'dashboard-tab' ? '0 2px 6px rgba(185, 28, 28, 0.3)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>📊</span> Dashboard
              </button>

              <button
                className={`nav-btn ${activeTab === 'graph-tab' ? 'active' : ''}`}
                onClick={() => setActiveTab('graph-tab')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: activeTab === 'graph-tab' ? 800 : 600,
                  color: activeTab === 'graph-tab' ? '#ffffff' : '#475569',
                  background: activeTab === 'graph-tab' ? '#b91c1c' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  boxShadow: activeTab === 'graph-tab' ? '0 2px 6px rgba(185, 28, 28, 0.3)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>🕸️</span> Network Topology Visualizer
              </button>


              <button
                className={`nav-btn ${activeTab === 'resolution-tab' ? 'active' : ''}`}
                onClick={() => setActiveTab('resolution-tab')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: activeTab === 'resolution-tab' ? 800 : 600,
                  color: activeTab === 'resolution-tab' ? '#ffffff' : '#475569',
                  background: activeTab === 'resolution-tab' ? '#b91c1c' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  boxShadow: activeTab === 'resolution-tab' ? '0 2px 6px rgba(185, 28, 28, 0.3)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>🎯</span> Entity Resolution & Merges
              </button>

              <button
                className={`nav-btn ${activeTab === 'path-tab' ? 'active' : ''}`}
                onClick={() => setActiveTab('path-tab')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: activeTab === 'path-tab' ? 800 : 600,
                  color: activeTab === 'path-tab' ? '#ffffff' : '#475569',
                  background: activeTab === 'path-tab' ? '#b91c1c' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  boxShadow: activeTab === 'path-tab' ? '0 2px 6px rgba(185, 28, 28, 0.3)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>🛤️</span> Shortest Path & Bottlenecks
              </button>

              <button
                className={`nav-btn ${activeTab === 'kingpin-tab' ? 'active' : ''}`}
                onClick={() => setActiveTab('kingpin-tab')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: activeTab === 'kingpin-tab' ? 800 : 600,
                  color: activeTab === 'kingpin-tab' ? '#ffffff' : '#475569',
                  background: activeTab === 'kingpin-tab' ? '#b91c1c' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  boxShadow: activeTab === 'kingpin-tab' ? '0 2px 6px rgba(185, 28, 28, 0.3)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>💰</span> Kingpin & Dark Money Analytics
              </button>

              <button
                className={`nav-btn ${activeTab === 'facial-tab' ? 'active' : ''}`}
                onClick={() => setActiveTab('facial-tab')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: activeTab === 'facial-tab' ? 800 : 600,
                  color: activeTab === 'facial-tab' ? '#ffffff' : '#475569',
                  background: activeTab === 'facial-tab' ? '#b91c1c' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  boxShadow: activeTab === 'facial-tab' ? '0 2px 6px rgba(185, 28, 28, 0.3)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>📷</span> Facial Scanner & Geo-Map
              </button>
            </div>
          </div>

          {/* Render Graph Filters & Legend in Left Sidebar ONLY when Network Topology Visualizer is active */}
          {activeTab === 'graph-tab' && (
            <div className="sidebar-section" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                Graph Filters & Legend
              </h3>
              
              <div className="filter-group" style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Filter Entity Type:
                </label>
                <select
                  value={entityFilter}
                  onChange={(e) => setEntityFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#0f172a',
                    background: '#ffffff',
                    outline: 'none'
                  }}
                >
                  <option value="ALL">All Entities</option>
                  <option value="Person">Suspects / Persons</option>
                  <option value="Phone">Phone Numbers / CDR</option>
                  <option value="Vehicle">Vehicles</option>
                  <option value="Location">Locations / Hideouts</option>
                  <option value="Organization">Front Orgs / Syndicates</option>
                  <option value="NewsEvent">OSINT News Events</option>
                </select>
              </div>

              <div className="filter-group" style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  <span>Threat Level Threshold:</span>
                  <span style={{ color: '#b91c1c', fontWeight: 800 }}>{threatFilter}+</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="5"
                  value={threatFilter}
                  onChange={(e) => setThreatFilter(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: '#2563eb', cursor: 'pointer' }}
                />
              </div>

              <div className="entity-legend" style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', marginTop: '12px' }}>
                <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#0f172a', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Node Color Representation
                </div>
                <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', marginBottom: '8px', fontWeight: 600, color: '#334155' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#dc2626', display: 'inline-block', flexShrink: 0 }}></span> 
                  <span>Red: Suspect / Person Entity</span>
                </div>
                <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', marginBottom: '8px', fontWeight: 600, color: '#334155' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb', display: 'inline-block', flexShrink: 0 }}></span> 
                  <span>Blue: Phone Number / CDR</span>
                </div>
                <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', marginBottom: '8px', fontWeight: 600, color: '#334155' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#d97706', display: 'inline-block', flexShrink: 0 }}></span> 
                  <span>Orange: Vehicle Node</span>
                </div>
                <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', marginBottom: '8px', fontWeight: 600, color: '#334155' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a', display: 'inline-block', flexShrink: 0 }}></span> 
                  <span>Green: Location / Safehouse</span>
                </div>
                <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', marginBottom: '8px', fontWeight: 600, color: '#334155' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#9333ea', display: 'inline-block', flexShrink: 0 }}></span> 
                  <span>Purple: Syndicate / Front Org</span>
                </div>
                <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', fontWeight: 600, color: '#334155' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#991b1b', display: 'inline-block', flexShrink: 0 }}></span> 
                  <span>Crimson: OSINT News Event</span>
                </div>
              </div>
            </div>
          )}
        </aside>

        <main className="workspace">
          {activeTab === 'dashboard-tab' && (
            <Dashboard
              onNavigate={(tabId) => {
                if (tabId === 'upload') setUploadModalOpen(true);
                else if (tabId === 'audit') setAuditModalOpen(true);
                else setActiveTab(tabId);
              }}
            />
          )}

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
                onQuickUpdateGraph={handleQuickUpdateGraph}
              />

              <NetworkTopology
                nodesData={nodesData}
                edgesData={edgesData}
                selectedNode={selectedNode}
                onSelectNode={(node) => setSelectedNode(node)}
                entityFilter={entityFilter}
                onEntityFilterChange={setEntityFilter}
                threatFilter={threatFilter}
                onThreatFilterChange={setThreatFilter}
              />
            </section>
          )}

          {activeTab === 'facial-tab' && (
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
                    <h2>Facial Scanner & Live GPS Geographical Map</h2>
                    <span className="sub-title">Laptop Camera Target Recognition & Real-time Sighting Heatmaps</span>
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
                    title="Expand map to full width by hiding sidebar"
                  >
                    <span>⚡</span> Expand Full Map (Hide Sidebar)
                  </button>
                )}
              </div>
              <FacialScannerGeoMap nodesData={nodesData} userRole={userRole} />
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

        {activeTab === 'graph-tab' && (
          <SuspectDossier
            selectedNode={selectedNode}
            edgesData={edgesData}
            onClose={() => setSelectedNode(null)}
            onDeleteNode={handleDeleteNode}
          />
        )}
      </div>

      {/* Modals */}
      <EvidenceUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onRefreshGraph={() => fetchGraphData(selectedCase)}
        onUploadPdfSuccess={({ caseId, caseTitle, nodes, edges }) => {
          const newCaseEntry = {
            case_id: caseId,
            title: caseTitle || `Case #${caseId}: FIR PDF Intelligence Cluster`,
            node_count: nodes ? nodes.length : 8,
            is_dataset: false
          };

          setCasesList(prev => {
            const exists = (prev || []).some(c => c.case_id === caseId);
            if (exists) return prev;
            return [newCaseEntry, ...(prev || [])];
          });

          if (nodes && nodes.length > 0) {
            setNodesData(nodes);
          }
          if (edges && edges.length > 0) {
            setEdgesData(edges);
          }

          setSelectedCase(caseId);
          setActiveTab('graph-tab');
          setUploadModalOpen(false);
        }}
      />

      <ChainOfCustodyAudit
        isOpen={auditModalOpen}
        onClose={() => setAuditModalOpen(false)}
      />
    </div>
  );
}
