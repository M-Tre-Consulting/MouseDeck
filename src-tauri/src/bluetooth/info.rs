use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BluetoothDeviceInfo {
    pub address: String,
    pub name: String,
    pub alias: String,
    pub icon: String,
    pub connected: bool,
    pub paired: bool,
    pub trusted: bool,
    pub blocked: bool,
    pub adapter: String,
    pub modalias: String,
    pub vendor_id: Option<String>,
    pub product_id: Option<String>,
    pub battery_percentage: Option<u8>,
    pub battery_status_text: String,
    pub is_sculpt_comfort: bool,
    pub is_g502_x: bool,
    pub is_mx_anywhere: bool,
    pub driver_id: String,
}

impl BluetoothDeviceInfo {
    pub fn new(address: String, name: String) -> Self {
        let alias = name.clone();
        let name_lower = name.to_lowercase();
        let is_sculpt_comfort = name_lower.contains("sculpt comfort");
        let is_g502_x = name_lower.contains("g502");
        let is_mx_anywhere_2s = name_lower.contains("anywhere 2s");
        let is_mx_anywhere_3 = name_lower.contains("anywhere 3");
        let is_mx_anywhere = is_mx_anywhere_2s || is_mx_anywhere_3;
        
        let driver_id = if is_g502_x {
            "logitech_g502_x".to_string()
        } else if is_mx_anywhere_2s {
            "logitech_mx_anywhere_2s".to_string()
        } else if is_mx_anywhere_3 {
            "logitech_mx_anywhere_3".to_string()
        } else {
            "microsoft_sculpt_comfort".to_string()
        };

        let (v_id, p_id) = if is_sculpt_comfort {
            (Some("045e".into()), Some("07a2".into()))
        } else if is_g502_x {
            (Some("046d".into()), Some("c547".into()))
        } else if is_mx_anywhere_2s {
            (Some("046d".into()), Some("406a".into()))
        } else if is_mx_anywhere_3 {
            (Some("046d".into()), Some("4090".into()))
        } else {
            (None, None)
        };

        let is_logitech_wireless = is_g502_x || is_mx_anywhere;

        Self {
            address,
            name,
            alias,
            icon: "input-mouse".to_string(),
            connected: false,
            paired: false,
            trusted: false,
            blocked: false,
            adapter: if is_logitech_wireless { "Bluetooth LE / Unifying 2.4GHz".to_string() } else { "hci0".to_string() },
            modalias: String::new(),
            vendor_id: v_id,
            product_id: p_id,
            battery_percentage: None,
            battery_status_text: if is_logitech_wireless { "Batteria Ricaricabile Li-Po".to_string() } else { "2x Batterie AA (Standard)".to_string() },
            is_sculpt_comfort,
            is_g502_x,
            is_mx_anywhere,
            driver_id,
        }
    }
}
