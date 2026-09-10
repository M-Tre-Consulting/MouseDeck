# MouseDeck 🖱️⚡
> **Universal Linux Mouse Dashboard & Gesture Remapper (Specialized Drivers for Logitech G502 X Lightspeed & Microsoft Sculpt Comfort Mouse)**  
> Built with **Rust**, **Tauri 2.0**, **React**, **TailwindCSS**, and **Linux evdev/uinput**. Native support for **Wayland** (Hyprland, Sway, GNOME, KDE) and **X11**.

---

## 🌟 Overview

**MouseDeck** is a modern Linux desktop utility designed to monitor, configure, and remap advanced pointing devices.
- **Logitech G502 X Lightspeed / PLUS:** Native low-latency Linux driver for LIGHTSPEED 2.4GHz wireless and USB wired connections. Program the G6 Sniper (DPI Shift) paddle, G4/G5 thumb keys, G7/G8 index wing buttons, G9 profile button, and dual-mode 4-way tilt scroll wheel with live telemetry and battery gauge.
- **Microsoft Sculpt Comfort Mouse:** Low-latency driver for the signature capacitive blue touch strip (Windows button), intercepting and canceling hardcoded OS chords.

Powered by a modular **`DeviceDriver` architecture**, MouseDeck provides a dedicated, low-latency driver for the Sculpt Comfort while laying the groundwork to support any mouse with custom gesture strips, tilt wheels, or extra thumb keys.

### Key Features:
- **Zero-Latency Rust Engine:** Grabs hardware input events directly via `evdev` (`EVIOCGRAB`), cancels original OS chords, and emulates custom shortcuts, mouse clicks, media controls, or shell commands through `/dev/uinput`.
- **Zero Interference with Laptop/Desktop Keyboards:** The mouse exposes three distinct input nodes (`pointer`, `consumer control`, and `virtual keyboard`). MouseDeck captures **only** the mouse keyboard node, leaving your physical typing keyboard 100% untouched.
- **Background Execution & System Tray:** Closing the main window cleanly minimizes MouseDeck to the system tray (`libappindicator`). Your gesture remappings continue running uninterrupted in the background.
- **Autostart at Boot:** One-click toggle in Settings to register MouseDeck with the XDG Autostart specification (`~/.config/autostart/mousedeck.desktop`). Launches silently minimized to the tray at user login.
- **Native Polkit Privilege Escalation:** Hardware permission setup is completely integrated into the app. When requesting udev permissions, the native desktop Polkit authentication dialog prompts for the administrator password—no terminal, no bash scripting required.
- **Automatic Snapshot Backup & 1-Click Rollback:** Prior to writing udev rules, MouseDeck saves an atomic snapshot of any pre-existing system state. If you ever uninstall or want to revert, a single click restores your pristine system configuration.
- **Multi-Source Battery Telemetry:** Queries BlueZ D-Bus, UPower, and sysfs to display battery status, connection signal, MAC address, and host adapter info. Handles modern BLE rechargeable mice (0–100% gauge) as well as classic BT 3.0 AA alkaline mice.
- **Minimalist Desktop Aesthetic:** Dark graphite interface inspired by native macOS Settings, Raycast, and Linear, complete with dynamic keycap visualizers and grouped settings tables.
- **Live Event Workbench:** An interactive SVG vector diagram of the mouse that lights up in real-time as you swipe or press the touch strip.

---

## 🚀 System Requirements

- **Operating System:** Linux (Arch Linux, Omarchy, Fedora, Ubuntu, Debian, openSUSE, etc.)
- **Display Server:** Wayland (Hyprland, Sway, GNOME, KDE Plasma) or X11
- **Kernel:** Linux with `uinput` module enabled (standard on all modern Linux distros)
- **Build Tools:** Node.js (v18+) and Rust toolchain (Cargo 1.80+)

---

## 🛠️ System Permissions & Security (udev + Polkit)

On Linux, user-space applications require `uaccess` udev tags on device nodes to intercept input events and generate virtual keys without running the GUI as `root`.

MouseDeck automates this entire flow:
1. **Within the App (Recommended):**
   - If permissions are missing, a prominent banner appears on launch.
   - Click **"Configure with Backup"** (or open the **System** tab).
   - Your desktop environment prompts for your admin password via native Polkit (`pkexec`).
   - MouseDeck creates a backup snapshot in `~/.config/mousedeck/backup/manifest.json`, writes `/etc/udev/rules.d/70-mousedeck.rules`, loads `uinput`, and reloads `udevadm`.
   - To clean up and uninstall, click **"Restore & Uninstall"** in the Settings tab to revert all system modifications.
2. **Headless / CLI Mode:**
   ```bash
   # Install udev rules and create a backup snapshot
   pkexec mousedeck --setup-permissions <username>

   # Revert changes and restore original system state
   pkexec mousedeck --restore-permissions <username>
   ```

---

## 🏃 Running and Building

### Development Mode:
```bash
npm run tauri dev
```

### Production Build:
```bash
npm run build
cd src-tauri && cargo build --release
```
The optimized binary will be placed in `src-tauri/target/release/mousedeck` (or `tauri-app`).

---

## 📦 Arch Linux Packaging (`.pkg.tar.zst`)

MouseDeck provides first-class native packaging for Arch Linux, Manjaro, EndeavourOS, CachyOS, and Omarchy.

