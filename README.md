# MouseDeck 🖱️⚡
> **Universal Linux Mouse Dashboard & Gesture Remapper (Specialized Module for Microsoft Sculpt Comfort Mouse)**  
> Costruito con **Rust**, **Tauri 2.0**, **React**, **TailwindCSS**, ed **evdev/uinput**. Supporto nativo per **Wayland** (Hyprland, Sway, GNOME, KDE) e **X11**.

---

## 🌟 Cos'è MouseDeck?

**MouseDeck** è una suite desktop moderna per Linux progettata per gestire, monitorare e rimappare le periferiche di puntamento avanzate. Nasce originariamente per sbloccare l'intero potenziale del leggendario mouse **Microsoft Sculpt Comfort** (Bluetooth 3.0), la cui **touch strip laterale capacitiva (pulsante Windows)** invia di default sequenze di tasti fisse non configurabili su Linux. 

Grazie a un'**architettura modulare a driver (`DeviceDriver`)**, MouseDeck è progettato sia per gestire in modo dedicato lo Sculpt Comfort, sia per accogliere facilmente moduli per qualsiasi altro mouse dotato di pulsanti o gesture non convenzionali.

### Caratteristiche Principali:
- **Backend Rust a Latenza Zero:** Intercetta gli eventi hardware a basso livello tramite `evdev` (`EVIOCGRAB`) e virtualizza combinazioni di tasti, clic del mouse, controlli multimediali o comandi shell su `/dev/uinput`.
- **Nessuna interferenza con la tastiera di sistema:** Il mouse espone tre nodi separati (`mouse`, `consumer`, `keyboard`). MouseDeck isola **soltanto** il nodo tastiera del mouse, lasciando la tastiera del tuo laptop o PC intatta al 100%.
- **Dashboard & Telemetria Batteria:** Lettura in tempo reale di BlueZ D-Bus, UPower e sysfs per monitorare connessione Bluetooth, host adapter, stato della batteria (con barra di percentuale per periferiche che supportano la telemetria o stato alcaline AA per BT 3.0).
- **Design Desktop Minimalista:** Stile raffinato ispirato ai tool nativi macOS e Raycast/Linear (modalità dark graphite, indicatori visivi di stato, diagramma vettoriale animato reattivo).
- **Test Interattivo dal Vivo:** Un diagramma vettoriale dinamico che si illumina e pulsa in tempo reale ogni volta che sfiori la striscia con il pollice o clicchi.
- **Architettura a Driver Modulare:** Il trait Rust `DeviceDriver` consente di aggiungere supporto a qualsiasi mouse implementando un modulo plug-in.

---

## 🚀 Requisiti di Sistema

- **OS:** Linux (qualsiasi distribuzione: Arch, Omarchy, Fedora, Ubuntu, Debian, ecc.)
- **Display Server:** Wayland (Hyprland, Sway, GNOME, KDE) oppure X11
- **Kernel Linux:** Modulo `uinput` attivo (di serie su tutti i kernel Linux moderni)
- **Strumenti di build:** Node.js (v18+) e Cargo / Rust (1.80+)

---

## 🛠️ Configurazione Permessi (Regole udev)

Su Linux, per consentire a un'applicazione nello spazio utente di catturare eventi di input e generare tasti virtuali senza richiedere `sudo` costante, è sufficiente installare una volta le regole `udev` con tag `uaccess`.

MouseDeck include uno script di setup automatico:

```bash
chmod +x setup-permissions.sh
sudo ./setup-permissions.sh
```

Lo script configura:
1. `/etc/udev/rules.d/70-mousedeck.rules` con tag `uaccess` per il mouse (Vendor `045e`, Product `07a2`) e `/dev/uinput`.
2. Caricamento del modulo kernel `uinput`.
3. Ricarica immediata tramite `udevadm trigger`.

