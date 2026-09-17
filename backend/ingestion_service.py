import csv
import io
import re
from backend.graph_service import get_driver
from backend.analytics_service import record_audit_action


def process_raw_fir_text(fir_text: str, case_id: str = "CASE-NEW"):
    """
    NLP entity extraction logic to parse unstructured FIR text and inject extracted nodes/edges into Neo4j.
    Extracts Suspects, Phone Numbers, Vehicles, Locations, and Amounts.
    """
    # Simple regex-based NLP entity extractor for demonstration/competition speed
    phones = list(set(re.findall(r'\+?\d{10,12}', fir_text)))
    vehicles = list(set(re.findall(r'[A-Z]{2}[-\s]?\d{2}[-\s]?[A-Z]{1,2}[-\s]?\d{4}', fir_text)))
    amounts = list(set(re.findall(r'₹?\s?\d+,\d+,\d+|\d+\s?Lakh|\d+\s?Crore', fir_text)))
    
    STOPWORDS = {"Has", "Recently", "Contacted", "Called", "Met", "Spoke", "With", "To", "From", "And", "The", "In", "At", "Near", "On", "Of", "For", "Is", "Was", "They", "He", "She", "It", "Case", "Update", "Fir", "New", "Yesterday", "Today"}

    # Extract names following typical FIR patterns or free-form sentence capitalized words
    name_matches = re.findall(r'(?:Accused|Suspect|Alias|Named)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)', fir_text)
    if not name_matches:
        raw_words = re.findall(r'\b[A-Z][a-z]+\b', fir_text)
        name_matches = [w for w in raw_words if w not in STOPWORDS]
    
    names = list(dict.fromkeys(name_matches)) if name_matches else ["Unknown Suspect"]
    
    locations_matches = re.findall(r'(?:at|near|location|area of)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)', fir_text)
    locations = list(set(locations_matches)) if locations_matches else []

    nodes_created = []
    edges_created = []

    with get_driver() as driver:
        with driver.session() as session:
            # Create Case node
            session.run("""
                MERGE (c:Entity {id: $case_id})
                ON CREATE SET c.name = $case_id, c.type = 'CrimeCase', c.created_at = timestamp()
            """, case_id=case_id)
            
            # Create Suspect Nodes
            for idx, name in enumerate(names):
                suspect_id = f"PER_{name.upper()[:6]}_{int(abs(hash(name)) % 10000)}"
                session.run("""
                    MERGE (p:Entity {name: $name})
                    ON CREATE SET p.id = $suspect_id, p.type = 'Person', p.status = 'SUSPECT', p.case_id = $case_id
                    MERGE (c:Entity {id: $case_id})
                    MERGE (p)-[:MENTIONED_IN_CASE]->(c)
                """, name=name, suspect_id=suspect_id, case_id=case_id)
                nodes_created.append({"id": suspect_id, "name": name, "type": "Person", "case_id": case_id})

            # Detect contextual relationship between persons
            text_lower = fir_text.lower()
            if any(k in text_lower for k in ["contact", "call", "phone", "talk", "spoke"]):
                rel_label = "CONTACTED"
            elif any(k in text_lower for k in ["meet", "met", "spotted", "seen"]):
                rel_label = "SPOTTED_WITH"
            elif any(k in text_lower for k in ["pay", "paid", "transfer", "fund", "money"]):
                rel_label = "FINANCIAL_TRANSFER"
            else:
                rel_label = "ASSOCIATED_WITH"

            if len(nodes_created) >= 2:
                for i in range(len(nodes_created) - 1):
                    p1 = nodes_created[i]["id"]
                    p2 = nodes_created[i+1]["id"]
                    session.run(f"""
                        MATCH (a:Entity {{id: $p1}}), (b:Entity {{id: $p2}})
                        MERGE (a)-[r:{rel_label} {{case_id: $case_id}}]->(b)
                        ON CREATE SET r.weight = 0.9, r.created_at = timestamp()
                    """, p1=p1, p2=p2, case_id=case_id)
                    edges_created.append({"source": p1, "target": p2, "label": rel_label})

            # Create Phone Nodes & connect to Suspect
            for idx, ph in enumerate(phones):
                phone_id = f"PHN_{ph[-6:]}"
                session.run("""
                    MERGE (ph:Entity {id: $phone_id})
                    ON CREATE SET ph.name = $ph, ph.type = 'Phone', ph.case_id = $case_id
                """, phone_id=phone_id, ph=ph, case_id=case_id)
                nodes_created.append({"id": phone_id, "name": ph, "type": "Phone", "case_id": case_id})

                if nodes_created:
                    first_suspect = nodes_created[0]["id"]
                    session.run("""
                        MATCH (p:Entity {id: $suspect_id}), (ph:Entity {id: $phone_id})
                        MERGE (p)-[r:USES_PHONE]->(ph)
                        SET r.weight = 0.9, r.source = 'FIR_PARSER'
                    """, suspect_id=first_suspect, phone_id=phone_id)
                    edges_created.append({"source": first_suspect, "target": phone_id, "label": "USES_PHONE"})

            # Create Vehicle Nodes
            for idx, veh in enumerate(vehicles):
                veh_id = f"VEH_{veh[:6]}"
                session.run("""
                    MERGE (v:Entity {id: $veh_id})
                    ON CREATE SET v.name = $veh, v.type = 'Vehicle', v.case_id = $case_id
                """, veh_id=veh_id, veh=veh, case_id=case_id)
                nodes_created.append({"id": veh_id, "name": veh, "type": "Vehicle", "case_id": case_id})

            # Create Location Nodes
            for idx, loc in enumerate(locations):
                loc_id = f"LOC_{idx+1}_{int(hash(loc)%1000)}"
                session.run("""
                    MERGE (l:Entity {id: $loc_id})
                    ON CREATE SET l.name = $loc, l.type = 'Location', l.case_id = $case_id
                """, loc_id=loc_id, loc=loc, case_id=case_id)
                nodes_created.append({"id": loc_id, "name": loc, "type": "Location", "case_id": case_id})

    record_audit_action(
        "NLP Ingestion Engine", 
        "FIR_PARSED", 
        f"Extracted {len(nodes_created)} entities and {len(edges_created)} edges from text for Case {case_id}"
    )

    return {
        "status": "SUCCESS",
        "case_id": case_id,
        "extracted_nodes_count": len(nodes_created),
        "extracted_edges_count": len(edges_created),
        "nodes": nodes_created,
        "edges": edges_created
    }


