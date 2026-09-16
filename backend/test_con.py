import os
from backend.graph_service import (
    get_driver,
    search_entity,
    get_full_graph,
    get_node_details,
    find_shortest_path,
    get_top_influencers,
    detect_sub_gangs,
)


def run_tests():
    print("Testing connection to Neo4j AuraDB...")
    driver = get_driver()
    try:
        driver.verify_connectivity()
        print("✓ SUCCESS: Connected to AuraDB instance.")

        print("\n--- Testing 5 Core Graph Features ---")

        # Feature 1: Search & Resolution
        print("\n1. Testing search_entity('Arjun'):")
        results = search_entity("Arjun")
        for res in results[:3]:
            print(f"   {res}")

        # Feature 2: Graph Visualization Data
        print("\n2. Testing get_full_graph(limit=3):")
        nodes, edges = get_full_graph(limit=3)
        print(f"   Nodes sample ({len(nodes)}): {nodes[:2]}")
        print(f"   Edges sample ({len(edges)}): {edges[:2]}")

        # Node Details Lookup
        if results:
            sample_id = results[0]["id"]
            print(f"\n3. Testing get_node_details('{sample_id}'):")
            details = get_node_details(sample_id)
            print(f"   {details}")

        # Feature 3: Shortest Path
        if len(edges) >= 1:
            src = edges[0]["source"]
            tgt = edges[0]["target"]
            print(f"\n4. Testing find_shortest_path('{src}', '{tgt}'):")
            path = find_shortest_path(src, tgt)
            print(f"   {path}")

        # Feature 4: Kingpin / Centrality Identification
        print("\n5. Testing get_top_influencers(limit=3):")
        kingpins = get_top_influencers(limit=3)
        for kp in kingpins:
            print(f"   {kp}")

        # Feature 5: Sub-gang & Community Detection
        print("\n6. Testing detect_sub_gangs(limit=3):")
        subgangs = detect_sub_gangs(limit=3)
        for sg in subgangs:
            print(f"   {sg}")

        print("\n✓ All 5 Backend Core Features Verified Successfully.")

    except Exception as e:
        print(f"\n! Test failed. Error: {e}")
    finally:
        driver.close()


if __name__ == "__main__":
    run_tests()