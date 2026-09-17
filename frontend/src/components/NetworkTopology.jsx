import React, { useRef, useEffect, useState } from 'react';

export default function NetworkTopology({ nodesData, edgesData, selectedNode, onSelectNode, entityFilter, threatFilter }) {
  const canvasRef = useRef(null);
  const [scale, setScale] = useState(0.9);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragNode, setDragNode] = useState(null);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 800, height: 600 });

  // Dynamically assign organized concentric spherical ring coordinates to nodes
  useEffect(() => {
    if (!nodesData || nodesData.length === 0) return;
    const center = { x: 300, y: 220 };

    const ring0 = []; // Core Kingpins (threat >= 85)
    const ring1 = []; // Suspect Persons
    const ring2 = []; // Phones & Vehicles
    const ring3 = []; // Locations, Orgs, News Events

    nodesData.forEach((node) => {
      const rawType = (node.type || node.label || '').toUpperCase();
      const threat = node.threat_score || 50;

      if (threat >= 85 && (rawType.includes('PERSON') || rawType.includes('SUSPECT'))) {
        ring0.push(node);
      } else if (rawType.includes('PERSON') || rawType.includes('SUSPECT')) {
        ring1.push(node);
      } else if (rawType.includes('PHONE') || rawType.includes('CDR') || rawType.includes('PHN') || rawType.includes('VEHICLE') || rawType.includes('VEH')) {
        ring2.push(node);
      } else {
        ring3.push(node);
      }
    });

    // Place Ring 0 (Center Hub - Radius 75)
    ring0.forEach((node, i) => {
      const angle = (i / Math.max(1, ring0.length)) * 2 * Math.PI - Math.PI / 2;
      const r = ring0.length === 1 ? 0 : 75;
      node.x = center.x + r * Math.cos(angle);
      node.y = center.y + r * Math.sin(angle);
    });

    // Place Ring 1 (Radius 165)
    ring1.forEach((node, i) => {
      const angle = (i / Math.max(1, ring1.length)) * 2 * Math.PI - Math.PI / 2 + 0.3;
      node.x = center.x + 165 * Math.cos(angle);
      node.y = center.y + 165 * Math.sin(angle);
    });

    // Place Ring 2 (Radius 255)
    ring2.forEach((node, i) => {
      const angle = (i / Math.max(1, ring2.length)) * 2 * Math.PI - Math.PI / 2 + 0.5;
      node.x = center.x + 255 * Math.cos(angle);
      node.y = center.y + 255 * Math.sin(angle);
    });

    // Place Ring 3 (Radius 340)
    ring3.forEach((node, i) => {
      const angle = (i / Math.max(1, ring3.length)) * 2 * Math.PI - Math.PI / 2 + 0.2;
      node.x = center.x + 340 * Math.cos(angle);
      node.y = center.y + 340 * Math.sin(angle);
    });
  }, [nodesData]);

  const getNodeColor = (node) => {
    const rawType = (node.type || node.label || '').toUpperCase();
    if (rawType.includes('PERSON') || rawType.includes('SUSPECT')) return '#dc2626'; // Red
    if (rawType.includes('PHONE') || rawType.includes('CDR') || rawType.includes('PHN')) return '#2563eb'; // Blue
    if (rawType.includes('VEHICLE') || rawType.includes('VEH')) return '#d97706'; // Amber
    if (rawType.includes('LOCATION') || rawType.includes('HIDEOUT') || rawType.includes('LOC')) return '#16a34a'; // Green
    if (rawType.includes('ORGANIZATION') || rawType.includes('ORG') || rawType.includes('SYNDICATE')) return '#7c3aed'; // Purple
    if (rawType.includes('NEWS') || rawType.includes('EVENT')) return '#e11d48'; // Rose
    return '#0284c7';
  };

  const filteredNodes = (nodesData || []).filter(node => {
    const rawType = (node.type || node.label || '').toUpperCase();
    
    let typeMatch = true;
    if (entityFilter !== 'ALL') {
      const target = entityFilter.toUpperCase();
      if (target === 'PERSON') typeMatch = rawType.includes('PERSON') || rawType.includes('SUSPECT');
      else if (target === 'PHONE') typeMatch = rawType.includes('PHONE') || rawType.includes('CDR') || rawType.includes('PHN');
      else if (target === 'VEHICLE') typeMatch = rawType.includes('VEHICLE') || rawType.includes('VEH');
      else if (target === 'LOCATION') typeMatch = rawType.includes('LOCATION') || rawType.includes('HIDEOUT') || rawType.includes('LOC');
      else if (target === 'ORGANIZATION') typeMatch = rawType.includes('ORGANIZATION') || rawType.includes('ORG') || rawType.includes('SYNDICATE');
      else if (target === 'NEWSEVENT') typeMatch = rawType.includes('NEWS') || rawType.includes('EVENT');
      else typeMatch = rawType.includes(target);
    }

    const threatMatch = (node.threat_score || node.degree || 0) >= threatFilter;
    return typeMatch && threatMatch;
  });

  // Canvas Sizing & Layout Measuring
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const measureAndSet = () => {
      if (canvas.parentElement) {
        const rect = canvas.parentElement.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          canvas.width = rect.width;
          canvas.height = rect.height;
          setCanvasDimensions({ width: rect.width, height: rect.height });
        }
      }
    };

    measureAndSet();
    const timer1 = setTimeout(measureAndSet, 50);
    const timer2 = setTimeout(measureAndSet, 200);

    const resizeObserver = new ResizeObserver(() => measureAndSet());
    if (canvas.parentElement) resizeObserver.observe(canvas.parentElement);

    const handleWheel = (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      setScale(s => Math.max(0.4, Math.min(s * zoomFactor, 2.5)));
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      resizeObserver.disconnect();
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Auto-center canvas on selected node when searched or clicked
  useEffect(() => {
    if (selectedNode && typeof selectedNode.x === 'number' && typeof selectedNode.y === 'number') {
      setPan({
        x: (300 - selectedNode.x) * scale,
        y: (220 - selectedNode.y) * scale
      });
    }
  }, [selectedNode, scale]);

  // Main Render Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const width = canvas.parentElement ? canvas.parentElement.clientWidth : canvasDimensions.width;
    const height = canvas.parentElement ? canvas.parentElement.clientHeight : canvasDimensions.height;
    if (width > 0 && height > 0 && (canvas.width !== width || canvas.height !== height)) {
      canvas.width = width;
      canvas.height = height;
    }

    const currentW = canvas.width || 800;
    const currentH = canvas.height || 600;

    ctx.clearRect(0, 0, currentW, currentH);
    ctx.save();
    
    const translateX = pan.x + (currentW / 2 - 300 * scale);
    const translateY = pan.y + (currentH / 2 - 220 * scale);

    ctx.translate(translateX, translateY);
    ctx.scale(scale, scale);

    // Draw Light Grid Background
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    for (let x = -1000; x < 2500; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, -1000); ctx.lineTo(x, 2500); ctx.stroke();
    }
    for (let y = -1000; y < 2500; y += 40) {
      ctx.beginPath(); ctx.moveTo(-1000, y); ctx.lineTo(2500, y); ctx.stroke();
    }

    // Draw Concentric Spherical Orbit Rings (matching reference topology)
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    [75, 165, 255, 340].forEach(r => {
      ctx.beginPath();
      ctx.arc(300, 220, r, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // Draw Edges
    const validIds = new Set(filteredNodes.map(n => n.id));
    (edgesData || []).forEach(edge => {
      const sNode = nodesData.find(n => n.id === edge.source);
      const tNode = nodesData.find(n => n.id === edge.target);

      if (sNode && tNode && sNode.x !== undefined && tNode.x !== undefined && validIds.has(sNode.id) && validIds.has(tNode.id)) {
        ctx.beginPath();
        ctx.moveTo(sNode.x, sNode.y);
        ctx.lineTo(tNode.x, tNode.y);
        ctx.strokeStyle = edge.is_high_risk ? '#ef4444' : '#94a3b8';
        ctx.lineWidth = (edge.weight || 0.5) * 2.5;
        ctx.stroke();

        const midX = (sNode.x + tNode.x) / 2;
        const midY = (sNode.y + tNode.y) / 2;
        ctx.fillStyle = edge.is_high_risk ? '#dc2626' : '#475569';
        ctx.font = 'bold 10px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(edge.label || edge.relationship || 'LINK', midX, midY);
      }
    });

    // Draw Nodes
    filteredNodes.forEach(node => {
      const nx = node.x !== undefined ? node.x : 300;
      const ny = node.y !== undefined ? node.y : 220;
      const radius = Math.max(16, Math.min(32, node.size || (16 + ((node.threat_score || node.degree || 5) * 0.3))));
      const color = getNodeColor(node);
      const isSelected = selectedNode && selectedNode.id === node.id;

      if ((node.threat_score || 0) >= 80 || node.is_high_risk) {
        ctx.beginPath();
        ctx.arc(nx, ny, radius + 8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(220, 38, 38, 0.2)';
        ctx.fill();
      }

      // Selection Halo
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(nx, ny, radius + 14, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(nx, ny, radius + 7, 0, Math.PI * 2);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 4;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(nx, ny, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.lineWidth = isSelected ? 4 : 2;
      ctx.strokeStyle = isSelected ? '#0f172a' : '#ffffff';
      ctx.stroke();

      // Clear dark slate label text on light background with 2-line wrapping for long news titles
      const labelName = node.label || node.name || node.id;
      ctx.font = 'bold 11px "Inter", sans-serif';
      ctx.textAlign = 'center';

      if (labelName.length > 28) {
        const words = labelName.split(' ');
        const mid = Math.ceil(words.length / 2);
        const line1 = words.slice(0, mid).join(' ');
        const line2 = words.slice(mid).join(' ');

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.strokeText(line1, nx, ny + radius + 14);
        ctx.strokeText(line2, nx, ny + radius + 27);

        ctx.fillStyle = '#0f172a';
        ctx.fillText(line1, nx, ny + radius + 14);
        ctx.fillText(line2, nx, ny + radius + 27);
      } else {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.strokeText(labelName, nx, ny + radius + 15);
        
        ctx.fillStyle = '#0f172a';
        ctx.fillText(labelName, nx, ny + radius + 15);
      }
    });

    ctx.restore();
  }, [filteredNodes, edgesData, scale, pan, selectedNode, canvasDimensions, nodesData]);

  // Click & Drag Handlers
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    const currentW = canvas.width || 800;
    const currentH = canvas.height || 600;
    const translateX = pan.x + (currentW / 2 - 300 * scale);
    const translateY = pan.y + (currentH / 2 - 220 * scale);

    const mouseX = (e.clientX - rect.left - translateX) / scale;
    const mouseY = (e.clientY - rect.top - translateY) / scale;

    const clicked = filteredNodes.find(node => {
      const nx = node.x !== undefined ? node.x : 300;
      const ny = node.y !== undefined ? node.y : 220;
      const radius = Math.max(16, Math.min(32, node.size || (16 + ((node.threat_score || node.degree || 5) * 0.3))));
      const dist = Math.hypot(nx - mouseX, ny - mouseY);
      return dist <= radius + 6;
    });

    if (clicked) {
      setDragNode(clicked);
      onSelectNode(clicked);
    } else {
      setIsDragging(true);
      setLastMouse({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (dragNode) {
      const rect = canvas.getBoundingClientRect();
      const currentW = canvas.width || 800;
      const currentH = canvas.height || 600;
      const translateX = pan.x + (currentW / 2 - 300 * scale);
      const translateY = pan.y + (currentH / 2 - 220 * scale);

      dragNode.x = (e.clientX - rect.left - translateX) / scale;
      dragNode.y = (e.clientY - rect.top - translateY) / scale;
      setPan(p => ({ ...p }));
    } else if (isDragging) {
      setPan(prev => ({
        x: prev.x + (e.clientX - lastMouse.x),
        y: prev.y + (e.clientY - lastMouse.y)
      }));
      setLastMouse({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragNode(null);
  };

  return (
    <div className="canvas-container" style={{ position: 'relative', width: '100%', height: '540px', minHeight: '400px' }}>
      <canvas
        ref={canvasRef}
        id="network-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
      <div className="canvas-controls">
        <button onClick={() => setScale(s => s * 1.2)} title="Zoom In">+</button>
        <button onClick={() => setScale(s => s * 0.8)} title="Zoom Out">-</button>
        <button onClick={() => { setScale(0.9); setPan({ x: 0, y: 0 }); }} title="Reset Pan & Zoom">🎯</button>
        <button 
          onClick={() => {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen().catch(() => {});
            } else {
              document.exitFullscreen().catch(() => {});
            }
          }} 
          title="Toggle Fullscreen Mode"
        >
          ⛶
        </button>
      </div>
    </div>
  );
}
