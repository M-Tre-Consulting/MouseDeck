use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;
use evdev::Device;
use tauri::{AppHandle, Emitter};

use crate::config::ConfigManager;
use crate::drivers::sculpt_comfort::SculptComfortDriver;
use crate::drivers::trait_def::{DeviceDriver, GestureResult};
use crate::engine::emitter::UInputEmitter;

#[derive(Clone, serde::Serialize)]
pub struct GestureEventPayload {
    pub trigger_id: String,
    pub action_name: String,
    pub action_type: String,
    pub action_value: String,
    pub timestamp: String,
}

pub struct RemapperService {
    app_handle: AppHandle,
    config_mgr: Arc<Mutex<ConfigManager>>,
    emitter: Arc<Mutex<UInputEmitter>>,
}

impl RemapperService {
    pub fn new(app_handle: AppHandle, config_mgr: Arc<Mutex<ConfigManager>>) -> Self {
        let emitter = Arc::new(Mutex::new(UInputEmitter::new()));
        Self {
            app_handle,
            config_mgr,
            emitter,
        }
    }

    pub fn start(&self) {
        let app = self.app_handle.clone();
        let cfg_mgr = self.config_mgr.clone();
        let emitter = self.emitter.clone();

        thread::spawn(move || {
            let mut driver = SculptComfortDriver::new();

            loop {
                // Check if remapping is enabled
                let is_enabled = {
                    let cfg = cfg_mgr.lock().unwrap().load();
                    cfg.enabled
                };

                if !is_enabled {
                    thread::sleep(Duration::from_millis(1000));
                    continue;
                }

                // Identify nodes
                let nodes = driver.identify_input_nodes();
                let kbd_path = match nodes.get("keyboard") {
                    Some(p) => p.clone(),
                    None => {
                        thread::sleep(Duration::from_millis(1500));
                        continue;
                    }
                };

                // Open device
                let mut kbd_dev = match Device::open(&kbd_path) {
                    Ok(d) => d,
                    Err(_) => {
                        // Permission denied or node disappeared
                        thread::sleep(Duration::from_millis(2000));
                        continue;
                    }
                };

                // Grab device so default Windows gestures are consumed
                if let Err(e) = kbd_dev.grab() {
                    eprintln!("[RemapperService] Non è stato possibile afferrare {}: {}", kbd_path, e);
                } else {
                    println!("[RemapperService] Dispositivo {} afferrato con successo!", kbd_path);
                }

                driver.reset_state();

                // Event loop
                loop {
                    // Check if still enabled
                    let enabled = {
                        let cfg = cfg_mgr.lock().unwrap().load();
                        cfg.enabled
                    };
                    if !enabled {
                        break;
                    }

                    let should_break = match kbd_dev.fetch_events() {
                        Ok(events) => {
                            for ev in events {
                                if ev.event_type() == evdev::EventType::KEY {
                                    let res = driver.process_keyboard_event(ev.code(), ev.value());
                                    if let GestureResult::Trigger(trigger_id) = res {
                                        let cfg = cfg_mgr.lock().unwrap().load();
                                        let active_map = cfg.profiles.get(&cfg.active_profile)
                                            .cloned()
                                            .unwrap_or_default();

                                        if let Some(action) = active_map.get(&trigger_id) {
                                            emitter.lock().unwrap().execute_action(action);

                                            // Emit Tauri event to frontend
                                            let now = std::time::SystemTime::now();
                                            let dt: chrono::DateTime<chrono::Local> = now.into();
                                            let payload = GestureEventPayload {
                                                trigger_id: trigger_id.clone(),
                                                action_name: action.name.clone(),
                                                action_type: action.action_type.clone(),
                                                action_value: action.value.clone(),
                                                timestamp: dt.format("%H:%M:%S").to_string(),
                                            };
                                            let _ = app.emit("gesture-triggered", payload);
                                        }
                                    }
                                }
                            }
                            false
                        }
                        Err(e) => {
                            eprintln!("[RemapperService] Errore lettura eventi (disconnesso?): {}", e);
                            true
                        }
                    };

                    if should_break {
                        break;
                    }
                }

                let _ = kbd_dev.ungrab();
                thread::sleep(Duration::from_millis(1000));
            }
        });
    }

    pub fn simulate_trigger(&self, trigger_id: &str) {
        let cfg = self.config_mgr.lock().unwrap().load();
        let active_map = cfg.profiles.get(&cfg.active_profile).cloned().unwrap_or_default();
        if let Some(action) = active_map.get(trigger_id) {
            self.emitter.lock().unwrap().execute_action(action);

            let now = std::time::SystemTime::now();
            let dt: chrono::DateTime<chrono::Local> = now.into();
            let payload = GestureEventPayload {
                trigger_id: trigger_id.to_string(),
                action_name: action.name.clone(),
                action_type: action.action_type.clone(),
                action_value: action.value.clone(),
                timestamp: dt.format("%H:%M:%S").to_string(),
            };
            let _ = self.app_handle.emit("gesture-triggered", payload);
        }
    }
}
