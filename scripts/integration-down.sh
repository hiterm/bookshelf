#!/bin/bash
API_VERSION=$(tr -d '[:space:]' < bookshelf-api.version)
export API_VERSION

docker compose -f docker-compose.integration.yml down
