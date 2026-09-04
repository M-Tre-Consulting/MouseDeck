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
    pub is_sculpt_comfort: bool,
}

impl BluetoothDeviceInfo {
    pub fn new(address: String, name: String) -> Self {
        let alias = name.clone();
        let is_sculpt_comfort = name.to_lowercase().contains("sculpt comfort");
        Self {
            address,
            name,
            alias,
            icon: "input-mouse".to_string(),
            connected: false,
            paired: false,
            trusted: false,
            blocked: false,
            adapter: "hci0".to_string(),
            modalias: String::new(),
            vendor_id: if is_sculpt_comfort { Some("045e".into()) } else { None },
            product_id: if is_sculpt_comfort { Some("07a2".into()) } else { None },
            battery_percentage: None,
            is_sculpt_comfort,
        }
    }
}
