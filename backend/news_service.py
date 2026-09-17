import os
import re
import uuid
import time
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta
from neo4j import GraphDatabase

# Neo4j Connection Setup
URI = os.getenv("NEO4J_URI", "neo4j+ssc://6c134cfd.databases.neo4j.io")
USERNAME = os.getenv("NEO4J_USERNAME", "6c134cfd")
PASSWORD = os.getenv("NEO4J_PASSWORD", "jDqtQHhL8GFH81dufMU-xIbBdh-d3IGoSPBfqVAGHQ8")
AUTH = (USERNAME, PASSWORD)

def get_driver():
    return GraphDatabase.driver(URI, auth=AUTH)

# Store processed news in-memory cache to avoid duplicate processing
PROCESSED_NEWS_CACHE = set()

# Known Indian Locations & Crime Keywords for NLP extraction fallback
INDIAN_CITIES = [
    "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", 
    "Surat", "Pune", "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", 
    "Bhopal", "Visakhapatnam", "Patna", "Vadodara", "Ghaziabad", "Ludhiana", "Agra",
    "Chandigarh", "Jammu", "Kashmir", "Punjab", "Dharavi", "Chandni Chowk", "Dockyard Road"
]

CRIME_KEYWORDS = [
    "terror", "raid", "arrest", "arrested", "seized", "smuggling", "hawala", 
    "money laundering", "cyber fraud", "fake currency", "counterfeit", "absconding", 
    "extortion", "encounter", "gangster", "cartel", "drug bust", "syndicate", "FIR"
]


def fetch_google_news(query="crime OR raid OR arrest OR terror India", max_items=15):
    """
    Fetches live news RSS feed from Google News for criminal and security updates.
    Returns structured list of news items.
    """
    encoded_query = urllib.parse.quote(query)
    url = f"https://news.google.com/rss/search?q={encoded_query}&hl=en-IN&gl=IN&ceid=IN:en"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    items = []
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as response:
            xml_data = response.read()
            root = ET.fromstring(xml_data)
            
            for elem in root.findall(".//item")[:max_items]:
                title = elem.find("title").text if elem.find("title") is not None else ""
                link = elem.find("link").text if elem.find("link") is not None else ""
                pub_date = elem.find("pubDate").text if elem.find("pubDate") is not None else ""
                desc = elem.find("description").text if elem.find("description") is not None else ""
                
                # Strip HTML tags from description snippet
                clean_desc = re.sub(r'<[^>]+>', '', desc)
                
                news_id = f"NEWS_{abs(hash(link)) % 1000000}"
                
                items.append({
                    "id": news_id,
                    "title": title,
                    "link": link,
                    "published": pub_date,
                    "summary": clean_desc,
                    "fetched_at": datetime.now().isoformat()
                })
    except Exception as e:
        print(f"[News Service] Error fetching Google News RSS: {e}")
        # Fallback realistic news items if network is offline during demo
        items = get_fallback_news_feed()
        
    return items


def extract_entities_from_text(text, session):
    """
    Extracts potential persons, locations, and crime categories from news text.
    Cross-references with existing Neo4j Entity database for matching.
    """
    text_lower = text.lower()
    
    # 1. Check for matches against existing entities in Neo4j
    query = """
    MATCH (n:Entity)
    WHERE n.name IS NOT NULL AND size(n.name) > 2
    RETURN n.id AS id, n.name AS name, coalesce(n.alias, '') AS alias, coalesce(n.type, labels(n)[0]) AS type, coalesce(n.case_id, 'CASE-001') AS case_id
    """
    db_entities = session.run(query).data()
    
    matched_db_entities = []
    for entity in db_entities:
        name = entity["name"].strip()
        alias = entity["alias"].strip()
        
        if name and name.lower() in text_lower:
            matched_db_entities.append(entity)
        elif alias and alias.lower() in text_lower:
            matched_db_entities.append(entity)

    # 2. Extract locations
    extracted_locations = [city for city in INDIAN_CITIES if city.lower() in text_lower]

    # 3. Extract crime tags
    extracted_crimes = [tag for tag in CRIME_KEYWORDS if tag.lower() in text_lower]

    # 4. Extract potential capitalised person names via Regex fallback
    person_matches = re.findall(r'\b[A-Z][a-z]+\s+[A-Z][a-z]+\b', text)
    filtered_persons = [
        p for p in person_matches 
        if p not in INDIAN_CITIES and not any(k in p.lower() for k in ["news", "times", "today", "india", "police", "court"])
    ]

    return {
        "matched_existing": matched_db_entities,
        "extracted_locations": list(set(extracted_locations)),
        "extracted_crimes": list(set(extracted_crimes)),
        "extracted_persons": list(set(filtered_persons[:3]))
    }


