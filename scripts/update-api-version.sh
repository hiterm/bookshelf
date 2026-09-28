#!/usr/bin/env bash

set -euo pipefail

version=${1:-}
version_file=${2:-bookshelf-api.version}

if [[ ! "${version}" =~ ^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$ ]]; then
  echo "Invalid API version: ${version}" >&2
  exit 1
fi

current_version=$(tr -d '[:space:]' < "${version_file}")
if [[ "${current_version}" == "${version}" ]]; then
  echo "bookshelf-api.version is already ${version}"
  changed=false
else
  printf '%s\n' "${version}" > "${version_file}"
  echo "Updated bookshelf-api.version from ${current_version} to ${version}"
  changed=true
fi

if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
  echo "changed=${changed}" >> "${GITHUB_OUTPUT}"
fi