### 1. Build and Package with one command:
```bash
npm run package:arch
```
*(or run `./scripts/build-arch-package.sh` directly)*

This compiles the release binary and automatically generates a standard Arch package in `dist/mousedeck-1.0.0-1-x86_64.pkg.tar.zst` (~2.6 MB).

### 2. Install on your system:
```bash
sudo pacman -U dist/mousedeck-1.0.0-1-x86_64.pkg.tar.zst
```
Or build and install immediately in a single pass:
```bash
./scripts/build-arch-package.sh --install
```

### What is included in the package:
- 🚀 `/usr/bin/mousedeck` (standalone, stripped, LTO-optimized binary)
- 🖥️ `/usr/share/applications/mousedeck.desktop` (XDG desktop entry)
- 🎨 `/usr/share/icons/hicolor/` (full icon set: 16px, 24px, 32px, 48px, 64px, 128px, 256px, 512px)
- 🔐 `/usr/share/polkit-1/actions/io.github.mousedeck.policy` (native Polkit action)
- ⚙️ `/usr/lib/udev/rules.d/70-mousedeck.rules` (system udev rules for `uaccess` and `input` group)
- 🔌 `/usr/lib/modules-load.d/mousedeck-uinput.conf` (automatic `uinput` module load at boot)

---

## 💡 How the Sculpt Comfort Hardware Works

The Microsoft Sculpt Comfort Mouse exposes three kernel input nodes:
1. `/dev/input/eventX` (Pointer, buttons 1–5, horizontal tilt wheel)
2. `/dev/input/eventY` (Consumer Control / Multimedia)
3. `/dev/input/eventZ` (Hardware Virtual Keyboard)

When interacting with the blue side strip, the mouse hardware transmits:
- **Swipe Up:** `LeftCtrl` + `LeftMeta` + `Backspace`
- **Swipe Down:** `LeftCtrl` + `LeftMeta` + `Tab`
- **Windows Click:** `LeftMeta` (`KEY_LEFTMETA`) alone

MouseDeck's sub-millisecond Rust state machine (`src-tauri/src/drivers/sculpt_comfort.rs`) intercepts these chord sequences, suppresses the raw OS keypresses, and instantly fires your configured action.

---

## 🧩 Preconfigured Profiles & Presets

MouseDeck includes out-of-the-box profiles that can be loaded with one click:

- 🪟 **Desktop Navigation (Workspaces):**
  - **Swipe Up:** `Super+Page_Up` (Previous Workspace)
  - **Swipe Down:** `Super+Page_Down` (Next Workspace)
  - **Windows Click:** `Super` (Application Overview / Launcher)
- ⚡ **Productivity:**
  - **Swipe Up:** `Ctrl+c` (Copy)
  - **Swipe Down:** `Ctrl+v` (Paste)
  - **Windows Click:** `Super+Space` (Quick Search / Spotlight)
- 🎵 **Multimedia:**
  - **Swipe Up:** `VolumeUp`
  - **Swipe Down:** `VolumeDown`
  - **Windows Click:** `PlayPause`
- 🌐 **Web Browsing:**
  - **Swipe Up:** `Ctrl+Tab` (Next Tab)
  - **Swipe Down:** `Ctrl+Shift+Tab` (Previous Tab)
  - **Windows Click:** `Ctrl+t` (New Tab)

All mappings are stored in JSON format in `~/.config/mousedeck/config.json`.

---

## 📐 Project Architecture

```
mousedeck/
├── package.json                # Frontend dependencies (React 19, Tailwind v4, Vite)
├── vite.config.ts              # Vite bundle configuration
├── src/                        # Frontend Application
│   ├── App.tsx                 # Main layout & Tauri event listeners
│   ├── types.ts                # TypeScript interface definitions
│   └── components/
│       ├── Sidebar.tsx         # Desktop sidebar navigation & battery badge
│       ├── MouseDiagram.tsx    # Reactive vector mouse visualizer
│       ├── ActionModal.tsx     # Custom shortcut / command configuration modal
│       └── views/
│           ├── DashboardView.tsx # Hardware overview, battery telemetry & specs
│           ├── RemapView.tsx     # Gesture remapping & preset loader
│           ├── LiveTestView.tsx  # Real-time event monitor workbench
│           └── SettingsView.tsx  # Polkit permissions, Autostart & driver info
└── src-tauri/                  # Native Rust Backend
    ├── Cargo.toml              # Rust dependencies (tauri 2.0, evdev, zbus, chrono)
    └── src/
        ├── main.rs             # Application entrypoint & CLI helper dispatcher
        ├── lib.rs              # Tauri command handlers & System Tray lifecycle
        ├── config.rs           # Profile manager & JSON persistence
        ├── autostart.rs        # XDG Autostart desktop entry manager
        ├── permissions.rs      # Native Polkit escalation & udev snapshot engine
        ├── bluetooth/          # BlueZ D-Bus, UPower & battery monitor
        ├── drivers/            # Modular driver registry (DeviceDriver trait)
        │   ├── trait_def.rs    # Pluggable driver interface
        │   ├── sculpt_comfort.rs # Specialized driver for Microsoft Sculpt (045e:07a2)
        │   └── g502_x.rs       # Specialized driver for Logitech G502 X (046d:c547/4099)
        └── engine/             # High-speed evdev loop & uinput virtual emitter
```

---

## 📄 License

Released under the **MIT License**. Free to use, modify, and distribute on any Linux system.