def process_news_article(article, driver):
    """
    Core Logic:
    - If news matches an EXISTING entity in Neo4j -> MERGES into existing case/graph.
    - If news is UNRELATED -> CREATES a NEW case graph & adds to Cases list.
    """
    global PROCESSED_NEWS_CACHE
    if article["id"] in PROCESSED_NEWS_CACHE:
        return {"status": "SKIPPED", "message": "Article already processed", "article_id": article["id"]}

    text_to_analyze = f"{article['title']} {article['summary']}"
    
    with driver.session() as session:
        extraction = extract_entities_from_text(text_to_analyze, session)
        matched_entities = extraction["matched_existing"]
        
        news_node_id = article["id"]
        title = article["title"]
        pub_date = article["published"]
        link = article["link"]
        
        if matched_entities:
            # ================================================================
            # SCENARIO A: MATCH FOUND -> LINK NEWS EVENT BUT KEEP RSS IN SEPARATE CASE NETWORK
            # ================================================================
            matched_case_id = matched_entities[0].get("case_id", "CASE-001")
            matched_name = matched_entities[0]["name"]
            
            # Prevent merging RSS news directly into Dataset cases
            new_case_num = len(PROCESSED_NEWS_CACHE) + 101
            target_case_id = f"CASE-NEWS-{new_case_num}"
            case_title = f"Case #{new_case_num}: OSINT Intelligence ({matched_name})"
            
            cypher = """
            // 1. Create News Case Node
            MERGE (c:Case {id: $case_id})
            ON CREATE SET c.name = $case_title, c.created_at = timestamp(), c.source = 'OSINT News'

            // 2. Create News Event Node
            MERGE (ne:Entity:NewsEvent {id: $news_id})
            ON CREATE SET 
                ne.name = $title,
                ne.type = 'NewsEvent',
                ne.link = $link,
                ne.published = $pub_date,
                ne.case_id = $case_id,
                ne.source = 'Google News RSS'
            
            MERGE (ne)-[:BELONGS_TO]->(c)

            WITH ne
            MATCH (target:Entity) WHERE target.id = $matched_id OR target.name = $matched_name
            MERGE (target)-[r:MENTIONED_IN_NEWS {case_id: $case_id}]->(ne)
            ON CREATE SET r.weight = 0.9, r.detected_at = timestamp()
            """
            session.run(
                cypher, 
                news_id=news_node_id, 
                title=title, 
                link=link, 
                pub_date=pub_date, 
                case_id=target_case_id,
                case_title=case_title,
                matched_id=matched_entities[0]["id"],
                matched_name=matched_name
            )
            
            # Attach extracted locations to the news case graph
            for loc in extraction["extracted_locations"]:
                loc_id = f"LOC_{abs(hash(loc)) % 10000}"
                loc_query = """
                MERGE (l:Entity:Location {id: $loc_id})
                ON CREATE SET l.name = $loc_name, l.type = 'Location', l.case_id = $case_id
                WITH l
                MATCH (ne:Entity:NewsEvent {id: $news_id})
                MERGE (ne)-[:OCCURRED_AT {case_id: $case_id}]->(l)
                """
                session.run(loc_query, loc_id=loc_id, loc_name=loc, case_id=target_case_id, news_id=news_node_id)

            PROCESSED_NEWS_CACHE.add(article["id"])
            return {
                "status": "MERGED",
                "action": "Linked News Event",
                "case_id": target_case_id,
                "matched_entity": matched_name,
                "article": article,
                "extracted": extraction
            }
            
        else:
            # ================================================================
            # SCENARIO B: NO MATCH -> CREATE NEW ISOLATED CASE GRAPH
            # ================================================================
            new_case_num = len(PROCESSED_NEWS_CACHE) + 101
            new_case_id = f"CASE-NEWS-{new_case_num}"
            case_title = f"Case #{new_case_num}: {title}"
            
            cypher = """
            // 1. Create Case Node
            MERGE (c:Case {id: $case_id})
            ON CREATE SET c.name = $case_title, c.created_at = timestamp(), c.source = 'OSINT News'
            
            // 2. Create News Node
            MERGE (ne:Entity:NewsEvent {id: $news_id})
            ON CREATE SET 
                ne.name = $title,
                ne.type = 'NewsEvent',
                ne.link = $link,
                ne.published = $pub_date,
                ne.case_id = $case_id,
                ne.source = 'Google News RSS'
            
            MERGE (ne)-[:BELONGS_TO]->(c)
            """
            session.run(
                cypher, 
                case_id=new_case_id, 
                case_title=case_title, 
                news_id=news_node_id, 
                title=title, 
                link=link, 
                pub_date=pub_date
            )
            
            # Create nodes for extracted persons & locations under new_case_id
            for idx, p_name in enumerate(extraction["extracted_persons"]):
                p_id = f"PER_NEWS_{abs(hash(p_name)) % 10000}"
                p_query = """
                MERGE (p:Entity:Person {id: $p_id})
                ON CREATE SET p.name = $p_name, p.type = 'Suspect', p.threat_level = 'ELEVATED', p.case_id = $case_id
                WITH p
                MATCH (ne:Entity:NewsEvent {id: $news_id})
                MERGE (p)-[:MENTIONED_IN_NEWS {case_id: $case_id}]->(ne)
                """
                session.run(p_query, p_id=p_id, p_name=p_name, case_id=new_case_id, news_id=news_node_id)
                
            for loc in extraction["extracted_locations"]:
                loc_id = f"LOC_NEWS_{abs(hash(loc)) % 10000}"
                loc_query = """
                MERGE (l:Entity:Location {id: $loc_id})
                ON CREATE SET l.name = $loc_name, l.type = 'Location', l.case_id = $case_id
                WITH l
                MATCH (ne:Entity:NewsEvent {id: $news_id})
                MERGE (ne)-[:OCCURRED_AT {case_id: $case_id}]->(l)
                """
                session.run(loc_query, loc_id=loc_id, loc_name=loc, case_id=new_case_id, news_id=news_node_id)

            PROCESSED_NEWS_CACHE.add(article["id"])
            return {
                "status": "NEW_CASE_CREATED",
                "action": "Created New Case Network",
                "case_id": new_case_id,
                "case_title": case_title,
                "article": article,
                "extracted": extraction
            }


