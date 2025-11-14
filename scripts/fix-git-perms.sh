#!/bin/bash

set -euo pipefail

if ! command -v git >/dev/null 2>&1; then
  echo "git is required but not found in PATH." >&2
  exit 1
fi

USE_RG=0
if command -v rg >/dev/null 2>&1; then
  USE_RG=1
fi

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"

if [[ -z "${REPO_ROOT}" ]]; then
  echo "This script must be run inside a git repository." >&2
  exit 1
fi

TARGET="${REPO_ROOT}/.git"

attr_present() {
  local attr="$1"
  if ((USE_RG)); then
    if xattr -lr "${TARGET}" 2>/dev/null | rg -q "${attr}"; then
      return 0
    fi
  else
    if xattr -lr "${TARGET}" 2>/dev/null | python3 - "${attr}" <<'PY'; then
import sys
needle = sys.argv[1]
for line in sys.stdin:
    if needle in line:
        sys.exit(0)
sys.exit(1)
PY
      return 0
    fi
  fi
  return 1
}

echo "Fixing permissions and extended attributes for ${TARGET}"

sudo chflags -R nouchg "${TARGET}" 2>/dev/null || true
sudo chown -R "$(whoami)":staff "${TARGET}"
sudo chmod -R u+rwX "${TARGET}"

REMAINING=()

for ATTR in com.apple.provenance com.apple.quarantine; do
  if attr_present "${ATTR}"; then
    echo "Removing ${ATTR} from ${TARGET}"
    sudo xattr -dr "${ATTR}" "${TARGET}" 2>/dev/null || true

    if attr_present "${ATTR}"; then
      REMAINING+=("${ATTR}")
    fi
  fi
done

if ((${#REMAINING[@]})); then
  echo "WARNING: The following attributes are still present after cleanup: ${REMAINING[*]}" >&2
  echo "You may need to rerun this script or manually run:" >&2
  for ATTR in "${REMAINING[@]}"; do
    echo "  sudo xattr -r -d ${ATTR} \"${TARGET}\"" >&2
  done
else
  echo "Permissions refreshed. You should now be able to run git commands without elevation."
fi
