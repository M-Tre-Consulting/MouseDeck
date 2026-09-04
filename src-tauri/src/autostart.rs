use std::fs;
use std::path::PathBuf;

fn get_autostart_desktop_path() -> Option<PathBuf> {
    dirs::config_dir().map(|p| p.join("autostart/mousedeck.desktop"))
}

pub fn is_autostart_enabled() -> bool {
    get_autostart_desktop_path().map(|p| p.exists()).unwrap_or(false)
}

pub fn set_autostart(enabled: bool) -> Result<(), String> {
    let desktop_path = get_autostart_desktop_path()
        .ok_or_else(|| "Impossibile determinare la cartella di configurazione utente".to_string())?;

    if enabled {
        let parent = desktop_path.parent().ok_or("Percorso non valido")?;
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;

        let current_exe = std::env::current_exe()
            .map_err(|e| format!("Impossibile determinare l'eseguibile: {}", e))?;

        let content = format!(
            r#"[Desktop Entry]
Type=Application
Name=MouseDeck
GenericName=Mouse Dashboard & Remapper
Comment=Universal Linux Mouse Dashboard & Gesture Remapper
Exec={} --minimized
Icon=mousedeck
Terminal=false
Categories=Utility;Settings;HardwareSettings;
StartupNotify=false
X-GNOME-Autostart-enabled=true
"#,
            current_exe.to_string_lossy()
        );

        fs::write(&desktop_path, content)
            .map_err(|e| format!("Errore scrittura file desktop: {}", e))?;
    } else {
        if desktop_path.exists() {
            fs::remove_file(&desktop_path)
                .map_err(|e| format!("Errore rimozione file desktop: {}", e))?;
        }
    }

    Ok(())
}