def fetch_and_process_recent_news(driver, max_articles=10):
    """
    Fetches news feed (past 24h / past 1h) and automatically updates/generates Neo4j graphs.
    """
    articles = fetch_google_news(max_items=max_articles)
    results = []
    
    for art in articles:
        res = process_news_article(art, driver)
        results.append(res)
        
    return results


def get_all_cases(driver):
    """
    Returns list of all active crime cases in the Neo4j database.
    """
    query = """
    MATCH (n:Entity)
    WITH coalesce(n.case_id, 'CASE-001') AS case_id, count(n) AS node_count
    RETURN case_id, node_count
    ORDER BY node_count DESC
    """
    with driver.session() as session:
        records = session.run(query).data()
        
        # Format display titles
        cases = []
        for r in records:
            cid = str(r["case_id"])
            is_dataset = cid in ["CASE-001", "CASE-DATASET-001"] or "DATASET" in cid.upper() or cid.startswith("CASE-2026") or cid.startswith("C0")
            
            if cid in ["CASE-001", "CASE-DATASET-001"]:
                title = "Case #001: Primary Suspect Network [Dataset]"
            elif is_dataset:
                title = f"Case #{cid}: Benchmark Synthetic Investigation [Dataset]"
            elif "NEWS" in cid.upper():
                title = f"Case #{cid.split('-')[-1] if '-' in cid else cid}: OSINT Live News Intelligence Cluster"
            else:
                title = f"Case #{cid}: Crime Investigation Unit"
                
            cases.append({
                "case_id": cid,
                "title": title,
                "node_count": r["node_count"],
                "is_dataset": is_dataset
            })
        return cases


def get_fallback_news_feed():
    """Fallback sample realistic news items for offline demo stability."""
    return [
        {
            "id": "NEWS_1001",
            "title": "NIA conducts raids in Mumbai port area, suspect Ravi Kumar linked to illegal arms transfer",
            "link": "https://news.google.com/articles/1001",
            "published": datetime.now().strftime("%a, %d %b %Y %H:%M:%S GMT"),
            "summary": "National Investigation Agency officers searched multiple locations near Dockyard Road following intelligence regarding suspect Ravi Kumar and illegal arms smuggling.",
            "fetched_at": datetime.now().isoformat()
        },
        {
            "id": "NEWS_1002",
            "title": "Cyber Crime Cell uncovers new multi-crore Hawala syndicate operating from Hyderabad",
            "link": "https://news.google.com/articles/1002",
            "published": (datetime.now() - timedelta(hours=2)).strftime("%a, %d %b %Y %H:%M:%S GMT"),
            "summary": "Hyderabad Police flagged suspicious transaction accounts transferring funds through international shell firms. Intermediary suspect Sameer Khan identified.",
            "fetched_at": datetime.now().isoformat()
        },
        {
            "id": "NEWS_1003",
            "title": "Special Task Force detains suspect Divya Reddy in Pune counterfeiting probe",
            "link": "https://news.google.com/articles/1003",
            "published": (datetime.now() - timedelta(hours=5)).strftime("%a, %d %b %Y %H:%M:%S GMT"),
            "summary": "Police seized counterfeit currency printing equipment during a midnight raid in Pune. Key suspect Divya Reddy is currently being interrogated.",
            "fetched_at": datetime.now().isoformat()
        }
    ]
