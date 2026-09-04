import React, { useState, useEffect } from "react";
import { MouseDiagram } from "../MouseDiagram";
import { KeyComboBadge } from "../Keycap";
import { GestureEventPayload } from "../../types";
import { Trash2, ArrowUp, ArrowDown, Sparkles, Terminal } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";

interface LiveTestViewProps {
  lastEvent: GestureEventPayload | null;
  history: GestureEventPayload[];
  onClearHistory: () => void;
}

export const LiveTestView: React.FC<LiveTestViewProps> = ({
  lastEvent,
  history,
  onClearHistory,
}) => {
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null);

  useEffect(() => {
    if (lastEvent) {
      setActiveHighlight(lastEvent.trigger_id);
      const timer = setTimeout(() => {
        setActiveHighlight(null);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [lastEvent]);

  const handleSimulate = async (triggerId: string) => {
    setActiveHighlight(triggerId);
    try {
      await invoke("simulate_gesture", { triggerId });
    } catch (e) {
      console.error(e);
    }
    setTimeout(() => {
      setActiveHighlight(null);
    }, 600);
  };

  const getGestureTitle = (id: string) => {
    switch (id) {
      case "swipe_up":
        return "Swipe Up (Scorri in Alto)";
      case "swipe_down":
        return "Swipe Down (Scorri in Basso)";
      case "windows_click":
        return "Pulsante Windows (Click/Tap)";
      case "tilt_left":
        return "Inclinazione Sinistra";
      case "tilt_right":
        return "Inclinazione Destra";
      case "middle_click":
        return "Click Rotellina";
      default:
        return id;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div>
        <h1 className="text-xl font-semibold text-white tracking-tight">
          Test in Tempo Reale
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Esegui gesti sulla touch strip per vederli catturati istantaneamente dal motore Rust.
        </p>
      </div>

      {/* Split layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* Left: Vector Mouse */}
        <div className="md:col-span-5 desktop-card p-6 flex flex-col items-center justify-center">
          <MouseDiagram activeTrigger={activeHighlight} width={220} height={290} />
          <p className="text-[11px] text-slate-500 text-center mt-3">
            La touch strip blu e la rotellina si illuminano all'attivazione.
          </p>
        </div>

        {/* Right: Live Monitor & Event Stream */}
        <div className="md:col-span-7 space-y-4">
          {/* Last event card */}
          <div className="desktop-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Ultimo Gesto Rilevato
              </span>
              {lastEvent && (
                <span className="text-[11px] font-mono text-slate-400">
                  {lastEvent.timestamp}
                </span>
              )}
            </div>

            {lastEvent ? (
              <div className="space-y-2">
                <div className="text-base font-semibold text-white">
                  {getGestureTitle(lastEvent.trigger_id)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Azione simulata:</span>
                  {lastEvent.action_type === "key_combo" ? (
                    <KeyComboBadge combo={lastEvent.action_value} />
                  ) : (
                    <span className="text-xs font-mono text-slate-300 px-2 py-0.5 rounded bg-white/[0.05]">
                      {lastEvent.action_name || lastEvent.action_value}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-2 text-xs text-slate-500 italic">
                Nessun gesto ricevuto. Prova a scorrere il pollice sulla touch strip.
              </div>
            )}
          </div>

          {/* Test Buttons */}
          <div className="desktop-card p-3.5 space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 block">
              Simulazione Software:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => handleSimulate("swipe_up")}
                className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-medium border border-white/[0.06] transition-colors flex items-center gap-1.5"
              >
                <ArrowUp className="w-3.5 h-3.5 text-[#0078d4]" />
                Swipe Up
              </button>
              <button
                onClick={() => handleSimulate("swipe_down")}
                className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-medium border border-white/[0.06] transition-colors flex items-center gap-1.5"
              >
                <ArrowDown className="w-3.5 h-3.5 text-[#0078d4]" />
                Swipe Down
              </button>
              <button
                onClick={() => handleSimulate("windows_click")}
                className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-medium border border-white/[0.06] transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Windows Click
              </button>
              <button
                onClick={() => handleSimulate("tilt_left")}
                className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-medium border border-white/[0.06] transition-colors"
              >
                Tilt Left
              </button>
              <button
                onClick={() => handleSimulate("tilt_right")}
                className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-medium border border-white/[0.06] transition-colors"
              >
                Tilt Right
              </button>
            </div>
          </div>

          {/* Event Stream Log */}
          <div className="desktop-card overflow-hidden">
            <div className="px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02] flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                Registro Eventi
              </span>
              {history.length > 0 && (
                <button
                  onClick={onClearHistory}
                  className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Svuota
                </button>
              )}
            </div>

            <div className="max-h-48 overflow-y-auto divide-y divide-white/[0.03] text-xs font-mono">
              {history.length === 0 ? (
                <div className="p-4 text-slate-500 italic text-center">
                  Nessun evento registrato nella sessione.
                </div>
              ) : (
                history.map((ev, idx) => (
                  <div key={idx} className="px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0078d4]" />
                      <span className="text-slate-300 font-sans font-medium">
                        {getGestureTitle(ev.trigger_id)}
                      </span>
                      <span className="text-slate-600">➔</span>
                      <span className="text-slate-200">
                        {ev.action_name || ev.action_value}
                      </span>
                    </div>
                    <span className="text-slate-500 text-[11px]">{ev.timestamp}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
