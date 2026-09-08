#!/bin/bash
set -euo pipefail

if [[ -n "${GRAPHQL_SCHEMA_PATH:-}" ]]; then
  cp "$GRAPHQL_SCHEMA_PATH" src/graphql/schema.graphql
  exit 0
fi

VERSION=$(cat "$(dirname "$0")/../bookshelf-api.version" | tr -d '[:space:]')
curl -f -o src/graphql/schema.graphql \
  "https://raw.githubusercontent.com/hiterm/bookshelf-api/${VERSION}/schema.graphql"
