pub mod config;
pub mod bluetooth;
pub mod drivers;
pub mod engine;
pub mod permissions;
pub mod autostart;

use std::sync::{Arc, Mutex};
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager, State,
};

use crate::config::{ActionConfig, AppConfig, ConfigManager, get_preset_mappings};
use crate::bluetooth::info::BluetoothDeviceInfo;
use crate::bluetooth::monitor::BluetoothManager;
use crate::engine::service::RemapperService;
use crate::permissions::{check_permissions, run_setup_permissions, run_restore_permissions, PermissionStatus};
use crate::autostart::{is_autostart_enabled, set_autostart};

pub struct AppState {
    pub config_mgr: Arc<Mutex<ConfigManager>>,
    pub service: Arc<Mutex<Option<RemapperService>>>,
}

#[tauri::command]
async fn get_device_status() -> Result<Option<BluetoothDeviceInfo>, String> {
    Ok(BluetoothManager::get_target_device().await)
}

#[tauri::command]
fn get_config(state: State<'_, AppState>) -> AppConfig {
    state.config_mgr.lock().unwrap().load()
}

#[tauri::command]
fn set_remapping_enabled(enabled: bool, state: State<'_, AppState>) -> Result<(), String> {
    let mut cfg = state.config_mgr.lock().unwrap().load();
    cfg.enabled = enabled;
    state.config_mgr.lock().unwrap().save(&cfg)
}

#[tauri::command]
fn save_mapping(trigger_id: String, action: ActionConfig, state: State<'_, AppState>) -> Result<(), String> {
    let mut cfg = state.config_mgr.lock().unwrap().load();
    let profile = cfg.active_profile.clone();
    let mappings = cfg.profiles.entry(profile).or_default();
    mappings.insert(trigger_id, action);
    state.config_mgr.lock().unwrap().save(&cfg)
}

#[tauri::command]
fn apply_preset(preset_key: String, state: State<'_, AppState>) -> Result<AppConfig, String> {
    if let Some(preset) = get_preset_mappings(&preset_key) {
        let mut cfg = state.config_mgr.lock().unwrap().load();
        let profile = cfg.active_profile.clone();
        cfg.profiles.insert(profile, preset);
        state.config_mgr.lock().unwrap().save(&cfg)?;
        Ok(cfg)
    } else {
        Err("Preset non trovato".to_string())
    }
}

#[tauri::command]
fn check_system_permissions() -> PermissionStatus {
    check_permissions()
}

#[tauri::command]
async fn run_setup_permissions_cmd() -> Result<String, String> {
    run_setup_permissions()
}

#[tauri::command]
async fn run_restore_permissions_cmd() -> Result<String, String> {
    run_restore_permissions()
}

#[tauri::command]
fn get_autostart_status() -> bool {
    is_autostart_enabled()
}

#[tauri::command]
fn set_autostart_cmd(enabled: bool, state: State<'_, AppState>) -> Result<(), String> {
    set_autostart(enabled)?;
    let mut cfg = state.config_mgr.lock().unwrap().load();
    cfg.autostart = enabled;
    state.config_mgr.lock().unwrap().save(&cfg)?;
    Ok(())
}

#[tauri::command]
fn simulate_gesture(trigger_id: String, state: State<'_, AppState>) -> Result<(), String> {
    if let Some(service) = state.service.lock().unwrap().as_ref() {
        service.simulate_trigger(&trigger_id);
    }
    Ok(())
}

#[tauri::command]
fn reconnect_bluetooth(address: String) -> Result<(), String> {
    BluetoothManager::reconnect(&address)
}

pub fn run() {
    let config_mgr = Arc::new(Mutex::new(ConfigManager::new()));
    let service_holder: Arc<Mutex<Option<RemapperService>>> = Arc::new(Mutex::new(None));

    let app_state = AppState {
        config_mgr: config_mgr.clone(),
        service: service_holder.clone(),
    };

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(app_state)
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                // Prevent app from quitting on close: minimize to tray instead
                api.prevent_close();
                let _ = window.hide();
            }
        })
        .setup(move |app| {
            let handle = app.handle().clone();
            let srv = RemapperService::new(handle.clone(), config_mgr);
            srv.start();
            *service_holder.lock().unwrap() = Some(srv);

            // Configure System Tray
            let show_i = MenuItem::with_id(app, "show", "Mostra MouseDeck", true, None::<&str>)?;
            let hide_i = MenuItem::with_id(app, "hide", "Nascondi nella Tray", true, None::<&str>)?;
            let quit_i = MenuItem::with_id(app, "quit", "Esci da MouseDeck", true, None::<&str>)?;
            let tray_menu = Menu::with_items(app, &[&show_i, &hide_i, &quit_i])?;

            if let Some(icon) = app.default_window_icon() {
                let _tray = TrayIconBuilder::new()
                    .icon(icon.clone())
                    .menu(&tray_menu)
                    .show_menu_on_left_click(false)
                    .tooltip("MouseDeck • Linux Mouse Suite")
                    .on_menu_event(|app, event| match event.id.as_ref() {
                        "show" => {
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                        "hide" => {
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.hide();
                            }
                        }
                        "quit" => {
                            app.exit(0);
                        }
                        _ => {}
                    })
                    .on_tray_icon_event(|tray, event| {
                        if let TrayIconEvent::Click {
                            button: MouseButton::Left,
                            button_state: MouseButtonState::Up,
                            ..
                        } = event
                        {
                            let app = tray.app_handle();
                            if let Some(window) = app.get_webview_window("main") {
                                if window.is_visible().unwrap_or(false) {
                                    let _ = window.hide();
                                } else {
                                    let _ = window.show();
                                    let _ = window.set_focus();
                                }
                            }
                        }
                    })
                    .build(app)?;
            }

            // Check if application was launched minimized/hidden (e.g. at boot)
            let is_minimized = std::env::args().any(|a| a == "--minimized" || a == "--hidden");
            if is_minimized {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.hide();
                }
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_device_status,
            get_config,
            set_remapping_enabled,
            save_mapping,
            apply_preset,
            check_system_permissions,
            run_setup_permissions_cmd,
            run_restore_permissions_cmd,
            get_autostart_status,
            set_autostart_cmd,
            simulate_gesture,
            reconnect_bluetooth,
        ])
        .run(tauri::generate_context!())
        .expect("Errore durante l'esecuzione di MouseDeck");
}
