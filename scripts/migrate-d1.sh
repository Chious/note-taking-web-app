#!/bin/bash

# D1 Migration Helper Script
# This script helps apply migrations to both local and remote D1 databases

echo "🚀 D1 Migration Helper"
echo "====================="

# Check if migration name is provided
if [ -z "$1" ]; then
    echo "📋 Available commands:"
    echo "  ./scripts/migrate-d1.sh apply     - Apply all pending migrations"
    echo "  ./scripts/migrate-d1.sh list      - List migration status"
    echo "  ./scripts/migrate-d1.sh tables    - Show tables in database"
    echo ""
    exit 1
fi

case "$1" in
    "apply")
        echo "📦 Applying migrations to local D1 database..."
        npx wrangler d1 migrations apply noteapp
        
        echo ""
        echo "☁️  Applying migrations to remote D1 database..."
        npx wrangler d1 migrations apply noteapp --remote
        
        echo "✅ Migrations completed!"
        ;;
        
    "list")
        echo "📋 Local D1 database migration status:"
        npx wrangler d1 migrations list noteapp
        
        echo ""
        echo "☁️  Remote D1 database migration status:"
        npx wrangler d1 migrations list noteapp --remote
        ;;
        
    "tables")
        echo "📋 Local D1 database tables:"
        npx wrangler d1 execute noteapp --command="SELECT name FROM sqlite_master WHERE type='table';"
        
        echo ""
        echo "☁️  Remote D1 database tables:"
        npx wrangler d1 execute noteapp --remote --command="SELECT name FROM sqlite_master WHERE type='table';"
        ;;
        
    *)
        echo "❌ Unknown command: $1"
        echo "📋 Available commands: apply, list, tables"
        exit 1
        ;;
esac
