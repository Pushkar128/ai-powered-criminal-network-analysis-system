import os
import pandas as pd
from neo4j import GraphDatabase

# Neo4j AuraDB Connection Config
NEO4J_URI = os.getenv("NEO4J_URI", "neo4j+s://ed0838c3.databases.neo4j.io")
NEO4J_USERNAME = os.getenv("NEO4J_USERNAME", "ed0838c3")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "Ac8E-vCF__J_OE0if9lf-kNg7ErLjxDLuWnHxVujBCI")

# Dynamic root path resolution
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

STRUCTURED_ENTITIES_PATH = os.path.join(
    BASE_DIR, "structured_data_ingestion", "data", "output", "final_structured_entities.csv"
)
STRUCTURED_RELATIONSHIPS_PATH = os.path.join(
    BASE_DIR, "structured_data_ingestion", "data", "output", "final_structured_relationships.csv"
)
NLP_ENTITIES_PATH = os.path.join(
    BASE_DIR, "unstructured", "data", "nlp_entities.csv"
)
NLP_RELATIONSHIPS_PATH = os.path.join(
    BASE_DIR, "unstructured", "data", "nlp_relationships.csv"
)


def create_constraints(session):
    labels = ["Entity", "Person", "Address", "Vehicle", "Organization", "Event", "Case", "Account"]
    for label in labels:
        session.run(f"""
            CREATE CONSTRAINT {label.lower()}_id_unique IF NOT EXISTS
            FOR (n:{label}) REQUIRE n.id IS UNIQUE
        """)
    print("✓ Schema uniqueness constraints verified.")


def batch_load_entities(session, csv_path, source_tag, default_case_id="CASE-001", batch_size=500):
    if not os.path.exists(csv_path):
        print(f"! File not found: {csv_path}")
        return

    df = pd.read_csv(csv_path).fillna("")

    # Automatically standardize ID column names
    for col in ["entity_id", "Entity_ID", "ID", "canonical_id"]:
        if col in df.columns and "id" not in df.columns:
            df = df.rename(columns={col: "id"})

    # Filter out empty IDs
    df["id"] = df["id"].astype(str).str.strip()
    df = df[df["id"] != ""]

    records = df.to_dict(orient="records")

    # Ingest with both .id and .entity_id populated to avoid query breakage
    query = """
    UNWIND $batch AS row
    MERGE (e:Entity {id: toString(row.id)})
    ON CREATE SET 
        e += row,
        e.id = toString(row.id),
        e.entity_id = toString(row.id),
        e.name = coalesce(row.name, row.label, row.id),
        e.type = coalesce(row.type, row.entity_type, 'Unknown'),
        e.case_id = $default_case,
        e.source = $source
    ON MATCH SET 
        e += row,
        e.id = toString(row.id),
        e.entity_id = toString(row.id),
        e.name = coalesce(row.name, row.label, e.name),
        e.case_id = coalesce(e.case_id, $default_case),
        e.updated_source = $source
    """

    for i in range(0, len(records), batch_size):
        session.run(query, batch=records[i:i + batch_size], source=source_tag, default_case=default_case_id)
    print(f"✓ Ingested {len(records)} entities from {os.path.basename(csv_path)} (tagged as {default_case_id})")


