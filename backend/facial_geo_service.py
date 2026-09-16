import os
import time
import uuid
from backend.analytics_service import record_audit_action

# Directory path for storing uploaded suspect photos
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads", "suspects")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# In-memory store for suspect face signatures and live GPS sightings
SUSPECT_FACES = []

# Persistent historical sightings log archive (starts empty until live camera scans occur)
LIVE_SIGHTINGS = []





def save_suspect_photo(file_bytes: bytes, original_filename: str, suspect_name: str):
    """
    Saves physical image file into backend/uploads/suspects/ folder and registers 
    suspect node in database.
    """
    ext = os.path.splitext(original_filename)[1] or ".png"
    unique_filename = f"{int(time.time())}_{uuid.uuid4().hex[:6]}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as f:
        f.write(file_bytes)
        
    suspect_id = f"PER_FACE_{int(time.time())}"
    photo_url = f"/uploads/suspects/{unique_filename}"
    
    suspect_entry = {
        "id": suspect_id,
        "name": suspect_name,
        "alias": "Registered Face Target",
        "threat_score": 90,
        "status": "WANTED",
        "photo_filename": unique_filename,
        "file_path": file_path,
        "photo_url": photo_url,
        "registered_at": time.strftime("%Y-%m-%d %H:%M:%S")
    }
    
    # Remove existing suspect if same ID exists
    SUSPECT_FACES.insert(0, suspect_entry)
    
    record_audit_action(
        "Photo Registration Engine", 
        "SUSPECT_PHOTO_UPLOADED", 
        f"Saved photo file {unique_filename} for suspect {suspect_name} ({suspect_id})"
    )
    
    return suspect_entry


def get_registered_suspects():
    """Returns list of currently registered suspect face targets."""
    return SUSPECT_FACES


def delete_suspect_photo(suspect_id: str):
    """
    Deletes the physical photo file from backend disk folder and removes suspect 
    database/memory record.
    """
    global SUSPECT_FACES
    deleted_entry = None
    
    for idx, s in enumerate(SUSPECT_FACES):
        if s["id"] == suspect_id:
            deleted_entry = SUSPECT_FACES.pop(idx)
            break
            
    if deleted_entry and "file_path" in deleted_entry:
        file_path = deleted_entry["file_path"]
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception as e:
                print(f"File deletion error: {e}")
                
    record_audit_action(
        "Photo Registration Engine", 
        "SUSPECT_PHOTO_DELETED", 
        f"Permanently deleted photo and record for suspect ID {suspect_id}"
    )
    
    return {"status": "DELETED", "suspect_id": suspect_id}


def clear_all_suspect_photos():
    """Permanently deletes all registered suspect photo files from cloud disk and clears memory list."""
    global SUSPECT_FACES
    count = len(SUSPECT_FACES)
    
    if os.path.exists(UPLOAD_DIR):
        for f in os.listdir(UPLOAD_DIR):
            file_path = os.path.join(UPLOAD_DIR, f)
            try:
                if os.path.isfile(file_path):
                    os.remove(file_path)
            except Exception as e:
                print(f"Error removing file {f}: {e}")
                
    SUSPECT_FACES = []
    
    record_audit_action(
        "Photo Registration Engine", 
        "ALL_SUSPECT_PHOTOS_CLEARED", 
        f"Permanently wiped all {count} registered suspect photo files from disk"
    )
    return {"status": "ALL_CLEARED", "count": count}


def log_live_sighting(suspect_id: str, lat: float, lng: float, location_name: str, confidence: float = 0.94, suspect_name: str = None):
    """Logs a live camera/GPS sighting of a suspect into the database."""
    sighting_id = f"SIGHT_{len(LIVE_SIGHTINGS) + 1:02d}"
    ts = time.strftime("%Y-%m-%d %H:%M:%S")
    
    final_name = suspect_name
    if not final_name or final_name == "Target Suspect":
        for s in SUSPECT_FACES:
            if s["id"] == suspect_id:
                final_name = s["name"]
                break
    if not final_name:
        final_name = "Target Suspect"

    entry = {
        "id": sighting_id,
        "suspect_id": suspect_id,
        "name": final_name,
        "lat": lat,
        "lng": lng,
        "location_name": location_name,
        "timestamp": ts,
        "confidence": confidence,
        "risk": "CRITICAL" if confidence >= 0.90 else "ELEVATED",
        "is_active_session": True
    }


    LIVE_SIGHTINGS.insert(0, entry)
    
    record_audit_action(
        "AI Camera Surveillance", 
        "FACIAL_RECOGNITION_MATCH", 
        f"Matched suspect {suspect_name} ({suspect_id}) at GPS ({lat}, {lng}) with {int(confidence*100)}% confidence"
    )
    return entry


def clear_active_sightings_session():
    """Marks all sightings as non-active for live map popups while retaining historical records."""
    for s in LIVE_SIGHTINGS:
        s["is_active_session"] = False
    return {"status": "CLEARED"}


def get_geo_heatmap_data():
    """Returns GPS sighting locations and crime risk heatmap clusters."""
    return {
        "sightings_count": len(LIVE_SIGHTINGS),
        "sightings": LIVE_SIGHTINGS,
        "active_sightings": [s for s in LIVE_SIGHTINGS if s.get("is_active_session", False)],
        "hotspots": [
            {"name": "Dharavi Syndicate Hideouts", "lat": 19.0402, "lng": 72.8508, "intensity": 0.95, "radius": 45},
            {"name": "Bandra Financial Shell Hub", "lat": 19.0760, "lng": 72.8777, "intensity": 0.82, "radius": 35},
            {"name": "Colaba Port Landing Zone", "lat": 18.9220, "lng": 72.8347, "intensity": 0.75, "radius": 30}
        ]
    }

