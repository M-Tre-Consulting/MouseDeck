use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ActionConfig {
    #[serde(rename = "type")]
    pub action_type: String, // "key_combo", "mouse_button", "media", "command", "disabled", "passthrough"
    pub value: String,
    pub name: String,
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub enabled: bool,
    pub autostart: bool,
    pub active_profile: String,
    pub active_driver: String,
    pub profiles: HashMap<String, HashMap<String, ActionConfig>>,
}

impl Default for AppConfig {
    fn default() -> Self {
        let mut profiles = HashMap::new();
        profiles.insert("Predefinito".to_string(), get_default_mappings());

        Self {
            enabled: true,
            autostart: false,
            active_profile: "Predefinito".to_string(),
            active_driver: "microsoft_sculpt_comfort".to_string(),
            profiles,
        }
    }
}

pub fn get_default_mappings() -> HashMap<String, ActionConfig> {
    let mut m = HashMap::new();
    m.insert(
        "swipe_up".to_string(),
        ActionConfig {
            action_type: "key_combo".to_string(),
            value: "Super+Page_Up".to_string(),
            name: "Workspace Precedente".to_string(),
            description: "Passa allo spazio di lavoro precedente".to_string(),
        },
    );
    m.insert(
        "swipe_down".to_string(),
        ActionConfig {
            action_type: "key_combo".to_string(),
            value: "Super+Page_Down".to_string(),
            name: "Workspace Successivo".to_string(),
            description: "Passa allo spazio di lavoro successivo".to_string(),
        },
    );
    m.insert(
        "windows_click".to_string(),
        ActionConfig {
            action_type: "key_combo".to_string(),
            value: "Super".to_string(),
            name: "Panoramica Desktop / Launcher".to_string(),
            description: "Apre il menu applicazioni o la panoramica".to_string(),
        },
    );
    m.insert(
        "tilt_left".to_string(),
        ActionConfig {
            action_type: "key_combo".to_string(),
            value: "Alt+Left".to_string(),
            name: "Indietro Browser".to_string(),
            description: "Torna alla pagina precedente".to_string(),
        },
    );
    m.insert(
        "tilt_right".to_string(),
        ActionConfig {
            action_type: "key_combo".to_string(),
            value: "Alt+Right".to_string(),
            name: "Avanti Browser".to_string(),
            description: "Avanza alla pagina successiva".to_string(),
        },
    );
    m.insert(
        "middle_click".to_string(),
        ActionConfig {
            action_type: "mouse_button".to_string(),
            value: "BTN_MIDDLE".to_string(),
            name: "Click Centrale".to_string(),
            description: "Azione standard della rotellina".to_string(),
        },
    );
    m
}