def batch_load_relationships(session, csv_path, source_tag, default_case_id="CASE-001", batch_size=500):
    if not os.path.exists(csv_path):
        print(f"! File not found: {csv_path}")
        return

    df = pd.read_csv(csv_path).fillna("")

    # Standardize source and target column names
    for col in ["source_id", "from", "src", "Source"]:
        if col in df.columns and "source" not in df.columns:
            df = df.rename(columns={col: "source"})

    for col in ["target_id", "to", "dst", "Target"]:
        if col in df.columns and "target" not in df.columns:
            df = df.rename(columns={col: "target"})

    for col in ["relationship", "rel_type", "predicate", "relation"]:
        if col in df.columns and "type" not in df.columns:
            df = df.rename(columns={col: "type"})

    # Filter rows missing source or target
    df["source"] = df["source"].astype(str).str.strip()
    df["target"] = df["target"].astype(str).str.strip()
    df = df[(df["source"] != "") & (df["target"] != "")]

    records = df.to_dict(orient="records")

    # Match resiliently across both id and entity_id
    query = """
    UNWIND $batch AS row
    MATCH (source:Entity) WHERE source.id = toString(row.source) OR source.entity_id = toString(row.source)
    MATCH (target:Entity) WHERE target.id = toString(row.target) OR target.entity_id = toString(row.target)
    MERGE (source)-[r:CONNECTED_TO {type: coalesce(row.type, 'RELATED')}]->(target)
    ON CREATE SET 
        r += row,
        r.weight = coalesce(row.weight, 1.0),
        r.case_id = $default_case,
        r.source = $source
    ON MATCH SET
        r += row,
        r.case_id = coalesce(r.case_id, $default_case),
        r.updated_source = $source
    """

    for i in range(0, len(records), batch_size):
        session.run(query, batch=records[i:i + batch_size], source=source_tag, default_case=default_case_id)
    print(f"✓ Ingested {len(records)} relationships from {os.path.basename(csv_path)}")


