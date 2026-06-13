#!/bin/bash
# export-supabase-schema.sh
# Exports Supabase schema and data for migration to NEON

set -e

# Supabase connection details — use env var SOURCE_DATABASE_URL
if [ -z "$SOURCE_DATABASE_URL" ]; then
  echo "Set SOURCE_DATABASE_URL env var (Supabase connection string)"
  exit 1
fi
CONN_STR="$SOURCE_DATABASE_URL"

echo "========================================"
echo "Exporting Supabase schema and data..."
echo "========================================"

# Export schema only
echo "Exporting schema..."
pg_dump "$CONN_STR" --schema-only > supabase_schema.sql

# Export data only
echo "Exporting data..."
pg_dump "$CONN_STR" --data-only > supabase_data.sql

echo ""
echo "========================================"
echo "Export complete!"
echo "Files created:"
echo "  - supabase_schema.sql"
echo "  - supabase_data.sql"
echo "========================================"
