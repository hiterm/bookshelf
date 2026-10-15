#!/usr/bin/env bash

set -euo pipefail

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
updater="${script_dir}/update-api-version.sh"
test_dir=$(mktemp -d)
trap 'rm -rf "${test_dir}"' EXIT
version_file="${test_dir}/bookshelf-api.version"
output_file="${test_dir}/github-output"

printf '1.2.3\n' > "${version_file}"
if "${updater}" 1.2 "${version_file}" 2>/dev/null; then
  echo "Expected an invalid version to fail" >&2
  exit 1
fi
[[ $(< "${version_file}") == "1.2.3" ]]

GITHUB_OUTPUT="${output_file}" "${updater}" 2.3.4 "${version_file}"
[[ $(< "${version_file}") == "2.3.4" ]]
grep -qx 'changed=true' "${output_file}"

: > "${output_file}"
GITHUB_OUTPUT="${output_file}" "${updater}" 2.3.4 "${version_file}"
[[ $(< "${version_file}") == "2.3.4" ]]
grep -qx 'changed=false' "${output_file}"

assert_update() {
  local current=$1 requested=$2 baseline=$3 expected=$4 changed=$5
  printf '%s\n' "${current}" > "${version_file}"
  : > "${output_file}"
  GITHUB_OUTPUT="${output_file}" "${updater}" "${requested}" "${version_file}" "${baseline}"
  [[ $(< "${version_file}") == "${expected}" ]]
  grep -qx "changed=${changed}" "${output_file}"
}

# Delayed deliveries must not downgrade either main or the open PR.
assert_update 2.3.4 2.3.3 "" 2.3.4 false
assert_update 2.3.4 2.3.5 2.3.6 2.3.4 false
assert_update 2.3.4 2.3.6 2.3.6 2.3.4 false
assert_update 2.3.6 2.3.5 2.3.4 2.3.6 false
assert_update 2.3.6 2.3.7 2.3.4 2.3.7 true

# Compare numeric components rather than lexicographic strings.
assert_update 2.9.9 2.10.0 "" 2.10.0 true
assert_update 2.10.0 2.9.9 "" 2.10.0 false
assert_update 9.99.99 10.0.0 "" 10.0.0 true

echo "API version update tests passed"
