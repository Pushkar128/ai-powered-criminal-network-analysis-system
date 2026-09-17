import os
from fastapi import FastAPI, HTTPException, Query, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import Optional

from backend.graph_service import (
    search_entity,
    get_full_graph,
    get_node_details,
    get_resolved_entities,
    find_shortest_path,
    delete_entity_node,
)
from backend.news_service import (
    get_driver as get_news_driver,
    fetch_and_process_recent_news,
    get_all_cases,
    fetch_google_news,
)

app = FastAPI(
    title="Forensic Criminal Network Intelligence API",
    description="Backend API exposing Neo4j graph analytics, threat scoring, entity resolution, and live OSINT news graph ingestion.",
    version="1.1.0",
)

# Enable CORS for frontend connectivity
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Static Uploads Folder
uploads_dir = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")


@app.get("/api/health")
def health_check():
    """Health check endpoint to verify backend service status."""
    return {
        "status": "online",
        "service": "Forensic Network Intelligence API",
        "version": "1.1.0",
        "endpoints": [
            "/api/graph",
            "/api/search",
            "/api/node/{entity_id}",
            "/api/entity-resolution",
            "/api/path",
            "/api/cases",
            "/api/news/ingest",
            "/api/news/feed",
        ],
    }



# ============================================================================
# FEATURE 1: MULTI-PIVOT ENTITY SEARCH
# ============================================================================
@app.get("/api/search")
def search_entities(
    term: str = Query(..., min_length=1, description="Name, alias, phone, ID, or crime category"),
    limit: int = Query(20, ge=1, le=100, description="Max search results to return"),
):
    """Search suspects, locations, and crimes across multiple forensic markers."""
    try:
        results = search_entity(term, limit=limit)
        return {"query": term, "count": len(results), "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


# ============================================================================
# FEATURE 2: INTERACTIVE RISK-WEIGHTED TOPOLOGY & CASE FILTERING
# ============================================================================
@app.get("/api/graph")
def get_graph(
    limit: int = Query(200, ge=1, le=1000, description="Max edge traversals to fetch"),
    case_id: Optional[str] = Query(None, description="Optional case ID filter (e.g. CASE-001)"),
):
    """Retrieve visual network topology filtered by case ID with dynamic node scaling."""
    try:
        nodes, edges = get_full_graph(limit=limit, case_id=case_id)
        return {
            "case_id": case_id or "ALL",
            "node_count": len(nodes),
            "edge_count": len(edges),
            "nodes": nodes,
            "edges": edges,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Graph retrieval failed: {str(e)}")


# ============================================================================
# FEATURE 2.5: OSINT LIVE NEWS INGESTION & AUTOMATED GRAPH GENERATOR
# ============================================================================
@app.get("/api/cases")
def list_cases():
    """Retrieve list of all active crime case graphs in Neo4j."""
    try:
        driver = get_news_driver()
        cases = get_all_cases(driver)
        return {"count": len(cases), "cases": cases}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fetching cases failed: {str(e)}")


@app.post("/api/news/ingest")
@app.get("/api/news/ingest")
def ingest_news(max_articles: int = Query(8, ge=1, le=20, description="Max articles to process")):
    """
    Fetches news from past 24h / 1h (Google News RSS), matches entities against database,
    and updates existing network graphs or spawns new case networks dynamically.
    """
    try:
        driver = get_news_driver()
        results = fetch_and_process_recent_news(driver, max_articles=max_articles)
        
        merged_count = sum(1 for r in results if r.get("status") == "MERGED")
        new_cases_count = sum(1 for r in results if r.get("status") == "NEW_CASE_CREATED")
        
        return {
            "processed_count": len(results),
            "merged_into_existing_count": merged_count,
            "new_cases_created_count": new_cases_count,
            "ingestion_results": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"News ingestion failed: {str(e)}")


@app.get("/api/news/feed")
def get_news_feed():
    """Returns recent raw Google News items."""
    try:
        feed = fetch_google_news(max_items=10)
        return {"count": len(feed), "articles": feed}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fetching news feed failed: {str(e)}")



# ============================================================================
# FEATURE 3: NODE INSPECTOR & COMPUTED THREAT INDEX
# ============================================================================
@app.get("/api/node/{entity_id}")
def get_node(entity_id: str):
    """Retrieve deep profile dossier, crime history, and automated 0-100 Threat Index."""
    try:
        details = get_node_details(entity_id)
        if not details:
            raise HTTPException(
                status_code=404,
                detail=f"Entity with ID '{entity_id}' not found in database",
            )
        return details
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Node lookup failed: {str(e)}")


@app.delete("/api/node/{entity_id}")
def remove_node(entity_id: str):
    """Deletes entity node and all connected edges from Neo4j database."""
    try:
        res = delete_entity_node(entity_id)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Node deletion failed: {str(e)}")


# ============================================================================
# FEATURE 4: ENTITY RESOLUTION & MERGE AUDIT
# ============================================================================
@app.get("/api/entity-resolution")
def get_entity_resolutions(
    limit: int = Query(25, ge=1, le=200, description="Max resolved clusters to audit"),
):
    """Inspect resolved master entities, deduplicated aliases, and confidence scores."""
    try:
        resolutions = get_resolved_entities(limit=limit)
        return {"count": len(resolutions), "resolved_entities": resolutions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Entity resolution audit failed: {str(e)}")


# ============================================================================
# FEATURE 5: SHORTEST PATH & CRITICAL BOTTLENECK FINDER
# ============================================================================
@app.get("/api/path")
def trace_path(
    source: str = Query(..., description="Source entity ID"),
    target: str = Query(..., description="Target entity ID"),
):
    """Calculate shortest association path between two entities and flag critical intermediary bridges."""
    try:
        path_result = find_shortest_path(source, target)
        if not path_result:
            return {
                "source": source,
                "target": target,
                "found": False,
                "message": "No direct or indirect relationship chain found within traversal limits.",
            }
        return {"source": source, "target": target, "found": True, "path": path_result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Path discovery failed: {str(e)}")


# ============================================================================
# FEATURE 6: LIVE EVIDENCE & DOCUMENT PARSER INGESTION
# ============================================================================
from pydantic import BaseModel

class FIRIngestRequest(BaseModel):
    fir_text: str
    case_id: Optional[str] = "CASE-RAW-001"

class CSVIngestRequest(BaseModel):
    csv_text: str
    file_type: Optional[str] = "CDR"
    case_id: Optional[str] = "CASE-CSV-001"

from backend.ingestion_service import process_raw_fir_text, parse_and_ingest_csv_data
from backend.analytics_service import (
    get_kingpin_centrality_analytics,
    detect_suspicious_money_loops,
    generate_ai_intelligence_dossier,
    get_audit_trail
)

@app.post("/api/evidence/ingest-text")
def ingest_fir_text(req: FIRIngestRequest):
    """Parses raw FIR text via NLP, extracts suspect entities, and builds graph nodes."""
    try:
        res = process_raw_fir_text(req.fir_text, case_id=req.case_id)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"FIR parsing failed: {str(e)}")


@app.post("/api/evidence/ingest-csv")
def ingest_csv(req: CSVIngestRequest):
    """Parses CDR or financial CSV records into Neo4j graph nodes and edges."""
    try:
        res = parse_and_ingest_csv_data(req.csv_text, file_type=req.file_type, case_id=req.case_id)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"CSV parsing failed: {str(e)}")


# ============================================================================
# FEATURE 7: PAGERANK & KINGPIN DATA SCIENCE ANALYTICS
# ============================================================================
@app.get("/api/analytics/kingpins")
def get_kingpins(limit: int = Query(10, ge=1, le=50)):
    """Computes PageRank and Betweenness Centrality to rank key criminal network leaders."""
    try:
        kingpins = get_kingpin_centrality_analytics(limit=limit)
        return {"count": len(kingpins), "kingpins": kingpins}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Kingpin calculation failed: {str(e)}")


@app.get("/api/analytics/money-loops")
def get_money_loops():
    """Detects multi-hop circular money laundering transactions."""
    try:
        loops = detect_suspicious_money_loops()
        return {"count": len(loops), "money_loops": loops}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Money loop analysis failed: {str(e)}")


# ============================================================================
# FEATURE 8: AI INTELLIGENCE BRIEF & MHA AUDIT LOG
# ============================================================================
@app.get("/api/dossier/ai-report/{entity_id}")
def get_ai_dossier_report(entity_id: str):
    """Generates an executive AI Intelligence Summary for a suspect node."""
    try:
        report = generate_ai_intelligence_dossier(entity_id)
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dossier generation failed: {str(e)}")


# ============================================================================
# FEATURE 9: FACIAL RECOGNITION SURVEILLANCE & GEOSPATIAL HEATMAP
# ============================================================================
from backend.facial_geo_service import log_live_sighting, get_geo_heatmap_data, clear_active_sightings_session

class SightingRequest(BaseModel):
    suspect_id: str
    suspect_name: Optional[str] = None
    lat: float
    lng: float
    location_name: Optional[str] = "Live Camera Location"
    confidence: Optional[float] = 0.94

@app.post("/api/surveillance/sighting")
def record_sighting(req: SightingRequest):
    """Records a live facial camera recognition GPS sighting."""
    try:
        res = log_live_sighting(req.suspect_id, req.lat, req.lng, req.location_name, req.confidence, suspect_name=req.suspect_name)
        return {"status": "SUCCESS", "sighting": res}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sighting logging failed: {str(e)}")



@app.get("/api/surveillance/heatmap")
def get_heatmap():
    """Returns live GPS suspect sightings and crime hotspot coordinates."""
    try:
        return get_geo_heatmap_data()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fetching heatmap failed: {str(e)}")


@app.post("/api/surveillance/clear-active-pins")
def clear_active_pins():
    """Clears live pins from map overlay while preserving history archive."""
    try:
        return clear_active_sightings_session()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Clear active pins failed: {str(e)}")



from backend.facial_geo_service import save_suspect_photo, delete_suspect_photo, get_registered_suspects, clear_all_suspect_photos

@app.get("/api/surveillance/registered-suspects")
def list_registered_suspects():
    """Returns list of registered target suspects stored on backend disk."""
    try:
        return {"suspects": get_registered_suspects()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fetching registered suspects failed: {str(e)}")


@app.post("/api/surveillance/upload-photo")
async def upload_suspect_photo(
    file: UploadFile = File(...),
    suspect_name: str = Form(...)
):
    """Saves uploaded photo to backend/uploads/suspects/ folder and registers suspect in database."""
    try:
        content = await file.read()
        res = save_suspect_photo(content, file.filename, suspect_name)
        return {"status": "SUCCESS", "suspect": res}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Photo upload failed: {str(e)}")


@app.delete("/api/surveillance/delete-photo/{suspect_id}")
def remove_suspect_photo(suspect_id: str):
    """Deletes photo file from disk and removes suspect record from database."""
    try:
        res = delete_suspect_photo(suspect_id)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Photo deletion failed: {str(e)}")


@app.delete("/api/surveillance/clear-all-photos")
def wipe_all_suspect_photos():
    """Wipes all suspect photo files from disk and clears registered targets."""
    try:
        return clear_all_suspect_photos()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Wiping photos failed: {str(e)}")


# ============================================================================
# FEATURE 10: SERVE UPLOADS & UNIFIED SINGLE-SERVICE FRONTEND
# ============================================================================
from fastapi.staticfiles import StaticFiles

uploads_dir = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

frontend_dist_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
if os.path.exists(frontend_dist_dir):
    app.mount("/", StaticFiles(directory=frontend_dist_dir, html=True), name="frontend")


    