pub fn get_preset_mappings(preset_key: &str) -> Option<HashMap<String, ActionConfig>> {
    let mut m = HashMap::new();
    match preset_key {
        "desktop_navigation" => {
            m.insert("swipe_up".to_string(), ActionConfig { action_type: "key_combo".into(), value: "Super+Page_Up".into(), name: "Workspace Precedente".into(), description: "Spazio di lavoro precedente".into() });
            m.insert("swipe_down".to_string(), ActionConfig { action_type: "key_combo".into(), value: "Super+Page_Down".into(), name: "Workspace Successivo".into(), description: "Spazio di lavoro successivo".into() });
            m.insert("windows_click".to_string(), ActionConfig { action_type: "key_combo".into(), value: "Super".into(), name: "Panoramica / Launcher".into(), description: "Apre la panoramica di sistema".into() });
            m.insert("tilt_left".to_string(), ActionConfig { action_type: "key_combo".into(), value: "Alt+Left".into(), name: "Indietro".into(), description: "Cronologia indietro".into() });
            m.insert("tilt_right".to_string(), ActionConfig { action_type: "key_combo".into(), value: "Alt+Right".into(), name: "Avanti".into(), description: "Cronologia avanti".into() });
            m.insert("middle_click".to_string(), ActionConfig { action_type: "mouse_button".into(), value: "BTN_MIDDLE".into(), name: "Click Centrale".into(), description: "Standard".into() });
            Some(m)
        }
        "productivity" => {
            m.insert("swipe_up".to_string(), ActionConfig { action_type: "key_combo".into(), value: "Ctrl+c".into(), name: "Copia".into(), description: "Copia negli appunti".into() });
            m.insert("swipe_down".to_string(), ActionConfig { action_type: "key_combo".into(), value: "Ctrl+v".into(), name: "Incolla".into(), description: "Incolla dagli appunti".into() });
            m.insert("windows_click".to_string(), ActionConfig { action_type: "key_combo".into(), value: "Super+Space".into(), name: "Ricerca Rapida".into(), description: "Apre la ricerca file/app".into() });
            m.insert("tilt_left".to_string(), ActionConfig { action_type: "key_combo".into(), value: "Ctrl+z".into(), name: "Annulla".into(), description: "Undo ultima operazione".into() });
            m.insert("tilt_right".to_string(), ActionConfig { action_type: "key_combo".into(), value: "Ctrl+y".into(), name: "Ripristina".into(), description: "Redo operazione".into() });
            m.insert("middle_click".to_string(), ActionConfig { action_type: "mouse_button".into(), value: "BTN_MIDDLE".into(), name: "Click Centrale".into(), description: "Standard".into() });
            Some(m)
        }
        "multimedia" => {
            m.insert("swipe_up".to_string(), ActionConfig { action_type: "media".into(), value: "VolumeUp".into(), name: "Alza Volume".into(), description: "Incrementa il volume audio".into() });
            m.insert("swipe_down".to_string(), ActionConfig { action_type: "media".into(), value: "VolumeDown".into(), name: "Abbassa Volume".into(), description: "Diminuisce il volume audio".into() });
            m.insert("windows_click".to_string(), ActionConfig { action_type: "media".into(), value: "PlayPause".into(), name: "Play / Pausa".into(), description: "Riproduci o metti in pausa".into() });
            m.insert("tilt_left".to_string(), ActionConfig { action_type: "media".into(), value: "PreviousTrack".into(), name: "Traccia Precedente".into(), description: "Brano precedente".into() });
            m.insert("tilt_right".to_string(), ActionConfig { action_type: "media".into(), value: "NextTrack".into(), name: "Traccia Successiva".into(), description: "Brano successivo".into() });
            m.insert("middle_click".to_string(), ActionConfig { action_type: "media".into(), value: "Mute".into(), name: "Muto".into(), description: "Disattiva audio".into() });
            Some(m)
        }
        "browser" => {
            m.insert("swipe_up".to_string(), ActionConfig { action_type: "key_combo".into(), value: "Ctrl+Tab".into(), name: "Scheda Successiva".into(), description: "Passa alla scheda a destra".into() });
            m.insert("swipe_down".to_string(), ActionConfig { action_type: "key_combo".into(), value: "Ctrl+Shift+Tab".into(), name: "Scheda Precedente".into(), description: "Passa alla scheda a sinistra".into() });
            m.insert("windows_click".to_string(), ActionConfig { action_type: "key_combo".into(), value: "Ctrl+t".into(), name: "Nuova Scheda".into(), description: "Apre una nuova scheda".into() });
            m.insert("tilt_left".to_string(), ActionConfig { action_type: "key_combo".into(), value: "Alt+Left".into(), name: "Pagina Indietro".into(), description: "Torna alla pagina precedente".into() });
            m.insert("tilt_right".to_string(), ActionConfig { action_type: "key_combo".into(), value: "Alt+Right".into(), name: "Pagina Avanti".into(), description: "Avanza alla pagina successiva".into() });
            m.insert("middle_click".to_string(), ActionConfig { action_type: "key_combo".into(), value: "Ctrl+w".into(), name: "Chiudi Scheda".into(), description: "Chiude la scheda attiva".into() });
            Some(m)
        }
        _ => None,
    }
}

pub struct ConfigManager {
    config_path: PathBuf,
}

impl ConfigManager {
    pub fn new() -> Self {
        let mut path = dirs::config_dir().unwrap_or_else(|| PathBuf::from("."));
        path.push("sculptflow");
        fs::create_dir_all(&path).ok();
        path.push("config.json");
        Self { config_path: path }
    }

    pub fn load(&self) -> AppConfig {
        if self.config_path.exists() {
            if let Ok(content) = fs::read_to_string(&self.config_path) {
                if let Ok(config) = serde_json::from_str::<AppConfig>(&content) {
                    return config;
                }
            }
        }
        let default_config = AppConfig::default();
        self.save(&default_config).ok();
        default_config
    }

    pub fn save(&self, config: &AppConfig) -> Result<(), String> {
        let data = serde_json::to_string_pretty(config).map_err(|e| e.to_string())?;
        fs::write(&self.config_path, data).map_err(|e| e.to_string())?;
        Ok(())
    }
}
