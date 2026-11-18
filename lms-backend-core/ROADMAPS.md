# Roadmap metadata

The roadmap editor stores category, estimated roadmap duration, target audience,
and estimated duration for each stage. Before starting the backend with the
updated entities, apply
`src/main/resources/db/add_roadmap_metadata_and_stage_duration.sql` to the
configured PostgreSQL database. The script is safe to re-run and keeps existing
roadmap rows; the new fields are nullable.

Roadmap and stage durations are stored as positive whole weeks. Existing rows
without values remain valid and display those details only when provided.
