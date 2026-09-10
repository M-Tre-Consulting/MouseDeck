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
        let is_g502_detected = if let Ok(content) = fs::read_to_string("/proc/bus/input/devices") {
            content.to_lowercase().contains("g502")
        } else {
            false
        };

        let initial_driver = if is_g502_detected {
            "logitech_g502_x".to_string()
        } else {
            "microsoft_sculpt_comfort".to_string()
        };

        let mut profiles = HashMap::new();
        profiles.insert("Predefinito".to_string(), get_default_mappings(&initial_driver));

        Self {
            enabled: true,
            autostart: false,
            active_profile: "Predefinito".to_string(),
            active_driver: initial_driver,
            profiles,
        }
    }
}

pub fn get_default_mappings(driver_id: &str) -> HashMap<String, ActionConfig> {
    if driver_id == "logitech_g502_x" {
        get_default_g502_mappings()
    } else {
        get_default_sculpt_mappings()
    }
}

pub fn get_default_sculpt_mappings() -> HashMap<String, ActionConfig> {
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

pub fn get_default_g502_mappings() -> HashMap<String, ActionConfig> {
    let mut m = HashMap::new();
    m.insert(
        "g4_back".to_string(),
        ActionConfig {
            action_type: "key_combo".to_string(),
            value: "Alt+Left".to_string(),
            name: "Indietro Browser / App".to_string(),
            description: "Pulsante laterale inferiore (G4)".to_string(),
        },
    );
    m.insert(
        "g5_forward".to_string(),
        ActionConfig {
            action_type: "key_combo".to_string(),
            value: "Alt+Right".to_string(),
            name: "Avanti Browser / App".to_string(),
            description: "Pulsante laterale superiore (G5)".to_string(),
        },
    );
    m.insert(
        "g6_sniper".to_string(),
        ActionConfig {
            action_type: "key_combo".to_string(),
            value: "Ctrl+Shift+M".to_string(),
            name: "Tasto Sniper / Muto Microfono".to_string(),
            description: "Pulsante pollice frontale (G6)".to_string(),
        },
    );
    m.insert(
        "g7_dpi_down".to_string(),
        ActionConfig {
            action_type: "media".to_string(),
            value: "VolumeDown".to_string(),
            name: "Volume Giù".to_string(),
            description: "Pulsante indice inferiore (G7)".to_string(),
        },
    );
    m.insert(
        "g8_dpi_up".to_string(),
        ActionConfig {
            action_type: "media".to_string(),
            value: "VolumeUp".to_string(),
            name: "Volume Su".to_string(),
            description: "Pulsante indice superiore (G8)".to_string(),
        },
    );
    m.insert(
        "g9_profile".to_string(),
        ActionConfig {
            action_type: "key_combo".to_string(),
            value: "Super".to_string(),
            name: "Panoramica / Launcher".to_string(),
            description: "Pulsante centrale profilo (G9)".to_string(),
        },
    );
    m.insert(
        "tilt_left".to_string(),
        ActionConfig {
            action_type: "key_combo".to_string(),
            value: "Ctrl+Page_Up".to_string(),
            name: "Scheda Precedente".to_string(),
            description: "Inclinazione rotellina a sinistra".to_string(),
        },
    );
    m.insert(
        "tilt_right".to_string(),
        ActionConfig {
            action_type: "key_combo".to_string(),
            value: "Ctrl+Page_Down".to_string(),
            name: "Scheda Successiva".to_string(),
            description: "Inclinazione rotellina a destra".to_string(),
        },
    );
    m.insert(
        "middle_click".to_string(),
        ActionConfig {
            action_type: "mouse_button".to_string(),
            value: "BTN_MIDDLE".to_string(),
            name: "Click Centrale".to_string(),
            description: "Pressione verticale della rotellina".to_string(),
        },
    );
    m
}

pub fn get_preset_mappings(preset_key: &str, driver_id: &str) -> Option<HashMap<String, ActionConfig>> {
    if driver_id == "logitech_g502_x" {
        get_g502_preset_mappings(preset_key)
    } else {
        get_sculpt_preset_mappings(preset_key)
    }
}

fn get_g502_preset_mappings(preset_key: &str) -> Option<HashMap<String, ActionConfig>> {
    let mut m = HashMap::new();
    match preset_key {
        "gaming" => {
            m.insert("g4_back".to_string(), ActionConfig { action_type: "key_combo".into(), value: "f".into(), name: "Azione / Melee".into(), description: "Attacco corpo a corpo o interazione".into() });
            m.insert("g5_forward".to_string(), ActionConfig { action_type: "key_combo".into(), value: "g".into(), name: "Granata / Abilità".into(), description: "Lancio equipaggiamento tattico".into() });
            m.insert("g6_sniper".to_string(), ActionConfig { action_type: "key_combo".into(), value: "Shift".into(), name: "Mira Precisione / Trattieni Respiro".into(), description: "Stabilizzazione mira cecchino".into() });
            m.insert("g7_dpi_down".to_string(), ActionConfig { action_type: "key_combo".into(), value: "4".into(), name: "Kit Medico / Cura".into(), description: "Usa consumabile rapido".into() });
            m.insert("g8_dpi_up".to_string(), ActionConfig { action_type: "key_combo".into(), value: "m".into(), name: "Mappa / Tattica".into(), description: "Apre mappa di gioco".into() });
            m.insert("g9_profile".to_string(), ActionConfig { action_type: "key_combo".into(), value: "Tab".into(), name: "Punteggio / Inventario".into(), description: "Tabella punteggi".into() });
            m.insert("tilt_left".to_string(), ActionConfig { action_type: "key_combo".into(), value: "z".into(), name: "Segnale Ping / Allarme".into(), description: "Ping posizione ai compagni".into() });
            m.insert("tilt_right".to_string(), ActionConfig { action_type: "key_combo".into(), value: "x".into(), name: "Voce Push-To-Talk".into(), description: "Attiva microfono".into() });
            m.insert("middle_click".to_string(), ActionConfig { action_type: "mouse_button".into(), value: "BTN_MIDDLE".into(), name: "Click Centrale".into(), description: "Standard".into() });
            Some(m)
        }
        "productivity" => {
            m.insert("g4_back".to_string(), ActionConfig { action_type: "key_combo".into(), value: "Ctrl+c".into(), name: "Copia".into(), description: "Copia negli appunti".into() });
            m.insert("g5_forward".to_string(), ActionConfig { action_type: "key_combo".into(), value: "Ctrl+v".into(), name: "Incolla".into(), description: "Incolla dagli appunti".into() });
            m.insert("g6_sniper".to_string(), ActionConfig { action_type: "key_combo".into(), value: "Super+Space".into(), name: "Ricerca Rapida".into(), description: "Apre launcher o ricerca".into() });
            m.insert("g7_dpi_down".to_string(), ActionConfig { action_type: "key_combo".into(), value: "Ctrl+z".into(), name: "Annulla".into(), description: "Undo operazione".into() });
            m.insert("g8_dpi_up".to_string(), ActionConfig { action_type: "key_combo".into(), value: "Ctrl+y".into(), name: "Ripristina".into(), description: "Redo operazione".into() });
            m.insert("g9_profile".to_string(), ActionConfig { action_type: "key_combo".into(), value: "Super".into(), name: "Panoramica / Launcher".into(), description: "Apre panoramica desktop".into() });
            m.insert("tilt_left".to_string(), ActionConfig { action_type: "key_combo".into(), value: "Super+Page_Up".into(), name: "Workspace Precedente".into(), description: "Passa allo spazio a sinistra".into() });
            m.insert("tilt_right".to_string(), ActionConfig { action_type: "key_combo".into(), value: "Super+Page_Down".into(), name: "Workspace Successivo".into(), description: "Passa allo spazio a destra".into() });
            m.insert("middle_click".to_string(), ActionConfig { action_type: "mouse_button".into(), value: "BTN_MIDDLE".into(), name: "Click Centrale".into(), description: "Standard".into() });
            Some(m)
        }
        "multimedia" => {
            m.insert("g4_back".to_string(), ActionConfig { action_type: "media".into(), value: "PreviousTrack".into(), name: "Brano Precedente".into(), description: "Torna indietro".into() });
            m.insert("g5_forward".to_string(), ActionConfig { action_type: "media".into(), value: "NextTrack".into(), name: "Brano Successivo".into(), description: "Avanza al brano successivo".into() });
            m.insert("g6_sniper".to_string(), ActionConfig { action_type: "media".into(), value: "Mute".into(), name: "Muto Audio".into(), description: "Disattiva audio di sistema".into() });
            m.insert("g7_dpi_down".to_string(), ActionConfig { action_type: "media".into(), value: "VolumeDown".into(), name: "Volume Giù".into(), description: "Diminuisce il volume".into() });
            m.insert("g8_dpi_up".to_string(), ActionConfig { action_type: "media".into(), value: "VolumeUp".into(), name: "Volume Su".into(), description: "Aumenta il volume".into() });
            m.insert("g9_profile".to_string(), ActionConfig { action_type: "key_combo".into(), value: "Ctrl+Shift+M".into(), name: "Muto Microfono".into(), description: "Mute microfono Discord/Meet".into() });
            m.insert("tilt_left".to_string(), ActionConfig { action_type: "media".into(), value: "PreviousTrack".into(), name: "Traccia Precedente".into(), description: "Brano precedente".into() });
            m.insert("tilt_right".to_string(), ActionConfig { action_type: "media".into(), value: "NextTrack".into(), name: "Traccia Successiva".into(), description: "Brano successivo".into() });
            m.insert("middle_click".to_string(), ActionConfig { action_type: "media".into(), value: "PlayPause".into(), name: "Play / Pausa".into(), description: "Riproduci o metti in pausa".into() });
            Some(m)
        }
        "browser" => {
            m.insert("g4_back".to_string(), ActionConfig { action_type: "key_combo".into(), value: "Alt+Left".into(), name: "Pagina Indietro".into(), description: "Cronologia indietro".into() });
            m.insert("g5_forward".to_string(), ActionConfig { action_type: "key_combo".into(), value: "Alt+Right".into(), name: "Pagina Avanti".into(), description: "Cronologia avanti".into() });
            m.insert("g6_sniper".to_string(), ActionConfig { action_type: "key_combo".into(), value: "Ctrl+w".into(), name: "Chiudi Scheda".into(), description: "Chiude la tab attiva".into() });
            m.insert("g7_dpi_down".to_string(), ActionConfig { action_type: "key_combo".into(), value: "Ctrl+-".into(), name: "Zoom -".into(), description: "Riduci zoom pagina".into() });
            m.insert("g8_dpi_up".to_string(), ActionConfig { action_type: "key_combo".into(), value: "Ctrl+Plus".into(), name: "Zoom +".into(), description: "Aumenta zoom pagina".into() });
            m.insert("g9_profile".to_string(), ActionConfig { action_type: "key_combo".into(), value: "Ctrl+t".into(), name: "Nuova Scheda".into(), description: "Apre una nuova tab".into() });
            m.insert("tilt_left".to_string(), ActionConfig { action_type: "key_combo".into(), value: "Ctrl+Shift+Tab".into(), name: "Scheda Precedente".into(), description: "Tab a sinistra".into() });
            m.insert("tilt_right".to_string(), ActionConfig { action_type: "key_combo".into(), value: "Ctrl+Tab".into(), name: "Scheda Successiva".into(), description: "Tab a destra".into() });
            m.insert("middle_click".to_string(), ActionConfig { action_type: "mouse_button".into(), value: "BTN_MIDDLE".into(), name: "Click Centrale".into(), description: "Apre link in nuova tab".into() });
            Some(m)
        }
        _ => None,
    }
}

fn get_sculpt_preset_mappings(preset_key: &str) -> Option<HashMap<String, ActionConfig>> {
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
        let base_dir = dirs::config_dir().unwrap_or_else(|| PathBuf::from("."));
        let new_dir = base_dir.join("mousedeck");
        let new_file = new_dir.join("config.json");
        
        let old_file = base_dir.join("sculptflow").join("config.json");
        if old_file.exists() && !new_file.exists() {
            fs::create_dir_all(&new_dir).ok();
            fs::copy(&old_file, &new_file).ok();
        } else {
            fs::create_dir_all(&new_dir).ok();
        }

        Self { config_path: new_file }
    }

    pub fn load(&self) -> AppConfig {
        if self.config_path.exists() {
            if let Ok(content) = fs::read_to_string(&self.config_path) {
                if let Ok(mut config) = serde_json::from_str::<AppConfig>(&content) {
                    // Check if profiles are empty or need default
                    if config.profiles.is_empty() {
                        config.profiles.insert("Predefinito".to_string(), get_default_mappings(&config.active_driver));
                        self.save(&config).ok();
                    }
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_g502_default_mappings() {
        let mappings = get_default_mappings("logitech_g502_x");
        assert!(mappings.contains_key("g4_back"));
        assert!(mappings.contains_key("g5_forward"));
        assert!(mappings.contains_key("g6_sniper"));
        assert!(mappings.contains_key("g7_dpi_down"));
        assert!(mappings.contains_key("g8_dpi_up"));
        assert!(mappings.contains_key("g9_profile"));
        assert!(mappings.contains_key("tilt_left"));
        assert!(mappings.contains_key("tilt_right"));
        assert!(mappings.contains_key("middle_click"));
    }

    #[test]
    fn test_g502_presets() {
        for preset in &["gaming", "productivity", "multimedia", "browser"] {
            let res = get_preset_mappings(preset, "logitech_g502_x");
            assert!(res.is_some(), "Preset {} should exist for G502", preset);
            let map = res.unwrap();
            assert!(map.contains_key("g6_sniper"));
            assert!(map.contains_key("g4_back"));
            assert!(map.contains_key("g5_forward"));
        }
    }
}

