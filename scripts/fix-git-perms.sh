#!/bin/bash

set -euo pipefail

if ! command -v git >/dev/null 2>&1; then
  echo "git is required but not found in PATH." >&2
  exit 1
fi

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"

if [[ -z "${REPO_ROOT}" ]]; then
  echo "This script must be run inside a git repository." >&2
  exit 1
fi

TARGET="${REPO_ROOT}/.git"

echo "Fixing permissions and extended attributes for ${TARGET}"

sudo chflags -R nouchg "${TARGET}" 2>/dev/null || true
sudo chown -R "$(whoami)":staff "${TARGET}"
sudo chmod -R u+rwX "${TARGET}"

for ATTR in com.apple.provenance com.apple.quarantine; do
  if xattr -p "${ATTR}" "${TARGET}" >/dev/null 2>&1; then
    echo "Removing ${ATTR} from ${TARGET}"
  fi
  sudo xattr -dr "${ATTR}" "${TARGET}" 2>/dev/null || true
done

echo "Permissions refreshed. You should now be able to run git commands without elevation."
