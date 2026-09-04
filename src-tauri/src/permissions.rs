use std::fs::OpenOptions;
use std::path::Path;
use std::process::Command;
use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
pub struct PermissionStatus {
    pub uinput_accessible: bool,
    pub input_nodes_accessible: bool,
    pub setup_script_path: String,
    pub message: String,
}

pub fn check_permissions() -> PermissionStatus {
    let uinput_ok = OpenOptions::new()
        .read(true)
        .write(true)
        .open("/dev/uinput")
        .is_ok();

    // Check Sculpt Comfort nodes if present
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
    }
}

pub fn run_setup_permissions() -> Result<String, String> {
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
        .output()
        .map_err(|e| format!("Errore esecuzione pkexec: {}", e))?;

    if output.status.success() {
        Ok("Regole udev e permessi applicati con successo!".to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}