def parse_and_ingest_csv_data(csv_text: str, file_type: str = "CDR", case_id: str = "CASE-CSV"):
    """
    Parses Call Detail Records (CDR) or Financial CSV logs and creates relational graph topology.
    """
    reader = csv.DictReader(io.StringIO(csv_text))
    nodes_created = []
    edges_created = []

    with get_driver() as driver:
        with driver.session() as session:
            for row in reader:
                src = row.get("Caller") or row.get("Sender") or row.get("Source")
                tgt = row.get("Receiver") or row.get("Beneficiary") or row.get("Target")
                dur_or_amt = row.get("Duration") or row.get("Amount") or "10"

                if src and tgt:
                    src_id = f"NODE_{src[:8]}"
                    tgt_id = f"NODE_{tgt[:8]}"

                    # Create Source & Target
                    session.run("""
                        MERGE (s:Entity {id: $src_id})
                        ON CREATE SET s.name = $src, s.type = $type_src, s.case_id = $case_id
                        MERGE (t:Entity {id: $tgt_id})
                        ON CREATE SET t.name = $tgt, t.type = $type_tgt, t.case_id = $case_id
                        MERGE (s)-[r:CONNECTED_TO]->(t)
                        SET r.weight = 0.85, r.detail = $detail
                    """, src_id=src_id, src=src, tgt_id=tgt_id, tgt=tgt, 
                       type_src="Phone" if file_type == "CDR" else "BankAccount",
                       type_tgt="Phone" if file_type == "CDR" else "BankAccount",
                       case_id=case_id, detail=dur_or_amt)

                    nodes_created.extend([{"id": src_id, "name": src}, {"id": tgt_id, "name": tgt}])
                    edges_created.append({"source": src_id, "target": tgt_id, "label": "CALL_LOG" if file_type == "CDR" else "TRANSFERRED_FUNDS"})

    record_audit_action("CSV Batch Parser", f"{file_type}_CSV_INGESTED", f"Processed CSV records for case {case_id}")

    return {
        "status": "SUCCESS",
        "case_id": case_id,
        "processed_rows": len(nodes_created) // 2,
        "nodes": nodes_created[:10],
        "edges": edges_created[:10]
    }
