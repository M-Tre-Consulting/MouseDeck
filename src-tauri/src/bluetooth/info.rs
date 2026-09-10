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
    pub driver_id: String,
}

impl BluetoothDeviceInfo {
    pub fn new(address: String, name: String) -> Self {
        let alias = name.clone();
        let name_lower = name.to_lowercase();
        let is_sculpt_comfort = name_lower.contains("sculpt comfort");
        let is_g502_x = name_lower.contains("g502");
        
        let driver_id = if is_g502_x {
            "logitech_g502_x".to_string()
        } else {
            "microsoft_sculpt_comfort".to_string()
        };

        let (v_id, p_id) = if is_sculpt_comfort {
            (Some("045e".into()), Some("07a2".into()))
        } else if is_g502_x {
            (Some("046d".into()), Some("c547".into()))
        } else {
            (None, None)
        };

        Self {
            address,
            name,
            alias,
            icon: "input-mouse".to_string(),
            connected: false,
            paired: false,
            trusted: false,
            blocked: false,
            adapter: if is_g502_x { "LIGHTSPEED Wireless 2.4GHz".to_string() } else { "hci0".to_string() },
            modalias: String::new(),
            vendor_id: v_id,
            product_id: p_id,
            battery_percentage: None,
            battery_status_text: if is_g502_x { "Batteria LIGHTSPEED".to_string() } else { "2x Batterie AA (Standard)".to_string() },
            is_sculpt_comfort,
            is_g502_x,
            driver_id,
        }
    }
}
