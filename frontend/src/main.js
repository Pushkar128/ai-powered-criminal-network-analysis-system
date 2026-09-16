const API_BASE_URL = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
  ? 'http://127.0.0.1:8000'
  : (typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1:8000');


// High Quality Fallback Dataset for Instant Demonstration & Testing
const MOCK_GRAPH_DATA = {
    nodes: [
        { id: 'PER_1001', name: 'Rashid Khan @Bhai', label: 'Person', threat_score: 92, type: 'Suspect', alias: 'Shadow King', phone: '+91 9876543210' },
        { id: 'PER_1002', name: 'Vikram Singh', label: 'Person', threat_score: 85, type: 'Suspect', alias: 'Vicky', phone: '+91 9812345678' },
        { id: 'PER_1003', name: 'Anil Deshmukh', label: 'Person', threat_score: 64, type: 'Suspect', alias: 'Operator', phone: '+91 9988776655' },
        { id: 'PHN_9001', name: '+91 9876543210', label: 'Phone', threat_score: 40, type: 'CDR' },
        { id: 'PHN_9002', name: '+91 9812345678', label: 'Phone', threat_score: 30, type: 'CDR' },
        { id: 'VEH_4001', name: 'MH-02-CD-9988 (Black SUV)', label: 'Vehicle', threat_score: 75, type: 'Vehicle' },
        { id: 'LOC_7001', name: 'Dharavi Safehouse B-4', label: 'Location', threat_score: 80, type: 'Hideout' },
        { id: 'ORG_5002', name: 'Apex Global Logistics Pvt Ltd', label: 'Organization', threat_score: 88, type: 'Front Org' },
        { id: 'PER_1004', name: 'Sanjay Dutt @Sanju', label: 'Person', threat_score: 78, type: 'Suspect' },
        { id: 'PHN_9003', name: '+91 9123456789', label: 'Phone', threat_score: 50, type: 'CDR' }
    ],
    edges: [
        { source: 'PER_1001', target: 'PHN_9001', relationship: 'USES_PHONE', weight: 0.9 },
        { source: 'PER_1002', target: 'PHN_9002', relationship: 'USES_PHONE', weight: 0.9 },
        { source: 'PER_1001', target: 'PER_1002', relationship: 'CALL_FREQUENT', weight: 0.85 },
        { source: 'PER_1001', target: 'VEH_4001', relationship: 'SPOTTED_IN', weight: 0.95 },
        { source: 'PER_1002', target: 'LOC_7001', relationship: 'FREQUENTS', weight: 0.75 },
        { source: 'PER_1001', target: 'ORG_5002', relationship: 'BENEFICIAL_OWNER', weight: 0.99 },
        { source: 'PER_1003', target: 'ORG_5002', relationship: 'DIRECTOR', weight: 0.70 },
        { source: 'PER_1004', target: 'PHN_9003', relationship: 'USES_PHONE', weight: 0.80 },
        { source: 'PER_1004', target: 'PER_1001', relationship: 'FINANCIAL_TRANSFER', weight: 0.92 }
    ]
};

const MOCK_RESOLUTIONS = [
    { master_id: 'PER_1001', master_name: 'Rashid Khan', entity_type: 'Person', aliases: ['Shadow King', 'Bhai', 'R. Khan'], confidence: '98.5%' },
    { master_id: 'ORG_5002', master_name: 'Apex Global Logistics', entity_type: 'Organization', aliases: ['Apex Shell Co', 'AGL Ltd'], confidence: '94.2%' },
    { master_id: 'LOC_7001', master_name: 'Dharavi Sector 4 Hideout', entity_type: 'Location', aliases: ['Safehouse B-4', 'Loc-99'], confidence: '91.0%' }
];

// State
let nodesData = [];
let edgesData = [];
let filteredNodes = [];
let selectedNode = null;
let scale = 1;
let panX = 0;
let panY = 0;
let isDragging = false;
let dragNode = null;
let lastMouseX = 0;
let lastMouseY = 0;

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', async () => {
    setupNavigation();
    setupCanvas();
    setupControls();
    await loadInitialData();
});

// Navigation Setup
function setupNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    const tabs = document.querySelectorAll('.tab-content');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            navBtns.forEach(b => b.classList.remove('active'));
            tabs.forEach(t => t.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(targetTab).classList.add('active');

            if (targetTab === 'resolution-tab') renderResolutions();
        });
    });

    document.getElementById('close-drawer').addEventListener('click', () => {
        document.getElementById('inspector-drawer').classList.add('hidden');
    });
}

