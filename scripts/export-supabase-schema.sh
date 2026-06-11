#!/bin/bash
# export-supabase-schema.sh
# Exports Supabase schema and data for migration to NEON

set -e

# Supabase connection details (from .env.local)
SUPABASE_URL="aws-0-ap-southeast-1.pooler.supabase.com"
SUPABASE_DB="postgres"
SUPABASE_USER="postgres.isubgeemvhvhnhikxbjb"
SUPABASE_PASS="REDACTED_SUPABASE_PASSWORD"

# Build connection string
CONN_STR="postgresql://${SUPABASE_USER}:${SUPABASE_PASS}@${SUPABASE_URL}:6543/${SUPABASE_DB}"

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
