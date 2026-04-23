#!/bin/bash
set -e

API_VERSION=$(tr -d '[:space:]' < bookshelf-api.version)

echo "Starting PostgreSQL..."
docker run -d \
  --name bookshelf-integration-postgres \
  --network host \
  -e POSTGRES_USER=bookshelf \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=bookshelf \
  postgres:15

for _ in $(seq 1 30); do
  if docker exec bookshelf-integration-postgres pg_isready -U bookshelf 2>/dev/null; then
    echo "PostgreSQL ready"
    break
  fi
  sleep 1
done

echo "Starting JWKS server..."
node e2e-integration/jwks-server.mjs > /tmp/jwks.log 2>&1 &
echo $! > /tmp/jwks-server.pid

for _ in $(seq 1 30); do
  if curl -fs http://localhost:9999/.well-known/jwks.json > /dev/null 2>&1; then
    echo "JWKS server ready"
    break
  fi
  sleep 1
done

echo "Starting bookshelf-api $API_VERSION..."
docker run -d \
  --name bookshelf-integration-api \
  --network host \
  -e DATABASE_URL=postgres://bookshelf:password@localhost:5432/bookshelf \
  -e PORT=8080 \
  -e ALLOWED_ORIGINS=http://localhost:4173 \
  -e JWT_AUDIENCE=test-audience \
  -e JWT_DOMAIN=test-issuer.local \
  "ghcr.io/hiterm/bookshelf-api:$API_VERSION"

for _ in $(seq 1 60); do
  if curl -fs http://localhost:8080/health > /dev/null 2>&1; then
    echo "bookshelf-api ready"
    echo ""
    echo "All services running. Run: npm run test:integration"
    exit 0
  fi
  sleep 1
done

echo "bookshelf-api failed to start:"
docker logs bookshelf-integration-api
exit 1
