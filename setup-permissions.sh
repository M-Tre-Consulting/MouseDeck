#!/usr/bin/env bash
# =============================================================================
# MouseDeck - Setup e Ripristino Permessi di Sistema Linux
# =============================================================================
# Gestisce l'installazione, il backup dello stato originario e il ripristino /
# disinstallazione pulita delle regole udev e dei moduli kernel.
#
# Uso:
#   sudo ./setup-permissions.sh install   (default: installa e crea backup)
#   sudo ./setup-permissions.sh restore   (ripristina lo stato originario del sistema)
#   sudo ./setup-permissions.sh status    (mostra lo stato corrente)
# =============================================================================

set -e

ACTION="${1:-install}"

# Richiedi privilegi di root se non presenti (solo per install o restore)
if [ "$ACTION" != "status" ] && [ "$EUID" -ne 0 ]; then
    echo "Questo script richiede privilegi di amministratore per configurare udev."
    if command -v pkexec >/dev/null 2>&1; then
        exec pkexec bash "$0" "$@"
    else
        exec sudo bash "$0" "$@"
    fi
fi

# Rileva l'utente chiamante originario (anche se eseguito con sudo o pkexec)
if [ -n "$PKEXEC_UID" ]; then
    TARGET_USER=$(id -un "$PKEXEC_UID" 2>/dev/null || true)
elif [ -n "$SUDO_USER" ]; then
    TARGET_USER="$SUDO_USER"
else
    TARGET_USER="$(logname 2>/dev/null || whoami)"
fi

TARGET_HOME=""
if [ -n "$TARGET_USER" ]; then
    TARGET_HOME=$(getent passwd "$TARGET_USER" | cut -d: -f6 2>/dev/null || true)
fi
if [ -z "$TARGET_HOME" ]; then
    TARGET_HOME="$HOME"
fi

BACKUP_DIR="/etc/mousedeck/backup"
USER_BACKUP_DIR="${TARGET_HOME}/.config/mousedeck/backup"
MANIFEST_FILE="${BACKUP_DIR}/manifest.json"
USER_MANIFEST_FILE="${USER_BACKUP_DIR}/manifest.json"

RULE_FILE="/etc/udev/rules.d/70-mousedeck.rules"
MODULE_FILE="/etc/modules-load.d/mousedeck-uinput.conf"
OLD_RULE_FILE="/etc/udev/rules.d/70-sculpt-comfort.rules"
OLD_MODULE_FILE="/etc/modules-load.d/sculptflow-uinput.conf"

