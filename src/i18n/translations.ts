export type Language = "it" | "en";

export interface Translations {
  common: {
    enabled: string;
    disabled: string;
    active: string;
    inactive: string;
    connected: string;
    disconnected: string;
    save: string;
    cancel: string;
    delete: string;
    reset: string;
    confirm: string;
    copy: string;
    copied: string;
    loading: string;
    details: string;
    refresh: string;
    simulated: string;
    passthrough: string;
    success: string;
    error: string;
  };
  sidebar: {
    dashboard: string;
    remap: string;
    test: string;
    settings: string;
    engineActive: string;
    enginePaused: string;
    battery: string;
    device: string;
    noDevice: string;
    deviceConnected: string;
    deviceDisconnected: string;
    language: string;
  };
  banner: {
    permsMissingTitle: string;
    permsMissingDesc: string;
    configureBtn: string;
    detailsBtn: string;
  };
  dashboard: {
    g502Active: string;
    sculptActive: string;
    engineSubtitle: string;
    reconnect: string;
    reconnectSent: string;
    reconnectReloaded: string;
    goToRemap: string;
    specsTitle: string;
    macAddress: string;
    adapter: string;
    protocol: string;
    batteryLevel: string;
    activeProfile: string;
    activeTriggers: string;
    deviceNotConnected: string;
    deviceConnectedDesc: string;
  };
  remap: {
    title: string;
    subtitle: string;
    profile: string;
    presets: string;
    applyPreset: string;
    presetApplied: string;
    selectDriver: string;
    g502ThumbGroup: string;
    g502IndexGroup: string;
    wheelGroup: string;
    sculptGroup: string;
    clickToRemap: string;
    hoverPreview: string;
    assignedAction: string;
    unmapped: string;
    presetsList: {
      gaming: string;
      desktop_navigation: string;
      productivity: string;
      multimedia: string;
      browser: string;
    };
  };
  test: {
    title: string;
    subtitleG502: string;
    subtitleSculpt: string;
    diagramTitle: string;
    diagramHelp: string;
    historyTitle: string;
    clearHistory: string;
    noEventsYet: string;
    timestamp: string;
    trigger: string;
    action: string;
    type: string;
    simulate: string;
  };
  settings: {
    title: string;
    subtitle: string;
    languageTitle: string;
    languageDesc: string;
    permsTitle: string;
    permsConfigured: string;
    permsMissing: string;
    permsDescOk: string;
    permsDescMissing: string;
    configureWithBackup: string;
    restorePristine: string;
    restoreConfirmTitle: string;
    restoreConfirmMsg: string;
    autostartTitle: string;
    autostartDesc: string;
    backupManifestTitle: string;
    backupCreated: string;
    rulesInstalled: string;
    rulesMissing: string;
    backupFiles: string;
    manualCliTitle: string;
    manualCliDesc: string;
  };
  modal: {
    title: string;
    subtitle: string;
    tabKeyboard: string;
    tabMouse: string;
    tabMedia: string;
    tabCommand: string;
    tabPassthrough: string;
    tabDisabled: string;
    clickToRecord: string;
    recording: string;
    recordingPrompt: string;
    manualInputPrompt: string;
    switchManual: string;
    switchRecorder: string;
    quickPresets: string;
    mouseButtonGrid: string;
    mediaControls: string;
    shellCommand: string;
    shellHelp: string;
    saveAction: string;
    resetAction: string;
    actionName: string;
    actionDesc: string;
    presets: {
      copy: string;
      paste: string;
      undo: string;
      cut: string;
      nextWorkspace: string;
      prevWorkspace: string;
      closeWindow: string;
      newTab: string;
      refreshPage: string;
    };
  };
  triggers: Record<string, { name: string; desc: string }>;
}

