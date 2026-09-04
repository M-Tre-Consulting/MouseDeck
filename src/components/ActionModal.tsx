import React, { useState, useEffect } from "react";
import { ActionConfig } from "../types";
import { X, Keyboard, Music, MousePointer, Terminal, Ban } from "lucide-react";

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
  triggerName,
  currentAction,
  onSave,
}) => {
  const [actionType, setActionType] = useState<string>("key_combo");
  const [value, setValue] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setActionType(currentAction.type || "key_combo");
      setValue(currentAction.value || "");
      setName(currentAction.name || "");
      setDescription(currentAction.description || "");
    }
  }, [isOpen, currentAction]);

  if (!isOpen) return null;

  const handleChipClick = (keyText: string) => {
    if (!value.trim()) {
      setValue(keyText);
    } else {
      setValue(`${value.trim()}+${keyText}`);
    }
  };

  const handleSave = () => {
    let finalName = name.trim();
    if (!finalName) {
      if (actionType === "key_combo") finalName = value;
      else if (actionType === "disabled") finalName = "Disabilitato";
      else finalName = value;
    }

    onSave({
      type: actionType,
      value: value.trim(),
      name: finalName,
      description: description.trim(),
    });
    onClose();
  };

  const categories = [
    { id: "key_combo", label: "Tasti / Scorciatoia", icon: Keyboard },
    { id: "media", label: "Multimediale", icon: Music },
    { id: "mouse_button", label: "Click Mouse", icon: MousePointer },
    { id: "command", label: "Comando Shell", icon: Terminal },
    { id: "disabled", label: "Disabilita", icon: Ban },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg text-white">Configura Azione</h3>
            <p className="text-xs text-cyan-400 font-medium">{triggerName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Category Tabs */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Tipo di Azione
            </label>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = actionType === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setActionType(cat.id);
                      if (cat.id === "media" && !value) setValue("VolumeUp");
                      if (cat.id === "mouse_button" && !value) setValue("BTN_MIDDLE");
                    }}
                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-sm shadow-cyan-500/20"
                        : "bg-slate-800/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[11px] text-center">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Specific Inputs */}
          {actionType === "key_combo" && (
            <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
              <label className="block text-xs font-medium text-slate-300">
                Combinazione di Tasti
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="es. Super+Page_Up, Ctrl+c, Alt+Tab"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />

              <div>
                <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">
                  Tasti rapidi da aggiungere:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Super", "Ctrl", "Alt", "Shift", "Page_Up", "Page_Down",
                    "Tab", "Backspace", "Space", "Enter", "Esc", "c", "v", "z"
                  ].map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => handleChipClick(k)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700/60 transition-colors"
                    >
                      +{k}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {actionType === "media" && (
            <div className="space-y-2 bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
              <label className="block text-xs font-medium text-slate-300">
                Comando Multimediale
              </label>
              <select
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500"
              >
                <option value="VolumeUp">Alza Volume (Volume Up)</option>
                <option value="VolumeDown">Abbassa Volume (Volume Down)</option>
                <option value="Mute">Muto (Mute Audio)</option>
                <option value="PlayPause">Riproduci / Pausa (Play/Pause)</option>
                <option value="NextTrack">Traccia Successiva (Next Song)</option>
                <option value="PreviousTrack">Traccia Precedente (Previous Song)</option>
              </select>
            </div>
          )}

          {actionType === "mouse_button" && (
            <div className="space-y-2 bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
              <label className="block text-xs font-medium text-slate-300">
                Pulsante del Mouse
              </label>
              <select
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500"
              >
                <option value="BTN_MIDDLE">Click Centrale (Rotellina)</option>
                <option value="BTN_SIDE">Pulsante Laterale (Indietro)</option>
                <option value="BTN_EXTRA">Pulsante Extra (Avanti)</option>
                <option value="BTN_LEFT">Click Sinistro</option>
                <option value="BTN_RIGHT">Click Destro</option>
              </select>
            </div>
          )}

          {actionType === "command" && (
            <div className="space-y-2 bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
              <label className="block text-xs font-medium text-slate-300">
                Comando Shell da Eseguire
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="es. hyprctl dispatch workspace +1, wpctl set-volume..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}

          {/* Labels & Description */}
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Nome Personalizzato (Opzionale)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="es. Workspace Successivo, Copia, Muto"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Descrizione
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve spiegazione dell'azione"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-medium transition-colors"
          >
            Annulla
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-medium shadow-lg shadow-cyan-500/25 transition-all"
          >
            Salva Azione
          </button>
        </div>
      </div>
    </div>
  );
};
