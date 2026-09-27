import os
from neo4j import GraphDatabase

uri = os.getenv("NEO4J_URI", "neo4j+s://ed0838c3.databases.neo4j.io")
user = os.getenv("NEO4J_USERNAME", "ed0838c3")
password = os.getenv("NEO4J_PASSWORD", "Ac8E-vCF__J_OE0if9lf-kNg7ErLjxDLuWnHxVujBCI")

driver = GraphDatabase.driver(uri, auth=(user, password))

with driver.session() as session:
    res = session.run("""
        MATCH (n:Entity)
        RETURN coalesce(n.case_id, 'CASE-001') AS case_id, count(n) AS count
    """).data()
    print("Distinct case_ids in Neo4j:")
    for row in res:
        print(f"  case_id: {row['case_id']} | count: {row['count']}")
