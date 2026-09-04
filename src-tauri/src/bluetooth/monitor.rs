use std::process::Command;
use crate::bluetooth::info::BluetoothDeviceInfo;

pub struct BluetoothManager;

impl BluetoothManager {
    pub async fn get_target_device() -> Option<BluetoothDeviceInfo> {
        // First try bluetoothctl info/devices which is standard across all Linux distros
        if let Ok(output) = Command::new("bluetoothctl").arg("devices").output() {
            let stdout = String::from_utf8_lossy(&output.stdout);
            for line in stdout.lines() {
                // Device 30:59:B7:79:CE:4C Microsoft Sculpt Comfort Mouse
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

            // If Sculpt Comfort wasn't named explicitly, pick first mouse
            for line in stdout.lines() {
                let parts: Vec<&str> = line.split_whitespace().collect();
                if parts.len() >= 3 && parts[0] == "Device" {
                    let mac = parts[1];
                    let name = parts[2..].join(" ");
                    if name.to_lowercase().contains("mouse") {
                        let mut info = BluetoothDeviceInfo::new(mac.to_string(), name);
                        Self::fill_device_details(&mut info, mac);
                        return Some(info);
                    }
                }
            }
        }
        None
    }

    fn fill_device_details(info: &mut BluetoothDeviceInfo, mac: &str) {
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
                    // parse usb:v045Ep07A2d0129
                    if let Some(idx) = modalias.find("v") {
                        if modalias.len() >= idx + 10 {
                            let v = &modalias[idx + 1..idx + 5];
                            let p = &modalias[idx + 6..idx + 10];
                            info.vendor_id = Some(v.to_lowercase());
                            info.product_id = Some(p.to_lowercase());
                        }
                    }
                } else if trimmed.starts_with("Battery Percentage:") {
                    // Extract percentage if present
                    if let Some(pct_str) = trimmed.split_whitespace().last() {
                        let clean = pct_str.trim_matches(|c| c == '(' || c == ')' || c == '%');
                        if let Ok(val) = clean.parse::<u8>() {
                            info.battery_percentage = Some(val);
                        }
                    }
                }
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
