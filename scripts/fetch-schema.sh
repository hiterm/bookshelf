#!/bin/bash
set -euo pipefail

VERSION=$(cat "$(dirname "$0")/../bookshelf-api.version" | tr -d '[:space:]')
curl -f -o src/graphql/schema.graphql \
  "https://raw.githubusercontent.com/hiterm/bookshelf-api/${VERSION}/schema.graphql"