export const translations: Record<Language, Translations> = {
  it: {
    common: {
      enabled: "Abilitato",
      disabled: "Disabilitato",
      active: "Attivo",
      inactive: "Inattivo",
      connected: "Connesso",
      disconnected: "Disconnesso",
      save: "Salva",
      cancel: "Annulla",
      delete: "Elimina",
      reset: "Ripristina",
      confirm: "Conferma",
      copy: "Copia",
      copied: "Copiato!",
      loading: "Caricamento...",
      details: "Dettagli",
      refresh: "Ricarica",
      simulated: "Simulato",
      passthrough: "Passthrough (Azione Originale)",
      success: "Operazione completata con successo",
      error: "Si è verificato un errore",
    },
    sidebar: {
      dashboard: "Panoramica",
      remap: "Pulsanti & Gesti",
      test: "Test in Tempo Reale",
      settings: "Sistema & Permessi",
      engineActive: "Motore Attivo",
      enginePaused: "In Pausa",
      battery: "Batteria",
      device: "Dispositivo",
      noDevice: "Nessun mouse rilevato",
      deviceConnected: "Dispositivo Connesso",
      deviceDisconnected: "Dispositivo Disconnesso",
      language: "Lingua",
    },
    banner: {
      permsMissingTitle: "Permessi Hardware non Configurati",
      permsMissingDesc:
        "MouseDeck può configurare le regole udev creando automaticamente un backup di ripristino istantaneo.",
      configureBtn: "Configura con Backup",
      detailsBtn: "Dettagli",
    },
    dashboard: {
      g502Active: "Driver G502 X Attivo",
      sculptActive: "Driver Sculpt Attivo",
      engineSubtitle: "MouseDeck Hardware Engine",
      reconnect: "Ricarica",
      reconnectSent: "Comando di riconnessione inviato.",
      reconnectReloaded: "Sottosistema input ricaricato.",
      goToRemap: "Configura Tasti",
      specsTitle: "Specifiche Hardware & Connessione",
      macAddress: "Indirizzo MAC / Percorso",
      adapter: "Adattatore Host",
      protocol: "Protocollo di Trasmissione",
      batteryLevel: "Livello Batteria",
      activeProfile: "Profilo Attivo",
      activeTriggers: "Controlli Rimappabili",
      deviceNotConnected: "Nessun dispositivo compatibile attivo",
      deviceConnectedDesc: "Dispositivo operativo e pronto per la rimappatura a bassa latenza.",
    },
    remap: {
      title: "Rimappatura Pulsanti & Gesti",
      subtitle: "Personalizza le azioni per ciascun tasto o gesto del mouse.",
      profile: "Profilo",
      presets: "Preset Rapidi",
      applyPreset: "Applica Preset",
      presetApplied: "Preset Applicato!",
      selectDriver: "Driver Selezionato",
      g502ThumbGroup: "Tasti Pollice (G4 / G5 / G6)",
      g502IndexGroup: "Tasti Indice & Profilo (G7 / G8 / G9)",
      wheelGroup: "Rotellina & Inclinazione (4 Direzioni)",
      sculptGroup: "Gesti Striscia Touch Blu",
      clickToRemap: "Clicca per rimappare",
      hoverPreview: "Passa con il cursore su un tasto per evidenziarlo sul diagramma",
      assignedAction: "Azione Assegnata",
      unmapped: "Non assegnato (Pass-through originale)",
      presetsList: {
        gaming: "Gaming (Macro DPI & Abilità)",
        desktop_navigation: "Navigazione Desktop & Workspace",
        productivity: "Produttività & Appunti",
        multimedia: "Controlli Multimediali",
        browser: "Navigazione Web & Schede",
      },
    },
    test: {
      title: "Test in Tempo Reale",
      subtitleG502:
        "Premi i tasti programmabili del tuo Logitech G502 X per vederli catturati istantaneamente dal motore Rust.",
      subtitleSculpt:
        "Esegui gesti sulla touch strip per vederli catturati istantaneamente dal motore Rust.",
      diagramTitle: "Diagramma Interattivo Hardware",
      diagramHelp: "I tasti e i gesti si illuminano in tempo reale quando vengono attivati dal mouse fisico.",
      historyTitle: "Cronologia Eventi Ricevuti",
      clearHistory: "Cancella Cronologia",
      noEventsYet:
        "Nessun evento registrato finora. Prova a premere o scorrere un tasto sul mouse.",
      timestamp: "Ora",
      trigger: "Tasto / Gesto",
      action: "Azione Eseguita",
      type: "Tipo",
      simulate: "Simula",
    },
    settings: {
      title: "Sistema & Permessi",
      subtitle:
        "Gestisci i privilegi di accesso hardware udev, uinput e le preferenze dell'applicazione.",
      languageTitle: "Lingua dell'Interfaccia",
      languageDesc: "Seleziona la lingua per testi, diagrammi e comandi.",
      permsTitle: "Permessi Hardware Linux (udev + uinput)",
      permsConfigured: "Permessi Hardware Correttamente Configurati",
      permsMissing: "Permessi di Sistema Mancanti o Incompleti",
      permsDescOk:
        "MouseDeck ha accesso verificato a /dev/uinput e ai nodi evdev del mouse per l'emulazione a latenza zero.",
      permsDescMissing:
        "Accesso limitato a /dev/uinput o ai nodi evdev. La modalità provvisoria monitor passivo è attiva per evitare blocchi del cursore.",
      configureWithBackup: "Configura con Backup (Polkit)",
      restorePristine: "Ripristina Stato Originario",
      restoreConfirmTitle: "Conferma Ripristino Sistema",
      restoreConfirmMsg:
        "Sei sicuro di voler rimuovere le regole udev e ripristinare il sistema allo stato iniziale?",
      autostartTitle: "Avvio Automatico al Login",
      autostartDesc:
        "Avvia MouseDeck ridotto a icona nella barra di sistema all'avvio dell'ambiente desktop (XDG Autostart).",
      backupManifestTitle: "Manifest Snapshot di Backup",
      backupCreated: "Backup registrato il:",
      rulesInstalled: "Regole udev installate in /etc/udev/rules.d/70-mousedeck.rules",
      rulesMissing: "Nessuna regola udev installata",
      backupFiles: "File nel backup:",
      manualCliTitle: "Comandi Manuali da Terminale",
      manualCliDesc: "Puoi configurare o ripristinare i permessi anche tramite la riga di comando:",
    },
    modal: {
      title: "Configura Azione",
      subtitle: "Assegna una scorciatoia, un tasto del mouse, un controllo multimediale o un comando.",
      tabKeyboard: "Tastiera",
      tabMouse: "Mouse",
      tabMedia: "Media",
      tabCommand: "Comando",
      tabPassthrough: "Passthrough",
      tabDisabled: "Disabilita",
      clickToRecord: "Clicca nel riquadro per registrare",
      recording: "In ascolto...",
      recordingPrompt: "Premi qualsiasi tasto o combinazione sulla tastiera",
      manualInputPrompt: "Es: Super+Page_Up, Ctrl+Shift+T, Alt+Tab...",
      switchManual: "Inserimento manuale",
      switchRecorder: "Registratore interattivo",
      quickPresets: "Macro Rapide Consigliate",
      mouseButtonGrid: "Seleziona Pulsante del Mouse da Emulare",
      mediaControls: "Seleziona Controllo Multimediale",
      shellCommand: "Comando Shell Bash",
      shellHelp:
        "Il comando verrà eseguito in background tramite /bin/sh con i privilegi del tuo utente.",
      saveAction: "Salva Configurazione",
      resetAction: "Azione Originale",
      actionName: "Nome Azione",
      actionDesc: "Descrizione opzionale",
      presets: {
        copy: "Copia (Ctrl+C)",
        paste: "Incolla (Ctrl+V)",
        undo: "Annulla (Ctrl+Z)",
        cut: "Taglia (Ctrl+X)",
        nextWorkspace: "Workspace Successivo",
        prevWorkspace: "Workspace Precedente",
        closeWindow: "Chiudi Finestra",
        newTab: "Nuova Scheda",
        refreshPage: "Ricarica Pagina",
      },
    },
    triggers: {
      g6_sniper: {
        name: "Tasto Sniper (G6 - DPI Shift)",
        desc: "Pulsante frontale a paletta sul poggia-pollice",
      },
      g4_back: {
        name: "Pulsante Laterale Indietro (G4)",
        desc: "Tasto pollice inferiore (default: Indietro)",
      },
      g5_forward: {
        name: "Pulsante Laterale Avanti (G5)",
        desc: "Tasto pollice superiore (default: Avanti)",
      },
      g8_dpi_up: {
        name: "Pulsante Indice Superiore (G8)",
        desc: "Tasto affiancato al click sinistro in alto (DPI Su)",
      },
      g7_dpi_down: {
        name: "Pulsante Indice Inferiore (G7)",
        desc: "Tasto affiancato al click sinistro in basso (DPI Giù)",
      },
      g9_profile: {
        name: "Pulsante Profilo / Extra (G9)",
        desc: "Tasto centrale dietro la levetta di sblocco rotellina",
      },
      middle_click: {
        name: "Click Rotellina Centrale",
        desc: "Pulsante 3 centrale della rotella",
      },
      tilt_left: {
        name: "Inclinazione Rotella Sinistra",
        desc: "Spinta orizzontale rotellina verso sinistra",
      },
      tilt_right: {
        name: "Inclinazione Rotella Destra",
        desc: "Spinta orizzontale rotellina verso destra",
      },
      swipe_up: {
        name: "Swipe Su (Striscia Touch)",
        desc: "Gesto verso l'alto sulla striscia capacitiva blu",
      },
      swipe_down: {
        name: "Swipe Giù (Striscia Touch)",
        desc: "Gesto verso il basso sulla striscia capacitiva blu",
      },
      windows_click: {
        name: "Pulsante Windows Touch",
        desc: "Clic capacitivo sulla striscia blu",
      },
    },
  },
  en: {
    common: {
      enabled: "Enabled",
      disabled: "Disabled",
      active: "Active",
      inactive: "Inactive",
      connected: "Connected",
      disconnected: "Disconnected",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      reset: "Reset",
      confirm: "Confirm",
      copy: "Copy",
      copied: "Copied!",
      loading: "Loading...",
      details: "Details",
      refresh: "Refresh",
      simulated: "Simulated",
      passthrough: "Passthrough (Native Action)",
      success: "Operation completed successfully",
      error: "An error occurred",
    },
    sidebar: {
      dashboard: "Overview",
      remap: "Buttons & Gestures",
      test: "Live Hardware Test",
      settings: "System & Permissions",
      engineActive: "Engine Active",
      enginePaused: "Engine Paused",
      battery: "Battery",
      device: "Device",
      noDevice: "No mouse detected",
      deviceConnected: "Device Connected",
      deviceDisconnected: "Device Disconnected",
      language: "Language",
    },
    banner: {
      permsMissingTitle: "Hardware Permissions Not Configured",
      permsMissingDesc:
        "MouseDeck can set up udev rules with an automatic instant snapshot rollback backup.",
      configureBtn: "Configure with Backup",
      detailsBtn: "Details",
    },
    dashboard: {
      g502Active: "G502 X Driver Active",
      sculptActive: "Sculpt Driver Active",
      engineSubtitle: "MouseDeck Hardware Engine",
      reconnect: "Refresh",
      reconnectSent: "Reconnection command sent.",
      reconnectReloaded: "Input subsystem reloaded.",
      goToRemap: "Configure Buttons",
      specsTitle: "Hardware & Connection Specs",
      macAddress: "MAC Address / Path",
      adapter: "Host Adapter",
      protocol: "Transmission Protocol",
      batteryLevel: "Battery Level",
      activeProfile: "Active Profile",
      activeTriggers: "Remappable Controls",
      deviceNotConnected: "No compatible device active",
      deviceConnectedDesc: "Device operational and ready for low-latency remapping.",
    },
    remap: {
      title: "Button & Gesture Remapping",
      subtitle: "Customize actions for each mouse button or gesture.",
      profile: "Profile",
      presets: "Quick Presets",
      applyPreset: "Apply Preset",
      presetApplied: "Preset Applied!",
      selectDriver: "Selected Driver",
      g502ThumbGroup: "Thumb Buttons (G4 / G5 / G6)",
      g502IndexGroup: "Index & Profile Buttons (G7 / G8 / G9)",
      wheelGroup: "Scroll Wheel & 4-Way Tilt",
      sculptGroup: "Blue Touch Strip Gestures",
      clickToRemap: "Click to remap",
      hoverPreview: "Hover over any control to highlight it on the diagram",
      assignedAction: "Assigned Action",
      unmapped: "Unmapped (Original pass-through)",
      presetsList: {
        gaming: "Gaming (DPI & Skill Macros)",
        desktop_navigation: "Desktop & Workspace Navigation",
        productivity: "Productivity & Clipboard",
        multimedia: "Media & Volume Controls",
        browser: "Web & Tab Navigation",
      },
    },
    test: {
      title: "Live Hardware Test",
      subtitleG502:
        "Press programmable buttons on your Logitech G502 X to watch them captured in real-time by the Rust engine.",
      subtitleSculpt:
        "Perform gestures on the blue touch strip to watch them captured in real-time by the Rust engine.",
      diagramTitle: "Interactive Hardware Diagram",
      diagramHelp: "Buttons and gestures illuminate in real-time when triggered on the physical mouse.",
      historyTitle: "Received Event Stream",
      clearHistory: "Clear History",
      noEventsYet:
        "No events recorded yet. Try clicking or swiping a button on your mouse.",
      timestamp: "Time",
      trigger: "Button / Gesture",
      action: "Executed Action",
      type: "Type",
      simulate: "Simulate",
    },
    settings: {
      title: "System & Permissions",
      subtitle:
        "Manage udev and uinput hardware access privileges and application preferences.",
      languageTitle: "Interface Language",
      languageDesc: "Select the display language for user interface, diagrams, and commands.",
      permsTitle: "Linux Hardware Permissions (udev + uinput)",
      permsConfigured: "Hardware Permissions Fully Configured",
      permsMissing: "System Permissions Missing or Incomplete",
      permsDescOk:
        "MouseDeck has verified access to /dev/uinput and mouse evdev nodes for zero-latency input emulation.",
      permsDescMissing:
        "Restricted access to /dev/uinput or evdev nodes. Fail-safe passive monitor mode is active to prevent mouse cursor freezes.",
      configureWithBackup: "Configure with Backup (Polkit)",
      restorePristine: "Restore Original State",
      restoreConfirmTitle: "Confirm System Restore",
      restoreConfirmMsg:
        "Are you sure you want to remove udev rules and restore the system to its initial pristine state?",
      autostartTitle: "Launch at System Login",
      autostartDesc:
        "Start MouseDeck minimized to the system tray when logging into your desktop session (XDG Autostart).",
      backupManifestTitle: "Rollback Snapshot Manifest",
      backupCreated: "Backup created on:",
      rulesInstalled: "udev rules installed in /etc/udev/rules.d/70-mousedeck.rules",
      rulesMissing: "No udev rules installed",
      backupFiles: "Backed up files:",
      manualCliTitle: "Manual Terminal Commands",
      manualCliDesc: "You can also configure or restore permissions via command line:",
    },
    modal: {
      title: "Configure Action",
      subtitle: "Assign a keyboard shortcut, mouse button, media control, or command.",
      tabKeyboard: "Keyboard",
      tabMouse: "Mouse",
      tabMedia: "Media",
      tabCommand: "Command",
      tabPassthrough: "Passthrough",
      tabDisabled: "Disable",
      clickToRecord: "Click in box to record",
      recording: "Listening...",
      recordingPrompt: "Press any key or combination on your keyboard",
      manualInputPrompt: "E.g.: Super+Page_Up, Ctrl+Shift+T, Alt+Tab...",
      switchManual: "Manual input",
      switchRecorder: "Interactive recorder",
      quickPresets: "Recommended Quick Macros",
      mouseButtonGrid: "Select Mouse Button to Emulate",
      mediaControls: "Select Media Action",
      shellCommand: "Bash Shell Command",
      shellHelp:
        "The command will execute in the background via /bin/sh with your user privileges.",
      saveAction: "Save Configuration",
      resetAction: "Native Action",
      actionName: "Action Name",
      actionDesc: "Optional description",
      presets: {
        copy: "Copy (Ctrl+C)",
        paste: "Paste (Ctrl+V)",
        undo: "Undo (Ctrl+Z)",
        cut: "Cut (Ctrl+X)",
        nextWorkspace: "Next Workspace",
        prevWorkspace: "Previous Workspace",
        closeWindow: "Close Window",
        newTab: "New Tab",
        refreshPage: "Refresh Page",
      },
    },
    triggers: {
      g6_sniper: {
        name: "Sniper Button (G6 - DPI Shift)",
        desc: "Front thumb paddle button on thumb rest",
      },
      g4_back: {
        name: "Side Back Button (G4)",
        desc: "Lower thumb button (default: Browser Back)",
      },
      g5_forward: {
        name: "Side Forward Button (G5)",
        desc: "Upper thumb button (default: Browser Forward)",
      },
      g8_dpi_up: {
        name: "Upper Index Button (G8)",
        desc: "Top button alongside left click (DPI Up / Volume)",
      },
      g7_dpi_down: {
        name: "Lower Index Button (G7)",
        desc: "Bottom button alongside left click (DPI Down / Volume)",
      },
      g9_profile: {
        name: "Profile Button (G9)",
        desc: "Center button behind wheel mode switch",
      },
      middle_click: {
        name: "Middle Wheel Click",
        desc: "Scroll wheel center click (Button 3)",
      },
      tilt_left: {
        name: "Wheel Tilt Left",
        desc: "Horizontal scroll wheel tilt to the left",
      },
      tilt_right: {
        name: "Wheel Tilt Right",
        desc: "Horizontal scroll wheel tilt to the right",
      },
      swipe_up: {
        name: "Swipe Up (Touch Strip)",
        desc: "Upward swipe gesture on blue capacitive strip",
      },
      swipe_down: {
        name: "Swipe Down (Touch Strip)",
        desc: "Downward swipe gesture on blue capacitive strip",
      },
      windows_click: {
        name: "Windows Touch Button",
        desc: "Capacitive tap on blue Windows strip",
      },
    },
  },
};
