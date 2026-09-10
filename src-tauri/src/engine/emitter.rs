use std::process::Command;
use std::thread;
use std::time::Duration;
use evdev::{
    uinput::VirtualDevice,
    AttributeSet, InputEvent, KeyCode, RelativeAxisCode,
};
use crate::config::ActionConfig;

const EV_KEY: u16 = 1;

pub struct UInputEmitter {
    virtual_dev: Option<VirtualDevice>,
    last_init_attempt: Option<std::time::Instant>,
}

impl UInputEmitter {
    pub fn new() -> Self {
        let dev = Self::init_virtual_device();
        Self {
            virtual_dev: dev,
            last_init_attempt: Some(std::time::Instant::now()),
        }
    }

    pub fn is_ready(&mut self) -> bool {
        if self.virtual_dev.is_some() {
            return true;
        }
        // Throttle initialization attempts to once every 2 seconds to avoid CPU spin
        let now = std::time::Instant::now();
        if let Some(last) = self.last_init_attempt {
            if now.duration_since(last) < Duration::from_secs(2) {
                return false;
            }
        }
        self.last_init_attempt = Some(now);
        self.virtual_dev = Self::init_virtual_device();
        self.virtual_dev.is_some()
    }

    fn syn_report() -> InputEvent {
        InputEvent::new(evdev::EventType::SYNCHRONIZATION.0, 0, 0)
    }

    fn init_virtual_device() -> Option<VirtualDevice> {
        let mut keys = AttributeSet::<KeyCode>::new();
        // Standard keys
        for code in 1..255 {
            keys.insert(KeyCode::new(code));
        }
        // Mouse buttons
        keys.insert(KeyCode::BTN_LEFT);
        keys.insert(KeyCode::BTN_RIGHT);
        keys.insert(KeyCode::BTN_MIDDLE);
        keys.insert(KeyCode::BTN_SIDE);
        keys.insert(KeyCode::BTN_EXTRA);
        keys.insert(KeyCode::BTN_FORWARD);
        keys.insert(KeyCode::BTN_BACK);
        keys.insert(KeyCode::BTN_TASK);
        keys.insert(KeyCode::BTN_0);
        keys.insert(KeyCode::BTN_1);
        keys.insert(KeyCode::BTN_2);
        keys.insert(KeyCode::BTN_3);
        keys.insert(KeyCode::BTN_4);
        keys.insert(KeyCode::BTN_5);
        keys.insert(KeyCode::BTN_6);
        keys.insert(KeyCode::BTN_7);

        // Media keys
        keys.insert(KeyCode::KEY_VOLUMEUP);
        keys.insert(KeyCode::KEY_VOLUMEDOWN);
        keys.insert(KeyCode::KEY_MUTE);
        keys.insert(KeyCode::KEY_PLAYPAUSE);
        keys.insert(KeyCode::KEY_NEXTSONG);
        keys.insert(KeyCode::KEY_PREVIOUSSONG);

        let mut rel_axes = AttributeSet::<RelativeAxisCode>::new();
        rel_axes.insert(RelativeAxisCode::REL_X);
        rel_axes.insert(RelativeAxisCode::REL_Y);
        rel_axes.insert(RelativeAxisCode::REL_WHEEL);
        rel_axes.insert(RelativeAxisCode::REL_HWHEEL);
        rel_axes.insert(RelativeAxisCode::REL_WHEEL_HI_RES);
        rel_axes.insert(RelativeAxisCode::REL_HWHEEL_HI_RES);

        match VirtualDevice::builder() {
            Ok(builder) => match builder
                .name("MouseDeck Virtual Input Device")
                .with_keys(&keys)
                .and_then(|b| b.with_relative_axes(&rel_axes))
            {
                Ok(b) => match b.build() {
                    Ok(vd) => {
                        println!("[UInputEmitter] Dispositivo virtuale /dev/uinput inizializzato con successo.");
                        Some(vd)
                    }
                    Err(e) => {
                        eprintln!("[UInputEmitter] Errore build VirtualDevice: {}", e);
                        None
                    }
                },
                Err(e) => {
                    eprintln!("[UInputEmitter] Errore configurazione assi/tasti VirtualDevice: {}", e);
                    None
                }
            },
            Err(e) => {
                eprintln!("[UInputEmitter] Impossibile aprire /dev/uinput (permessi mancanti?): {}", e);
                None
            }
        }
    }

