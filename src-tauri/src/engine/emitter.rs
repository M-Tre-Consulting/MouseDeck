use std::process::Command;
use std::thread;
use std::time::Duration;
use evdev::{
    uinput::VirtualDevice,
    AttributeSet, InputEvent, KeyCode,
};
use crate::config::ActionConfig;

const EV_KEY: u16 = 1;

pub struct UInputEmitter {
    virtual_dev: Option<VirtualDevice>,
}

impl UInputEmitter {
    pub fn new() -> Self {
        let dev = Self::init_virtual_device();
        Self { virtual_dev: dev }
    }

    fn init_virtual_device() -> Option<VirtualDevice> {
        let mut keys = AttributeSet::<KeyCode>::new();
        // Insert all standard keys
        for code in 1..255 {
            keys.insert(KeyCode::new(code));
        }
        // Insert mouse buttons
        keys.insert(KeyCode::BTN_LEFT);
        keys.insert(KeyCode::BTN_RIGHT);
        keys.insert(KeyCode::BTN_MIDDLE);
        keys.insert(KeyCode::BTN_SIDE);
        keys.insert(KeyCode::BTN_EXTRA);
        keys.insert(KeyCode::BTN_FORWARD);
        keys.insert(KeyCode::BTN_BACK);

        // Insert media keys
        keys.insert(KeyCode::KEY_VOLUMEUP);
        keys.insert(KeyCode::KEY_VOLUMEDOWN);
        keys.insert(KeyCode::KEY_MUTE);
        keys.insert(KeyCode::KEY_PLAYPAUSE);
        keys.insert(KeyCode::KEY_NEXTSONG);
        keys.insert(KeyCode::KEY_PREVIOUSSONG);

        match VirtualDevice::builder() {
            Ok(builder) => match builder.name("SculptFlow Virtual Input Device").with_keys(&keys) {
                Ok(b) => match b.build() {
                    Ok(vd) => {
                        println!("[UInputEmitter] Virtual device initialized successfully.");
                        Some(vd)
                    }
                    Err(e) => {
                        eprintln!("[UInputEmitter] VirtualDevice build error: {}", e);
                        None
                    }
                },
                Err(e) => {
                    eprintln!("[UInputEmitter] with_keys error: {}", e);
                    None
                }
            },
            Err(e) => {
                eprintln!("[UInputEmitter] VirtualDevice::builder error: {}", e);
                None
            }
        }
    }

    pub fn execute_action(&mut self, action: &ActionConfig) {
        if action.action_type == "disabled" {
            return;
        }

        if action.action_type == "command" {
            let cmd = action.value.clone();
            if !cmd.is_empty() {
                thread::spawn(move || {
                    let _ = Command::new("sh").arg("-c").arg(&cmd).spawn();
                });
            }
            return;
        }

        if self.virtual_dev.is_none() {
            self.virtual_dev = Self::init_virtual_device();
        }

        let dev = match self.virtual_dev.as_mut() {
            Some(d) => d,
            None => {
                eprintln!("[UInputEmitter] Virtual device not available.");
                return;
            }
        };

        match action.action_type.as_str() {
            "key_combo" => Self::emit_key_combo(dev, &action.value),
            "mouse_button" => Self::emit_mouse_button(dev, &action.value),
            "media" => Self::emit_media_key(dev, &action.value),
            _ => {}
        }
    }

    fn emit_key_combo(dev: &mut VirtualDevice, combo: &str) {
        let parts: Vec<&str> = combo.split('+').map(|s| s.trim()).collect();
        let mut keys_to_press = Vec::new();

        for p in parts {
            if let Some(key) = parse_key(p) {
                keys_to_press.push(key);
            }
        }

        if keys_to_press.is_empty() {
            return;
        }

        // Press down
        let mut down_events = Vec::new();
        for k in &keys_to_press {
            down_events.push(InputEvent::new(EV_KEY, k.code(), 1));
        }
        let _ = dev.emit(&down_events);

        thread::sleep(Duration::from_millis(15));

        // Release in reverse
        let mut up_events = Vec::new();
        for k in keys_to_press.iter().rev() {
            up_events.push(InputEvent::new(EV_KEY, k.code(), 0));
        }
        let _ = dev.emit(&up_events);
    }

