import os
from neo4j import GraphDatabase

password = os.getenv("NEO4J_PASSWORD", "Ac8E-vCF__J_0E0if9lf-kNg7ErLjxDLuWnHxVujBCI")
db_id = "ed0838c3"

protocols = ["neo4j+s", "neo4j+ssc", "bolt+s"]
usernames = ["neo4j", db_id]

print(f"Testing Neo4j AuraDB connections for instance {db_id}...")

success = False
for proto in protocols:
    for user in usernames:
        uri = f"{proto}://{db_id}.databases.neo4j.io"
        print(f"\nTrying URI: {uri} | Username: {user}")
        try:
            driver = GraphDatabase.driver(uri, auth=(user, password))
            driver.verify_connectivity()
            print(f" SUCCESS! Connected using URI: {uri} and Username: {user}")
            success = True
            break
        except Exception as e:
            print(f"  Failed: {e}")
    if success:
        break

if not success:
    print("\n All combinations failed. Please check the credentials in your downloaded text file or reset password in Aura console.")
