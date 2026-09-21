#!/usr/bin/env bash

set -uo pipefail

: "${API_IMAGE:?API_IMAGE must be set}"

generate() {
  set -e
  local start=$SECONDS
  pnpm run generate
  echo "Source generation completed in $((SECONDS - start))s"
}

start_postgres() {
  set -e
  local start=$SECONDS
  docker pull postgres:15
  docker run -d \
    --name postgres \
    --network host \
    -e POSTGRES_USER=bookshelf \
    -e POSTGRES_PASSWORD=password \
    -e POSTGRES_DB=bookshelf \
    postgres:15
  for _ in {1..30}; do
    if docker exec postgres pg_isready -U bookshelf; then
      echo "PostgreSQL ready in $((SECONDS - start))s"
      return
    fi
    sleep 1
  done
  docker logs postgres
  return 1
}

pull_api() {
  set -e
  local start=$SECONDS
  docker pull "$API_IMAGE"
  if [[ ${LOG_API_DIGEST:-false} == true ]]; then
    local digest
    digest=$(docker image inspect --format '{{index .RepoDigests 0}}' "$API_IMAGE")
    echo "Using bookshelf-api main image: $digest"
  fi
  echo "bookshelf-api pull completed in $((SECONDS - start))s"
}

install_playwright() {
  set -e
  local start=$SECONDS
  pnpm exec playwright install --only-shell chromium
  echo "Playwright install completed in $((SECONDS - start))s"
}

wait_for_jwks() {
  set -e
  local start=$SECONDS
  for _ in {1..30}; do
    if curl -fs http://localhost:9999/.well-known/jwks.json > /dev/null; then
      echo "JWKS server ready in $((SECONDS - start))s"
      return
    fi
    sleep 1
  done
  cat /tmp/jwks.log
  return 1
}

generate & generate_pid=$!
start_postgres & postgres_pid=$!
pull_api & api_pull_pid=$!
install_playwright & playwright_pid=$!
node e2e-integration/jwks-server.mjs > /tmp/jwks.log 2>&1 &
wait_for_jwks & jwks_pid=$!

status=0
for setup in \
  "generate:$generate_pid" \
  "postgres:$postgres_pid" \
  "api-pull:$api_pull_pid" \
  "playwright:$playwright_pid" \
  "jwks:$jwks_pid"; do
  name=${setup%%:*}
  pid=${setup##*:}
  if ! wait "$pid"; then
    echo "::error::$name setup failed"
    status=1
  fi
done
if ((status != 0)); then
  exit "$status"
fi

set -e
start=$SECONDS
docker run -d \
  --name bookshelf-api \
  --network host \
  -e DATABASE_URL=postgres://bookshelf:password@localhost:5432/bookshelf \
  -e PORT=8080 \
  -e ALLOWED_ORIGINS=http://localhost:4173 \
  -e JWT_AUDIENCE=test-audience \
  -e JWT_DOMAIN=test-issuer.local \
  -e JWKS_URL=http://localhost:9999/.well-known/jwks.json \
  "$API_IMAGE"
for _ in {1..60}; do
  if curl -fs http://localhost:8080/health > /dev/null; then
    echo "bookshelf-api ready in $((SECONDS - start))s"
    exit 0
  fi
  sleep 1
done
docker logs bookshelf-api
exit 1
