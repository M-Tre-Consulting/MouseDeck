use std::process::Command;
use crate::bluetooth::info::BluetoothDeviceInfo;

pub struct BluetoothManager;

impl BluetoothManager {
    pub async fn get_target_device() -> Option<BluetoothDeviceInfo> {
        // Query bluetoothctl devices
        if let Ok(output) = Command::new("bluetoothctl").arg("devices").output() {
            let stdout = String::from_utf8_lossy(&output.stdout);
            
            // Prefer Sculpt Comfort if present
            for line in stdout.lines() {
                let parts: Vec<&str> = line.split_whitespace().collect();
                if parts.len() >= 3 && parts[0] == "Device" {
                    let mac = parts[1];
                    let name = parts[2..].join(" ");
                    if name.to_lowercase().contains("sculpt comfort") {
                        let mut info = BluetoothDeviceInfo::new(mac.to_string(), name);
                        Self::fill_device_details(&mut info, mac);
                        return Some(info);
                    }
                }
            }

            // Otherwise pick any mouse or pointing device
            for line in stdout.lines() {
                let parts: Vec<&str> = line.split_whitespace().collect();
                if parts.len() >= 3 && parts[0] == "Device" {
                    let mac = parts[1];
                    let name = parts[2..].join(" ");
                    if name.to_lowercase().contains("mouse") || name.to_lowercase().contains("touchpad") {
                        let mut info = BluetoothDeviceInfo::new(mac.to_string(), name);
                        Self::fill_device_details(&mut info, mac);
                        return Some(info);
                    }
                }
            }

            // If any device is paired/connected, take the first one
            for line in stdout.lines() {
                let parts: Vec<&str> = line.split_whitespace().collect();
                if parts.len() >= 3 && parts[0] == "Device" {
                    let mac = parts[1];
                    let name = parts[2..].join(" ");
                    let mut info = BluetoothDeviceInfo::new(mac.to_string(), name);
                    Self::fill_device_details(&mut info, mac);
                    if info.connected {
                        return Some(info);
                    }
                }
            }
        }
        None
    }

    fn fill_device_details(info: &mut BluetoothDeviceInfo, mac: &str) {
        // 1. Check bluetoothctl info
        if let Ok(output) = Command::new("bluetoothctl").args(["info", mac]).output() {
            let stdout = String::from_utf8_lossy(&output.stdout);
            for line in stdout.lines() {
                let trimmed = line.trim();
                if trimmed.starts_with("Connected:") {
                    info.connected = trimmed.contains("yes");
                } else if trimmed.starts_with("Paired:") {
                    info.paired = trimmed.contains("yes");
                } else if trimmed.starts_with("Trusted:") {
                    info.trusted = trimmed.contains("yes");
                } else if trimmed.starts_with("Blocked:") {
                    info.blocked = trimmed.contains("yes");
                } else if trimmed.starts_with("Alias:") {
                    info.alias = trimmed.replace("Alias:", "").trim().to_string();
                } else if trimmed.starts_with("Icon:") {
                    info.icon = trimmed.replace("Icon:", "").trim().to_string();
                } else if trimmed.starts_with("Modalias:") {
                    let modalias = trimmed.replace("Modalias:", "").trim().to_string();
                    info.modalias = modalias.clone();
                    if let Some(idx) = modalias.find("v") {
                        if modalias.len() >= idx + 10 {
                            let v = &modalias[idx + 1..idx + 5];
                            let p = &modalias[idx + 6..idx + 10];
                            info.vendor_id = Some(v.to_lowercase());
                            info.product_id = Some(p.to_lowercase());
                        }
                    }
                } else if trimmed.starts_with("Battery Percentage:") {
                    if let Some(pct_str) = trimmed.split_whitespace().last() {
                        let clean = pct_str.trim_matches(|c| c == '(' || c == ')' || c == '%');
                        if let Ok(val) = clean.parse::<u8>() {
                            info.battery_percentage = Some(val);
                            info.battery_status_text = format!("{}%", val);
                        }
                    }
                }
            }
        }

        // 2. If battery not found, check UPower
        if info.battery_percentage.is_none() {
            if let Ok(output) = Command::new("upower").arg("-e").output() {
                let stdout = String::from_utf8_lossy(&output.stdout);
                let mac_clean = mac.replace(":", "_").to_lowercase();
                for dev_path in stdout.lines() {
                    if dev_path.to_lowercase().contains(&mac_clean) || dev_path.contains("mouse") {
                        if let Ok(info_out) = Command::new("upower").args(["-i", dev_path.trim()]).output() {
                            let info_str = String::from_utf8_lossy(&info_out.stdout);
                            for l in info_str.lines() {
                                if l.trim().starts_with("percentage:") {
                                    if let Some(pct_part) = l.split(':').nth(1) {
                                        let clean = pct_part.trim().trim_end_matches('%').trim();
                                        if let Ok(val) = clean.parse::<f32>() {
                                            let u_val = val.round() as u8;
                                            info.battery_percentage = Some(u_val);
                                            info.battery_status_text = format!("{}%", u_val);
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // 3. If battery still not reported (as in BT 3.0 Classic HID devices)
        if info.battery_percentage.is_none() {
            if info.is_sculpt_comfort {
                info.battery_status_text = "2x Batterie AA (Non telemetrato via BT 3.0)".to_string();
            } else {
                info.battery_status_text = "Livello non disponibile via protocollo HID".to_string();
            }
        }
    }

    pub fn reconnect(address: &str) -> Result<(), String> {
        let _ = Command::new("bluetoothctl").args(["disconnect", address]).output();
        std::thread::sleep(std::time::Duration::from_millis(500));
        let res = Command::new("bluetoothctl").args(["connect", address]).output()
            .map_err(|e| e.to_string())?;
        if res.status.success() {
            Ok(())
        } else {
            Err(String::from_utf8_lossy(&res.stderr).to_string())
        }
    }
}
