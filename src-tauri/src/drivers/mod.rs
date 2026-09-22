pub mod trait_def;
pub mod sculpt_comfort;
pub mod g502_x;
pub mod mx_anywhere;

use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use crate::drivers::trait_def::DeviceDriver;
use crate::drivers::sculpt_comfort::SculptComfortDriver;
use crate::drivers::g502_x::G502XDriver;
use crate::drivers::mx_anywhere::MxAnywhereDriver;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DriverInfo {
    pub id: String,
    pub name: String,
    pub vendor_id: String,
    pub product_id: String,
}

pub struct DriverRegistry {
    drivers: HashMap<String, Box<dyn DeviceDriver>>,
}

impl DriverRegistry {
    pub fn new() -> Self {
        let mut drivers: HashMap<String, Box<dyn DeviceDriver>> = HashMap::new();
        
        let sc = SculptComfortDriver::new();
        drivers.insert(sc.driver_id().to_string(), Box::new(sc));

        let g502 = G502XDriver::new();
        drivers.insert(g502.driver_id().to_string(), Box::new(g502));

        let mx2s = MxAnywhereDriver::new_2s();
        drivers.insert(mx2s.driver_id().to_string(), Box::new(mx2s));

        let mx3 = MxAnywhereDriver::new_3();
        drivers.insert(mx3.driver_id().to_string(), Box::new(mx3));

        Self { drivers }
    }

    pub fn get_driver(&self, id: &str) -> Option<&Box<dyn DeviceDriver>> {
        self.drivers.get(id)
    }

    pub fn find_driver_for_device(&self, vendor: Option<&str>, product: Option<&str>, name: &str) -> Option<&Box<dyn DeviceDriver>> {
        for drv in self.drivers.values() {
            if drv.match_device(vendor, product, name) {
                return Some(drv);
            }
        }
        None
    }

    pub fn list_drivers() -> Vec<DriverInfo> {
        vec![
            DriverInfo {
                id: "logitech_g502_x".to_string(),
                name: "Logitech G502 X Lightspeed".to_string(),
                vendor_id: "046d".to_string(),
                product_id: "c547".to_string(),
            },
            DriverInfo {
                id: "logitech_mx_anywhere_2s".to_string(),
                name: "Logitech MX Anywhere 2S".to_string(),
                vendor_id: "046d".to_string(),
                product_id: "406a".to_string(),
            },
            DriverInfo {
                id: "logitech_mx_anywhere_3".to_string(),
                name: "Logitech MX Anywhere 3".to_string(),
                vendor_id: "046d".to_string(),
                product_id: "4090".to_string(),
            },
            DriverInfo {
                id: "microsoft_sculpt_comfort".to_string(),
                name: "Microsoft Sculpt Comfort Mouse".to_string(),
                vendor_id: "045e".to_string(),
                product_id: "07a2".to_string(),
            },
        ]
    }

    pub fn instantiate_driver(id: &str) -> Box<dyn DeviceDriver> {
        match id {
            "logitech_g502_x" => Box::new(G502XDriver::new()),
            "logitech_mx_anywhere_2s" => Box::new(MxAnywhereDriver::new_2s()),
            "logitech_mx_anywhere_3" => Box::new(MxAnywhereDriver::new_3()),
            _ => Box::new(SculptComfortDriver::new()),
        }
    }
}
