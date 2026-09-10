use std::fs::OpenOptions;
use std::path::{Path, PathBuf};
use std::process::Command;
use serde::{Deserialize, Serialize};

const UDEV_RULES_CONTENT: &str = r#"# -------------------------------------------------------------------------
# MouseDeck - Hardware Input & Virtual uinput Rules
# -------------------------------------------------------------------------

# Microsoft Sculpt Comfort (045e:07a2)
SUBSYSTEM=="input", ATTRS{id/vendor}=="045e", ATTRS{id/product}=="07a2", TAG+="uaccess", MODE="0660"
KERNEL=="event*", ATTRS{id/vendor}=="045e", ATTRS{id/product}=="07a2", TAG+="uaccess", MODE="0660"
KERNEL=="event*", ATTRS{name}=="Microsoft Sculpt Comfort Mouse*", TAG+="uaccess", MODE="0660"

# Logitech G502 / G502 X Series (046d:c547, 046d:4099, 046d:c099, 046d:c08b)
SUBSYSTEM=="input", ATTRS{id/vendor}=="046d", ATTRS{id/product}=="c547", TAG+="uaccess", MODE="0660"
SUBSYSTEM=="input", ATTRS{id/vendor}=="046d", ATTRS{id/product}=="4099", TAG+="uaccess", MODE="0660"
SUBSYSTEM=="input", ATTRS{id/vendor}=="046d", ATTRS{id/product}=="c099", TAG+="uaccess", MODE="0660"
SUBSYSTEM=="input", ATTRS{id/vendor}=="046d", ATTRS{id/product}=="c08b", TAG+="uaccess", MODE="0660"
KERNEL=="event*", ATTRS{name}=="*G502*", TAG+="uaccess", MODE="0660"

# Accesso al modulo uinput per l'emissione di tasti e click virtuali
KERNEL=="uinput", SUBSYSTEM=="misc", TAG+="uaccess", OPTIONS+="static_node=uinput", MODE="0660"
"#;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BackupManifest {
    pub timestamp: String,
    pub target_user: String,
    pub user_was_in_input_group: bool,
    pub rule_file: String,
    pub module_file: String,
    pub backed_up_rules: Option<String>,
    pub backed_up_modules: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct PermissionStatus {
    pub uinput_accessible: bool,
    pub input_nodes_accessible: bool,
    pub setup_script_path: String,
    pub message: String,
    pub rules_installed: bool,
    pub backup_exists: bool,
    pub backup_timestamp: Option<String>,
    pub backup_files: Vec<String>,
}

fn get_user_home(username: &str) -> PathBuf {
    if let Ok(content) = std::fs::read_to_string("/etc/passwd") {
        for line in content.lines() {
            let parts: Vec<&str> = line.split(':').collect();
            if parts.len() >= 6 && parts[0] == username {
                return PathBuf::from(parts[5]);
            }
        }
    }
    PathBuf::from(format!("/home/{}", username))
}

fn is_user_in_group(username: &str, group: &str) -> bool {
    if let Ok(output) = Command::new("id").args(["-nG", username]).output() {
        let groups = String::from_utf8_lossy(&output.stdout);
        groups.split_whitespace().any(|g| g == group)
    } else {
        false
    }
}

