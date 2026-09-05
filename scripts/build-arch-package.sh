#!/usr/bin/env bash
# ==============================================================================
# MouseDeck - Arch Linux Package Builder (.pkg.tar.zst)
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
COLOR_RED="\033[31m"

log_info()  { echo -e "${COLOR_CYAN}${COLOR_BOLD}==>${COLOR_RESET} ${COLOR_BOLD}$*${COLOR_RESET}"; }
log_ok()    { echo -e "${COLOR_GREEN}${COLOR_BOLD}==>${COLOR_RESET} ${COLOR_BOLD}$*${COLOR_RESET}"; }
log_warn()  { echo -e "${COLOR_YELLOW}${COLOR_BOLD}==> WARNING:${COLOR_RESET} ${COLOR_BOLD}$*${COLOR_RESET}"; }
log_err()   { echo -e "${COLOR_RED}${COLOR_BOLD}==> ERROR:${COLOR_RESET} ${COLOR_BOLD}$*${COLOR_RESET}"; }

# Check dependencies
command -v makepkg >/dev/null 2>&1 || { log_err "makepkg non trovato! Questo script richiede Arch Linux o derivate."; exit 1; }
command -v npm >/dev/null 2>&1 || { log_err "npm non trovato!"; exit 1; }
command -v cargo >/dev/null 2>&1 || export PATH="$HOME/.cargo/bin:$PATH"
command -v cargo >/dev/null 2>&1 || { log_err "cargo non trovato nel PATH o in ~/.cargo/bin!"; exit 1; }

INSTALL_FLAG=false
for arg in "$@"; do
    case "$arg" in
        -i|--install) INSTALL_FLAG=true ;;
    esac
done

# Read version
PKG_VER=$(grep '"version"' package.json | head -n1 | cut -d'"' -f4 || echo "1.0.0")
PKG_REL="1"
PKG_NAME="mousedeck"
ARCH="x86_64"

log_info "Creazione pacchetto Arch Linux per ${PKG_NAME} v${PKG_VER}-${PKG_REL} (${ARCH})..."

# 1. Build frontend
log_info "[1/4] Compilazione interfaccia frontend (Vite / React)..."
npm run build

# 2. Build backend
log_info "[2/4] Compilazione backend Rust in modalità Release..."
cargo build --release --manifest-path src-tauri/Cargo.toml

# Find compiled binary
BIN_PATH=""
if [ -f "src-tauri/target/release/mousedeck" ]; then
    BIN_PATH="src-tauri/target/release/mousedeck"
elif [ -f "src-tauri/target/release/tauri-app" ]; then
    BIN_PATH="src-tauri/target/release/tauri-app"
fi

if [ -z "${BIN_PATH}" ]; then
    log_err "Binario non trovato in src-tauri/target/release/!"
    exit 1
fi
log_ok "Binario compilato trovato: ${BIN_PATH}"

# 3. Prepare staging workspace
BUILD_DIR="${ROOT_DIR}/dist-arch"
STAGING_DIR="${BUILD_DIR}/staging"
rm -rf "${BUILD_DIR}"
mkdir -p "${STAGING_DIR}"

log_info "[3/4] Assemblaggio file di sistema e metadati Arch..."

# Stage files into staging root
mkdir -p "${STAGING_DIR}/usr/bin"
mkdir -p "${STAGING_DIR}/usr/share/applications"
mkdir -p "${STAGING_DIR}/usr/share/pixmaps"
mkdir -p "${STAGING_DIR}/usr/share/polkit-1/actions"
mkdir -p "${STAGING_DIR}/usr/lib/udev/rules.d"
mkdir -p "${STAGING_DIR}/usr/lib/modules-load.d"
mkdir -p "${STAGING_DIR}/usr/share/doc/${PKG_NAME}"

# Binary
install -Dm755 "${BIN_PATH}" "${STAGING_DIR}/usr/bin/mousedeck"

