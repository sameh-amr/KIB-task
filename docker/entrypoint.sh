#!/bin/sh
set -e

# Wait for Postgres TCP port
echo "Waiting for Postgres at ${DATABASE_HOST}:${DATABASE_PORT}..."
until node -e "require('net').createConnection({host: process.env.DATABASE_HOST, port: parseInt(process.env.DATABASE_PORT||'5432')}).once('connect',()=>process.exit(0)).once('error',()=>process.exit(1))"; do
  sleep 1
done
echo "Postgres is up."

# Ensure DB exists (your script already does this)
echo "Ensuring database..."
node scripts/ensure-db.js

# Run migrations using compiled data source
echo "Running migrations..."
node ./node_modules/typeorm/cli.js -d ./dist/data-source.js migration:run

# Start the app
echo "Starting API..."
node dist/src/main.js
