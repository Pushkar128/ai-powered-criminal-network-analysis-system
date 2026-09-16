from pathlib import Path
import json
import re
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw"
OUT = ROOT / "data" / "output"
OUT.mkdir(parents=True, exist_ok=True)

ENTITY_TYPES = {"PERSON", "LOCATION", "CASE", "PHONE", "VEHICLE", "BANK_ACCOUNT", "ORGANIZATION"}
RELATIONSHIP_TYPES = {
    "LIVES_AT", "ASSOCIATED_WITH", "INVOLVED_IN", "CALLED", "OWNS",
    "USED", "LOCATED_AT", "REGISTERED_TO", "VISITED", "MEMBER_OF"
}


def norm(value):
    value = "" if pd.isna(value) else str(value)
    return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()


def props(**kwargs):
    return json.dumps({k: v for k, v in kwargs.items() if v is not None and not pd.isna(v)}, ensure_ascii=False)


def main():
    entities, relationships = [], []
    entity_seen, rel_seen = set(), set()

    def add_entity(entity_id, entity_type, name, source_record, confidence=0.95, aliases=None, **extra):
        if entity_type not in ENTITY_TYPES:
            raise ValueError(f"Invalid entity type: {entity_type}")
        if entity_id in entity_seen:
            return
        entity_seen.add(entity_id)
        aliases = aliases or name
        entities.append({
            "entity_id": entity_id,
            "entity_type": entity_type,
            "name": str(name),
            "normalized_name": norm(name),
            "aliases": str(aliases),
            "source_record": source_record,
            "confidence": confidence,
            "properties": props(**extra),
        })

    def add_rel(source_id, relationship_type, target_id, source_record, date=None, confidence=0.92, **extra):
        if relationship_type not in RELATIONSHIP_TYPES:
            raise ValueError(f"Invalid relationship type: {relationship_type}")
        key = (source_id, relationship_type, target_id)
        if key in rel_seen:
            return
        rel_seen.add(key)
        relationships.append({
            "relationship_id": f"R{len(relationships)+1:04d}",
            "source_id": source_id,
            "relationship_type": relationship_type,
            "target_id": target_id,
            "date": date or "",
            "source_record": source_record,
            "confidence": confidence,
            "properties": props(**extra),
        })

    persons = pd.read_csv(RAW / "person_registry.csv")
    locations = pd.read_csv(RAW / "location_registry.csv")
    vehicles = pd.read_csv(RAW / "vehicle_registry.csv")
    contacts = pd.read_csv(RAW / "contact_records.csv")
    finances = pd.read_csv(RAW / "financial_records.csv")
    orgs = pd.read_csv(RAW / "organization_registry.csv")
    cases = pd.read_csv(RAW / "case_register.csv")

    for _, r in locations.iterrows():
        add_entity(r.location_id, "LOCATION", r.location_name, r.source_record, category=r.get("category", "residential/commercial"))
    for _, r in orgs.iterrows():
        add_entity(r.organization_id, "ORGANIZATION", r.organization_name, r.source_record)
    for _, r in persons.iterrows():
        add_entity(r.person_id, "PERSON", r.person_name, r.source_record, occupation=r.occupation)
    for _, r in contacts.iterrows():
        add_entity(r.phone_id, "PHONE", r.phone_number, r.source_record, contact_type=r.contact_type)
    for _, r in vehicles.iterrows():
        add_entity(r.vehicle_id, "VEHICLE", r.vehicle_registration, r.source_record, model=r.vehicle_model)
    for _, r in finances.iterrows():
        add_entity(r.account_id, "BANK_ACCOUNT", r.account_number, r.source_record, account_type=r.account_type)
    for _, r in cases.iterrows():
        add_entity(r.case_id, "CASE", r.case_number, r.source_record, crime_type=r.crime_type)

    for _, r in persons.iterrows():
        add_rel(r.person_id, "LIVES_AT", r.address_id, r.source_record)
        if str(r.organization_id) and str(r.organization_id) != "nan":
            add_rel(r.person_id, "MEMBER_OF", r.organization_id, r.source_record)
    for _, r in contacts.iterrows():
        add_rel(r.person_id, "OWNS", r.phone_id, r.source_record)
    for _, r in finances.iterrows():
        add_rel(r.account_holder_id, "OWNS", r.account_id, r.source_record)
    for _, r in vehicles.iterrows():
        add_rel(r.registered_owner_id, "REGISTERED_TO", r.vehicle_id, r.source_record)
        add_rel(r.vehicle_id, "LOCATED_AT", r.registration_location_id, r.source_record)
    for _, r in orgs.iterrows():
        add_rel(r.organization_id, "LOCATED_AT", r.headquarters_location_id, r.source_record)
    for _, r in cases.iterrows():
        add_rel(r.case_id, "LOCATED_AT", r.primary_location_id, r.source_record)
        for pid in str(r.involved_person_ids).split(";"):
            pid = pid.strip()
            if pid:
                add_rel(pid, "INVOLVED_IN", r.case_id, r.source_record)

    pd.DataFrame(entities, columns=["entity_id", "entity_type", "name", "normalized_name", "aliases", "source_record", "confidence", "properties"]).to_csv(OUT / "final_structured_entities.csv", index=False)
    pd.DataFrame(relationships, columns=["relationship_id", "source_id", "relationship_type", "target_id", "date", "source_record", "confidence", "properties"]).to_csv(OUT / "final_structured_relationships.csv", index=False)
    print(f"Created {len(entities)} entities and {len(relationships)} relationships")


if __name__ == "__main__":
    main()