    fn emit_mouse_button(dev: &mut VirtualDevice, btn_str: &str) {
        let key = match btn_str.to_lowercase().as_str() {
            "btn_middle" | "middle" => KeyCode::BTN_MIDDLE,
            "btn_left" | "left" => KeyCode::BTN_LEFT,
            "btn_right" | "right" => KeyCode::BTN_RIGHT,
            "btn_side" | "side" | "back" => KeyCode::BTN_SIDE,
            "btn_extra" | "extra" | "forward" => KeyCode::BTN_EXTRA,
            _ => KeyCode::BTN_MIDDLE,
        };

        let down = [InputEvent::new(EV_KEY, key.code(), 1)];
        let _ = dev.emit(&down);
        thread::sleep(Duration::from_millis(15));
        let up = [InputEvent::new(EV_KEY, key.code(), 0)];
        let _ = dev.emit(&up);
    }

    fn emit_media_key(dev: &mut VirtualDevice, media_str: &str) {
        let key = match media_str.to_lowercase().as_str() {
            "volumeup" => KeyCode::KEY_VOLUMEUP,
            "volumedown" => KeyCode::KEY_VOLUMEDOWN,
            "mute" => KeyCode::KEY_MUTE,
            "playpause" => KeyCode::KEY_PLAYPAUSE,
            "nexttrack" => KeyCode::KEY_NEXTSONG,
            "previoustrack" => KeyCode::KEY_PREVIOUSSONG,
            _ => return,
        };

        let down = [InputEvent::new(EV_KEY, key.code(), 1)];
        let _ = dev.emit(&down);
        thread::sleep(Duration::from_millis(15));
        let up = [InputEvent::new(EV_KEY, key.code(), 0)];
        let _ = dev.emit(&up);
    }
}

fn parse_key(name: &str) -> Option<KeyCode> {
    match name.to_lowercase().as_str() {
        "ctrl" | "control" => Some(KeyCode::KEY_LEFTCTRL),
        "shift" => Some(KeyCode::KEY_LEFTSHIFT),
        "alt" => Some(KeyCode::KEY_LEFTALT),
        "super" | "win" | "meta" => Some(KeyCode::KEY_LEFTMETA),
        "page_up" | "pageup" => Some(KeyCode::KEY_PAGEUP),
        "page_down" | "pagedown" => Some(KeyCode::KEY_PAGEDOWN),
        "tab" => Some(KeyCode::KEY_TAB),
        "backspace" => Some(KeyCode::KEY_BACKSPACE),
        "space" => Some(KeyCode::KEY_SPACE),
        "enter" | "return" => Some(KeyCode::KEY_ENTER),
        "esc" | "escape" => Some(KeyCode::KEY_ESC),
        "left" => Some(KeyCode::KEY_LEFT),
        "right" => Some(KeyCode::KEY_RIGHT),
        "up" => Some(KeyCode::KEY_UP),
        "down" => Some(KeyCode::KEY_DOWN),
        "a" => Some(KeyCode::KEY_A),
        "b" => Some(KeyCode::KEY_B),
        "c" => Some(KeyCode::KEY_C),
        "d" => Some(KeyCode::KEY_D),
        "e" => Some(KeyCode::KEY_E),
        "f" => Some(KeyCode::KEY_F),
        "g" => Some(KeyCode::KEY_G),
        "h" => Some(KeyCode::KEY_H),
        "i" => Some(KeyCode::KEY_I),
        "j" => Some(KeyCode::KEY_J),
        "k" => Some(KeyCode::KEY_K),
        "l" => Some(KeyCode::KEY_L),
        "m" => Some(KeyCode::KEY_M),
        "n" => Some(KeyCode::KEY_N),
        "o" => Some(KeyCode::KEY_O),
        "p" => Some(KeyCode::KEY_P),
        "q" => Some(KeyCode::KEY_Q),
        "r" => Some(KeyCode::KEY_R),
        "s" => Some(KeyCode::KEY_S),
        "t" => Some(KeyCode::KEY_T),
        "u" => Some(KeyCode::KEY_U),
        "v" => Some(KeyCode::KEY_V),
        "w" => Some(KeyCode::KEY_W),
        "x" => Some(KeyCode::KEY_X),
        "y" => Some(KeyCode::KEY_Y),
        "z" => Some(KeyCode::KEY_Z),
        "1" => Some(KeyCode::KEY_1),
        "2" => Some(KeyCode::KEY_2),
        "3" => Some(KeyCode::KEY_3),
        "4" => Some(KeyCode::KEY_4),
        "5" => Some(KeyCode::KEY_5),
        "6" => Some(KeyCode::KEY_6),
        "7" => Some(KeyCode::KEY_7),
        "8" => Some(KeyCode::KEY_8),
        "9" => Some(KeyCode::KEY_9),
        "0" => Some(KeyCode::KEY_0),
        _ => None,
    }
}
