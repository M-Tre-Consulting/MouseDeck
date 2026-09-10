import React, { useState } from "react";
import { BluetoothDeviceInfo } from "../../types";
import { MouseDiagram } from "../MouseDiagram";
import {
  RefreshCw,
  Sparkles,
  ExternalLink,
  Battery,
  Zap,
  Target,
  Layers,
} from "lucide-react";
import { invoke } from "@tauri-apps/api/core";

interface DashboardViewProps {
  device: BluetoothDeviceInfo | null;
  activeProfile: string;
  activeDriver?: string;
  onNavigateToRemap: () => void;
  onRefreshBluetooth: () => void;
  onSelectDriver?: (driverId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  device,
  activeProfile,
  activeDriver = "logitech_g502_x",
  onNavigateToRemap,
  onRefreshBluetooth,
  onSelectDriver,
}) => {
  const isConnected = device?.connected ?? false;
  const isG502 = device?.is_g502_x || activeDriver === "logitech_g502_x";

  const [isReconnecting, setIsReconnecting] = useState(false);
  const [reconMsg, setReconMsg] = useState<string | null>(null);

  const handleReconnect = async () => {
    if (!device?.address) return;
    setIsReconnecting(true);
    setReconMsg(null);
    try {
      await invoke("reconnect_bluetooth", { address: device.address });
      setReconMsg(isG502 ? "Sottosistema input ricaricato." : "Comando di riconnessione inviato.");
      setTimeout(() => onRefreshBluetooth(), 1000);
    } catch (e) {
      setReconMsg(`Errore: ${e}`);
    } finally {
      setIsReconnecting(false);
      setTimeout(() => setReconMsg(null), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold text-white tracking-tight">
              {device?.alias || device?.name || (isG502 ? "Logitech G502 X Lightspeed" : "Microsoft Sculpt Comfort Mouse")}
            </h1>
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
              isG502
                ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/25"
                : "bg-[#0078d4]/15 text-[#70b4ff] border-[#0078d4]/25"
            }`}>
              {isG502 ? "Driver G502 X Attivo" : "Driver Sculpt Attivo"}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            MouseDeck Hardware Engine • Vendor {device?.vendor_id || (isG502 ? "046D" : "045E")} • Product {device?.product_id || (isG502 ? "C547" : "07A2")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onSelectDriver && (
            <select
              value={activeDriver}
              onChange={(e) => onSelectDriver(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="logitech_g502_x">Logitech G502 X Lightspeed</option>
              <option value="microsoft_sculpt_comfort">Microsoft Sculpt Comfort</option>
            </select>
          )}

          <button
            onClick={handleReconnect}
            disabled={isReconnecting || !device}
            className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.09] text-slate-300 text-xs font-medium border border-white/[0.08] transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isReconnecting ? "animate-spin" : ""}`} />
            Ricarica
          </button>
          <button
            onClick={onNavigateToRemap}
            className={`px-3 py-1.5 rounded-lg text-white text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs ${
              isG502
                ? "bg-cyan-600 hover:bg-cyan-500"
                : "bg-[#0078d4] hover:bg-[#1084d8]"
            }`}
          >
            Configura Tasti
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {reconMsg && (
        <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300">
          {reconMsg}
        </div>
      )}

      {/* Main Split: Vector Preview on left, Specs on right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        {/* Left Column: Vector Mouse Diagram */}
        <div className="md:col-span-4 desktop-card p-5 flex flex-col items-center justify-center text-center">
          <MouseDiagram
            driverId={isG502 ? "logitech_g502_x" : "microsoft_sculpt_comfort"}
            width={200}
            height={260}
          />
          <div className="mt-3">
            <span className="text-xs font-semibold text-slate-300 block">
              {isG502 ? "Logitech G502 X Lightspeed" : "Microsoft Sculpt Comfort"}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              {isG502 ? "evdev kernel grab • sub-millisecond" : "evdev grab • tastiera virtuale"}
            </span>
          </div>
        </div>

        {/* Right Column: Telemetry Grouped Rows */}
        <div className="md:col-span-8 space-y-4">
          <div className="desktop-card overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.06] bg-white/[0.02] flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Stato Hardware & Connessione
              </span>
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                  isConnected ? "text-emerald-400" : "text-slate-500"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isConnected ? "bg-emerald-400 shadow-[0_0_6px_#34d399]" : "bg-slate-600"
                  }`}
                />
                {isConnected ? "Dispositivo Attivo" : "In Attesa"}
              </span>
            </div>

            <div className="divide-y divide-white/[0.04] text-xs">
              <div className="px-4 py-3 flex items-center justify-between">
                <span className="text-slate-400">
                  {isG502 ? "Seriale / Identificativo Hardware" : "Indirizzo MAC Bluetooth"}
                </span>
                <span className="font-mono text-slate-200">
                  {device?.address || (isG502 ? "LIGHTSPEED-WIRELESS" : "30:59:B7:79:CE:4C")}
                </span>
              </div>

              <div className="px-4 py-3 flex items-center justify-between">
                <span className="text-slate-400">Interfaccia di Comunicazione</span>
                <span className="font-mono text-slate-200">
                  {device?.adapter || (isG502 ? "LIGHTSPEED Wireless 2.4GHz" : "hci0")}
                </span>
              </div>

              <div className="px-4 py-3 flex items-center justify-between">
                <span className="text-slate-400">Autonomia / Livello Batteria</span>
                <div className="flex items-center gap-2.5">
                  <Battery
                    className={`w-4 h-4 ${
                      device?.battery_percentage != null
                        ? device.battery_percentage > 20
                          ? "text-emerald-400"
                          : "text-amber-400"
                        : "text-slate-400"
                    }`}
                  />
                  {device?.battery_percentage != null ? (
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-white/[0.08] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            device.battery_percentage > 20 ? "bg-emerald-400" : "bg-amber-400"
                          }`}
                          style={{
                            width: `${Math.min(100, Math.max(0, device.battery_percentage))}%`,
                          }}
                        />
                      </div>
                      <span className="font-mono text-xs font-semibold text-slate-200">
                        {device.battery_percentage}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-300 text-xs">
                      {device?.battery_status_text || (isG502 ? "Batteria LIGHTSPEED" : "2x Batterie AA")}
                    </span>
                  )}
                </div>
              </div>

              <div className="px-4 py-3 flex items-center justify-between">
                <span className="text-slate-400">Sensore Ottico</span>
                <span className="text-slate-200 font-medium">
                  {isG502 ? "Logitech HERO 25K (100 – 25.600 DPI)" : "Microsoft BlueTrack (1000 DPI)"}
                </span>
              </div>

              <div className="px-4 py-3 flex items-center justify-between">
                <span className="text-slate-400">Switch Principali</span>
                <span className="text-slate-200">
                  {isG502 ? "Lightforce Ibridi Ottico-Meccanici" : "Microswitch Standard"}
                </span>
              </div>

              <div className="px-4 py-3 flex items-center justify-between">
                <span className="text-slate-400">Profilo Mappatura Attivo</span>
                <span className="font-medium text-cyan-400">
                  {activeProfile}
                </span>
              </div>
            </div>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1">
              <div className="flex items-center gap-1.5 text-slate-200 font-medium">
                {isG502 ? <Target className="w-3.5 h-3.5 text-cyan-400" /> : <Zap className="w-3.5 h-3.5 text-[#0078d4]" />}
                {isG502 ? "Tasto Sniper & Tasti Macro" : "Windows Touch Strip"}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {isG502
                  ? "Tasto DPI Shift G6 (pollice), tasti laterali G4/G5, tasti indice G7/G8 e tasto profilo G9 programmabili."
                  : "Rileva scorrimenti verso l'alto (Swipe Up), verso il basso (Swipe Down) e click singolo."}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1">
              <div className="flex items-center gap-1.5 text-slate-200 font-medium">
                {isG502 ? <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> : <Layers className="w-3.5 h-3.5 text-[#0078d4]" />}
                Rotellina a 4 Vie (Dual-Mode)
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {isG502
                  ? "Rotellina metallica iper-veloce con scatto o corsa libera, doppio tilt orizzontale L/R e click centrale."
                  : "Supporta inclinazione orizzontale (tilt a sinistra e destra) più click centrale standard."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