*(Puoi anche applicare i permessi con 1 clic direttamente dall'interfaccia nella scheda **Sistema**).*

---

## 🏃 Avvio dell'Applicazione

Puoi avviare l'applicazione direttamente tramite lo script `run.sh`:

```bash
./run.sh
```

Oppure in modalità sviluppo live:

```bash
npm run tauri dev
```

---

## 💡 Come funziona l'Hardware del Mouse

Il Microsoft Sculpt Comfort Mouse espone a livello kernel tre endpoint di input:
1. `/dev/input/eventX` (Puntatore e pulsanti 1-5 + rotellina tilt orizzontale)
2. `/dev/input/eventY` (Consumer Control / Media)
3. `/dev/input/eventZ` (Tastiera virtuale hardware)

Quando interagisci con la touch strip blu:
- **Swipe Up (Scorrimento in alto):** Il firmware emette una corda rapidissima: `Ctrl` + `Super` + `Backspace`.
- **Swipe Down (Scorrimento in basso):** Il firmware emette: `Ctrl` + `Super` + `Tab`.
- **Click Windows (Pressione):** Il firmware emette `Super` (`KEY_LEFTMETA`).

La macchina a stati in **Rust** (`src-tauri/src/drivers/sculpt_comfort.rs`) cattura questi eventi in una finestra sub-millisecondo, sopprime i tasti raw originali e lancia la tua azione preferita (es. cambio workspace, controllo volume, copia/incolla o scorciatoia browser).

---

## 🧩 Profili e Preset Inclusi

- 🪟 **Navigazione Desktop (Workspaces):**
  - **Swipe Up:** `Super+Page_Up` (Workspace precedente)
  - **Swipe Down:** `Super+Page_Down` (Workspace successivo)
  - **Click Windows:** `Super` (Panoramica / App Launcher)
- ⚡ **Produttività:**
  - **Swipe Up:** `Ctrl+c` (Copia)
  - **Swipe Down:** `Ctrl+v` (Incolla)
  - **Click Windows:** `Super+Space` (Ricerca rapida)
- 🎵 **Multimediale:**
  - **Swipe Up:** `VolumeUp`
  - **Swipe Down:** `VolumeDown`
  - **Click Windows:** `PlayPause`
- 🌐 **Browser Web:**
  - **Swipe Up:** `Ctrl+Tab` (Scheda a destra)
  - **Swipe Down:** `Ctrl+Shift+Tab` (Scheda a sinistra)
  - **Click Windows:** `Ctrl+t` (Nuova scheda)

Le configurazioni sono persistite in formato JSON in `~/.config/mousedeck/config.json`.

---

## 📐 Struttura del Progetto

```
sculpt-comfort-remapper/
├── setup-permissions.sh        # Script udev e permessi kernel
├── run.sh                      # Launcher dell'applicazione
├── package.json                # Dipendenze Node/React/Vite
├── vite.config.ts              # Configurazione Vite con plugin Tailwind v4
├── src/                        # Frontend (React + TypeScript + Tailwind)
│   ├── App.tsx                 # Container principale con listener eventi Tauri
│   ├── types.ts                # Modelli TypeScript
│   └── components/
│       ├── Header.tsx          # Barra superiore con badge BT e master toggle
│       ├── MouseDiagram.tsx    # Diagramma vettoriale animato del mouse
│       ├── ActionModal.tsx     # Editor per combinazioni di tasti e comandi
│       └── views/
│           ├── DashboardView.tsx # Panoramica hardware e telemetria BT
│           ├── RemapView.tsx     # Configurazione gesti touch strip
│           ├── LiveTestView.tsx  # Workbench per testare i gesti in tempo reale
│           └── SettingsView.tsx  # Permessi di sistema e architettura driver
└── src-tauri/                  # Backend Nativo Rust
    ├── Cargo.toml              # Dipendenze Rust (tauri, evdev, zbus, chrono)
    └── src/
        ├── lib.rs              # Comandi Tauri e lifecycle app
        ├── config.rs           # Gestione profili e persistenza JSON
        ├── permissions.rs      # Verifica permessi uinput / evdev
        ├── bluetooth/          # Monitoraggio BlueZ D-Bus e stato MAC
        ├── drivers/            # Architettura modulare dei driver
        │   ├── trait_def.rs    # Trait DeviceDriver per estensibilità
        │   └── sculpt_comfort.rs # Driver per Sculpt Comfort (045e:07a2)
        └── engine/             # Loop evdev a bassa latenza e virtual emitter
```

---

## 📄 Licenza

Rilasciato sotto licenza MIT. Libero per l'uso e la modifica su qualsiasi sistema Linux.
