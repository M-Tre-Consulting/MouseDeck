use std::fs;
use std::process::Command;
use crate::bluetooth::info::BluetoothDeviceInfo;

pub struct BluetoothManager;

impl BluetoothManager {
    pub async fn get_target_device() -> Option<BluetoothDeviceInfo> {
        // 1. Check for Logitech devices in sysfs power_supply (direct hardware telemetry)
        if let Some(dev) = Self::detect_logitech_from_sysfs() {
            return Some(dev);
        }

        // 2. Check for Logitech devices in /proc/bus/input/devices
        if let Some(dev) = Self::detect_logitech_from_proc() {
            return Some(dev);
        }

        // 3. Query bluetoothctl devices (for BT mice)
        if let Ok(output) = Command::new("bluetoothctl").arg("devices").output() {
            let stdout = String::from_utf8_lossy(&output.stdout);
            
            // Prefer known supported mice if present
            for line in stdout.lines() {
                let parts: Vec<&str> = line.split_whitespace().collect();
                if parts.len() >= 3 && parts[0] == "Device" {
                    let mac = parts[1];
                    let name = parts[2..].join(" ");
                    let name_lower = name.to_lowercase();
                    if name_lower.contains("sculpt comfort")
                        || name_lower.contains("anywhere 2s")
                        || name_lower.contains("anywhere 3")
                    {
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

    fn detect_logitech_from_sysfs() -> Option<BluetoothDeviceInfo> {
        let base_path = "/sys/class/power_supply";
        if let Ok(entries) = fs::read_dir(base_path) {
            for entry in entries.flatten() {
                let p = entry.path();
                let model_path = p.join("model_name");
                if let Ok(model_raw) = fs::read_to_string(&model_path) {
                    let model = model_raw.trim();
                    let model_lower = model.to_lowercase();

                    let (is_match, driver_id, default_pid) = if model_lower.contains("g502") {
                        (true, "logitech_g502_x", "4099")
                    } else if model_lower.contains("anywhere 2s") {
                        (true, "logitech_mx_anywhere_2s", "406a")
                    } else if model_lower.contains("anywhere 3") {
                        (true, "logitech_mx_anywhere_3", "4090")
                    } else {
                        (false, "", "")
                    };

                    if is_match {
                        let full_name = if model.starts_with("Logitech") {
                            model.to_string()
                        } else {
                            format!("Logitech {}", model)
                        };

                        let serial = fs::read_to_string(p.join("serial_number"))
                            .map(|s| s.trim().to_string())
                            .unwrap_or_else(|_| "WIRELESS-DONGLE".to_string());

                        let mut info = BluetoothDeviceInfo::new(serial, full_name.clone());
                        info.alias = full_name;
                        info.connected = true;
                        info.paired = true;
                        info.trusted = true;
                        info.vendor_id = Some("046d".to_string());
                        info.product_id = Some(default_pid.to_string());
                        info.driver_id = driver_id.to_string();

                        if let Ok(cap_str) = fs::read_to_string(p.join("capacity")) {
                            if let Ok(val) = cap_str.trim().parse::<u8>() {
                                info.battery_percentage = Some(val);
                                let status = fs::read_to_string(p.join("status"))
                                    .unwrap_or_default()
                                    .trim()
                                    .to_string();
                                
                                let status_label = if status.eq_ignore_ascii_case("charging") {
                                    "In carica"
                                } else {
                                    "Ricaricabile"
                                };
                                info.battery_status_text = format!("{}% ({})", val, status_label);
                            }
                        }

                        return Some(info);
                    }
                }
            }
        }
        None
    }

    fn detect_logitech_from_proc() -> Option<BluetoothDeviceInfo> {
        if let Ok(content) = fs::read_to_string("/proc/bus/input/devices") {
            for block in content.split("\n\n") {
                let lower = block.to_lowercase();

                let (is_match, driver_id, default_name, default_pid) = if lower.contains("g502") {
                    (true, "logitech_g502_x", "Logitech G502 X Lightspeed", "4099")
                } else if lower.contains("anywhere 2s") {
                    (true, "logitech_mx_anywhere_2s", "Logitech MX Anywhere 2S", "406a")
                } else if lower.contains("anywhere 3") {
                    (true, "logitech_mx_anywhere_3", "Logitech MX Anywhere 3", "4090")
                } else {
                    (false, "", "", "")
                };

                if is_match {
                    let mut name = default_name.to_string();
                    let mut uniq = "WIRELESS".to_string();

                    for line in block.lines() {
                        if line.starts_with("N: Name=") {
                            name = line.replace("N: Name=", "").trim_matches('"').to_string();
                        } else if line.starts_with("U: Uniq=") {
                            let u = line.replace("U: Uniq=", "").trim().to_string();
                            if !u.is_empty() {
                                uniq = u;
                            }
                        }
                    }

                    let mut info = BluetoothDeviceInfo::new(uniq, name.clone());
                    info.alias = name;
                    info.connected = true;
                    info.paired = true;
                    info.trusted = true;
                    info.vendor_id = Some("046d".to_string());
                    info.product_id = Some(default_pid.to_string());
                    info.driver_id = driver_id.to_string();

                    // Check upower for battery
                    Self::check_upower_for_mouse(&mut info);

                    return Some(info);
                }
            }
        }
        None
    }

    fn check_upower_for_mouse(info: &mut BluetoothDeviceInfo) {
        if let Ok(output) = Command::new("upower").arg("-e").output() {
            let stdout = String::from_utf8_lossy(&output.stdout);
            for dev_path in stdout.lines() {
                let dev_clean = dev_path.trim();
                if dev_clean.contains("mouse") || dev_clean.contains("hidpp") {
                    if let Ok(info_out) = Command::new("upower").args(["-i", dev_clean]).output() {
                        let info_str = String::from_utf8_lossy(&info_out.stdout);
                        let info_lower = info_str.to_lowercase();
                        if info_lower.contains("g502")
                            || info_lower.contains("anywhere 2s")
                            || info_lower.contains("anywhere 3")
                            || info_str.contains(&info.address)
                        {
                            for l in info_str.lines() {
                                if l.trim().starts_with("percentage:") {
                                    if let Some(pct_part) = l.split(':').nth(1) {
                                        let clean = pct_part.trim().trim_end_matches('%').trim();
                                        if let Ok(val) = clean.parse::<f32>() {
                                            let u_val = val.round() as u8;
                                            info.battery_percentage = Some(u_val);
                                            info.battery_status_text = format!("{}% (Ricaricabile)", u_val);
                                            return;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
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
        // If it's a USB or non-Bluetooth address, trigger udev device rescan
        if !address.contains(':') || address.starts_with("LIGHTSPEED") {
            let _ = Command::new("udevadm").args(["trigger", "--subsystem-match=input"]).output();
            return Ok(());
        }

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
