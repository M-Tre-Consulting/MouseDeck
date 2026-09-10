import React, { useState, useEffect } from "react";
import { MouseDiagram } from "../MouseDiagram";
import { KeyComboBadge } from "../Keycap";
import { GestureEventPayload } from "../../types";
import { Trash2, ArrowUp, ArrowDown, Sparkles, Crosshair, ArrowLeft, ArrowRight, MousePointer, Sliders } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";

interface LiveTestViewProps {
  lastEvent: GestureEventPayload | null;
  history: GestureEventPayload[];
  onClearHistory: () => void;
  activeDriver?: string;
}

export const LiveTestView: React.FC<LiveTestViewProps> = ({
  lastEvent,
  history,
  onClearHistory,
  activeDriver = "logitech_g502_x",
}) => {
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null);
  const isG502 = activeDriver === "logitech_g502_x" || (lastEvent && lastEvent.trigger_id.startsWith("g"));

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
      case "g4_back":
        return "Tasto Indietro (G4)";
      case "g5_forward":
        return "Tasto Avanti (G5)";
      case "g6_sniper":
        return "Tasto Sniper / DPI Shift (G6)";
      case "g7_dpi_down":
        return "Tasto DPI Giù (G7)";
      case "g8_dpi_up":
        return "Tasto DPI Su (G8)";
      case "g9_profile":
        return "Tasto Profilo (G9)";
      case "swipe_up":
        return "Swipe Up (Scorri in Alto)";
      case "swipe_down":
        return "Swipe Down (Scorri in Basso)";
      case "windows_click":
        return "Pulsante Windows (Click/Tap)";
      case "tilt_left":
        return "Inclinazione Sinistra (Tilt Left)";
      case "tilt_right":
        return "Inclinazione Destra (Tilt Right)";
      case "middle_click":
        return "Click Rotellina Centrale";
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
          {isG502
            ? "Premi i tasti programmabili del tuo Logitech G502 X per vederli catturati istantaneamente dal motore Rust."
            : "Esegui gesti sulla touch strip per vederli catturati istantaneamente dal motore Rust."}
        </p>
      </div>

      {/* Split layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* Left: Vector Mouse */}
        <div className="md:col-span-5 desktop-card p-6 flex flex-col items-center justify-center">
          <MouseDiagram
            activeTrigger={activeHighlight}
            driverId={isG502 ? "logitech_g502_x" : "microsoft_sculpt_comfort"}
            width={220}
            height={290}
          />
          <p className="text-[11px] text-slate-500 text-center mt-3">
            {isG502
              ? "I tasti G6, G4, G5, G7, G8, G9 e la rotellina si illuminano all'attivazione."
              : "La touch strip blu e la rotellina si illuminano all'attivazione."}
          </p>
        </div>

        {/* Right: Live Monitor & Event Stream */}
        <div className="md:col-span-7 space-y-4">
          {/* Last event card */}
          <div className="desktop-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Ultimo Evento Rilevato
              </span>
              {lastEvent && (
                <span className="text-[11px] font-mono text-cyan-400">
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
                  <span className="text-xs text-slate-400">Azione eseguita:</span>
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
                {isG502
                  ? "In attesa di eventi hardware. Prova a premere il tasto Sniper o i tasti laterali."
                  : "Nessun gesto ricevuto. Prova a scorrere il pollice sulla touch strip."}
              </div>
            )}
          </div>

          {/* Test Simulation Buttons */}
          <div className="desktop-card p-3.5 space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 block">
              Simulazione Software:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {isG502 ? (
                <>
                  <button
                    onClick={() => handleSimulate("g6_sniper")}
                    className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-medium border border-white/[0.06] transition-colors flex items-center gap-1.5"
                  >
                    <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                    Sniper (G6)
                  </button>
                  <button
                    onClick={() => handleSimulate("g4_back")}
                    className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-medium border border-white/[0.06] transition-colors flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
                    Indietro (G4)
                  </button>
                  <button
                    onClick={() => handleSimulate("g5_forward")}
                    className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-medium border border-white/[0.06] transition-colors flex items-center gap-1.5"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                    Avanti (G5)
                  </button>
                  <button
                    onClick={() => handleSimulate("g8_dpi_up")}
                    className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-medium border border-white/[0.06] transition-colors flex items-center gap-1.5"
                  >
                    <ArrowUp className="w-3.5 h-3.5 text-cyan-400" />
                    DPI Su (G8)
                  </button>
                  <button
                    onClick={() => handleSimulate("g7_dpi_down")}
                    className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-medium border border-white/[0.06] transition-colors flex items-center gap-1.5"
                  >
                    <ArrowDown className="w-3.5 h-3.5 text-cyan-400" />
                    DPI Giù (G7)
                  </button>
                  <button
                    onClick={() => handleSimulate("g9_profile")}
                    className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-medium border border-white/[0.06] transition-colors flex items-center gap-1.5"
                  >
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                    Profilo (G9)
                  </button>
                </>
              ) : (
                <>
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
                </>
              )}

              <button
                onClick={() => handleSimulate("tilt_left")}
                className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-medium border border-white/[0.06] transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
                Tilt Left
              </button>
              <button
                onClick={() => handleSimulate("tilt_right")}
                className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-medium border border-white/[0.06] transition-colors flex items-center gap-1.5"
              >
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                Tilt Right
              </button>
              <button
                onClick={() => handleSimulate("middle_click")}
                className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-medium border border-white/[0.06] transition-colors flex items-center gap-1.5"
              >
                <MousePointer className="w-3.5 h-3.5 text-slate-400" />
                Click Centrale
              </button>
            </div>
          </div>

          {/* Event Stream Log */}
          <div className="desktop-card overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.06] bg-white/[0.02] flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Log Eventi in Tempo Reale ({history.length})
              </span>
              {history.length > 0 && (
                <button
                  onClick={onClearHistory}
                  className="text-[11px] text-slate-500 hover:text-rose-400 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Svuota
                </button>
              )}
            </div>

            <div className="max-h-64 overflow-y-auto divide-y divide-white/[0.03]">
              {history.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  La cronologia degli eventi apparirà qui man mano che utilizzi il mouse.
                </div>
              ) : (
                history.map((ev, idx) => (
                  <div
                    key={idx}
                    className="px-4 py-2.5 flex items-center justify-between hover:bg-white/[0.01] transition-colors text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-[10px] text-slate-500">
                        {ev.timestamp}
                      </span>
                      <span className="font-medium text-slate-200">
                        {getGestureTitle(ev.trigger_id)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">
                        {ev.action_name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-300">
                        {ev.action_value}
                      </span>
                    </div>
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
