#!/bin/bash
set -e

API_VERSION=$(tr -d '[:space:]' < bookshelf-api.version)
export API_VERSION

docker compose -f docker-compose.integration.yml up -d

echo "Waiting for bookshelf-api..."
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
docker compose -f docker-compose.integration.yml logs bookshelf-api
exit 1