pub fn check_permissions() -> PermissionStatus {
    let uinput_ok = OpenOptions::new()
        .read(true)
        .write(true)
        .open("/dev/uinput")
        .is_ok();

    // Check Sculpt Comfort / input nodes if present
    let mut nodes_ok = true;
    if let Ok(content) = std::fs::read_to_string("/proc/bus/input/devices") {
        for block in content.split("\n\n") {
            let lower = block.to_lowercase();
            if lower.contains("sculpt comfort") || lower.contains("g502") {
                for line in block.lines() {
                    if line.starts_with("H: Handlers=") {
                        for part in line.split_whitespace() {
                            if part.starts_with("event") {
                                let path = format!("/dev/input/{}", part);
                                if OpenOptions::new().read(true).open(&path).is_err() {
                                    nodes_ok = false;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    let rule_path = Path::new("/etc/udev/rules.d/70-mousedeck.rules");
    let rules_installed = rule_path.exists();

    // Check for backup manifest in user config or /etc
    let mut backup_exists = false;
    let mut backup_timestamp = None;
    let mut backup_files = Vec::new();

    let manifest_candidates = [
        dirs::config_dir().map(|d| d.join("mousedeck/backup/manifest.json")),
        Some(Path::new("/etc/mousedeck/backup/manifest.json").to_path_buf()),
    ];

    for candidate in manifest_candidates.into_iter().flatten() {
        if candidate.exists() {
            if let Ok(data) = std::fs::read_to_string(&candidate) {
                if let Ok(manifest) = serde_json::from_str::<BackupManifest>(&data) {
                    backup_exists = true;
                    backup_timestamp = Some(manifest.timestamp.clone());
                    backup_files.push(manifest.rule_file.clone());
                    backup_files.push(manifest.module_file.clone());
                    if let Some(r) = manifest.backed_up_rules {
                        backup_files.push(format!("(Originale: {})", r));
                    }
                    break;
                }
            }
        }
    }

    let message = if uinput_ok && nodes_ok {
        "Tutti i permessi di sistema sono configurati correttamente.".to_string()
    } else if !uinput_ok {
        "Accesso a /dev/uinput negato. Sono richieste le regole udev.".to_string()
    } else {
        "Accesso ai nodi /dev/input del mouse negato. Sono richieste le regole udev.".to_string()
    };

    PermissionStatus {
        uinput_accessible: uinput_ok,
        input_nodes_accessible: nodes_ok,
        setup_script_path: "native-polkit".to_string(),
        message,
        rules_installed,
        backup_exists,
        backup_timestamp,
        backup_files,
    }
}

pub fn perform_native_install(target_user: &str) -> Result<String, String> {
    let backup_dir = Path::new("/etc/mousedeck/backup");
    std::fs::create_dir_all(backup_dir)
        .map_err(|e| format!("Impossibile creare la cartella di backup /etc/mousedeck/backup: {}", e))?;

    let user_home = get_user_home(target_user);
    let user_backup_dir = user_home.join(".config/mousedeck/backup");
    std::fs::create_dir_all(&user_backup_dir).ok();

    let rule_file = Path::new("/etc/udev/rules.d/70-mousedeck.rules");
    let module_file = Path::new("/etc/modules-load.d/mousedeck-uinput.conf");

    // Check if target user was already in input group
    let user_was_in_input = is_user_in_group(target_user, "input");

    // Backup pre-existing rules if not created by MouseDeck
    let mut backed_up_rules = None;
    if rule_file.exists() {
        let content = std::fs::read_to_string(rule_file).unwrap_or_default();
        if !content.contains("MouseDeck") {
            let dest = backup_dir.join("70-mousedeck.rules.orig");
            std::fs::copy(rule_file, &dest).ok();
            backed_up_rules = Some(dest.to_string_lossy().to_string());
        }
    }

    // Backup pre-existing modules config
    let mut backed_up_modules = None;
    if module_file.exists() {
        let content = std::fs::read_to_string(module_file).unwrap_or_default();
        if !content.contains("uinput") {
            let dest = backup_dir.join("mousedeck-uinput.conf.orig");
            std::fs::copy(module_file, &dest).ok();
            backed_up_modules = Some(dest.to_string_lossy().to_string());
        }
    }

    // Remove legacy sculptflow files if any
    std::fs::remove_file("/etc/udev/rules.d/70-sculpt-comfort.rules").ok();
    std::fs::remove_file("/etc/modules-load.d/sculptflow-uinput.conf").ok();

    // Write backup manifest
    let manifest = BackupManifest {
        timestamp: chrono::Utc::now().to_rfc3339(),
        target_user: target_user.to_string(),
        user_was_in_input_group: user_was_in_input,
        rule_file: rule_file.to_string_lossy().to_string(),
        module_file: module_file.to_string_lossy().to_string(),
        backed_up_rules,
        backed_up_modules,
    };

    let manifest_json = serde_json::to_string_pretty(&manifest)
        .map_err(|e| format!("Errore serializzazione manifest: {}", e))?;

    std::fs::write(backup_dir.join("manifest.json"), &manifest_json).ok();
    std::fs::write(user_backup_dir.join("manifest.json"), &manifest_json).ok();

    // Write udev rule
    std::fs::create_dir_all("/etc/udev/rules.d").ok();
    std::fs::write(rule_file, UDEV_RULES_CONTENT)
        .map_err(|e| format!("Errore scrittura regola udev in {:?}: {}", rule_file, e))?;

    // Write modules-load.d
    if Path::new("/etc/modules-load.d").exists() {
        std::fs::write(module_file, "uinput\n").ok();
    }

    // Load uinput
    let _ = Command::new("modprobe").arg("uinput").output();

    // Add user to input group if not already in it
    if !user_was_in_input && !target_user.is_empty() && target_user != "root" {
        let _ = Command::new("usermod").args(["-aG", "input", target_user]).output();
    }

    // Reload udev
    let _ = Command::new("udevadm").args(["control", "--reload-rules"]).output();
    let _ = Command::new("udevadm").args(["trigger", "--subsystem-match=input"]).output();
    let _ = Command::new("udevadm").args(["trigger", "--subsystem-match=misc"]).output();

    // Fix permissions on /dev/uinput
    let _ = Command::new("chmod").args(["0660", "/dev/uinput"]).output();
    let _ = Command::new("chgrp").args(["input", "/dev/uinput"]).output();

    // Fix ownership of user config directory
    let user_mousedeck_dir = user_home.join(".config/mousedeck");
    let _ = Command::new("chown")
        .args(["-R", &format!("{}:{}", target_user, target_user), &user_mousedeck_dir.to_string_lossy()])
        .output();

    Ok("✅ Regole udev installate e backup di sistema memorizzato con successo!".to_string())
}

pub fn perform_native_restore(target_user: &str) -> Result<String, String> {
    let user_home = get_user_home(target_user);
    let manifest_candidates = [
        Path::new("/etc/mousedeck/backup/manifest.json").to_path_buf(),
        user_home.join(".config/mousedeck/backup/manifest.json"),
    ];

    let mut user_was_in_input = true;
    for cand in &manifest_candidates {
        if let Ok(data) = std::fs::read_to_string(cand) {
            if let Ok(manifest) = serde_json::from_str::<BackupManifest>(&data) {
                user_was_in_input = manifest.user_was_in_input_group;
                break;
            }
        }
    }

    let rule_orig = Path::new("/etc/mousedeck/backup/70-mousedeck.rules.orig");
    let rule_file = Path::new("/etc/udev/rules.d/70-mousedeck.rules");
    if rule_orig.exists() {
        std::fs::copy(rule_orig, rule_file).ok();
    } else {
        std::fs::remove_file(rule_file).ok();
        std::fs::remove_file("/etc/udev/rules.d/70-sculpt-comfort.rules").ok();
    }

    let mod_orig = Path::new("/etc/mousedeck/backup/mousedeck-uinput.conf.orig");
    let mod_file = Path::new("/etc/modules-load.d/mousedeck-uinput.conf");
    if mod_orig.exists() {
        std::fs::copy(mod_orig, mod_file).ok();
    } else {
        std::fs::remove_file(mod_file).ok();
        std::fs::remove_file("/etc/modules-load.d/sculptflow-uinput.conf").ok();
    }

    if !user_was_in_input && !target_user.is_empty() && target_user != "root" {
        let _ = Command::new("gpasswd").args(["-d", target_user, "input"]).output();
    }

    // Reload udev
    let _ = Command::new("udevadm").args(["control", "--reload-rules"]).output();
    let _ = Command::new("udevadm").args(["trigger", "--subsystem-match=input"]).output();
    let _ = Command::new("udevadm").args(["trigger", "--subsystem-match=misc"]).output();

    // Clean up backup dirs
    std::fs::remove_dir_all("/etc/mousedeck/backup").ok();
    std::fs::remove_dir_all(user_home.join(".config/mousedeck/backup")).ok();

    Ok("✅ Ripristino completato! Tutte le configurazioni sono state ripristinate allo stato iniziale.".to_string())
}

pub fn run_permissions_action(action: &str) -> Result<String, String> {
    let current_exe = std::env::current_exe()
        .map_err(|e| format!("Impossibile individuare il percorso del binario: {}", e))?;

    let target_user = std::env::var("USER").unwrap_or_else(|_| "root".to_string());

    let flag = match action {
        "restore" => "--restore-permissions",
        _ => "--setup-permissions",
    };

    let output = Command::new("pkexec")
        .arg(&current_exe)
        .arg(flag)
        .arg(&target_user)
        .output()
        .map_err(|e| {
            if e.kind() == std::io::ErrorKind::NotFound {
                "Sottosistema di elevazione privilegi 'pkexec' (Polkit) non trovato.".to_string()
            } else {
                format!("Errore durante la richiesta di elevazione privilegi: {}", e)
            }
        })?;

    if output.status.success() {
        let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
        if stdout.is_empty() {
            Ok(match action {
                "restore" => "Ripristino dei permessi originari completato con successo.".to_string(),
                _ => "Regole udev e permessi applicati con backup creato con successo!".to_string(),
            })
        } else {
            Ok(stdout)
        }
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
        let code = output.status.code();
        if code == Some(126) || code == Some(127) || stderr.contains("dismissed") || stderr.contains("not granted") {
            Err("Richiesta di autenticazione annullata o non autorizzata.".to_string())
        } else if stderr.is_empty() {
            Err("Operazione non completata o permessi non concessi.".to_string())
        } else {
            Err(stderr)
        }
    }
}

pub fn run_setup_permissions() -> Result<String, String> {
    run_permissions_action("install")
}

pub fn run_restore_permissions() -> Result<String, String> {
    run_permissions_action("restore")
}
