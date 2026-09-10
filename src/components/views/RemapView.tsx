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
  Crosshair,
  Sliders,
} from "lucide-react";

interface RemapViewProps {
  config: AppConfig;
  onSaveAction: (triggerId: string, action: ActionConfig) => void;
  onApplyPreset: (presetKey: string) => void;
  onChangeDriver?: (driverId: string) => void;
}

export const RemapView: React.FC<RemapViewProps> = ({
  config,
  onSaveAction,
  onApplyPreset,
  onChangeDriver,
}) => {
  const isG502 = config.active_driver === "logitech_g502_x";

  const [selectedTrigger, setSelectedTrigger] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [selectedPreset, setSelectedPreset] = useState(
    isG502 ? "gaming" : "desktop_navigation"
  );
  const [presetSuccess, setPresetSuccess] = useState(false);

  const activeMappings = config.profiles[config.active_profile] || {};

  const handleApplyPresetClick = () => {
    onApplyPreset(selectedPreset);
    setPresetSuccess(true);
    setTimeout(() => setPresetSuccess(false), 2000);
  };

  // Triggers for Logitech G502 X
  const g502ThumbTriggers = [
    {
      id: "g6_sniper",
      name: "Tasto Sniper (G6 - DPI Shift)",
      desc: "Pulsante frontale a paletta sul poggia-pollice",
      icon: Crosshair,
    },
    {
      id: "g4_back",
      name: "Pulsante Laterale Indietro (G4)",
      desc: "Tasto pollice inferiore (default: Indietro nel browser)",
      icon: ArrowLeft,
    },
    {
      id: "g5_forward",
      name: "Pulsante Laterale Avanti (G5)",
      desc: "Tasto pollice superiore (default: Avanti nel browser)",
      icon: ArrowRight,
    },
  ];

  const g502IndexTriggers = [
    {
      id: "g8_dpi_up",
      name: "Pulsante Indice Superiore (G8)",
      desc: "Tasto affiancato al click sinistro in alto (DPI Su / Volume)",
      icon: ArrowUp,
    },
    {
      id: "g7_dpi_down",
      name: "Pulsante Indice Inferiore (G7)",
      desc: "Tasto affiancato al click sinistro in basso (DPI Giù / Volume)",
      icon: ArrowDown,
    },
    {
      id: "g9_profile",
      name: "Pulsante Profilo / Extra (G9)",
      desc: "Tasto centrale dietro la levetta di sblocco rotellina",
      icon: Sliders,
    },
  ];

  // Triggers for Microsoft Sculpt Comfort
  const sculptStripTriggers = [
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
      name: "Pulsante Rotellina Centrale",
      desc: "Pressione verticale della rotellina (Click 3)",
      icon: MousePointer,
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-white tracking-tight">
              Rimappatura Tasti & Gesti
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              {isG502 ? "Logitech G502 X" : "Sculpt Comfort"}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Clicca su qualsiasi tasto per riconfigurarlo. Le modifiche vengono intercettate ed eseguite a livello hardware istantaneamente.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onChangeDriver && (
            <select
              value={config.active_driver}
              onChange={(e) => onChangeDriver(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-[#151821] border border-white/[0.08] text-[11px] text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="logitech_g502_x">Modulo G502 X Lightspeed</option>
              <option value="microsoft_sculpt_comfort">Modulo Sculpt Comfort</option>
            </select>
          )}

          <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            Hardware Sincronizzato
          </div>
        </div>
      </div>

      {isG502 ? (
        <>
          {/* G502 Group 1: Thumb cluster */}
          <div className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1 flex items-center justify-between">
              <span>Cluster Pollice (Sniper & Tasti Laterali)</span>
              <span className="text-[10px] text-cyan-400 font-mono">G6 • G4 • G5</span>
            </h2>

            <div className="desktop-card overflow-hidden divide-y divide-white/[0.04]">
              {g502ThumbTriggers.map((t) => {
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
                      <div className="w-7 h-7 rounded-md bg-[#161a24] border border-white/[0.06] flex items-center justify-center text-cyan-400">
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

          {/* G502 Group 2: Index Wing & Profile Buttons */}
          <div className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1 flex items-center justify-between">
              <span>Tasti Ala Indice & Switch Profilo</span>
              <span className="text-[10px] text-cyan-400 font-mono">G8 • G7 • G9</span>
            </h2>

            <div className="desktop-card overflow-hidden divide-y divide-white/[0.04]">
              {g502IndexTriggers.map((t) => {
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
                      <div className="w-7 h-7 rounded-md bg-[#161a24] border border-white/[0.06] flex items-center justify-center text-cyan-400">
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
        </>
      ) : (
        /* Sculpt Comfort: Touch Strip Group */
        <div className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
            Touch Strip Laterale Windows (Striscia Blu)
          </h2>

          <div className="desktop-card overflow-hidden divide-y divide-white/[0.04]">
            {sculptStripTriggers.map((t) => {
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
      )}

      {/* Common: Rotellina a 4 Vie (Tilt & Click) */}
      <div className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1 flex items-center justify-between">
          <span>Rotellina Dual-Mode & Inclinazione a 4 Vie</span>
          <span className="text-[10px] text-slate-500 font-mono">Tilt L • Tilt R • Click</span>
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

      {/* Preset configurations */}
      <div className="space-y-2 pt-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
          Profili Predefiniti & Preset Rapidi
        </h2>

        <div className="desktop-card p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
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
                  Scegli un profilo tematico pronto all'uso per rimappare automaticamente tutti i tasti del mouse in un colpo solo.
                  <span className="text-amber-400/80 block mt-0.5">
                    Nota: il caricamento di un preset sovrascrive le assegnazioni attuali del profilo attivo.
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <select
                value={selectedPreset}
                onChange={(e) => setSelectedPreset(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-[#151821] border border-white/[0.08] text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {isG502 ? (
                  <>
                    <option value="gaming">Gaming FPS / MOBA (Sniper, Melee, Ping)</option>
                    <option value="productivity">Produttività (Copia, Incolla, Launcher)</option>
                    <option value="multimedia">Controllo Multimediale (Volume, Mute, Tracce)</option>
                    <option value="browser">Navigazione Web (Schede, Zoom, Cronologia)</option>
                  </>
                ) : (
                  <>
                    <option value="desktop_navigation">Navigazione Desktop (Workspaces)</option>
                    <option value="productivity">Produttività (Copia, Incolla, Ricerca)</option>
                    <option value="multimedia">Controllo Multimediale (Volume, Tracce)</option>
                    <option value="browser">Navigazione Web (Schede & Cronologia)</option>
                  </>
                )}
              </select>

              <button
                onClick={handleApplyPresetClick}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs ${
                  presetSuccess
                    ? "bg-emerald-600 text-white"
                    : "bg-cyan-600 hover:bg-cyan-500 text-white"
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

