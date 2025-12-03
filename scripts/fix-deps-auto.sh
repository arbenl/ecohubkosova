#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "🧰 [deps-fix] Repo: $ROOT"

# --- detect package manager ---
detect_pm() {
  # 1) package.json "packageManager"
  if [[ -f package.json ]]; then
    local pm
    pm="$(node -p "try{require('./package.json').packageManager||''}catch(e){''}" 2>/dev/null || true)"
    if [[ -n "${pm:-}" ]]; then
      if [[ "$pm" == pnpm@* ]]; then echo "pnpm"; return; fi
      if [[ "$pm" == npm@*  ]]; then echo "npm";  return; fi
      if [[ "$pm" == yarn@* ]]; then echo "yarn"; return; fi
      if [[ "$pm" == bun@*  ]]; then echo "bun";  return; fi
    fi
  fi

  # 2) lockfiles
  if [[ -f pnpm-lock.yaml ]]; then echo "pnpm"; return; fi
  if [[ -f package-lock.json ]]; then echo "npm"; return; fi
  if [[ -f yarn.lock ]]; then echo "yarn"; return; fi
  if [[ -f bun.lockb || -f bun.lock ]]; then echo "bun"; return; fi

  # default
  echo "npm"
}

PM="$(detect_pm)"
echo "✅ [deps-fix] Detected package manager: $PM"
echo "ℹ️  Node: $(node -v 2>/dev/null || echo 'missing')"
echo "ℹ️  npm : $(npm -v 2>/dev/null || echo 'missing')"

# --- common cleanup ---
echo "🧹 [deps-fix] Removing node_modules (and common caches)..."
rm -rf node_modules .next .turbo dist build coverage 2>/dev/null || true

# --- manager-specific cleanup + install ---
case "$PM" in
  pnpm)
    echo "🧹 [deps-fix] pnpm cleanup"
    if ! command -v pnpm >/dev/null 2>&1; then
      echo "→ pnpm not found; enabling via corepack"
      corepack enable >/dev/null 2>&1 || true
      corepack prepare pnpm@latest --activate >/dev/null 2>&1 || true
    fi

    echo "→ pnpm version: $(pnpm -v)"
    pnpm store prune || true
    echo "📦 [deps-fix] pnpm install"
    pnpm install || pnpm install --no-frozen-lockfile
    ;;

  yarn)
    echo "🧹 [deps-fix] yarn cleanup"
    if command -v yarn >/dev/null 2>&1; then
      yarn cache clean || true
      echo "📦 [deps-fix] yarn install"
      yarn install || yarn install --no-immutable
    else
      echo "❌ yarn not found. Install yarn or set packageManager in package.json."
      exit 1
    fi
    ;;

  bun)
    echo "🧹 [deps-fix] bun cleanup"
    if command -v bun >/dev/null 2>&1; then
      bun pm cache rm || true
      echo "📦 [deps-fix] bun install"
      bun install
    else
      echo "❌ bun not found. Install bun or set packageManager in package.json."
      exit 1
    fi
    ;;

  npm|*)
    echo "🧹 [deps-fix] npm cleanup"
    npm cache clean --force || true

    # IMPORTANT: avoids the npm@11 arborist crash by running npm@10 via npx (no global downgrade)
    echo "📦 [deps-fix] npm install using npm@10 (via npx) to avoid arborist 'matches' crash"
    npx -y npm@10.9.2 install --no-audit --no-fund || npx -y npm@10.9.2 install --legacy-peer-deps --no-audit --no-fund
    ;;
esac

echo "✅ [deps-fix] Done."
echo "Next recommended checks:"
echo "  - $PM -v (or npm -v)"
echo "  - pnpm build / pnpm dev (or npm run build / npm run dev)"