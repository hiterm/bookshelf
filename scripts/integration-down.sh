#!/bin/bash

if [ -f /tmp/jwks-server.pid ]; then
  kill "$(cat /tmp/jwks-server.pid)" 2>/dev/null || true
  rm /tmp/jwks-server.pid
fi

docker rm -f bookshelf-integration-api 2>/dev/null || true
docker rm -f bookshelf-integration-postgres 2>/dev/null || true

echo "Integration services stopped"
