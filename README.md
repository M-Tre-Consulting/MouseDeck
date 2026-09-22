# MouseDeck 🖱️⚡
> **Universal Linux Mouse Dashboard & Gesture Remapper (Specialized Drivers for Logitech G502 X, MX Anywhere 2S / 3 & Microsoft Sculpt Comfort Mouse)**  
> Built with **Rust**, **Tauri 2.0**, **React**, **TailwindCSS**, and **Linux evdev/uinput**. Native support for **Wayland** (Hyprland, Sway, GNOME, KDE) and **X11**.

---

## 🌟 Overview

**MouseDeck** is a modern Linux desktop utility designed to monitor, configure, and remap advanced pointing devices.
- **Logitech G502 X Lightspeed / PLUS:** Native low-latency Linux driver for LIGHTSPEED 2.4GHz wireless and USB wired connections. Program the G6 Sniper (DPI Shift) paddle, G4/G5 thumb keys, G7/G8 index wing buttons, G9 profile button, and dual-mode 4-way tilt scroll wheel with live telemetry and battery gauge.
- **Logitech MX Anywhere 2S & MX Anywhere 3 / 3S:** Native driver for compact mobile mice across Bluetooth Low Energy, Unifying Receiver, and Logi Bolt. Program thumb buttons (Forward / Back), MagSpeed / freewheel scroll wheel, and 4-way horizontal tilt with battery telemetry and profile presets.
- **Microsoft Sculpt Comfort Mouse:** Low-latency driver for the signature capacitive blue touch strip (Windows button), intercepting and canceling hardcoded OS chords.

Powered by a modular **`DeviceDriver` architecture**, MouseDeck provides dedicated, low-latency drivers while laying the groundwork to support any mouse with custom gesture strips, tilt wheels, or extra thumb keys.

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
- **Fail-Safe Cursor Protection:** Exclusive grabbing (`EVIOCGRAB`) is activated only if `/dev/uinput` is writable and verified. If permissions are missing, MouseDeck defaults to passive monitor mode without grabbing, ensuring that your physical mouse pointer never freezes.

---

## 📋 Device & Feature Support Matrix

| Device / Model | Connection Method | Remappable Controls | Telemetry / Battery | Support Status |
| :--- | :--- | :--- | :--- | :--- |
| **Logitech G502 X Lightspeed / PLUS** | LIGHTSPEED 2.4 GHz & USB-C Wired | • G6 Sniper (DPI Shift paddle)<br>• G4 / G5 (Thumb side buttons)<br>• G7 / G8 (Index wing DPI adjustment)<br>• G9 (Profile / top button)<br>• Center wheel click & 4-way tilt (L/R) | ✅ Live percentage (UPower / sysfs hidpp) | **100% Supported** (Native driver) |
| **Logitech G502 HERO / Lightspeed** | LIGHTSPEED 2.4 GHz & USB Wired | • G6 Sniper (DPI Shift)<br>• G4 / G5 Thumb buttons<br>• G7 / G8 Index DPI buttons<br>• G9 Profile button<br>• Center wheel click & 4-way tilt | ✅ Battery / Status via UPower | **100% Supported** (Compatible) |
| **Logitech MX Anywhere 2S** | Bluetooth LE & Unifying Receiver (2.4 GHz) | • Thumb side buttons (Forward / Back)<br>• Center wheel click<br>• 4-way horizontal tilt wheel (L/R) | ✅ Live percentage (UPower / sysfs / D-Bus) | **100% Supported** (Native driver) |
| **Logitech MX Anywhere 3 / 3S** | Bluetooth LE & Logi Bolt / Unifying Receiver | • Thumb side buttons (Forward / Back)<br>• MagSpeed center wheel click<br>• 4-way horizontal tilt wheel (L/R) | ✅ Live percentage (UPower / sysfs / D-Bus) | **100% Supported** (Native driver) |
| **Microsoft Sculpt Comfort Mouse** | Bluetooth 3.0 / Classic BT | • Blue capacitive touch strip (Swipe Up / Down)<br>• Windows button click (Capacitive tap)<br>• Center wheel click & horizontal tilt | ✅ Voltage / Status via BlueZ D-Bus | **100% Supported** (Native driver) |
| **Generic Multi-Button Mice** | USB / 2.4 GHz / Bluetooth | • Center wheel click<br>• Standard side buttons (`BTN_SIDE`, `BTN_EXTRA`) | ℹ️ Generic UPower (if supported by kernel) | 🧪 Basic Support |

### 🖥️ Display Server & Desktop Environment Compatibility

| Desktop Environment / Compositor | Display Server | Status | Feature Details |
| :--- | :--- | :--- | :--- |
| **Hyprland** | Wayland | ✅ Tested & Supported | Zero-latency evdev hardware grab + uinput virtual emulation |
| **Sway** | Wayland | ✅ Tested & Supported | Full compatibility with shortcuts, workspaces, and shell commands |
| **GNOME (40+)** | Wayland & X11 | ✅ Tested & Supported | System tray execution (requires AppIndicator extension on GNOME) |
| **KDE Plasma (5/6)** | Wayland & X11 | ✅ Tested & Supported | Full integration with system tray and profile management |
| **Other WMs (i3, bspwm, XFCE)** | X11 / Wayland | ✅ Supported | Requires kernel module `uinput` and `uaccess` permissions |

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

## 📦 Multi-Distro Packaging & CI/CD

MouseDeck provides native packaging for major Linux distributions as well as a universal AppImage.

### Automated CI/CD Releases (GitHub Actions)
Every time a version tag is pushed (e.g. `git tag v1.0.0 && git push origin v1.0.0`), the automated GitHub Actions pipeline compiles and publishes release assets:
- **Arch Linux / Omarchy / Manjaro / EndeavourOS:** `.pkg.tar.zst` (built in native Arch container with `makepkg`)
- **Ubuntu / Debian / Pop!_OS / Linux Mint:** `.deb`
- **Fedora / openSUSE / RHEL:** `.rpm`
- **Universal Linux:** `.AppImage` (runs standalone on any modern Linux distro)
- **Integrity verification:** `SHA256SUMS.txt` checksum manifest

---

### Local Packaging

#### Arch Linux (`.pkg.tar.zst`)
```bash
# Build package with one command
npm run package:arch

# Install on Arch / Manjaro / EndeavourOS / Omarchy
sudo pacman -U dist/mousedeck-*.pkg.tar.zst
```

#### Debian / Ubuntu (`.deb`) & Fedora / openSUSE (`.rpm`)
```bash
# Build deb, rpm, and AppImage bundles via Tauri CLI
npm run tauri build
```
Built packages are located in `src-tauri/target/release/bundle/`:
- `bundle/deb/mousedeck_*.deb`
- `bundle/rpm/mousedeck-*.rpm`
- `bundle/appimage/mousedeck_*.AppImage`

### What is included in all packages:
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
        │   ├── g502_x.rs       # Specialized driver for Logitech G502 X (046d:c547/4099)
        │   └── mx_anywhere.rs  # Specialized driver for Logitech MX Anywhere 2S / 3 (046d:406a/4090)
        └── engine/             # High-speed evdev loop & uinput virtual emitter
```

---

## 📄 License

Released under the **MIT License**. Free to use, modify, and distribute on any Linux system.

