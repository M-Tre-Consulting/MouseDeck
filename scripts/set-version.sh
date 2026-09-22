#!/usr/bin/env bash
# ==============================================================================
# MouseDeck - Version Synchronization Script
# Synchronizes the application release version from Git tag or input across:
# - package.json
# - src-tauri/tauri.conf.json
# - src-tauri/Cargo.toml
# - packaging/arch/PKGBUILD
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${ROOT_DIR}"

COLOR_RESET="\033[0m"
COLOR_BOLD="\033[1m"
COLOR_CYAN="\033[36m"
COLOR_GREEN="\033[32m"
COLOR_YELLOW="\033[33m"

# Auto-discover node if not in current PATH
if ! command -v node >/dev/null 2>&1; then
    for candidate in /usr/bin/node /usr/local/bin/node "$HOME/.nvm/versions/node/"*/bin/node "$HOME/.local/share/nvm/"*/bin/node; do
        if [ -x "$candidate" ]; then
            export PATH="$(dirname "$candidate"):$PATH"
            break
        fi
    done
fi

RAW_VER="${1:-${VERSION:-}}"

if [ -z "${RAW_VER}" ]; then
    if [ -n "${GITHUB_REF_NAME:-}" ]; then
        RAW_VER="${GITHUB_REF_NAME}"
    elif git describe --tags --exact-match >/dev/null 2>&1; then
        RAW_VER="$(git describe --tags --exact-match)"
    fi
fi

# Strip leading 'refs/tags/' or 'v' if present
CLEAN_VER="$(echo "${RAW_VER:-}" | sed -E 's#^refs/tags/##; s#^v##')"

# Check if it matches semver pattern (e.g. 1.0.0, 1.2.3-rc1, etc.)
if [[ "${CLEAN_VER}" =~ ^[0-9]+\.[0-9]+(\.[0-9]+)?(-[a-zA-Z0-9.]+)?$ ]]; then
    TARGET_VERSION="${CLEAN_VER}"
else
    # Fallback to current version in package.json
    TARGET_VERSION="$(grep '"version"' package.json | head -n1 | cut -d'"' -f4 || echo "1.0.0")"
fi

echo -e "${COLOR_CYAN}${COLOR_BOLD}==>${COLOR_RESET} Setting MouseDeck version to: ${COLOR_GREEN}${COLOR_BOLD}${TARGET_VERSION}${COLOR_RESET}"

# 1. Update package.json & src-tauri/tauri.conf.json
if command -v node >/dev/null 2>&1; then
    node -e "
const fs = require('fs');
const v = process.argv[1];

// package.json
try {
  const p = 'package.json';
  const pkg = JSON.parse(fs.readFileSync(p, 'utf8'));
  pkg.version = v;
  fs.writeFileSync(p, JSON.stringify(pkg, null, 2) + '\n');
  console.log('  ✓ Updated package.json -> ' + v);
} catch (e) {
  console.error('  ✗ Failed to update package.json:', e.message);
}

// src-tauri/tauri.conf.json
try {
  const p = 'src-tauri/tauri.conf.json';
  const conf = JSON.parse(fs.readFileSync(p, 'utf8'));
  conf.version = v;
  fs.writeFileSync(p, JSON.stringify(conf, null, 2) + '\n');
  console.log('  ✓ Updated src-tauri/tauri.conf.json -> ' + v);
} catch (e) {
  console.error('  ✗ Failed to update src-tauri/tauri.conf.json:', e.message);
}
" "${TARGET_VERSION}"
else
    # Fallback to sed if node is not installed yet
    sed -i -E "0,/\"version\"[[:space:]]*:[[:space:]]*\"[^\"]+\"/s/(\"version\"[[:space:]]*:[[:space:]]*)\"[^\"]+\"/\1\"${TARGET_VERSION}\"/" package.json
    sed -i -E "0,/\"version\"[[:space:]]*:[[:space:]]*\"[^\"]+\"/s/(\"version\"[[:space:]]*:[[:space:]]*)\"[^\"]+\"/\1\"${TARGET_VERSION}\"/" src-tauri/tauri.conf.json
    echo "  ✓ Updated package.json and tauri.conf.json via sed -> ${TARGET_VERSION}"
fi

# 2. Update src-tauri/Cargo.toml (package version)
if [ -f "src-tauri/Cargo.toml" ]; then
    sed -i -E "0,/^version[[:space:]]*=/s/^(version[[:space:]]*=[[:space:]]*)\"[^\"]+\"/\1\"${TARGET_VERSION}\"/" src-tauri/Cargo.toml
    echo "  ✓ Updated src-tauri/Cargo.toml -> ${TARGET_VERSION}"
fi

# 3. Update packaging/arch/PKGBUILD
if [ -f "packaging/arch/PKGBUILD" ]; then
    sed -i -E "s/^(pkgver=).*/\1${TARGET_VERSION}/" packaging/arch/PKGBUILD
    echo "  ✓ Updated packaging/arch/PKGBUILD -> ${TARGET_VERSION}"
fi

echo -e "${COLOR_GREEN}${COLOR_BOLD}==>${COLOR_RESET} Version synchronized successfully across all Linux targets."
