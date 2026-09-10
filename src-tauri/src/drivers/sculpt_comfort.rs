use std::collections::HashMap;
use std::fs;
use crate::drivers::trait_def::{DeviceDriver, GestureResult};

pub struct SculptComfortDriver {
    ctrl_down: bool,
    meta_down: bool,
    chord_detected: Option<String>,
}

impl SculptComfortDriver {
    pub fn new() -> Self {
        Self {
            ctrl_down: false,
            meta_down: false,
            chord_detected: None,
        }
    }
}

// Linux evdev key constants
const KEY_BACKSPACE: u16 = 14;
const KEY_TAB: u16 = 15;
const KEY_LEFTCTRL: u16 = 29;
const KEY_LEFTMETA: u16 = 125;
const BTN_MIDDLE: u16 = 274;
const EV_REL: u16 = 0x02;
const EV_KEY: u16 = 0x01;
const REL_HWHEEL: u16 = 0x06;

impl DeviceDriver for SculptComfortDriver {
    fn driver_id(&self) -> &'static str {
        "microsoft_sculpt_comfort"
    }

    fn name(&self) -> &'static str {
        "Microsoft Sculpt Comfort Mouse"
    }

    fn vendor_id(&self) -> &'static str {
        "045e"
    }

    fn product_id(&self) -> &'static str {
        "07a2"
    }

    fn match_device(&self, vendor: Option<&str>, product: Option<&str>, name: &str) -> bool {
        if let (Some(v), Some(p)) = (vendor, product) {
            if v.eq_ignore_ascii_case(self.vendor_id()) && p.eq_ignore_ascii_case(self.product_id()) {
                return true;
            }
        }
        name.to_lowercase().contains("sculpt comfort")
    }

    fn identify_input_nodes(&self) -> HashMap<String, String> {
        let mut nodes = HashMap::new();
        if let Ok(content) = fs::read_to_string("/proc/bus/input/devices") {
            for block in content.split("\n\n") {
                let mut is_sculpt = false;
                let mut name = String::new();
                let mut handlers = String::new();

                for line in block.lines() {
                    if line.starts_with("N: Name=") {
                        name = line.replace("N: Name=", "").trim_matches('"').to_string();
                        if name.contains("Sculpt Comfort") {
                            is_sculpt = true;
                        }
                    } else if line.starts_with("I: ") {
                        let lower = line.to_lowercase();
                        if lower.contains("045e") && lower.contains("07a2") {
                            is_sculpt = true;
                        }
                    } else if line.starts_with("H: Handlers=") {
                        handlers = line.replace("H: Handlers=", "").trim().to_string();
                    }
                }

                if is_sculpt && !handlers.is_empty() {
                    for part in handlers.split_whitespace() {
                        if part.starts_with("event") {
                            let path = format!("/dev/input/{}", part);
                            if name.contains("Keyboard") {
                                nodes.insert("keyboard".to_string(), path);
                            } else if name.contains("Consumer") {
                                nodes.insert("consumer".to_string(), path);
                            } else {
                                nodes.insert("mouse".to_string(), path);
                            }
                        }
                    }
                }
            }
        }
        nodes
    }

    fn process_keyboard_event(&mut self, code: u16, value: i32) -> GestureResult {
        if value == 1 { // Key Down
            match code {
                KEY_LEFTCTRL => {
                    self.ctrl_down = true;
                    GestureResult::Consume
                }
                KEY_LEFTMETA => {
                    self.meta_down = true;
                    self.chord_detected = None;
                    GestureResult::Consume
                }
                KEY_BACKSPACE => {
                    if self.ctrl_down || self.meta_down {
                        self.chord_detected = Some("swipe_up".to_string());
                        GestureResult::Trigger("swipe_up".to_string())
                    } else {
                        GestureResult::Consume
                    }
                }
                KEY_TAB => {
                    if self.ctrl_down || self.meta_down {
                        self.chord_detected = Some("swipe_down".to_string());
                        GestureResult::Trigger("swipe_down".to_string())
                    } else {
                        GestureResult::Consume
                    }
                }
                _ => GestureResult::Consume,
            }
        } else if value == 0 { // Key Up
            match code {
                KEY_BACKSPACE | KEY_TAB => GestureResult::Consume,
                KEY_LEFTCTRL => {
                    self.ctrl_down = false;
                    GestureResult::Consume
                }
                KEY_LEFTMETA => {
                    self.meta_down = false;
                    if self.chord_detected.is_none() {
                        GestureResult::Trigger("windows_click".to_string())
                    } else {
                        self.chord_detected = None;
                        GestureResult::Consume
                    }
                }
                _ => GestureResult::Consume,
            }
        } else {
            GestureResult::Consume
        }
    }

    fn process_mouse_event(&mut self, ev_type: u16, code: u16, value: i32) -> GestureResult {
        if ev_type == EV_REL && code == REL_HWHEEL {
            if value < 0 {
                return GestureResult::Trigger("tilt_left".to_string());
            } else if value > 0 {
                return GestureResult::Trigger("tilt_right".to_string());
            }
            return GestureResult::Consume;
        }

        if ev_type == EV_KEY && code == BTN_MIDDLE {
            if value == 1 {
                return GestureResult::Trigger("middle_click".to_string());
            } else if value == 0 {
                return GestureResult::TriggerRelease("middle_click".to_string());
            }
            return GestureResult::Consume;
        }

        // Pass through standard pointer movements and buttons
        GestureResult::PassThrough
    }

    fn reset_state(&mut self) {
        self.ctrl_down = false;
        self.meta_down = false;
        self.chord_detected = None;
    }
}
