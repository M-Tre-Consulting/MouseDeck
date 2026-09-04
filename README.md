# SculptFlow 🖱️⚡
> **Modern Linux Dashboard & Gesture Remapper for Microsoft Sculpt Comfort Mouse (and beyond)**  
> Costruito con **Rust**, **Tauri 2.0**, **React**, **TailwindCSS**, ed **evdev/uinput**. Supporto nativo per **Wayland** (Hyprland, Sway, GNOME) e **X11**.

---

## 🌟 Cos'è SculptFlow?

Il mouse **Microsoft Sculpt Comfort** è una periferica eccezionale con connettività Bluetooth 3.0 universale e un sensore BlueTrack preciso su qualunque superficie. Tuttavia, su Linux la sua caratteristica più distintiva — la **touch strip laterale blu (pulsante Windows)** — invia sequenze di tasti hardware fisse che spesso aprono menu indesiderati o non fanno nulla.

**SculptFlow** risolve questo problema alla radice con un'architettura ad altissime prestazioni:
- **Backend Rust a Latenza Zero:** Intercetta il sotto-dispositivo di input hardware della touch strip tramite `evdev` (`EVIOCGRAB`) e virtualizza combinazioni di tasti, clic del mouse, controlli multimediali o comandi shell su `/dev/uinput`.
- **Nessuna interferenza con la tastiera:** Il mouse espone tre nodi separati (`mouse`, `consumer`, `keyboard`). SculptFlow isola **soltanto** il nodo tastiera del mouse, lasciando la tastiera del tuo laptop o PC intatta al 100%.
- **Dashboard Bluetooth in Tempo Reale:** Informazioni in tempo reale via BlueZ D-Bus (stato connessione, indirizzo MAC, chipset, dettagli batteria e protocollo BT 3.0 Classic).
- **Test Interattivo dal Vivo:** Un diagramma vettoriale dinamico del mouse che si illumina e pulsa in tempo reale ogni volta che sfiori la striscia con il pollice o clicchi.
- **Architettura a Driver Modulare:** Progettato per essere esteso in futuro a qualsiasi altro mouse con pulsanti gesture (es. Logitech MX Master, Razer, o mouse HID personalizzati).

---

## 🚀 Requisiti di Sistema

- **OS:** Linux (qualsiasi distribuzione: Arch, Omarchy, Fedora, Ubuntu, Debian, ecc.)
- **Display Server:** Wayland (Hyprland, Sway, GNOME, KDE) oppure X11
- **Kernel Linux:** Modulo `uinput` attivo (di serie su tutti i kernel Linux moderni)
- **Strumenti di build:** Node.js (v18+) e Cargo / Rust (1.80+)

---

## 🛠️ Configurazione Permessi (Regole udev)

Su Linux, per consentire a un'applicazione nello spazio utente di catturare eventi di input e generare tasti virtuali senza richiedere `sudo` costante, è sufficiente installare una volta le regole `udev` con tag `uaccess`.

SculptFlow include uno script di setup automatico:

```bash
chmod +x setup-permissions.sh
sudo ./setup-permissions.sh
```

Lo script configura:
1. `/etc/udev/rules.d/70-sculpt-comfort.rules` con tag `uaccess` per il mouse (Vendor `045e`, Product `07a2`) e `/dev/uinput`.
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

Le configurazioni sono persistite in formato JSON in `~/.config/sculptflow/config.json`.

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
