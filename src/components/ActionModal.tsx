import React, { useState, useEffect, useRef } from "react";
import { ActionConfig } from "../types";
import { KeyComboBadge, Keycap } from "./Keycap";
import {
  X,
  Keyboard,
  Music,
  MousePointer,
  Terminal,
  Ban,
  Volume2,
  Volume1,
  VolumeX,
  Play,
  SkipForward,
  SkipBack,
  Check,
  Sparkles,
  Trash2,
  Sliders,
  Crosshair,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerId: string;
  triggerName: string;
  currentAction: ActionConfig;
  onSave: (action: ActionConfig) => void;
}

export const ActionModal: React.FC<ActionModalProps> = ({
  isOpen,
  onClose,
  triggerId,
  triggerName,
  currentAction,
  onSave,
}) => {
  const [actionType, setActionType] = useState<string>("key_combo");
  const [value, setValue] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  // Interactive Key Recorder State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [liveModifiers, setLiveModifiers] = useState<string>("");
  const [showManualInput, setShowManualInput] = useState<boolean>(false);

  const recorderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setActionType(currentAction.type || "key_combo");
      setValue(currentAction.value || "");
      setName(currentAction.name || "");
      setDescription(currentAction.description || "");
      setIsRecording(false);
      setLiveModifiers("");
      setShowManualInput(false);
    }
  }, [isOpen, currentAction]);

  // Global Keydown Listener for Esc and Recording
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // If pressing Escape
      if (e.key === "Escape") {
        if (isRecording) {
          setIsRecording(false);
          setLiveModifiers("");
        } else {
          onClose();
        }
        return;
      }

      // If recording key combo
      if (isRecording) {
        e.preventDefault();
        e.stopPropagation();

        const mods: string[] = [];
        if (e.metaKey) mods.push("Super");
        if (e.ctrlKey) mods.push("Ctrl");
        if (e.altKey) mods.push("Alt");
        if (e.shiftKey) mods.push("Shift");

        const isModifier = ["Control", "Shift", "Alt", "Meta"].includes(e.key);

        if (isModifier) {
          setLiveModifiers(mods.join("+"));
          return;
        }

        // Map key names
        let keyStr = e.key;
        if (keyStr === " ") keyStr = "Space";
        else if (keyStr === "PageUp") keyStr = "Page_Up";
        else if (keyStr === "PageDown") keyStr = "Page_Down";
        else if (keyStr === "ArrowUp") keyStr = "Up";
        else if (keyStr === "ArrowDown") keyStr = "Down";
        else if (keyStr === "ArrowLeft") keyStr = "Left";
        else if (keyStr === "ArrowRight") keyStr = "Right";
        else if (keyStr === "Enter") keyStr = "Enter";
        else if (keyStr === "Backspace") keyStr = "Backspace";
        else if (keyStr === "Tab") keyStr = "Tab";
        else if (keyStr === "Delete") keyStr = "Delete";
        else if (keyStr === "Insert") keyStr = "Insert";
        else if (keyStr === "Home") keyStr = "Home";
        else if (keyStr === "End") keyStr = "End";
        else if (/^F\d+$/i.test(keyStr)) keyStr = keyStr.toUpperCase();
        else if (keyStr.length === 1) keyStr = keyStr.toLowerCase();

        const finalCombo = [...mods, keyStr].join("+");
        setValue(finalCombo);
        setIsRecording(false);
        setLiveModifiers("");

        // Auto-suggest name if empty
        if (!name.trim()) {
          setName(finalCombo);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (isRecording) {
        const mods: string[] = [];
        if (e.metaKey) mods.push("Super");
        if (e.ctrlKey) mods.push("Ctrl");
        if (e.altKey) mods.push("Alt");
        if (e.shiftKey) mods.push("Shift");
        setLiveModifiers(mods.join("+"));
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("keyup", handleKeyUp, true);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("keyup", handleKeyUp, true);
    };
  }, [isOpen, isRecording, name, onClose]);

  if (!isOpen) return null;

  const handleSave = () => {
    let finalName = name.trim();
    if (!finalName) {
      if (actionType === "key_combo") finalName = value || "Nessuna azione";
      else if (actionType === "disabled") finalName = "Disabilitato";
      else if (actionType === "media") {
        const item = mediaOptions.find((m) => m.id === value);
        finalName = item ? item.title : value;
      } else if (actionType === "mouse_button") {
        const item = mouseOptions.find((m) => m.id === value);
        finalName = item ? item.title : value;
      } else finalName = value;
    }

    onSave({
      type: actionType,
      value: value.trim(),
      name: finalName,
      description: description.trim(),
    });
    onClose();
  };

  const getTriggerIcon = (id: string) => {
    if (id.includes("sniper")) return Crosshair;
    if (id.includes("back")) return ArrowLeft;
    if (id.includes("forward")) return ArrowRight;
    if (id.includes("dpi_up") || id.includes("up")) return ArrowUp;
    if (id.includes("dpi_down") || id.includes("down")) return ArrowDown;
    if (id.includes("profile")) return Sliders;
    if (id.includes("tilt")) return Sliders;
    if (id.includes("windows")) return Sparkles;
    return MousePointer;
  };

  const TriggerIcon = getTriggerIcon(triggerId);

  const categories = [
    { id: "key_combo", label: "Scorciatoia", icon: Keyboard },
    { id: "media", label: "Media", icon: Music },
    { id: "mouse_button", label: "Tasti Mouse", icon: MousePointer },
    { id: "command", label: "Comando Shell", icon: Terminal },
    { id: "disabled", label: "Disabilita", icon: Ban },
  ];

  // Media Options
  const mediaOptions = [
    {
      id: "VolumeUp",
      title: "Alza Volume",
      desc: "Incrementa volume di sistema",
      icon: Volume2,
    },
    {
      id: "VolumeDown",
      title: "Abbassa Volume",
      desc: "Riduce volume di sistema",
      icon: Volume1,
    },
    {
      id: "Mute",
      title: "Muto Audio",
      desc: "Silenzia o riattiva l'audio",
      icon: VolumeX,
    },
    {
      id: "PlayPause",
      title: "Play / Pausa",
      desc: "Controlla riproduzione media",
      icon: Play,
    },
    {
      id: "NextTrack",
      title: "Traccia Successiva",
      desc: "Avanza al prossimo brano",
      icon: SkipForward,
    },
    {
      id: "PreviousTrack",
      title: "Traccia Precedente",
      desc: "Ritorna al brano precedente",
      icon: SkipBack,
    },
  ];

  // Mouse Button Options
  const mouseOptions = [
    {
      id: "BTN_MIDDLE",
      title: "Click Centrale",
      desc: "Pulsante 3 della rotellina",
      sub: "Apre link in nuova tab",
    },
    {
      id: "BTN_SIDE",
      title: "Tasto Indietro",
      desc: "Pulsante pollice inferiore",
      sub: "Cronologia browser indietro",
    },
    {
      id: "BTN_EXTRA",
      title: "Tasto Avanti",
      desc: "Pulsante pollice superiore",
      sub: "Cronologia browser avanti",
    },
    {
      id: "BTN_LEFT",
      title: "Click Sinistro",
      desc: "Pulsante primario standard",
      sub: "Selezione e trascinamento",
    },
    {
      id: "BTN_RIGHT",
      title: "Click Destro",
      desc: "Pulsante secondario standard",
      sub: "Menu contestuale",
    },
  ];

  // Quick Preset Shortcuts
  const shortcutPresets = [
    { label: "Workspace Succ", combo: "Super+Page_Down", category: "Desktop" },
    { label: "Workspace Prec", combo: "Super+Page_Up", category: "Desktop" },
    { label: "Panoramica / Super", combo: "Super", category: "Desktop" },
    { label: "Chiudi Finestra", combo: "Alt+F4", category: "Desktop" },
    { label: "Copia", combo: "Ctrl+c", category: "Appunti" },
    { label: "Incolla", combo: "Ctrl+v", category: "Appunti" },
    { label: "Annulla", combo: "Ctrl+z", category: "Appunti" },
    { label: "Ripristina", combo: "Ctrl+y", category: "Appunti" },
    { label: "Nuova Scheda", combo: "Ctrl+t", category: "Browser" },
    { label: "Chiudi Scheda", combo: "Ctrl+w", category: "Browser" },
    { label: "Scheda Succ", combo: "Ctrl+Tab", category: "Browser" },
    { label: "Scheda Prec", combo: "Ctrl+Shift+Tab", category: "Browser" },
  ];

  // Shell Command Quick Templates
  const shellPresets = [
    {
      name: "Hyprland Workspace +1",
      cmd: "hyprctl dispatch workspace +1",
    },
    {
      name: "Hyprland Workspace -1",
      cmd: "hyprctl dispatch workspace -1",
    },
    {
      name: "Sway Next Workspace",
      cmd: "swaymsg workspace next",
    },
    {
      name: "Playerctl Play/Pause",
      cmd: "playerctl play-pause",
    },
    {
      name: "Screenshot Rapido",
      cmd: "grim -g \"$(slurp)\"",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-[#10121a] border border-white/[0.1] rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col animate-pop-in">
        {/* Accent top gradient line */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 shrink-0" />

        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.01]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 shadow-inner">
              <TriggerIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-white tracking-tight">
                  {triggerName}
                </h3>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-400 border border-white/[0.04]">
                  {triggerId}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Configura l'azione hardware intercettata all'attivazione
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Chiudi (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Segmented Navigation */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex rounded-xl bg-[#090a0f] p-1 border border-white/[0.06] gap-1">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = actionType === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setActionType(cat.id);
                    setIsRecording(false);
                    if (cat.id === "media" && (!value || !mediaOptions.some((m) => m.id === value))) {
                      setValue("VolumeUp");
                      setName("Alza Volume");
                    }
                    if (cat.id === "mouse_button" && (!value || !mouseOptions.some((m) => m.id === value))) {
                      setValue("BTN_MIDDLE");
                      setName("Click Centrale");
                    }
                    if (cat.id === "disabled") {
                      setName("Disabilitato");
                    }
                  }}
                  className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-b from-[#202534] to-[#161a25] text-white shadow-md border border-white/[0.12] text-cyan-300"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-cyan-400" : "text-slate-400"}`} />
                  <span className="truncate">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Body */}
        <div className="px-6 py-3 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* TAB 1: KEYBOARD SHORTCUT */}
          {actionType === "key_combo" && (
            <div className="space-y-3">
              {/* Interactive Key Recorder Box */}
              <div
                ref={recorderRef}
                tabIndex={0}
                onClick={() => setIsRecording(true)}
                className={`relative rounded-xl p-4 transition-all duration-200 cursor-pointer border flex flex-col items-center justify-center text-center ${
                  isRecording
                    ? "bg-[#0c1424] recording-pulse"
                    : "bg-[#0a0b10] border-white/[0.08] hover:border-cyan-500/40 hover:bg-[#0e1017]"
                }`}
              >
                {/* Status Header */}
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isRecording
                        ? "bg-cyan-400 animate-ping"
                        : value
                        ? "bg-emerald-400 shadow-[0_0_6px_#34d399]"
                        : "bg-slate-500"
                    }`}
                  />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {isRecording ? "In ascolto della tastiera..." : "Combinazione Registrata"}
                  </span>
                </div>

                {/* Display Area */}
                <div className="py-2 min-h-[44px] flex items-center justify-center flex-wrap gap-1.5">
                  {isRecording ? (
                    liveModifiers ? (
                      <div className="flex items-center gap-1.5">
                        <KeyComboBadge combo={liveModifiers} size="lg" />
                        <span className="text-cyan-400 text-xs font-mono animate-pulse">
                          + premi tasto...
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-cyan-300 font-medium">
                        Premi la combinazione desiderata (es. Ctrl+Shift+T, Super+Page_Up)...
                      </span>
                    )
                  ) : value ? (
                    <KeyComboBadge combo={value} size="lg" />
                  ) : (
                    <span className="text-xs text-slate-500 italic">
                      Nessuna combinazione assegnata. Clicca qui per registrare.
                    </span>
                  )}
                </div>

                {/* Helper buttons under recorder */}
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsRecording(!isRecording);
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer border ${
                      isRecording
                        ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/30"
                        : "bg-white/[0.05] text-slate-300 border-white/[0.08] hover:bg-white/[0.09]"
                    }`}
                  >
                    {isRecording ? "Interrompi Registrazione" : "Registra Nuova Combinazione"}
                  </button>

                  {value && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setValue("");
                        setName("");
                      }}
                      className="px-2 py-1 rounded-md text-[11px] text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent transition-colors flex items-center gap-1 cursor-pointer"
                      title="Cancella scorciatoia"
                    >
                      <Trash2 className="w-3 h-3" />
                      Cancella
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Preset Macros */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Preset Rapidi & Macro Comuni
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowManualInput(!showManualInput)}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                  >
                    {showManualInput ? "Nascondi editor manuale" : "Modifica manuale testo"}
                  </button>
                </div>

                {/* Manual Text String Input (Toggleable) */}
                {showManualInput && (
                  <div className="p-2.5 rounded-xl bg-[#090a0f] border border-white/[0.06] space-y-1">
                    <label className="block text-[11px] text-slate-400">
                      Stringa combinazione (formato: <code className="text-cyan-400 font-mono">Super+Page_Up</code>)
                    </label>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder="es. Super+Page_Up, Ctrl+Shift+T"
                      className="w-full px-3 py-1.5 rounded-lg bg-[#141620] border border-white/[0.08] text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1">
                  {shortcutPresets.map((p) => {
                    const isCurrent = value === p.combo;
                    return (
                      <button
                        key={p.combo}
                        type="button"
                        onClick={() => {
                          setValue(p.combo);
                          setName(p.label);
                          setIsRecording(false);
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-left transition-all border flex flex-col justify-between cursor-pointer ${
                          isCurrent
                            ? "bg-cyan-500/10 border-cyan-500/40 text-white shadow-xs"
                            : "bg-[#14161f] border-white/[0.05] text-slate-300 hover:border-white/[0.12] hover:bg-[#181b26]"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[11px] font-medium truncate">{p.label}</span>
                          {isCurrent && <Check className="w-3 h-3 text-cyan-400 shrink-0" />}
                        </div>
                        <div className="mt-1">
                          <KeyComboBadge combo={p.combo} size="sm" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MULTIMEDIA */}
          {actionType === "media" && (
            <div className="space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                Seleziona Azione Multimediale
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {mediaOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = value === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setValue(opt.id);
                        setName(opt.title);
                        setDescription(opt.desc);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? "bg-gradient-to-br from-cyan-500/15 to-blue-500/10 border-cyan-500/50 shadow-md"
                          : "bg-[#14161f] border-white/[0.05] hover:border-white/[0.12] hover:bg-[#181b26]"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected
                            ? "bg-cyan-500 text-slate-950 font-bold shadow-sm"
                            : "bg-white/[0.05] text-slate-400"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-semibold ${
                              isSelected ? "text-white" : "text-slate-200"
                            }`}
                          >
                            {opt.title}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">{opt.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: MOUSE BUTTONS */}
          {actionType === "mouse_button" && (
            <div className="space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                Pulsante Virtuale del Mouse
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {mouseOptions.map((opt) => {
                  const isSelected = value === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setValue(opt.id);
                        setName(opt.title);
                        setDescription(opt.desc);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? "bg-gradient-to-br from-cyan-500/15 to-blue-500/10 border-cyan-500/50 shadow-md"
                          : "bg-[#14161f] border-white/[0.05] hover:border-white/[0.12] hover:bg-[#181b26]"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected
                            ? "bg-cyan-500 text-slate-950 font-bold shadow-sm"
                            : "bg-white/[0.05] text-slate-400"
                        }`}
                      >
                        <MousePointer className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-semibold ${
                              isSelected ? "text-white" : "text-slate-200"
                            }`}
                          >
                            {opt.title}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{opt.desc}</p>
                        <span className="text-[10px] text-slate-500 block">{opt.sub}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: SHELL COMMAND */}
          {actionType === "command" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Comando Shell Linux da Eseguire
                </label>
                <div className="relative rounded-xl overflow-hidden border border-white/[0.08] bg-[#090a0e] p-3 flex items-center gap-2">
                  <span className="font-mono text-xs text-cyan-400 font-bold select-none">$</span>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="es. hyprctl dispatch workspace +1"
                    className="w-full bg-transparent text-white font-mono text-xs focus:outline-none placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Shell quick templates */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Script & Comandi Suggeriti
                </span>
                <div className="space-y-1">
                  {shellPresets.map((sh, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setValue(sh.cmd);
                        setName(sh.name);
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-[#14161f] border border-white/[0.04] hover:border-cyan-500/30 text-left flex items-center justify-between text-xs transition-colors cursor-pointer group"
                    >
                      <span className="text-slate-300 group-hover:text-white font-medium">
                        {sh.name}
                      </span>
                      <code className="text-[10px] font-mono text-slate-500 group-hover:text-cyan-400">
                        {sh.cmd}
                      </code>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DISABLED */}
          {actionType === "disabled" && (
            <div className="py-8 px-4 rounded-xl bg-[#14161f] border border-white/[0.05] text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                <Ban className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-semibold text-white">Tasto Disabilitato</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                La pressione di questo tasto hardware verrà intercettata e soppressa. Nessun evento di input verrà inviato al sistema.
              </p>
            </div>
          )}

          {/* Custom Label & Description (for all active types) */}
          {actionType !== "disabled" && (
            <div className="pt-2 border-t border-white/[0.05] grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Etichetta / Nome Tasto
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={value || "Nome personalizzato"}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#141620] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Descrizione Opzionale
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="es. Scorri al desktop seguente"
                  className="w-full px-3 py-1.5 rounded-lg bg-[#141620] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-white/[0.06] bg-[#0c0d12] flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <Keycap label="Esc" size="sm" variant="muted" /> per chiudere
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Keycap label="↵ Enter" size="sm" variant="muted" /> per salvare
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs font-medium transition-colors cursor-pointer"
            >
              Annulla
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold transition-all shadow-[0_0_12px_rgba(6,182,212,0.35)] flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              Salva Rimappatura
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

