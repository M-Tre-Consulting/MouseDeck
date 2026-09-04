#!/usr/bin/env bash
# SculptFlow - Setup permessi di sistema Linux
# Configura le regole udev necessarie per accedere al mouse Microsoft Sculpt Comfort
# e consentire la scrittura sul modulo kernel /dev/uinput senza privilegi root.

set -e

if [ "$EUID" -ne 0 ]; then
    echo "Questo script richiede i privilegi di amministratore."
    echo "Riavvio con sudo..."
    exec sudo bash "$0" "$@"
fi

RULE_FILE="/etc/udev/rules.d/70-sculpt-comfort.rules"

echo "=== Configurazione Permessi Hardware SculptFlow ==="
echo "1. Creazione delle regole udev in $RULE_FILE..."

cat << 'RULE' > "$RULE_FILE"
# -------------------------------------------------------------------------
# SculptFlow - Microsoft Sculpt Comfort Mouse & Virtual Input Rules
# -------------------------------------------------------------------------

# Accesso in lettura/cattura al mouse Microsoft Sculpt Comfort (045e:07a2)
SUBSYSTEM=="input", ATTRS{id/vendor}=="045e", ATTRS{id/product}=="07a2", TAG+="uaccess", MODE="0660"
KERNEL=="event*", ATTRS{id/vendor}=="045e", ATTRS{id/product}=="07a2", TAG+="uaccess", MODE="0660"
KERNEL=="event*", ATTRS{name}=="Microsoft Sculpt Comfort Mouse*", TAG+="uaccess", MODE="0660"

# Accesso al modulo uinput per l'emissione di tasti e click virtuali
KERNEL=="uinput", SUBSYSTEM=="misc", TAG+="uaccess", OPTIONS+="static_node=uinput", MODE="0660"
RULE

echo "2. Caricamento del modulo kernel uinput..."
modprobe uinput 2>/dev/null || true

# Configura il caricamento automatico di uinput al boot
if [ -d /etc/modules-load.d ]; then
    echo "uinput" > /etc/modules-load.d/sculptflow-uinput.conf
fi

# Se è specificato un utente non-root, aggiungilo anche al gruppo input
TARGET_USER="${SUDO_USER:-$PKEXEC_UID}"
if [ -n "$TARGET_USER" ] && id "$TARGET_USER" &>/dev/null; then
    if getent group input >/dev/null; then
        echo "3. Aggiunta utente '$TARGET_USER' al gruppo 'input'..."
        usermod -aG input "$TARGET_USER" || true
    fi
fi

echo "4. Ricarica e attivazione delle regole udev..."
udevadm control --reload-rules
udevadm trigger --subsystem-match=input || true
udevadm trigger --subsystem-match=misc || true

if [ -e /dev/uinput ]; then
    chmod 0660 /dev/uinput || true
    chgrp input /dev/uinput 2>/dev/null || true
fi

echo ""
echo "✅ Configurazione completata con successo!"
echo "I permessi hardware sono ora attivi per la sessione corrente."
