#!/bin/bash
# Migrate data from Supabase to WSL PostgreSQL

set -e

SUPABASE_HOST="db.ohleydwbqagxwyfdtiny.supabase.co"
SUPABASE_PORT="6543"
SUPABASE_USER="postgres"
SUPABASE_PASSWORD="2mr38qsDV52NxD8NT"
SUPABASE_DB="postgres"

WSL_HOST="localhost"
WSL_PORT="5432"
WSL_USER="postgres"
WSL_DB="budgetapp_dev"

DUMP_FILE="/tmp/supabase_dump.sql"

echo "🔄 Starting Supabase to WSL PostgreSQL migration..."
echo ""

# Step 1: Dump Supabase schema and data
echo "📤 Step 1: Dumping Supabase database..."
PGPASSWORD="$SUPABASE_PASSWORD" pg_dump \
  -h "$SUPABASE_HOST" \
  -p "$SUPABASE_PORT" \
  -U "$SUPABASE_USER" \
  -d "$SUPABASE_DB" \
  --verbose \
  --no-owner \
  --no-acl \
  --if-exists \
  --clean \
  > "$DUMP_FILE"

echo "✅ Dump completed: $DUMP_FILE"
echo ""

# Step 2: Restore to WSL PostgreSQL
echo "📥 Step 2: Restoring to WSL PostgreSQL..."
PGPASSWORD="" sudo -u postgres psql -h "$WSL_HOST" -p "$WSL_PORT" -d "$WSL_DB" < "$DUMP_FILE"

echo "✅ Restore completed!"
echo ""

# Step 3: Verify
echo "✅ Verifying tables..."
sudo -u postgres psql -h "$WSL_HOST" -p "$WSL_PORT" -d "$WSL_DB" -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;" 

echo ""
echo "🎉 Migration complete! Data ready in WSL PostgreSQL"