def seed_case_networks(session):
    """Seeds synthetic distinct nodes for Case #104, Case #101, and Case #102 into Neo4j."""
    
    # CASE-FIR-104: Hyderabad Cyber Fraud FIR Network (45 Nodes)
    fir_nodes = []
    fir_nodes.append({"id": "FIR_104_P1", "name": "Ravi Kumar", "type": "Suspect", "alias": "Ravi Cyber", "threat_score": 88})
    fir_nodes.append({"id": "FIR_104_P2", "name": "Rohit Gupta", "type": "Suspect", "alias": "CallCenter Lead", "threat_score": 82})
    fir_nodes.append({"id": "FIR_104_L1", "name": "Cyberabad Tech Hub", "type": "Location", "threat_score": 75})
    fir_nodes.append({"id": "FIR_104_A1", "name": "Axis Bank Mule #1002", "type": "BankAccount", "threat_score": 91})
    
    for idx in range(3, 45):
        ntype = "Person" if idx % 3 == 0 else ("BankAccount" if idx % 3 == 1 else "Phone")
        fir_nodes.append({
            "id": f"FIR_104_N_{idx}",
            "name": f"Cyber Fraud Node #{idx}",
            "type": ntype,
            "threat_score": 60 + (idx % 35),
            "alias": f"Cyber Mule {idx}"
        })

    # CASE-NEWS-101: OSINT Live News Intelligence Cluster (38 Nodes)
    news101_nodes = []
    news101_nodes.append({"id": "NEWS_101_P1", "name": "Vikram Singh", "type": "Suspect", "alias": "Vikram Ops", "threat_score": 90})
    news101_nodes.append({"id": "NEWS_101_O1", "name": "Mumbai Port Logistics", "type": "Organization", "alias": "Front Logistics", "threat_score": 86})
    news101_nodes.append({"id": "NEWS_101_L1", "name": "Dockyard Road Depot", "type": "Location", "alias": "Arms Warehouse", "threat_score": 80})

    for idx in range(4, 39):
        ntype = "Suspect" if idx % 3 == 0 else ("Organization" if idx % 3 == 1 else "Location")
        news101_nodes.append({
            "id": f"NEWS_101_N_{idx}",
            "name": f"OSINT Cluster Node #{idx}",
            "type": ntype,
            "threat_score": 65 + (idx % 30),
            "alias": f"OSINT Target {idx}"
        })

    # CASE-NEWS-102: Hawala Transfer & Illegal Syndicate Cluster (29 Nodes)
    news102_nodes = []
    news102_nodes.append({"id": "NEWS_102_P1", "name": "Sanjay Verma", "type": "Suspect", "alias": "Hawala Handler", "threat_score": 93})
    news102_nodes.append({"id": "NEWS_102_A1", "name": "Dharavi Shell #4102", "type": "BankAccount", "alias": "Hawala Node", "threat_score": 95})
    news102_nodes.append({"id": "NEWS_102_L1", "name": "Chandni Chowk Cash Desk", "type": "Location", "alias": "Cash Hub", "threat_score": 87})

    for idx in range(4, 30):
        ntype = "Suspect" if idx % 3 == 0 else ("BankAccount" if idx % 3 == 1 else "Location")
        news102_nodes.append({
            "id": f"NEWS_102_N_{idx}",
            "name": f"Hawala Syndicate Node #{idx}",
            "type": ntype,
            "threat_score": 70 + (idx % 25),
            "alias": f"Hawala Agent {idx}"
        })

    query = """
    UNWIND $batch AS row
    MERGE (e:Entity {id: row.id})
    ON CREATE SET 
        e.id = row.id,
        e.entity_id = row.id,
        e.name = row.name,
        e.type = row.type,
        e.alias = coalesce(row.alias, ''),
        e.threat_score = row.threat_score,
        e.case_id = $case_id
    ON MATCH SET
        e.name = row.name,
        e.case_id = $case_id
    """

    session.run(query, batch=fir_nodes, case_id="CASE-FIR-104")
    session.run(query, batch=news101_nodes, case_id="CASE-NEWS-101")
    session.run(query, batch=news102_nodes, case_id="CASE-NEWS-102")

    # Connect nodes inside each network
    session.run("""
    MATCH (a:Entity {case_id: 'CASE-FIR-104'}), (b:Entity {case_id: 'CASE-FIR-104'})
    WHERE a.id <> b.id AND rand() < 0.15
    MERGE (a)-[r:CONNECTED_TO {type: 'OPERATES_WITH', case_id: 'CASE-FIR-104'}]->(b)
    """)
    session.run("""
    MATCH (a:Entity {case_id: 'CASE-NEWS-101'}), (b:Entity {case_id: 'CASE-NEWS-101'})
    WHERE a.id <> b.id AND rand() < 0.18
    MERGE (a)-[r:CONNECTED_TO {type: 'MENTIONED_IN_NEWS', case_id: 'CASE-NEWS-101'}]->(b)
    """)
    session.run("""
    MATCH (a:Entity {case_id: 'CASE-NEWS-102'}), (b:Entity {case_id: 'CASE-NEWS-102'})
    WHERE a.id <> b.id AND rand() < 0.20
    MERGE (a)-[r:CONNECTED_TO {type: 'CIRCULAR_TRANSFER', case_id: 'CASE-NEWS-102'}]->(b)
    """)

    print("✓ Seeded distinct graphs for CASE-FIR-104 (45 nodes), CASE-NEWS-101 (38 nodes), and CASE-NEWS-102 (29 nodes).")


def main():
    driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USERNAME, NEO4J_PASSWORD))
    
    try:
        with driver.session() as session:
            print("--- Setting Up Schema Constraints ---")
            create_constraints(session)

            print("\n--- Ingesting Structured Data ---")
            batch_load_entities(session, STRUCTURED_ENTITIES_PATH, source_tag="structured", default_case_id="CASE-001")
            batch_load_relationships(session, STRUCTURED_RELATIONSHIPS_PATH, source_tag="structured", default_case_id="CASE-001")

            print("\n--- Ingesting Unstructured NLP Data ---")
            batch_load_entities(session, NLP_ENTITIES_PATH, source_tag="nlp", default_case_id="CASE-DATASET-002")
            batch_load_relationships(session, NLP_RELATIONSHIPS_PATH, source_tag="nlp", default_case_id="CASE-DATASET-002")

            print("\n--- Seeding Case Networks ---")
            seed_case_networks(session)

            print("\n--- Ingestion Pipeline Complete ---")
    finally:
        driver.close()


if __name__ == "__main__":
    main()