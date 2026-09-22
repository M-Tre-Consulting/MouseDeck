use std::collections::HashMap;
use std::fs;
use crate::drivers::trait_def::{DeviceDriver, GestureResult};

/// Unified driver for the Logitech MX Anywhere family of compact wireless mice.
///
/// Supports:
///   • MX Anywhere 2S  (Vendor 046d, Wireless PID 406a, Unifying Receiver c52b)
///   • MX Anywhere 3   (Vendor 046d, Wireless PID 4090, Bolt Receiver c548)
///   • MX Anywhere 3S  (Vendor 046d, Wireless PID 4096)
///
/// Button layout (identical across all variants):
///   Left / Right click (passthrough), Scroll wheel click, two thumb side
///   buttons (Back / Forward), and horizontal tilt wheel (left / right).
pub struct MxAnywhereDriver {
    model: MxAnywhereModel,
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum MxAnywhereModel {
    Anywhere2S,
    Anywhere3,
}

impl MxAnywhereDriver {
    pub fn new_2s() -> Self {
        Self { model: MxAnywhereModel::Anywhere2S }
    }

    pub fn new_3() -> Self {
        Self { model: MxAnywhereModel::Anywhere3 }
    }
}

// Linux evdev button & key constants
const BTN_LEFT: u16 = 272;       // 0x110
const BTN_RIGHT: u16 = 273;      // 0x111
const BTN_MIDDLE: u16 = 274;     // 0x112 - Scroll wheel click
const BTN_SIDE: u16 = 275;       // 0x113 - Thumb Back
const BTN_EXTRA: u16 = 276;      // 0x114 - Thumb Forward

// Event types & relative axes
const EV_KEY: u16 = 0x01;
const EV_REL: u16 = 0x02;
const REL_HWHEEL: u16 = 0x06;
const REL_HWHEEL_HI_RES: u16 = 0x0c;

/// All known product IDs for MX Anywhere 2S
const MX_ANYWHERE_2S_PIDS: &[&str] = &["406a", "4069"];

/// All known product IDs for MX Anywhere 3 / 3S
const MX_ANYWHERE_3_PIDS: &[&str] = &["4090", "4096", "b025"];

impl DeviceDriver for MxAnywhereDriver {
    fn driver_id(&self) -> &'static str {
        match self.model {
            MxAnywhereModel::Anywhere2S => "logitech_mx_anywhere_2s",
            MxAnywhereModel::Anywhere3  => "logitech_mx_anywhere_3",
        }
    }