do_install() {
    echo "=== [MouseDeck] Installazione Permessi & Creazione Backup ==="
    mkdir -p "$BACKUP_DIR"

    # 1. Verifica appartenenza pregressa al gruppo input
    USER_WAS_IN_INPUT="false"
    if [ -n "$TARGET_USER" ] && id -nG "$TARGET_USER" 2>/dev/null | grep -qw "input"; then
        USER_WAS_IN_INPUT="true"
    fi

    # 2. Backup di regole udev preesistenti non create da MouseDeck
    BACKED_UP_RULES=""
    if [ -f "$RULE_FILE" ] && ! grep -q "MouseDeck" "$RULE_FILE" 2>/dev/null; then
        echo "-> Eseguo il backup della regola udev preesistente..."
        cp "$RULE_FILE" "${BACKUP_DIR}/70-mousedeck.rules.orig"
        BACKED_UP_RULES="${BACKUP_DIR}/70-mousedeck.rules.orig"
    fi

    # 3. Backup configurazione moduli preesistente
    BACKED_UP_MODULES=""
    if [ -f "$MODULE_FILE" ] && ! grep -q "uinput" "$MODULE_FILE" 2>/dev/null; then
        echo "-> Eseguo il backup della configurazione moduli preesistente..."
        cp "$MODULE_FILE" "${BACKUP_DIR}/mousedeck-uinput.conf.orig"
        BACKED_UP_MODULES="${BACKUP_DIR}/mousedeck-uinput.conf.orig"
    fi

    # 4. Rimuovi eventuali vecchie regole con il vecchio nome SculptFlow
    rm -f "$OLD_RULE_FILE" "$OLD_MODULE_FILE"

    TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    # 5. Scrivi manifest JSON di backup
    cat << EOF > "$MANIFEST_FILE"
{
  "timestamp": "$TIMESTAMP",
  "target_user": "$TARGET_USER",
  "user_was_in_input_group": $USER_WAS_IN_INPUT,
  "rule_file": "$RULE_FILE",
  "module_file": "$MODULE_FILE",
  "backed_up_rules": $([ -n "$BACKED_UP_RULES" ] && echo "\"$BACKED_UP_RULES\"" || echo "null"),
  "backed_up_modules": $([ -n "$BACKED_UP_MODULES" ] && echo "\"$BACKED_UP_MODULES\"" || echo "null")
}
EOF

    # 6. Scrivi la nuova regola udev MouseDeck
    echo "-> Configurazione regola udev in $RULE_FILE..."
    cat << 'RULE' > "$RULE_FILE"
# -------------------------------------------------------------------------
# MouseDeck - Hardware Input & Virtual uinput Rules
# -------------------------------------------------------------------------

# Accesso in lettura/cattura al mouse Microsoft Sculpt Comfort (045e:07a2)
SUBSYSTEM=="input", ATTRS{id/vendor}=="045e", ATTRS{id/product}=="07a2", TAG+="uaccess", MODE="0660"
KERNEL=="event*", ATTRS{id/vendor}=="045e", ATTRS{id/product}=="07a2", TAG+="uaccess", MODE="0660"
KERNEL=="event*", ATTRS{name}=="Microsoft Sculpt Comfort Mouse*", TAG+="uaccess", MODE="0660"

# Accesso in lettura/cattura a Logitech G502 / G502 X Series (046d:c547, 046d:4099, 046d:c099, 046d:c08b)
SUBSYSTEM=="input", ATTRS{id/vendor}=="046d", ATTRS{id/product}=="c547", TAG+="uaccess", MODE="0660"
SUBSYSTEM=="input", ATTRS{id/vendor}=="046d", ATTRS{id/product}=="4099", TAG+="uaccess", MODE="0660"
SUBSYSTEM=="input", ATTRS{id/vendor}=="046d", ATTRS{id/product}=="c099", TAG+="uaccess", MODE="0660"
SUBSYSTEM=="input", ATTRS{id/vendor}=="046d", ATTRS{id/product}=="c08b", TAG+="uaccess", MODE="0660"
KERNEL=="event*", ATTRS{name}=="*G502*", TAG+="uaccess", MODE="0660"

# Accesso al modulo uinput per l'emissione di tasti e click virtuali
KERNEL=="uinput", SUBSYSTEM=="misc", TAG+="uaccess", OPTIONS+="static_node=uinput", MODE="0660"
RULE

    # 7. Modulo kernel uinput
    echo "-> Caricamento modulo kernel uinput..."
    modprobe uinput 2>/dev/null || true

    if [ -d /etc/modules-load.d ]; then
        echo "uinput" > "$MODULE_FILE"
    fi

    # 8. Assegnazione gruppo input all'utente
    if [ -n "$TARGET_USER" ] && id "$TARGET_USER" &>/dev/null; then
        if getent group input >/dev/null; then
            echo "-> Aggiunta utente '$TARGET_USER' al gruppo 'input'..."
            usermod -aG input "$TARGET_USER" || true
        fi
    fi

    # 9. Ricarica udev
    echo "-> Ricarica sottosistema udev..."
    udevadm control --reload-rules
    udevadm trigger --subsystem-match=input || true
    udevadm trigger --subsystem-match=misc || true

    if [ -e /dev/uinput ]; then
        chmod 0660 /dev/uinput || true
        chgrp input /dev/uinput 2>/dev/null || true
    fi

    # 10. Copia mirror manifest nella home dell'utente per lettura senza root
    if [ -n "$TARGET_USER" ] && [ -d "$TARGET_HOME" ]; then
        mkdir -p "$USER_BACKUP_DIR"
        cp "$MANIFEST_FILE" "$USER_MANIFEST_FILE"
        chown -R "$TARGET_USER":"$TARGET_USER" "${TARGET_HOME}/.config/mousedeck" 2>/dev/null || true
    fi

    echo ""
    echo "✅ Installazione e backup completati con successo!"
    echo "Manifest salvato in: $MANIFEST_FILE"
}

