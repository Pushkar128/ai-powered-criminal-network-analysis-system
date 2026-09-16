import os
import pandas as pd
from neo4j import GraphDatabase

# Neo4j AuraDB Connection Config
NEO4J_URI = os.getenv("NEO4J_URI", "neo4j+ssc://6c134cfd.databases.neo4j.io")
NEO4J_USERNAME = os.getenv("NEO4J_USERNAME", "6c134cfd")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "jDqtQHhL8GFH81dufMU-xIbBdh-d3IGoSPBfqVAGHQ8")

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


def batch_load_entities(session, csv_path, source_tag, batch_size=500):
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
        e.source = $source
    ON MATCH SET 
        e += row,
        e.id = toString(row.id),
        e.entity_id = toString(row.id),
        e.name = coalesce(row.name, row.label, e.name),
        e.updated_source = $source
    """

    for i in range(0, len(records), batch_size):
        session.run(query, batch=records[i:i + batch_size], source=source_tag)
    print(f"✓ Ingested {len(records)} entities from {os.path.basename(csv_path)}")


def batch_load_relationships(session, csv_path, source_tag, batch_size=500):
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
        r.source = $source
    ON MATCH SET
        r += row,
        r.updated_source = $source
    """

    for i in range(0, len(records), batch_size):
        session.run(query, batch=records[i:i + batch_size], source=source_tag)
    print(f"✓ Ingested {len(records)} relationships from {os.path.basename(csv_path)}")


def main():
    driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USERNAME, NEO4J_PASSWORD))
    
    try:
        with driver.session() as session:
            print("--- Setting Up Schema Constraints ---")
            create_constraints(session)

            print("\n--- Ingesting Structured Data ---")
            batch_load_entities(session, STRUCTURED_ENTITIES_PATH, source_tag="structured")
            batch_load_relationships(session, STRUCTURED_RELATIONSHIPS_PATH, source_tag="structured")

            print("\n--- Ingesting Unstructured NLP Data ---")
            batch_load_entities(session, NLP_ENTITIES_PATH, source_tag="nlp")
            batch_load_relationships(session, NLP_RELATIONSHIPS_PATH, source_tag="nlp")

            print("\n--- Ingestion Pipeline Complete ---")
    finally:
        driver.close()


if __name__ == "__main__":
    main()