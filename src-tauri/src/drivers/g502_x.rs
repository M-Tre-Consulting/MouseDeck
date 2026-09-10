use std::collections::HashMap;
use std::fs;
use crate::drivers::trait_def::{DeviceDriver, GestureResult};

pub struct G502XDriver {
    // Reserved for future gesture chord states if needed
}

impl G502XDriver {
    pub fn new() -> Self {
        Self {}
    }
}

// Linux evdev button & key constants
const BTN_LEFT: u16 = 272;       // 0x110
const BTN_RIGHT: u16 = 273;      // 0x111
const BTN_MIDDLE: u16 = 274;     // 0x112 - Scroll wheel click
const BTN_SIDE: u16 = 275;       // 0x113 - G4 (Thumb Back)
const BTN_EXTRA: u16 = 276;      // 0x114 - G5 (Thumb Forward)
const BTN_FORWARD: u16 = 277;    // 0x115 - G8 (DPI Up default HID)
const BTN_BACK: u16 = 278;       // 0x116 - G7 (DPI Down default HID)
const BTN_TASK: u16 = 279;       // 0x117 - G9 (Profile switch default HID)
const BTN_0: u16 = 280;          // 0x118 - G6 (Sniper / DPI Shift)
const BTN_1: u16 = 281;          // 0x119 - G7 alternative
const BTN_2: u16 = 282;          // 0x11a - G8 alternative
const BTN_3: u16 = 283;          // 0x11b - G9 alternative
const BTN_6: u16 = 286;          // 0x11e - G6 alternative
const KEY_PROG1: u16 = 148;      // G6 alternative
const KEY_PROG2: u16 = 149;      // G9 alternative
const KEY_VOLUMEDOWN: u16 = 114; // G7 alternative
const KEY_VOLUMEUP: u16 = 115;   // G8 alternative

// Event types & relative axes
const EV_KEY: u16 = 0x01;
const EV_REL: u16 = 0x02;
const REL_HWHEEL: u16 = 0x06;
const REL_HWHEEL_HI_RES: u16 = 0x0c;