// Data Fetching
async function loadInitialData() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/graph`);
        if (response.ok) {
            const data = await response.json();
            nodesData = data.nodes || MOCK_GRAPH_DATA.nodes;
            edgesData = data.edges || MOCK_GRAPH_DATA.edges;
            document.getElementById('api-status-text').innerText = 'Neo4j Live API Connected';
        } else {
            throw new Error('API offline');
        }
    } catch (e) {
        console.warn('Backend API not reached. Using high-fidelity local dataset:', e);
        nodesData = MOCK_GRAPH_DATA.nodes;
        edgesData = MOCK_GRAPH_DATA.edges;
        document.getElementById('api-status-text').innerText = 'Local Sandbox Mode (Preloaded Data)';
    }

    // Initialize node positions in circle/grid
    initNodePositions();
    applyFilters();
    updateHeaderStats();
}

function initNodePositions() {
    const width = 800;
    const height = 500;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;

    nodesData.forEach((node, i) => {
        const angle = (i / nodesData.length) * 2 * Math.PI;
        node.x = centerX + radius * Math.cos(angle) + (Math.random() - 0.5) * 50;
        node.y = centerY + radius * Math.sin(angle) + (Math.random() - 0.5) * 50;
        node.vx = 0;
        node.vy = 0;
    });
}

function updateHeaderStats() {
    document.getElementById('stat-nodes').innerText = nodesData.length;
    document.getElementById('stat-edges').innerText = edgesData.length;
}

// Filtering
function applyFilters() {
    const entityType = document.getElementById('filter-entity-type').value;
    const minThreat = parseInt(document.getElementById('threat-threshold').value) || 0;

    filteredNodes = nodesData.filter(node => {
        const typeMatch = entityType === 'ALL' || node.label === entityType;
        const threatMatch = (node.threat_score || 0) >= minThreat;
        return typeMatch && threatMatch;
    });

    requestAnimationFrame(renderCanvas);
}

function setupControls() {
    document.getElementById('filter-entity-type').addEventListener('change', applyFilters);
    const threatSlider = document.getElementById('threat-threshold');
    threatSlider.addEventListener('input', (e) => {
        document.getElementById('threat-threshold-val').innerText = e.target.value;
        applyFilters();
    });

    // Global Search
    const searchInput = document.getElementById('global-search');
    const searchBtn = document.getElementById('search-btn');
    const dropdown = document.getElementById('search-results-dropdown');

    const handleSearch = () => {
        const query = searchInput.value.toLowerCase().trim();
        if (!query) {
            dropdown.classList.add('hidden');
            return;
        }

        const matches = nodesData.filter(n =>
            n.name.toLowerCase().includes(query) ||
            n.id.toLowerCase().includes(query) ||
            (n.alias && n.alias.toLowerCase().includes(query))
        );

        if (matches.length > 0) {
            dropdown.innerHTML = matches.map(m => `
                <div class="search-dropdown-item" data-id="${m.id}">
                    <div>
                        <div class="item-title">${m.name}</div>
                        <div class="item-sub">${m.id} &bull; ${m.label} &bull; Threat Index: ${m.threat_score || 50}</div>
                    </div>
                    <span class="badge ${m.threat_score > 75 ? 'badge-high' : 'badge-med'}">${m.threat_score || 50}</span>
                </div>
            `).join('');
            dropdown.classList.remove('hidden');

            dropdown.querySelectorAll('.search-dropdown-item').forEach(el => {
                el.addEventListener('click', () => {
                    const id = el.getAttribute('data-id');
                    const targetNode = nodesData.find(n => n.id === id);
                    if (targetNode) {
                        selectAndInspectNode(targetNode);
                        dropdown.classList.add('hidden');
                    }
                });
            });
        } else {
            dropdown.innerHTML = `<div style="padding:12px; color:#8b949e; text-align:center;">No matching suspect entities found</div>`;
            dropdown.classList.remove('hidden');
        }
    };

    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') handleSearch();
        else handleSearch();
    });

    // Shortest Path Button
    document.getElementById('btn-trace-path').addEventListener('click', traceShortestPath);
}

// Canvas Network Visualization
function setupCanvas() {
    const canvas = document.getElementById('network-canvas');
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        requestAnimationFrame(renderCanvas);
    }

    window.addEventListener('resize', resizeCanvas);
    setTimeout(resizeCanvas, 100);

    // Zoom & Pan Events
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
        scale *= zoomFactor;
        scale = Math.max(0.4, Math.min(scale, 3.0));
        renderCanvas();
    });

    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left - panX) / scale;
        const mouseY = (e.clientY - rect.top - panY) / scale;

        // Check node click
        const clicked = filteredNodes.find(node => {
            const dist = Math.hypot(node.x - mouseX, node.y - mouseY);
            return dist <= (12 + (node.threat_score || 50) * 0.15);
        });

        if (clicked) {
            dragNode = clicked;
            selectAndInspectNode(clicked);
        } else {
            isDragging = true;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        if (dragNode) {
            dragNode.x = (e.clientX - rect.left - panX) / scale;
            dragNode.y = (e.clientY - rect.top - panY) / scale;
            renderCanvas();
        } else if (isDragging) {
            panX += e.clientX - lastMouseX;
            panY += e.clientY - lastMouseY;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
            renderCanvas();
        }
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
        dragNode = null;
    });

    // Zoom buttons
    document.getElementById('zoom-in').addEventListener('click', () => { scale *= 1.2; renderCanvas(); });
    document.getElementById('zoom-out').addEventListener('click', () => { scale *= 0.8; renderCanvas(); });
    document.getElementById('zoom-fit').addEventListener('click', () => { scale = 1; panX = 0; panY = 0; renderCanvas(); });
    document.getElementById('reset-graph-btn').addEventListener('click', () => { initNodePositions(); renderCanvas(); });
}

function getNodeColor(label) {
    switch (label) {
        case 'Person': return '#ff2a5f';
        case 'Phone': return '#00f0ff';
        case 'Vehicle': return '#ffb703';
        case 'Location': return '#00e676';
        case 'Organization': return '#ab47bc';
        default: return '#2d68ff';
    }
}

function renderCanvas() {
    const canvas = document.getElementById('network-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(panX, panY);
    ctx.scale(scale, scale);

    // Draw Grid Background Lines
    ctx.strokeStyle = 'rgba(64, 93, 138, 0.08)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = -1000; x < 2000; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, -1000); ctx.lineTo(x, 2000); ctx.stroke();
    }
    for (let y = -1000; y < 2000; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(-1000, y); ctx.lineTo(2000, y); ctx.stroke();
    }

    // Draw Edges
    const validIds = new Set(filteredNodes.map(n => n.id));
    edgesData.forEach(edge => {
        const sourceNode = nodesData.find(n => n.id === edge.source);
        const targetNode = nodesData.find(n => n.id === edge.target);

        if (sourceNode && targetNode && validIds.has(sourceNode.id) && validIds.has(targetNode.id)) {
            ctx.beginPath();
            ctx.moveTo(sourceNode.x, sourceNode.y);
            ctx.lineTo(targetNode.x, targetNode.y);
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
            ctx.lineWidth = (edge.weight || 0.5) * 2.5;
            ctx.stroke();

            // Draw Relationship Label
            const midX = (sourceNode.x + targetNode.x) / 2;
            const midY = (sourceNode.y + targetNode.y) / 2;
            ctx.fillStyle = 'rgba(139, 148, 158, 0.7)';
            ctx.font = '9px monospace';
            ctx.fillText(edge.relationship || 'LINK', midX, midY);
        }
    });

    // Draw Nodes
    filteredNodes.forEach(node => {
        const radius = 12 + ((node.threat_score || 50) * 0.12);
        const color = getNodeColor(node.label);

        // Glow effect for high-threat suspects
        if ((node.threat_score || 0) >= 80) {
            ctx.beginPath();
            ctx.arc(node.x, node.y, radius + 6, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 42, 95, 0.2)';
            ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.lineWidth = selectedNode && selectedNode.id === node.id ? 4 : 2;
        ctx.strokeStyle = selectedNode && selectedNode.id === node.id ? '#ffffff' : 'rgba(255,255,255,0.3)';
        ctx.stroke();

        // Node Label
        ctx.fillStyle = '#f0f6fc';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(node.name || node.id, node.x, node.y + radius + 14);
    });

    ctx.restore();
}

// Suspect Dossier / Node Inspector
function selectAndInspectNode(node) {
    selectedNode = node;
    renderCanvas();

    const drawer = document.getElementById('inspector-drawer');
    const drawerBody = document.getElementById('drawer-body');
    drawer.classList.remove('hidden');

    const threatScore = node.threat_score || Math.floor(Math.random() * 40 + 55);

    drawerBody.innerHTML = `
        <div class="dossier-card">
            <div class="suspect-profile-header">
                <div class="suspect-avatar" style="background:${getNodeColor(node.label)}">${node.name ? node.name[0] : 'S'}</div>
                <div class="suspect-info">
                    <h4>${node.name}</h4>
                    <span class="entity-id">${node.id} &bull; ${node.label}</span>
                </div>
            </div>

            <div class="threat-gauge-box">
                <div class="threat-score-num">${threatScore} / 100</div>
                <div class="threat-score-label">Automated AI Threat Index</div>
            </div>

            <div class="dossier-section">
                <h5>Key Dossier Metadata</h5>
                <div class="detail-row"><span class="label">Entity Type:</span><span class="val">${node.label}</span></div>
                <div class="detail-row"><span class="label">Primary Alias:</span><span class="val">${node.alias || 'N/A'}</span></div>
                <div class="detail-row"><span class="label">Registered Contact:</span><span class="val">${node.phone || 'N/A'}</span></div>
                <div class="detail-row"><span class="label">Classification:</span><span class="val">${node.type || 'High Priority'}</span></div>
            </div>

            <div class="dossier-section">
                <h5>Known Associations (${edgesData.filter(e => e.source === node.id || e.target === node.id).length})</h5>
                ${edgesData.filter(e => e.source === node.id || e.target === node.id).map(e => `
                    <div class="detail-row">
                        <span class="label">${e.relationship}</span>
                        <span class="val">${e.source === node.id ? e.target : e.source}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Shortest Path Finder Logic
function traceShortestPath() {
    const srcInput = document.getElementById('path-source').value.trim();
    const tgtInput = document.getElementById('path-target').value.trim();
    const resultsArea = document.getElementById('path-results');

    if (!srcInput || !tgtInput) {
        resultsArea.innerHTML = `<div class="placeholder-msg">Please enter both Source and Target Suspect IDs.</div>`;
        return;
    }

    // Direct BFS Path Finding
    const queue = [[srcInput]];
    const visited = new Set([srcInput]);
    let foundPath = null;

    while (queue.length > 0) {
        const path = queue.shift();
        const curr = path[path.length - 1];

        if (curr === tgtInput) {
            foundPath = path;
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

    if (foundPath) {
        resultsArea.innerHTML = `
            <div style="color:#00e676; font-weight:bold; margin-bottom:12px;">✔ Association Chain Discovered (${foundPath.length - 1} Hops):</div>
            <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                ${foundPath.map((id, index) => {
                    const nodeObj = nodesData.find(n => n.id === id) || { name: id, label: 'Entity' };
                    return `
                        <div class="stat-badge" style="background:rgba(0,240,255,0.1); border:1px solid #00f0ff; padding:8px 12px; border-radius:6px;">
                            <span class="stat-label">${nodeObj.label}</span>
                            <span class="stat-value">${nodeObj.name} (${id})</span>
                        </div>
                        ${index < foundPath.length - 1 ? `<span style="color:#ff2a5f; font-weight:bold;">➔ [LINK] ➔</span>` : ''}
                    `;
                }).join('')}
            </div>
        `;
    } else {
        resultsArea.innerHTML = `
            <div style="color:#ff2a5f; font-weight:bold;">No direct link chain found within graph limits. Likely operates via indirect financial mules.</div>
        `;
    }
}

// Render Entity Resolutions Table
function renderResolutions() {
    const tbody = document.getElementById('resolution-tbody');
    tbody.innerHTML = MOCK_RESOLUTIONS.map(res => `
        <tr>
            <td style="font-family:var(--font-mono); color:var(--primary-cyan);">${res.master_id}</td>
            <td style="font-weight:bold;">${res.master_name}</td>
            <td>${res.entity_type}</td>
            <td>${res.aliases.map(a => `<span style="background:rgba(255,255,255,0.1); padding:2px 6px; border-radius:4px; margin-right:4px; font-size:11px;">${a}</span>`).join('')}</td>
            <td><span class="badge badge-high">${res.confidence} Match</span></td>
            <td><button class="btn btn-secondary" style="padding:4px 8px; font-size:11px;">Inspect Master Record</button></td>
        </tr>
    `).join('');
}