do_restore() {
    echo "=== [MouseDeck] Ripristino Permessi & Disinstallazione Pulita ==="

    MANIFEST=""
    if [ -f "$MANIFEST_FILE" ]; then
        MANIFEST="$MANIFEST_FILE"
    elif [ -f "$USER_MANIFEST_FILE" ]; then
        MANIFEST="$USER_MANIFEST_FILE"
    fi

    USER_WAS_IN_INPUT="true"
    if [ -n "$MANIFEST" ]; then
        echo "-> Trovato manifest di backup: $MANIFEST"
        if grep -q '"user_was_in_input_group": false' "$MANIFEST" 2>/dev/null; then
            USER_WAS_IN_INPUT="false"
        fi
    fi

    # 1. Ripristina o elimina regola udev
    if [ -f "${BACKUP_DIR}/70-mousedeck.rules.orig" ]; then
        echo "-> Ripristino della regola udev originaria..."
        cp "${BACKUP_DIR}/70-mousedeck.rules.orig" "$RULE_FILE"
    else
        echo "-> Rimozione regola udev MouseDeck ($RULE_FILE)..."
        rm -f "$RULE_FILE" "$OLD_RULE_FILE"
    fi

    # 2. Ripristina o elimina moduli-load
    if [ -f "${BACKUP_DIR}/mousedeck-uinput.conf.orig" ]; then
        echo "-> Ripristino configurazione moduli originaria..."
        cp "${BACKUP_DIR}/mousedeck-uinput.conf.orig" "$MODULE_FILE"
    else
        echo "-> Rimozione configurazione moduli MouseDeck ($MODULE_FILE)..."
        rm -f "$MODULE_FILE" "$OLD_MODULE_FILE"
    fi

    # 3. Ripristina gruppo utente solo se aggiunto da MouseDeck
    if [ "$USER_WAS_IN_INPUT" = "false" ] && [ -n "$TARGET_USER" ]; then
        echo "-> Rimozione utente '$TARGET_USER' dal gruppo 'input'..."
        gpasswd -d "$TARGET_USER" input 2>/dev/null || true
    fi

    # 4. Ricarica udev
    echo "-> Ricarica regole udev..."
    udevadm control --reload-rules
    udevadm trigger --subsystem-match=input || true
    udevadm trigger --subsystem-match=misc || true

    # 5. Rimuovi file di backup
    echo "-> Pulizia file temporanei di backup..."
    rm -rf "$BACKUP_DIR"
    rm -rf "$USER_BACKUP_DIR"

    echo ""
    echo "✅ Ripristino completato con successo! Il sistema è tornato al suo stato originale."
}

do_status() {
    echo "=== Stato Permessi MouseDeck ==="
    if [ -f "$RULE_FILE" ]; then
        echo "Regola udev: Presente ($RULE_FILE)"
    else
        echo "Regola udev: Non presente"
    fi

    if [ -f "$MANIFEST_FILE" ] || [ -f "$USER_MANIFEST_FILE" ]; then
        echo "Backup: Presente"
        [ -f "$MANIFEST_FILE" ] && cat "$MANIFEST_FILE"
    else
        echo "Backup: Nessun backup attivo"
    fi
}

case "$ACTION" in
    install|setup)
        do_install
        ;;
    restore|uninstall|clean)
        do_restore
        ;;
    status)
        do_status
        ;;
    *)
        echo "Azione non riconosciuta: $ACTION"
        echo "Uso: $0 [install|restore|status]"
        exit 1
        ;;
esac
