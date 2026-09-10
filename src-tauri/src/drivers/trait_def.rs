use std::collections::HashMap;

#[derive(Debug, Clone, PartialEq)]
pub enum GestureResult {
    PassThrough,
    Consume,
    Trigger(String),
    TriggerRelease(String),
}

pub trait DeviceDriver: Send + Sync {
    fn driver_id(&self) -> &'static str;
    fn name(&self) -> &'static str;
    fn vendor_id(&self) -> &'static str;
    fn product_id(&self) -> &'static str;
    fn match_device(&self, vendor: Option<&str>, product: Option<&str>, name: &str) -> bool;
    fn identify_input_nodes(&self) -> HashMap<String, String>;
    fn process_keyboard_event(&mut self, code: u16, value: i32) -> GestureResult;
    fn process_mouse_event(&mut self, ev_type: u16, code: u16, value: i32) -> GestureResult;
    fn reset_state(&mut self);
}