impl DeviceDriver for G502XDriver {
    fn driver_id(&self) -> &'static str {
        "logitech_g502_x"
    }

    fn name(&self) -> &'static str {
        "Logitech G502 X Lightspeed"
    }

    fn vendor_id(&self) -> &'static str {
        "046d"
    }

    fn product_id(&self) -> &'static str {
        "c547" // Receiver PID (also matches 4099, c099, c08b)
    }

    fn match_device(&self, vendor: Option<&str>, product: Option<&str>, name: &str) -> bool {
        let name_lower = name.to_lowercase();
        if name_lower.contains("g502") {
            return true;
        }

        if let (Some(v), Some(p)) = (vendor, product) {
            if v.eq_ignore_ascii_case(self.vendor_id()) {
                let p_lower = p.to_lowercase();
                if p_lower == "c547" || p_lower == "4099" || p_lower == "c099" || p_lower == "c08b" {
                    return true;
                }
            }
        }

        false
    }

    fn identify_input_nodes(&self) -> HashMap<String, String> {
        let mut nodes = HashMap::new();
        if let Ok(content) = fs::read_to_string("/proc/bus/input/devices") {
            for block in content.split("\n\n") {
                let mut is_g502 = false;
                let mut handlers = String::new();

                for line in block.lines() {
                    if line.starts_with("N: Name=") {
                        let name = line.replace("N: Name=", "").trim_matches('"').to_string();
                        if name.to_lowercase().contains("g502") {
                            is_g502 = true;
                        }
                    } else if line.starts_with("I: ") {
                        let lower = line.to_lowercase();
                        if lower.contains("046d") && (
                            lower.contains("4099") ||
                            lower.contains("c547") ||
                            lower.contains("c099") ||
                            lower.contains("c08b")
                        ) {
                            is_g502 = true;
                        }
                    } else if line.starts_with("H: Handlers=") {
                        handlers = line.replace("H: Handlers=", "").trim().to_string();
                    }
                }

                if is_g502 && !handlers.is_empty() {
                    for part in handlers.split_whitespace() {
                        if part.starts_with("event") {
                            let path = format!("/dev/input/{}", part);
                            nodes.insert("device".to_string(), path.clone());
                            nodes.insert("mouse".to_string(), path.clone());
                            nodes.insert("keyboard".to_string(), path);
                            return nodes;
                        }
                    }
                }
            }
        }
        nodes
    }

    fn process_keyboard_event(&mut self, code: u16, value: i32) -> GestureResult {
        // value: 1 = Press, 0 = Release, 2 = Repeat
        if value == 1 {
            match code {
                BTN_SIDE => GestureResult::Trigger("g4_back".to_string()),
                BTN_EXTRA => GestureResult::Trigger("g5_forward".to_string()),
                BTN_0 | BTN_6 | KEY_PROG1 => GestureResult::Trigger("g6_sniper".to_string()),
                BTN_BACK | BTN_1 | KEY_VOLUMEDOWN => GestureResult::Trigger("g7_dpi_down".to_string()),
                BTN_FORWARD | BTN_2 | KEY_VOLUMEUP => GestureResult::Trigger("g8_dpi_up".to_string()),
                BTN_TASK | BTN_3 | KEY_PROG2 => GestureResult::Trigger("g9_profile".to_string()),
                BTN_MIDDLE => GestureResult::Trigger("middle_click".to_string()),
                // Standard left & right clicks must pass through
                BTN_LEFT | BTN_RIGHT => GestureResult::PassThrough,
                _ => GestureResult::PassThrough,
            }
        } else if value == 0 {
            // Key release: consume handled remappable buttons to avoid OS side effects
            match code {
                BTN_SIDE | BTN_EXTRA | BTN_0 | BTN_6 | KEY_PROG1 |
                BTN_BACK | BTN_1 | KEY_VOLUMEDOWN |
                BTN_FORWARD | BTN_2 | KEY_VOLUMEUP |
                BTN_TASK | BTN_3 | KEY_PROG2 |
                BTN_MIDDLE => GestureResult::Consume,
                _ => GestureResult::PassThrough,
            }
        } else {
            // Repeat events
            match code {
                BTN_LEFT | BTN_RIGHT => GestureResult::PassThrough,
                _ => GestureResult::Consume,
            }
        }
    }

    fn process_mouse_event(&mut self, ev_type: u16, code: u16, value: i32) -> GestureResult {
        if ev_type == EV_REL {
            if code == REL_HWHEEL || code == REL_HWHEEL_HI_RES {
                if value < 0 {
                    return GestureResult::Trigger("tilt_left".to_string());
                } else if value > 0 {
                    return GestureResult::Trigger("tilt_right".to_string());
                }
                return GestureResult::Consume;
            }
            // Pass through standard pointer movements REL_X, REL_Y and vertical wheel REL_WHEEL
            return GestureResult::PassThrough;
        }

        if ev_type == EV_KEY {
            return self.process_keyboard_event(code, value);
        }

        GestureResult::PassThrough
    }

    fn reset_state(&mut self) {
        // No persistent chord state required for G502 discrete buttons
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_device_matching() {
        let driver = G502XDriver::new();
        assert!(driver.match_device(Some("046d"), Some("c547"), "Logitech USB Receiver"));
        assert!(driver.match_device(Some("046d"), Some("4099"), "Logitech G502 X PLUS"));
        assert!(driver.match_device(None, None, "Logitech G502 X LIGHTSPEED"));
        assert!(driver.match_device(None, None, "G502 HERO Gaming Mouse"));
        assert!(!driver.match_device(Some("045e"), Some("07a2"), "Microsoft Sculpt Comfort Mouse"));
    }

    #[test]
    fn test_button_triggers() {
        let mut driver = G502XDriver::new();

        // G-keys
        assert_eq!(driver.process_keyboard_event(BTN_SIDE, 1), GestureResult::Trigger("g4_back".into()));
        assert_eq!(driver.process_keyboard_event(BTN_EXTRA, 1), GestureResult::Trigger("g5_forward".into()));
        assert_eq!(driver.process_keyboard_event(BTN_0, 1), GestureResult::Trigger("g6_sniper".into()));
        assert_eq!(driver.process_keyboard_event(BTN_BACK, 1), GestureResult::Trigger("g7_dpi_down".into()));
        assert_eq!(driver.process_keyboard_event(BTN_FORWARD, 1), GestureResult::Trigger("g8_dpi_up".into()));
        assert_eq!(driver.process_keyboard_event(BTN_TASK, 1), GestureResult::Trigger("g9_profile".into()));
        assert_eq!(driver.process_keyboard_event(BTN_MIDDLE, 1), GestureResult::Trigger("middle_click".into()));

        // Left and Right clicks must pass through!
        assert_eq!(driver.process_keyboard_event(BTN_LEFT, 1), GestureResult::PassThrough);
        assert_eq!(driver.process_keyboard_event(BTN_RIGHT, 1), GestureResult::PassThrough);

        // Key up must consume handled triggers
        assert_eq!(driver.process_keyboard_event(BTN_SIDE, 0), GestureResult::Consume);
        assert_eq!(driver.process_keyboard_event(BTN_0, 0), GestureResult::Consume);
    }

    #[test]
    fn test_tilt_and_pointer_events() {
        let mut driver = G502XDriver::new();

        // Tilt left / right
        assert_eq!(driver.process_mouse_event(EV_REL, REL_HWHEEL, -1), GestureResult::Trigger("tilt_left".into()));
        assert_eq!(driver.process_mouse_event(EV_REL, REL_HWHEEL, 1), GestureResult::Trigger("tilt_right".into()));

        // Normal cursor movements pass through untouched
        assert_eq!(driver.process_mouse_event(EV_REL, 0 /* REL_X */, 15), GestureResult::PassThrough);
        assert_eq!(driver.process_mouse_event(EV_REL, 1 /* REL_Y */, -10), GestureResult::PassThrough);
        assert_eq!(driver.process_mouse_event(EV_REL, 8 /* REL_WHEEL */, 1), GestureResult::PassThrough);
    }

    #[test]
    fn test_node_identification() {
        let driver = G502XDriver::new();
        let nodes = driver.identify_input_nodes();
        // The connected test machine has a Logitech G502 X PLUS plugged in on event5
        if let Some(path) = nodes.get("device") {
            assert!(path.starts_with("/dev/input/event"));
        }
    }
}

