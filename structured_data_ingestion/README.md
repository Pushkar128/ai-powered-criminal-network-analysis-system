# Structured Data Ingestion

Ingests registry-style structured CSV files, validates and normalizes records, assigns standardized entity IDs, generates graph-ready entities and relationships, and removes duplicate relationships.

## Run

```bash
python src/structured_ingestion.py
```

## Inputs

- `data/raw/person_registry.csv`
- `data/raw/vehicle_registry.csv`
- `data/raw/contact_records.csv`
- `data/raw/financial_records.csv`
- `data/raw/location_registry.csv`
- `data/raw/organization_registry.csv`
- `data/raw/case_register.csv`

## Outputs

- `data/output/final_structured_entities.csv`
- `data/output/final_structured_relationships.csv`

The outputs follow the approved entity and relationship formats and can later be combined with the NLP dataset for matching and graph creation.


Relationships are created only from explicit fields in the structured source records; no row-order or artificially assigned relationships are generated.
