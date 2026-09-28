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

echo "API version update tests passed"
