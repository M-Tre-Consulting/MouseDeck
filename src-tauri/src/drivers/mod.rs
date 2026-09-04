pub mod trait_def;
pub mod sculpt_comfort;

use std::collections::HashMap;
use crate::drivers::trait_def::DeviceDriver;
use crate::drivers::sculpt_comfort::SculptComfortDriver;

pub struct DriverRegistry {
    drivers: HashMap<String, Box<dyn DeviceDriver>>,
}

impl DriverRegistry {
    pub fn new() -> Self {
        let mut drivers: HashMap<String, Box<dyn DeviceDriver>> = HashMap::new();
        let sc = SculptComfortDriver::new();
        drivers.insert(sc.driver_id().to_string(), Box::new(sc));
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
}
