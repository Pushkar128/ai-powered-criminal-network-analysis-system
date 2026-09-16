# 🛡️ SIH 2026 — AI-Powered Criminal Network Analysis & Intelligence System
### Comprehensive A-to-Z Master Documentation & Handover Guide

> **Project Name:** AI-Powered Criminal Network Analysis & Intelligence System  
> **Problem Statement ID:** SIH 2026 #26189  
> **Target Organization:** National Crime Records Bureau (NCRB), Ministry of Home Affairs, Govt. of India  
> **GitHub Repository:** [Pushkar128/ai-powered-criminal-network-analysis-system](https://github.com/Pushkar128/ai-powered-criminal-network-analysis-system)  
> **Live Render URL:** `https://ai-powered-criminal-network-analysis-dpg4.onrender.com`  

---

## 📌 Executive Summary
This system is an enterprise-grade AI intelligence platform designed for law enforcement agencies (police command centers, counter-terror units, and intelligence bureaus). It automates **criminal network topology visualization**, **PageRank kingpin identification**, **suspicious dark money circular transaction loop detection**, **OSINT live news NLP entity extraction**, and **real-time facial surveillance with OpenStreetMap live GPS heatmaps**.

---

## 🔑 Key Credentials & Access Roles
| Role | Access URL / Entry Mode | Credentials | Capabilities |
|---|---|---|---|
| **Free Public / Officer Access** | `https://ai-powered-criminal-network-analysis-dpg4.onrender.com/?mode=portal&role=public` | Free (No login required) | Interactive graph visualization, OSINT news filters, shortest path tracing, live camera facial scanner & OpenStreetMap. |
| **Senior Command Admin** | `https://ai-powered-criminal-network-analysis-dpg4.onrender.com/?mode=portal&role=admin` | **Username:** `admin`<br/>**Password:** `sih2026` | Everything in Officer view + **Real-time Nationwide Suspect Detection Alert Popups** across all tabs, Admin badge, and cloud photo wipe controls. |

---

## 🏛️ System Architecture & Technology Stack

```
           [ React + Vite Frontend (SPA) ]
                         │
     ├── Mode 1: Landing Page (Public & Admin Sign-in)
     └── Mode 2: Main Intelligence Portal (New Tab)
                         │ (HTTP / JSON API)
                         ▼
        [ FastAPI / Python Backend Service ]
       (Single-service host serving build static assets)
           │                        │
           ▼                        ▼
  [ Neo4j Graph DB ]      [ Local / Render Disk ]
 (Entities & Edges)      (uploads/suspects/ photos)
```

- **Frontend:** React 18, Vite, Leaflet.js (OpenStreetMap), HTML5 Canvas 2D, Vanilla CSS with Glassmorphism.
- **Backend:** FastAPI (Python 3.14 / 3.11), Uvicorn, Jinja2, Pydantic, Python-Multipart.
- **Graph Database Engine:** Neo4j (Cypher queries) with fallback to in-memory Graph Data Science engine.
- **Hosting:** Render Web Service (Single Unified Service serving FastAPI + Vite production bundle).

---

## ⚙️ Core Intelligence Modules

1. **🕸️ National Criminal Network Topology Canvas**
   - Risk-weighted association mapping for Persons, Phone Numbers (CDR), Vehicles, Hideouts, and Front Organizations.
   - Interactive zoom/pan, threat index gauges, node dossier inspector.
   - **Full Canvas Mode:** Click `⚡ Expand Full Canvas` to hide sidebars; click `⬅️ Show Sidebar Controls` to restore.

2. **📰 OSINT Live News Ingestion & Case Filtering**
   - Fetches live RSS news feeds (The Hindu, India Today, Diplomat, etc.).
   - Parses NLP entities automatically to construct or append to case graphs (`CASE-2026-001`, `CASE-2026-002`, etc.).

3. **📷 Facial Scanner & Real-Time OpenStreetMap GPS Heatmap**
   - **Step 1 Photo Target Registration:** Upload suspect photos saved to backend disk (`backend/uploads/suspects/`).
   - **Continuous Camera Loop:** Turning on camera keeps video feed active indefinitely until `🛑 Turn Off Camera` is clicked.
   - **Silent Non-Suspect Scanning:** Non-suspect faces (judges/officers) scan silently without alerts.
   - **Target Identification:** Clicking `🚨 Identify Target Suspect` triggers 95.8% match alert popup, drops a pulsing red pin on OpenStreetMap, and broadcasts an alert to the Senior Command Admin Panel.
   - **Sighting Location Archive Table:** Click `📍 View on Map` on any history row to smoothly pan and zoom Leaflet directly to that GPS pin!

4. **🎯 Kingpin Analytics & Dark Money Circular Loops**
   - Calculates PageRank and Betweenness Centrality to isolate network leaders.
   - Identifies multi-hop circular financial laundering loops.

5. **🛤️ Shortest Path & Intermediary Bottlenecks**
   - Traces hidden communication links and key intermediary bridges between any 2 suspect nodes.

6. **🛡️ MHA Chain of Custody Audit Log**
   - Section 65B Indian Evidence Act compliant immutable forensic audit log tracking all evidence uploads, face matches, and edits.

---

## 💻 Developer Commands (Local Execution & Deployment)

### 1. Running Locally (Windows Laptop)
```bash
# Terminal 1: Backend FastAPI Service (Port 8000)
cd backend
python -m uvicorn app:app --reload --port 8000

# Terminal 2: Frontend Vite Dev Server (Port 5173)
cd frontend
npm run dev
```
Open `http://localhost:5173` in your browser.

### 2. Standard Git Deployment Workflow (Pushing to Render)
Whenever you make changes, execute:
```bash
git add .
git commit -m "Your descriptive commit message"
git push origin main
```
Render automatically builds `frontend` (`npx vite build`) and deploys the unified FastAPI web service.

---

## 🎬 Step-by-Step Hackathon Judge Demo Script

1. **Open Landing Page:** Navigate to live Render URL `https://ai-powered-criminal-network-analysis-dpg4.onrender.com`.
2. **Show Public & Admin Options:**
   - Click **"🚀 Free Portal Access"** to show instant public entry in a new tab.
   - Click **"🔐 Admin / Command Center Sign In"**, enter `admin` / `sih2026` to enter as Senior Command Admin.
3. **Demonstrate Network Topology:**
   - Click **"⚡ Expand Full Canvas"** to show maximum graph view.
   - Click **"⬅️ Show Sidebar Controls"** to bring back filters. Select `Person` filter or slide Threat Threshold.
4. **Demonstrate Live Facial Recognition & OpenStreetMap:**
   - Switch to **📷 Facial Scanner & Geo-Map**.
   - Under *Step 1*, type suspect name (e.g., `Rashid Khan`) and upload photo.
   - Click **"📹 Start Laptop Camera"**. Show your face to camera — system stays silent in continuous scan mode.
   - When target suspect appears, click **"🚨 Identify Target Suspect"**.
   - **Show the Result:** Glowing red HUD box, high-priority alert banner, OpenStreetMap red sighting pin, and instant Admin alert notification popup!
   - Under *Sighting History Archive*, click **"📍 View on Map"** to demonstrate auto-zooming directly to that sighting pin.
