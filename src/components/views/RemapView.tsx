import React, { useState } from "react";
import { ActionConfig, AppConfig } from "../../types";
import { ActionModal } from "../ActionModal";
import {
  ArrowUp,
  ArrowDown,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  MousePointer,
  Sliders,
  Check,
  Edit3,
} from "lucide-react";

interface RemapViewProps {
  config: AppConfig;
  onSaveAction: (triggerId: string, action: ActionConfig) => void;
  onApplyPreset: (presetKey: string) => void;
}

export const RemapView: React.FC<RemapViewProps> = ({
  config,
  onSaveAction,
  onApplyPreset,
}) => {
  const [selectedTrigger, setSelectedTrigger] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [selectedPreset, setSelectedPreset] = useState("desktop_navigation");
  const [presetSuccess, setPresetSuccess] = useState(false);

  const activeMappings = config.profiles[config.active_profile] || {};

  const handleOpenEdit = (id: string, name: string) => {
    setSelectedTrigger({ id, name });
  };

  const handleApplyPresetClick = () => {
    onApplyPreset(selectedPreset);
    setPresetSuccess(true);
    setTimeout(() => setPresetSuccess(false), 2500);
  };

  const stripTriggers = [
    {
      id: "swipe_up",
      name: "Swipe Up (Scorri in Alto)",
      desc: "Scorrimento rapido con il pollice verso l'alto sulla striscia blu",
      icon: ArrowUp,
      accent: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    },
    {
      id: "swipe_down",
      name: "Swipe Down (Scorri in Basso)",
      desc: "Scorrimento rapido con il pollice verso il basso sulla striscia blu",
      icon: ArrowDown,
      accent: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      id: "windows_click",
      name: "Pulsante Windows (Click/Tap)",
      desc: "Pressione fisica/meccanica della striscia blu",
      icon: Sparkles,
      accent: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    },
  ];

  const wheelTriggers = [
    {
      id: "tilt_left",
      name: "Inclinazione Sinistra (Tilt Left)",
      desc: "Spinta laterale della rotellina verso sinistra",
      icon: ArrowLeft,
      accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      id: "tilt_right",
      name: "Inclinazione Destra (Tilt Right)",
      desc: "Spinta laterale della rotellina verso destra",
      icon: ArrowRight,
      accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      id: "middle_click",
      name: "Pulsante Centrale (Click Rotellina)",
      desc: "Pressione verticale della rotellina",
      icon: MousePointer,
      accent: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
  ];

  return (
    <div className="space-y-7 max-w-5xl mx-auto animate-fade-in">
      {/* 1. Presets Header Bar */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Profili Rapidi Predefiniti
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Carica istantaneamente set di configurazioni ottimizzate per il tuo flusso di lavoro.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedPreset}
            onChange={(e) => setSelectedPreset(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="desktop_navigation">Navigazione Desktop (Workspaces)</option>
            <option value="productivity">Produttività (Copia, Incolla, Ricerca)</option>
            <option value="multimedia">Controllo Multimediale (Volume, Tracce)</option>
            <option value="browser">Navigazione Web (Schede & Cronologia)</option>
          </select>

          <button
            onClick={handleApplyPresetClick}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md ${
              presetSuccess
                ? "bg-emerald-500 text-white shadow-emerald-500/20"
                : "bg-cyan-500 hover:bg-cyan-400 text-white shadow-cyan-500/20"
            }`}
          >
            {presetSuccess ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Applicato!
              </>
            ) : (
              "Applica Preset"
            )}
          </button>
        </div>
      </div>

      {/* 2. Touch Strip Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Touch Strip Laterale Windows (Striscia Blu)
          </h3>
          <span className="text-[11px] text-cyan-400/80 font-medium">
            3 Gesti Disponibili
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {stripTriggers.map((t) => {
            const Icon = t.icon;
            const action = activeMappings[t.id];
            const displayVal = action?.name || action?.value || "Non configurato";

            return (
              <div
                key={t.id}
                onClick={() => handleOpenEdit(t.id, t.name)}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-900/50 hover:bg-slate-900/90 border border-slate-800/80 hover:border-cyan-500/50 transition-all cursor-pointer shadow-lg"
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${t.accent}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                      {t.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">{t.desc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-3 sm:mt-0 self-end sm:self-center">
                  <span className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs font-semibold text-cyan-400">
                    {displayVal}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-slate-800/60 group-hover:bg-cyan-500 group-hover:text-white text-slate-400 flex items-center justify-center transition-all">
                    <Edit3 className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Mouse Extra Controls Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Rotellina Tilt a 4 Vie & Pulsanti Mouse
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {wheelTriggers.map((t) => {
            const Icon = t.icon;
            const action = activeMappings[t.id];
            const displayVal = action?.name || action?.value || "Standard";

            return (
              <div
                key={t.id}
                onClick={() => handleOpenEdit(t.id, t.name)}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-900/50 hover:bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer shadow-lg"
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${t.accent}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white group-hover:text-slate-200 transition-colors">
                      {t.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">{t.desc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-3 sm:mt-0 self-end sm:self-center">
                  <span className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs font-semibold text-slate-300">
                    {displayVal}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-slate-800/60 group-hover:bg-slate-700 text-slate-400 flex items-center justify-center transition-all">
                    <Edit3 className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal for editing */}
      {selectedTrigger && (
        <ActionModal
          isOpen={true}
          onClose={() => setSelectedTrigger(null)}
          triggerId={selectedTrigger.id}
          triggerName={selectedTrigger.name}
          currentAction={
            activeMappings[selectedTrigger.id] || {
              type: "key_combo",
              value: "",
              name: "",
              description: "",
            }
          }
          onSave={(newAction) => onSaveAction(selectedTrigger.id, newAction)}
        />
      )}
    </div>
  );
};
