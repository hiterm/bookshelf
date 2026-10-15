#!/usr/bin/env bash

set -euo pipefail

version=${1:-}
version_file=${2:-bookshelf-api.version}
baseline_version=${3:-}

if [[ ! "${version}" =~ ^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$ ]]; then
  echo "Invalid API version: ${version}" >&2
  exit 1
fi

current_version=$(tr -d '[:space:]' < "${version_file}")
if [[ -z "${current_version}" ]]; then
  echo "Current API version is empty" >&2
  exit 1
fi

for reference_version in "${current_version}" "${baseline_version}"; do
  [[ -z "${reference_version}" ]] && continue
  if [[ ! "${reference_version}" =~ ^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$ ]]; then
    echo "Invalid reference API version: ${reference_version}" >&2
    exit 1
  fi
done

latest_version=$(printf '%s\n' "${version}" "${current_version}" "${baseline_version}" | sort -V | tail -n 1)
if [[ "${current_version}" == "${version}" || "${latest_version}" != "${version}" || "${baseline_version}" == "${version}" ]]; then
  echo "Skipping API version ${version}; current=${current_version}, baseline=${baseline_version}"
  changed=false
else
  printf '%s\n' "${version}" > "${version_file}"
  echo "Updated bookshelf-api.version from ${current_version} to ${version}"
  changed=true
fi

if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
  echo "changed=${changed}" >> "${GITHUB_OUTPUT}"
fi
