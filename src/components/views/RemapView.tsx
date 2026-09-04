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
  Layers,
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
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">
            Rimappatura Gesti & Pulsanti
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Clicca su un gesto per modificarlo. Le modifiche vengono salvate ed applicate all'hardware istantaneamente.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            Hardware Sincronizzato
          </div>
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

      {/* Group 3: Optional Predefined Presets */}
      <div className="space-y-2 pt-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
          Profili Predefiniti & Preset Rapidi
        </h2>

        <div className="desktop-card p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#0078d4]/10 border border-[#0078d4]/20 flex items-center justify-center text-[#70b4ff] shrink-0 mt-0.5">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-200">
                    Carica una Configurazione Rapida
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/[0.05] text-slate-300 border border-white/[0.06]">
                    Profilo Attuale: {config.active_profile}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Scegli un profilo tematico pronto all'uso per rimappare automaticamente tutti i gesti in un colpo solo.
                  <span className="text-amber-400/80 block mt-0.5">
                    Nota: il caricamento di un preset sovrascrive le assegnazioni attuali.
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
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
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs ${
                  presetSuccess
                    ? "bg-emerald-600 text-white"
                    : "bg-[#0078d4] hover:bg-[#1084d8] text-white"
                }`}
              >
                {presetSuccess ? <Check className="w-3.5 h-3.5" /> : null}
                {presetSuccess ? "Preset Caricato!" : "Carica Preset"}
              </button>
            </div>
          </div>
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
