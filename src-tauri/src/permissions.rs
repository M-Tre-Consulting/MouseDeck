use std::fs::OpenOptions;
use std::path::Path;
use std::process::Command;
use serde::{Deserialize, Serialize};

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
            if block.contains("Sculpt Comfort") {
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

    let script_path = std::env::current_dir()
        .map(|p| p.join("setup-permissions.sh").to_string_lossy().to_string())
        .unwrap_or_else(|_| "setup-permissions.sh".to_string());

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
        setup_script_path: script_path,
        message,
        rules_installed,
        backup_exists,
        backup_timestamp,
        backup_files,
    }
}

pub fn run_permissions_action(action: &str) -> Result<String, String> {
    let candidates = [
        Path::new("setup-permissions.sh").to_path_buf(),
        std::env::current_dir().unwrap_or_default().join("setup-permissions.sh"),
        Path::new("/home/quark/Projects/sculpt-comfort-remapper/setup-permissions.sh").to_path_buf(),
    ];

    let script = candidates.iter().find(|p| p.exists())
        .ok_or_else(|| "Script setup-permissions.sh non trovato!".to_string())?;

    let output = Command::new("pkexec")
        .arg("bash")
        .arg(script)
        .arg(action)
        .output()
        .map_err(|e| format!("Errore esecuzione pkexec: {}", e))?;

    if output.status.success() {
        let stdout = String::from_utf8_lossy(&output.stdout).to_string();
        if stdout.trim().is_empty() {
            Ok(match action {
                "restore" => "Ripristino dei permessi originari completato con successo.".to_string(),
                _ => "Regole udev e permessi applicati con backup creato con successo!".to_string(),
            })
        } else {
            Ok(stdout)
        }
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

pub fn run_setup_permissions() -> Result<String, String> {
    run_permissions_action("install")
}

pub fn run_restore_permissions() -> Result<String, String> {
    run_permissions_action("restore")
}
