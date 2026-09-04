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
    { id: "key_combo", label: "Scorciatoia", icon: Keyboard },
    { id: "media", label: "Media", icon: Music },
    { id: "mouse_button", label: "Mouse", icon: MousePointer },
    { id: "command", label: "Comando", icon: Terminal },
    { id: "disabled", label: "Disabilita", icon: Ban },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-[#14161f] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.01]">
          <div>
            <h3 className="font-semibold text-sm text-white">{triggerName}</h3>
            <span className="text-[11px] text-slate-400">Configura azione personalizzata</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Segmented category switcher */}
          <div className="flex rounded-lg bg-[#0a0b0e] p-1 border border-white/[0.05]">
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
                  className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                    isSelected
                      ? "bg-[#202533] text-white shadow-xs"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Key Combo */}
          {actionType === "key_combo" && (
            <div className="space-y-3 bg-[#0d0f14] p-3.5 rounded-xl border border-white/[0.05]">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Combinazione di Tasti
                </label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="es. Super+Page_Up, Ctrl+c"
                  className="w-full px-3 py-1.5 rounded-lg bg-[#181a24] border border-white/[0.08] text-white font-mono text-xs focus:outline-none focus:border-[#0078d4]"
                />
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block mb-1">Aggiungi tasto:</span>
                <div className="flex flex-wrap gap-1">
                  {[
                    "Super", "Ctrl", "Alt", "Shift", "Page_Up", "Page_Down",
                    "Tab", "Backspace", "Space", "Enter", "Esc", "c", "v"
                  ].map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => handleChipClick(k)}
                      className="keycap cursor-pointer hover:bg-[#252a3a] transition-colors"
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Media */}
          {actionType === "media" && (
            <div className="space-y-1.5 bg-[#0d0f14] p-3.5 rounded-xl border border-white/[0.05]">
              <label className="block text-xs font-medium text-slate-300">
                Comando Multimediale
              </label>
              <select
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-[#181a24] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#0078d4]"
              >
                <option value="VolumeUp">Alza Volume (Volume Up)</option>
                <option value="VolumeDown">Abbassa Volume (Volume Down)</option>
                <option value="Mute">Muto (Mute Audio)</option>
                <option value="PlayPause">Riproduci / Pausa (Play/Pause)</option>
                <option value="NextTrack">Traccia Successiva</option>
                <option value="PreviousTrack">Traccia Precedente</option>
              </select>
            </div>
          )}

          {/* Mouse Button */}
          {actionType === "mouse_button" && (
            <div className="space-y-1.5 bg-[#0d0f14] p-3.5 rounded-xl border border-white/[0.05]">
              <label className="block text-xs font-medium text-slate-300">
                Pulsante del Mouse
              </label>
              <select
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-[#181a24] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#0078d4]"
              >
                <option value="BTN_MIDDLE">Click Centrale (Rotellina)</option>
                <option value="BTN_SIDE">Pulsante Laterale (Indietro)</option>
                <option value="BTN_EXTRA">Pulsante Extra (Avanti)</option>
                <option value="BTN_LEFT">Click Sinistro</option>
                <option value="BTN_RIGHT">Click Destro</option>
              </select>
            </div>
          )}

          {/* Shell Command */}
          {actionType === "command" && (
            <div className="space-y-1.5 bg-[#0d0f14] p-3.5 rounded-xl border border-white/[0.05]">
              <label className="block text-xs font-medium text-slate-300">
                Comando Shell da Eseguire
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="es. hyprctl dispatch workspace +1"
                className="w-full px-3 py-1.5 rounded-lg bg-[#181a24] border border-white/[0.08] text-white font-mono text-xs focus:outline-none focus:border-[#0078d4]"
              />
            </div>
          )}

          {/* Name & Desc */}
          <div className="space-y-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Nome Personalizzato
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="es. Workspace Successivo, Copia"
                className="w-full px-3 py-1.5 rounded-lg bg-[#181a24] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#0078d4]"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/[0.06] bg-white/[0.01] flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs font-medium transition-colors"
          >
            Annulla
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg bg-[#0078d4] hover:bg-[#1084d8] text-white text-xs font-medium transition-colors shadow-xs"
          >
            Salva
          </button>
        </div>
      </div>
    </div>
  );
};