# Desktop file
install -Dm644 packaging/arch/mousedeck.desktop "${STAGING_DIR}/usr/share/applications/mousedeck.desktop"

# Icons
for size in 16 24 32 48 64 128 256 512; do
    if [ -f "packaging/arch/icons/mousedeck_${size}.png" ]; then
        mkdir -p "${STAGING_DIR}/usr/share/icons/hicolor/${size}x${size}/apps"
        install -Dm644 "packaging/arch/icons/mousedeck_${size}.png" \
            "${STAGING_DIR}/usr/share/icons/hicolor/${size}x${size}/apps/mousedeck.png"
    fi
done
install -Dm644 packaging/arch/icons/mousedeck_512.png "${STAGING_DIR}/usr/share/pixmaps/mousedeck.png"

# Polkit & Udev rules
install -Dm644 packaging/arch/io.github.mousedeck.policy \
    "${STAGING_DIR}/usr/share/polkit-1/actions/io.github.mousedeck.policy"
install -Dm644 packaging/arch/70-mousedeck.rules \
    "${STAGING_DIR}/usr/lib/udev/rules.d/70-mousedeck.rules"
install -Dm644 packaging/arch/mousedeck-uinput.conf \
    "${STAGING_DIR}/usr/lib/modules-load.d/mousedeck-uinput.conf"

# Documentation
install -Dm644 README.md "${STAGING_DIR}/usr/share/doc/${PKG_NAME}/README.md"

# 4. Generate PKGBUILD for makepkg in BUILD_DIR
cat <<INNER_EOF > "${BUILD_DIR}/PKGBUILD"
# Maintainer: Quark <quark@localhost>
pkgname=${PKG_NAME}
pkgver=${PKG_VER}
pkgrel=${PKG_REL}
pkgdesc="Modern Linux mouse dashboard & hardware remapper with Touch Strip support"
arch=('${ARCH}')
url="https://github.com/M-Tre-Consulting/MouseDeck"
license=('MIT')
depends=('gtk3' 'webkit2gtk-4.1' 'libappindicator-gtk3' 'polkit')
optdepends=(
    'bluez: Bluetooth device telemetry and discovery'
    'bluez-utils: Bluetooth device management'
)
provides=('mousedeck')
conflicts=('mousedeck-bin' 'mousedeck-git')

package() {
    cp -r "${STAGING_DIR}"/* "\${pkgdir}/"
}
INNER_EOF

log_info "[4/4] Creazione pacchetto con makepkg (.pkg.tar.zst)..."
cd "${BUILD_DIR}"
makepkg -f -d

# Locate created package
PACKAGE_FILE=$(find "${BUILD_DIR}" -maxdepth 1 -name "*.pkg.tar.zst" | head -n1)

if [ -z "${PACKAGE_FILE}" ]; then
    log_err "Creazione del pacchetto fallita."
    exit 1
fi

PACKAGE_NAME=$(basename "${PACKAGE_FILE}")
mkdir -p "${ROOT_DIR}/dist"
cp "${PACKAGE_FILE}" "${ROOT_DIR}/dist/${PACKAGE_NAME}"

echo ""
log_ok "Pacchetto Arch Linux creato con successo!"
echo -e "📦 File: ${COLOR_GREEN}${ROOT_DIR}/dist/${PACKAGE_NAME}${COLOR_RESET}"
echo -e "📏 Dimensione: $(du -h "${ROOT_DIR}/dist/${PACKAGE_NAME}" | cut -f1)"
echo ""
echo -e "Per installarlo sul tuo sistema Arch/Manjaro/EndeavourOS:"
echo -e "  ${COLOR_CYAN}sudo pacman -U dist/${PACKAGE_NAME}${COLOR_RESET}"
echo ""

if [ "$INSTALL_FLAG" = true ]; then
    log_info "Installazione del pacchetto in corso con pacman..."
    sudo pacman -U --noconfirm "${ROOT_DIR}/dist/${PACKAGE_NAME}"
fi
