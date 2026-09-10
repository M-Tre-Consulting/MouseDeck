use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;
use evdev::Device;
use tauri::{AppHandle, Emitter};

use crate::config::ConfigManager;
use crate::drivers::DriverRegistry;
use crate::drivers::trait_def::GestureResult;
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
            loop {
                // Check if remapping is enabled
                let (is_enabled, active_driver_id) = {
                    let cfg = cfg_mgr.lock().unwrap().load();
                    (cfg.enabled, cfg.active_driver.clone())
                };

                if !is_enabled {
                    thread::sleep(Duration::from_millis(1000));
                    continue;
                }

                let mut driver = DriverRegistry::instantiate_driver(&active_driver_id);

                // Identify target input node
                let nodes = driver.identify_input_nodes();
                let target_path = match nodes.get("device").or_else(|| nodes.get("keyboard")).or_else(|| nodes.get("mouse")) {
                    Some(p) => p.clone(),
                    None => {
                        thread::sleep(Duration::from_millis(1500));
                        continue;
                    }
                };

                // Open device
                let mut dev = match Device::open(&target_path) {
                    Ok(d) => d,
                    Err(_) => {
                        // Permission denied or node disappeared
                        thread::sleep(Duration::from_millis(2000));
                        continue;
                    }
                };

                // Grab device
                let is_grabbed = match dev.grab() {
                    Ok(_) => {
                        println!("[RemapperService] Dispositivo {} afferrato con successo!", target_path);
                        true
                    }
                    Err(e) => {
                        eprintln!("[RemapperService] Impossibile afferrare in esclusiva {} (fallback monitor): {}", target_path, e);
                        false
                    }
                };

                driver.reset_state();

                // Event loop for this device
                loop {
                    // Check if still enabled and driver hasn't changed
                    let (enabled, current_driver_id) = {
                        let cfg = cfg_mgr.lock().unwrap().load();
                        (cfg.enabled, cfg.active_driver.clone())
                    };

                    if !enabled || current_driver_id != active_driver_id {
                        break;
                    }

                    let should_break = match dev.fetch_events() {
                        Ok(events) => {
                            for ev in events {
                                let res = match ev.event_type() {
                                    evdev::EventType::KEY => driver.process_keyboard_event(ev.code(), ev.value()),
                                    evdev::EventType::RELATIVE => driver.process_mouse_event(ev.event_type().0, ev.code(), ev.value()),
                                    evdev::EventType::SYNCHRONIZATION => GestureResult::PassThrough,
                                    _ => GestureResult::PassThrough,
                                };

                                match res {
                                    GestureResult::Trigger(trigger_id) => {
                                        let cfg = cfg_mgr.lock().unwrap().load();
                                        let active_map = cfg.profiles.get(&cfg.active_profile)
                                            .cloned()
                                            .unwrap_or_default();

                                        if let Some(action) = active_map.get(&trigger_id) {
                                            if action.action_type == "passthrough" {
                                                if is_grabbed {
                                                    emitter.lock().unwrap().emit_raw_event(&ev);
                                                }
                                            } else {
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
                                        } else if is_grabbed {
                                            // Unmapped: pass through original event
                                            emitter.lock().unwrap().emit_raw_event(&ev);
                                        }
                                    }
                                    GestureResult::PassThrough => {
                                        if is_grabbed {
                                            emitter.lock().unwrap().emit_raw_event(&ev);
                                        }
                                    }
                                    GestureResult::Consume => {
                                        // Consumed, do not forward
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

                if is_grabbed {
                    let _ = dev.ungrab();
                }
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