    pub fn emit_raw_event(&mut self, ev: &InputEvent) -> bool {
        if !self.is_ready() {
            return false;
        }
        if let Some(dev) = self.virtual_dev.as_mut() {
            match dev.emit(&[*ev]) {
                Ok(_) => true,
                Err(e) => {
                    eprintln!("[UInputEmitter] Errore emit_raw_event: {}", e);
                    false
                }
            }
        } else {
            false
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

        if !self.is_ready() {
            eprintln!("[UInputEmitter] Dispositivo virtuale non pronto o /dev/uinput non accessibile.");
            return;
        }

        let dev = match self.virtual_dev.as_mut() {
            Some(d) => d,
            None => return,
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

        // Press down + flush frame with SYN_REPORT
        let mut down_events = Vec::new();
        for k in &keys_to_press {
            down_events.push(InputEvent::new(EV_KEY, k.code(), 1));
        }
        down_events.push(Self::syn_report());
        let _ = dev.emit(&down_events);

        thread::sleep(Duration::from_millis(15));

        // Release in reverse + flush frame with SYN_REPORT
        let mut up_events = Vec::new();
        for k in keys_to_press.iter().rev() {
            up_events.push(InputEvent::new(EV_KEY, k.code(), 0));
        }
        up_events.push(Self::syn_report());
        let _ = dev.emit(&up_events);
    }

    fn emit_mouse_button(dev: &mut VirtualDevice, btn_str: &str) {
        let key = match btn_str.to_lowercase().as_str() {
            "btn_middle" | "middle" => KeyCode::BTN_MIDDLE,
            "btn_left" | "left" => KeyCode::BTN_LEFT,
            "btn_right" | "right" => KeyCode::BTN_RIGHT,
            "btn_side" | "side" | "back" => KeyCode::BTN_SIDE,
            "btn_extra" | "extra" | "forward" => KeyCode::BTN_EXTRA,
            "btn_forward" => KeyCode::BTN_FORWARD,
            "btn_back" => KeyCode::BTN_BACK,
            "btn_task" => KeyCode::BTN_TASK,
            "btn_0" => KeyCode::BTN_0,
            _ => KeyCode::BTN_MIDDLE,
        };

        let down = [InputEvent::new(EV_KEY, key.code(), 1), Self::syn_report()];
        let _ = dev.emit(&down);
        thread::sleep(Duration::from_millis(15));
        let up = [InputEvent::new(EV_KEY, key.code(), 0), Self::syn_report()];
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

        let down = [InputEvent::new(EV_KEY, key.code(), 1), Self::syn_report()];
        let _ = dev.emit(&down);
        thread::sleep(Duration::from_millis(15));
        let up = [InputEvent::new(EV_KEY, key.code(), 0), Self::syn_report()];
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
        "minus" | "-" => Some(KeyCode::KEY_MINUS),
        "equal" | "plus" | "=" | "+" => Some(KeyCode::KEY_EQUAL),
        "f1" => Some(KeyCode::KEY_F1),
        "f2" => Some(KeyCode::KEY_F2),
        "f3" => Some(KeyCode::KEY_F3),
        "f4" => Some(KeyCode::KEY_F4),
        "f5" => Some(KeyCode::KEY_F5),
        "f6" => Some(KeyCode::KEY_F6),
        "f7" => Some(KeyCode::KEY_F7),
        "f8" => Some(KeyCode::KEY_F8),
        "f9" => Some(KeyCode::KEY_F9),
        "f10" => Some(KeyCode::KEY_F10),
        "f11" => Some(KeyCode::KEY_F11),
        "f12" => Some(KeyCode::KEY_F12),
        "delete" | "del" => Some(KeyCode::KEY_DELETE),
        "insert" | "ins" => Some(KeyCode::KEY_INSERT),
        "home" => Some(KeyCode::KEY_HOME),
        "end" => Some(KeyCode::KEY_END),
        "print" | "printscreen" | "prtscr" => Some(KeyCode::KEY_SYSRQ),
        _ => None,
    }
}
