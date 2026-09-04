// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    let args: Vec<String> = std::env::args().collect();
    if args.len() > 1 {
        if args[1] == "--setup-permissions" {
            let target_user = args.get(2).cloned().unwrap_or_else(|| {
                std::env::var("USER").unwrap_or_else(|_| "root".to_string())
            });
            match tauri_app_lib::permissions::perform_native_install(&target_user) {
                Ok(msg) => {
                    println!("{}", msg);
                    std::process::exit(0);
                }
                Err(err) => {
                    eprintln!("{}", err);
                    std::process::exit(1);
                }
            }
        } else if args[1] == "--restore-permissions" {
            let target_user = args.get(2).cloned().unwrap_or_else(|| {
                std::env::var("USER").unwrap_or_else(|_| "root".to_string())
            });
            match tauri_app_lib::permissions::perform_native_restore(&target_user) {
                Ok(msg) => {
                    println!("{}", msg);
                    std::process::exit(0);
                }
                Err(err) => {
                    eprintln!("{}", err);
                    std::process::exit(1);
                }
            }
        }
    }

    tauri_app_lib::run()
}
