import React, { useState } from "react";
import { ActionConfig, AppConfig } from "../../types";
import { ActionModal } from "../ActionModal";
import { KeyComboBadge } from "../Keycap";
import {
  ArrowUp,
  ArrowDown,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  MousePointer,
  ChevronRight,
  Check,
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

  const handleApplyPresetClick = () => {
    onApplyPreset(selectedPreset);
    setPresetSuccess(true);
    setTimeout(() => setPresetSuccess(false), 2000);
  };

  const stripTriggers = [
    {
      id: "swipe_up",
      name: "Swipe Up (Scorri in Alto)",
      desc: "Scorrimento verso l'alto sulla striscia blu",
      icon: ArrowUp,
    },
    {
      id: "swipe_down",
      name: "Swipe Down (Scorri in Basso)",
      desc: "Scorrimento verso il basso sulla striscia blu",
      icon: ArrowDown,
    },
    {
      id: "windows_click",
      name: "Pulsante Windows (Click/Tap)",
      desc: "Pressione fisica della striscia blu",
      icon: Sparkles,
    },
  ];

  const wheelTriggers = [
    {
      id: "tilt_left",
      name: "Inclinazione Sinistra (Tilt Left)",
      desc: "Spinta della rotellina verso sinistra",
      icon: ArrowLeft,
    },
    {
      id: "tilt_right",
      name: "Inclinazione Destra (Tilt Right)",
      desc: "Spinta della rotellina verso destra",
      icon: ArrowRight,
    },
    {
      id: "middle_click",
      name: "Pulsante Centrale",
      desc: "Pressione verticale della rotellina",
      icon: MousePointer,
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header & Presets Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">
            Rimappatura Gesti & Pulsanti
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configura le azioni inviate al sistema per ogni gesto del mouse.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <select
            value={selectedPreset}
            onChange={(e) => setSelectedPreset(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#151821] border border-white/[0.08] text-xs text-slate-200 focus:outline-none focus:border-[#0078d4]"
          >
            <option value="desktop_navigation">Navigazione Desktop (Workspaces)</option>
            <option value="productivity">Produttività (Copia, Incolla, Ricerca)</option>
            <option value="multimedia">Controllo Multimediale (Volume, Tracce)</option>
            <option value="browser">Navigazione Web (Schede & Cronologia)</option>
          </select>

          <button
            onClick={handleApplyPresetClick}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
              presetSuccess
                ? "bg-emerald-600 text-white"
                : "bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 border border-white/[0.08]"
            }`}
          >
            {presetSuccess ? <Check className="w-3.5 h-3.5" /> : null}
            {presetSuccess ? "Applicato" : "Applica"}
          </button>
        </div>
      </div>

      {/* Group 1: Touch Strip Gestures */}
      <div className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
          Touch Strip Laterale Windows (Striscia Blu)
        </h2>

        <div className="desktop-card overflow-hidden divide-y divide-white/[0.04]">
          {stripTriggers.map((t) => {
            const Icon = t.icon;
            const action = activeMappings[t.id];
            const isKeyCombo = action?.type === "key_combo";
            const displayName = action?.name || action?.value || "Nessuna azione";

            return (
              <div
                key={t.id}
                onClick={() => setSelectedTrigger({ id: t.id, name: t.name })}
                className="px-4 py-3.5 flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-md bg-[#161a24] border border-white/[0.06] flex items-center justify-center text-[#70b4ff]">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-medium text-slate-200 group-hover:text-white transition-colors">
                      {t.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">{t.desc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {isKeyCombo ? (
                    <KeyComboBadge combo={action.value} />
                  ) : (
                    <span className="text-xs font-mono text-slate-300 px-2 py-0.5 rounded bg-white/[0.05]">
                      {displayName}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Group 2: Wheel & Mouse Buttons */}
      <div className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
          Rotellina a 4 Vie & Pulsanti Mouse
        </h2>

        <div className="desktop-card overflow-hidden divide-y divide-white/[0.04]">
          {wheelTriggers.map((t) => {
            const Icon = t.icon;
            const action = activeMappings[t.id];
            const isKeyCombo = action?.type === "key_combo";
            const displayName = action?.name || action?.value || "Standard";

            return (
              <div
                key={t.id}
                onClick={() => setSelectedTrigger({ id: t.id, name: t.name })}
                className="px-4 py-3.5 flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-md bg-[#161a24] border border-white/[0.06] flex items-center justify-center text-slate-400">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-medium text-slate-200 group-hover:text-white transition-colors">
                      {t.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">{t.desc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {isKeyCombo ? (
                    <KeyComboBadge combo={action.value} />
                  ) : (
                    <span className="text-xs font-mono text-slate-300 px-2 py-0.5 rounded bg-white/[0.05]">
                      {displayName}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action configuration sheet */}
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
