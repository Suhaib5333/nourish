#!/bin/bash
# Nourish — Run Supabase migrations
# Usage: npm run db:migrate              (run all pending)
#        npm run db:migrate -- file.sql  (run specific file)

# Load .env
if [ -f .env ]; then
  export $(grep -v '^#' .env | grep SUPABASE_DB_URL | xargs)
fi

DB_URL="${SUPABASE_DB_URL}"
MIGRATIONS_DIR="supabase/migrations"

if [ -z "$DB_URL" ]; then
  echo "❌ SUPABASE_DB_URL not set. Add it to .env"
  exit 1
fi

# Create migrations tracking table
npx supabase db query --db-url "$DB_URL" \
  "create table if not exists _migrations (name text primary key, ran_at timestamptz default now())" 2>/dev/null

run_migration() {
  local file="$1"
  local name=$(basename "$file")

  # Check if already ran
  local result=$(npx supabase db query --db-url "$DB_URL" \
    "select name from _migrations where name = '$name'" 2>/dev/null)

  if echo "$result" | grep -q "$name"; then
    echo "⏭️  Skipping $name (already applied)"
    return 0
  fi

  echo "🔄 Running $name..."

  # Run each non-empty, non-comment line as a statement
  local success=true
  while IFS= read -r line || [ -n "$line" ]; do
    [[ -z "$line" || "$line" =~ ^-- ]] && continue
    local out=$(npx supabase db query --db-url "$DB_URL" "$line" 2>&1)
    if echo "$out" | grep -qi "error"; then
      if ! echo "$out" | grep -qi "already exists"; then
        echo "  ❌ $out"
        success=false
      fi
    fi
  done < "$file"

  if $success; then
    npx supabase db query --db-url "$DB_URL" \
      "insert into _migrations (name) values ('$name') on conflict do nothing" 2>/dev/null
    echo "  ✅ $name applied"
  fi
}

if [ -n "$1" ]; then
  run_migration "$1"
else
  for file in $(ls "$MIGRATIONS_DIR"/*.sql 2>/dev/null | sort); do
    run_migration "$file"
  done
  echo ""
  echo "✅ All migrations complete"
fi
