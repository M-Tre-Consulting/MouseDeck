import React, { useState, useEffect } from "react";
import { MouseDiagram } from "../MouseDiagram";
import { GestureEventPayload } from "../../types";
import { Sparkles, Trash2, ArrowUp, ArrowDown, Radio, Activity } from "lucide-react";
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

  // When a new hardware event arrives, highlight it
  useEffect(() => {
    if (lastEvent) {
      setActiveHighlight(lastEvent.trigger_id);
      const timer = setTimeout(() => {
        setActiveHighlight(null);
      }, 700);
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
    }, 700);
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
        return "Inclinazione Sinistra (Tilt Left)";
      case "tilt_right":
        return "Inclinazione Destra (Tilt Right)";
      case "middle_click":
        return "Click Rotellina (Middle Click)";
      default:
        return id;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* 1. Instruction Banner */}
      <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
          <Activity className="w-5 h-5 animate-pulse" />
        </div>
        <p className="text-xs text-cyan-200/90 leading-relaxed">
          <span className="font-semibold text-white">Modalità Test Interattivo:</span> Esegui gesti con il pollice sulla touch strip blu del tuo Microsoft Sculpt Comfort Mouse. Il diagramma vettoriale si illuminerà all'istante mostrando l'azione scatenata nel sistema.
        </p>
      </div>

      {/* 2. Split Area: Vector Diagram on Left, Live Telemetry on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Vector Mouse Graphic */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center shadow-xl min-h-[420px]">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            Visualizzatore Hardware in Tempo Reale
          </span>

          <MouseDiagram activeTrigger={activeHighlight} width={270} height={350} />

          <p className="text-[11px] text-slate-500 text-center mt-2">
            La striscia laterale blu sul lato sinistro rileva sfioramenti verticali e click.
          </p>
        </div>

        {/* Right Column: Live readout & simulator */}
        <div className="lg:col-span-7 space-y-4">
          {/* Big Readout Card */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Ultimo Input Ricevuto
              </span>
              {lastEvent && (
                <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                  {lastEvent.timestamp}
                </span>
              )}
            </div>

            {lastEvent ? (
              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  {getGestureTitle(lastEvent.trigger_id)}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-slate-400">Azione eseguita:</span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 font-mono text-xs font-semibold border border-cyan-500/30">
                    {lastEvent.action_name || lastEvent.action_value} ({lastEvent.action_type})
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-4 text-slate-500 text-sm italic">
                In attesa di eventi dalla touch strip del mouse...
              </div>
            )}
          </div>

          {/* Simulator buttons */}
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2.5">
            <span className="text-xs font-medium text-slate-400 block">
              Simula Gesti (Test Software):
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleSimulate("swipe_up")}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow"
              >
                <ArrowUp className="w-3.5 h-3.5 text-cyan-400" />
                ↑ Swipe Up
              </button>
              <button
                onClick={() => handleSimulate("swipe_down")}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow"
              >
                <ArrowDown className="w-3.5 h-3.5 text-blue-400" />
                ↓ Swipe Down
              </button>
              <button
                onClick={() => handleSimulate("windows_click")}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                ⊞ Windows Click
              </button>
              <button
                onClick={() => handleSimulate("tilt_left")}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow"
              >
                ← Tilt Left
              </button>
              <button
                onClick={() => handleSimulate("tilt_right")}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow"
              >
                → Tilt Right
              </button>
            </div>
          </div>

          {/* Event Stream History */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Flusso Cronologico Eventi
              </span>
              {history.length > 0 && (
                <button
                  onClick={onClearHistory}
                  className="text-xs text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Pulisci
                </button>
              )}
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {history.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">
                  Nessun evento registrato nella sessione.
                </p>
              ) : (
                history.map((ev, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#38bdf8]" />
                      <span className="font-semibold text-white">
                        {getGestureTitle(ev.trigger_id)}
                      </span>
                      <span className="text-slate-400">➔</span>
                      <span className="text-cyan-300 font-mono">
                        {ev.action_name || ev.action_value}
                      </span>
                    </div>
                    <span className="text-slate-500 font-mono text-[11px]">
                      {ev.timestamp}
                    </span>
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