    fn name(&self) -> &'static str {
        match self.model {
            MxAnywhereModel::Anywhere2S => "Logitech MX Anywhere 2S",
            MxAnywhereModel::Anywhere3  => "Logitech MX Anywhere 3",
        }
    }

    fn vendor_id(&self) -> &'static str {
        "046d"
    }

    fn product_id(&self) -> &'static str {
        match self.model {
            MxAnywhereModel::Anywhere2S => "406a",
            MxAnywhereModel::Anywhere3  => "4090",
        }
    }

    fn match_device(&self, vendor: Option<&str>, product: Option<&str>, name: &str) -> bool {
        let name_lower = name.to_lowercase();

        match self.model {
            MxAnywhereModel::Anywhere2S => {
                if name_lower.contains("mx anywhere 2s") || name_lower.contains("anywhere 2s") {
                    return true;
                }
                if let (Some(v), Some(p)) = (vendor, product) {
                    if v.eq_ignore_ascii_case(self.vendor_id()) {
                        let p_lower = p.to_lowercase();
                        return MX_ANYWHERE_2S_PIDS.iter().any(|pid| p_lower == *pid);
                    }
                }
                false
            }
            MxAnywhereModel::Anywhere3 => {
                if name_lower.contains("mx anywhere 3") || name_lower.contains("anywhere 3s") {
                    return true;
                }
                if let (Some(v), Some(p)) = (vendor, product) {
                    if v.eq_ignore_ascii_case(self.vendor_id()) {
                        let p_lower = p.to_lowercase();
                        return MX_ANYWHERE_3_PIDS.iter().any(|pid| p_lower == *pid);
                    }
                }
                false
            }
        }
    }

    fn identify_input_nodes(&self) -> HashMap<String, String> {
        let mut nodes = HashMap::new();
        let match_keywords: Vec<&str> = match self.model {
            MxAnywhereModel::Anywhere2S => vec!["anywhere 2s"],
            MxAnywhereModel::Anywhere3  => vec!["anywhere 3"],
        };
        let match_pids: &[&str] = match self.model {
            MxAnywhereModel::Anywhere2S => MX_ANYWHERE_2S_PIDS,
            MxAnywhereModel::Anywhere3  => MX_ANYWHERE_3_PIDS,
        };

        if let Ok(content) = fs::read_to_string("/proc/bus/input/devices") {
            for block in content.split("\n\n") {
                let mut is_target = false;
                let mut handlers = String::new();

                for line in block.lines() {
                    if line.starts_with("N: Name=") {
                        let name = line.replace("N: Name=", "").trim_matches('"').to_string();
                        let name_lower = name.to_lowercase();
                        if match_keywords.iter().any(|kw| name_lower.contains(kw)) {
                            is_target = true;
                        }
                    } else if line.starts_with("I: ") {
                        let lower = line.to_lowercase();
                        if lower.contains("046d") && match_pids.iter().any(|pid| lower.contains(pid)) {
                            is_target = true;
                        }
                    } else if line.starts_with("H: Handlers=") {
                        handlers = line.replace("H: Handlers=", "").trim().to_string();
                    }
                }

                if is_target && !handlers.is_empty() {
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
                BTN_SIDE  => GestureResult::Trigger("back".to_string()),
                BTN_EXTRA => GestureResult::Trigger("forward".to_string()),
                BTN_MIDDLE => GestureResult::Trigger("middle_click".to_string()),
                // Standard left & right clicks must pass through
                BTN_LEFT | BTN_RIGHT => GestureResult::PassThrough,
                _ => GestureResult::PassThrough,
            }
        } else if value == 0 {
            match code {
                BTN_SIDE  => GestureResult::TriggerRelease("back".to_string()),
                BTN_EXTRA => GestureResult::TriggerRelease("forward".to_string()),
                BTN_MIDDLE => GestureResult::TriggerRelease("middle_click".to_string()),
                BTN_LEFT | BTN_RIGHT => GestureResult::PassThrough,
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
        // No persistent chord state required for MX Anywhere discrete buttons
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // =========================================================================
    // MX Anywhere 2S
    // =========================================================================

    #[test]
    fn test_2s_device_matching() {
        let driver = MxAnywhereDriver::new_2s();
        assert!(driver.match_device(Some("046d"), Some("406a"), "Logitech USB Receiver"));
        assert!(driver.match_device(None, None, "Logitech MX Anywhere 2S"));
        assert!(driver.match_device(None, None, "MX Anywhere 2S"));
        assert!(!driver.match_device(None, None, "MX Anywhere 3"));
        assert!(!driver.match_device(Some("046d"), Some("4090"), "Logitech Mouse"));
        assert!(!driver.match_device(Some("045e"), Some("07a2"), "Microsoft Sculpt Comfort Mouse"));
    }

    #[test]
    fn test_2s_button_triggers() {
        let mut driver = MxAnywhereDriver::new_2s();

        // Side buttons
        assert_eq!(driver.process_keyboard_event(BTN_SIDE, 1), GestureResult::Trigger("back".into()));
        assert_eq!(driver.process_keyboard_event(BTN_EXTRA, 1), GestureResult::Trigger("forward".into()));
        assert_eq!(driver.process_keyboard_event(BTN_MIDDLE, 1), GestureResult::Trigger("middle_click".into()));

        // Left and Right clicks must pass through!
        assert_eq!(driver.process_keyboard_event(BTN_LEFT, 1), GestureResult::PassThrough);
        assert_eq!(driver.process_keyboard_event(BTN_RIGHT, 1), GestureResult::PassThrough);

        // Key up emits TriggerRelease
        assert_eq!(driver.process_keyboard_event(BTN_SIDE, 0), GestureResult::TriggerRelease("back".into()));
        assert_eq!(driver.process_keyboard_event(BTN_EXTRA, 0), GestureResult::TriggerRelease("forward".into()));
    }

    #[test]
    fn test_2s_tilt_and_pointer_events() {
        let mut driver = MxAnywhereDriver::new_2s();

        // Tilt left / right
        assert_eq!(driver.process_mouse_event(EV_REL, REL_HWHEEL, -1), GestureResult::Trigger("tilt_left".into()));
        assert_eq!(driver.process_mouse_event(EV_REL, REL_HWHEEL, 1), GestureResult::Trigger("tilt_right".into()));

        // Normal cursor movements pass through untouched
        assert_eq!(driver.process_mouse_event(EV_REL, 0 /* REL_X */, 15), GestureResult::PassThrough);
        assert_eq!(driver.process_mouse_event(EV_REL, 1 /* REL_Y */, -10), GestureResult::PassThrough);
        assert_eq!(driver.process_mouse_event(EV_REL, 8 /* REL_WHEEL */, 1), GestureResult::PassThrough);
    }

    // =========================================================================
    // MX Anywhere 3
    // =========================================================================

    #[test]
    fn test_3_device_matching() {
        let driver = MxAnywhereDriver::new_3();
        assert!(driver.match_device(Some("046d"), Some("4090"), "Logitech USB Receiver"));
        assert!(driver.match_device(Some("046d"), Some("4096"), "Logitech MX Anywhere 3S"));
        assert!(driver.match_device(None, None, "Logitech MX Anywhere 3"));
        assert!(driver.match_device(None, None, "MX Anywhere 3S"));
        assert!(!driver.match_device(None, None, "MX Anywhere 2S"));
        assert!(!driver.match_device(Some("046d"), Some("406a"), "Logitech Mouse"));
    }

    #[test]
    fn test_3_button_triggers() {
        let mut driver = MxAnywhereDriver::new_3();

        assert_eq!(driver.process_keyboard_event(BTN_SIDE, 1), GestureResult::Trigger("back".into()));
        assert_eq!(driver.process_keyboard_event(BTN_EXTRA, 1), GestureResult::Trigger("forward".into()));
        assert_eq!(driver.process_keyboard_event(BTN_MIDDLE, 1), GestureResult::Trigger("middle_click".into()));

        assert_eq!(driver.process_keyboard_event(BTN_LEFT, 1), GestureResult::PassThrough);
        assert_eq!(driver.process_keyboard_event(BTN_RIGHT, 1), GestureResult::PassThrough);

        assert_eq!(driver.process_keyboard_event(BTN_SIDE, 0), GestureResult::TriggerRelease("back".into()));
    }

    #[test]
    fn test_3_tilt_events() {
        let mut driver = MxAnywhereDriver::new_3();

        assert_eq!(driver.process_mouse_event(EV_REL, REL_HWHEEL, -1), GestureResult::Trigger("tilt_left".into()));
        assert_eq!(driver.process_mouse_event(EV_REL, REL_HWHEEL, 1), GestureResult::Trigger("tilt_right".into()));
        assert_eq!(driver.process_mouse_event(EV_REL, REL_HWHEEL_HI_RES, -120), GestureResult::Trigger("tilt_left".into()));
        assert_eq!(driver.process_mouse_event(EV_REL, REL_HWHEEL_HI_RES, 120), GestureResult::Trigger("tilt_right".into()));
    }

    #[test]
    fn test_driver_identity() {
        let driver_2s = MxAnywhereDriver::new_2s();
        assert_eq!(driver_2s.driver_id(), "logitech_mx_anywhere_2s");
        assert_eq!(driver_2s.name(), "Logitech MX Anywhere 2S");
        assert_eq!(driver_2s.vendor_id(), "046d");
        assert_eq!(driver_2s.product_id(), "406a");

        let driver_3 = MxAnywhereDriver::new_3();
        assert_eq!(driver_3.driver_id(), "logitech_mx_anywhere_3");
        assert_eq!(driver_3.name(), "Logitech MX Anywhere 3");
        assert_eq!(driver_3.vendor_id(), "046d");
        assert_eq!(driver_3.product_id(), "4090");
    }

    #[test]
    fn test_node_identification() {
        let driver = MxAnywhereDriver::new_2s();
        let nodes = driver.identify_input_nodes();
        // On systems without the actual device this returns an empty HashMap
        if let Some(path) = nodes.get("device") {
            assert!(path.starts_with("/dev/input/event"));
        }
    }
}
