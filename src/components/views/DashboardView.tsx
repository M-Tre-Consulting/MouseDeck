import React, { useState } from "react";
import { BluetoothDeviceInfo } from "../../types";
import { MouseDiagram } from "../MouseDiagram";
import {
  RefreshCw,
  Radio,
  Sparkles,
  ExternalLink,
  Battery,
} from "lucide-react";
import { invoke } from "@tauri-apps/api/core";

interface DashboardViewProps {
  device: BluetoothDeviceInfo | null;
  activeProfile: string;
  onNavigateToRemap: () => void;
  onRefreshBluetooth: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  device,
  activeProfile,
  onNavigateToRemap,
  onRefreshBluetooth,
}) => {
  const isConnected = device?.connected ?? false;
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [reconMsg, setReconMsg] = useState<string | null>(null);

  const handleReconnect = async () => {
    if (!device?.address) return;
    setIsReconnecting(true);
    setReconMsg(null);
    try {
      await invoke("reconnect_bluetooth", { address: device.address });
      setReconMsg("Comando di riconnessione inviato.");
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
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold text-white tracking-tight">
              {device?.alias || device?.name || "Microsoft Sculpt Comfort Mouse"}
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#0078d4]/15 text-[#70b4ff] border border-[#0078d4]/25">
              Profilo Attivo
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            MouseDeck Hardware Engine • Vendor {device?.vendor_id || "045E"} • Product {device?.product_id || "07A2"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReconnect}
            disabled={isReconnecting || !device}
            className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.09] text-slate-300 text-xs font-medium border border-white/[0.08] transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isReconnecting ? "animate-spin" : ""}`} />
            Riconnetti
          </button>
          <button
            onClick={onNavigateToRemap}
            className="px-3 py-1.5 rounded-lg bg-[#0078d4] hover:bg-[#1084d8] text-white text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs"
          >
            Configura Gesti
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {reconMsg && (
        <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
          {reconMsg}
        </div>
      )}

      {/* Main Split: Vector Preview on left, Specs on right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        {/* Left Column: Minimal Vector Mouse */}
        <div className="md:col-span-4 desktop-card p-5 flex flex-col items-center justify-center text-center">
          <MouseDiagram width={190} height={250} />
          <div className="mt-3">
            <span className="text-xs font-semibold text-slate-300 block">
              Modulo Dispositivo
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Microsoft Sculpt Comfort (evdev grab)
            </span>
          </div>
        </div>

        {/* Right Column: Clean Telemetry Grouped Rows */}
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
                {isConnected ? "Connesso" : "Disconnesso"}
              </span>
            </div>

            <div className="divide-y divide-white/[0.04] text-xs">
              <div className="px-4 py-3 flex items-center justify-between">
                <span className="text-slate-400">Indirizzo MAC Bluetooth</span>
                <span className="font-mono text-slate-200">
                  {device?.address || "30:59:B7:79:CE:4C"}
                </span>
              </div>

              <div className="px-4 py-3 flex items-center justify-between">
                <span className="text-slate-400">Controller Host</span>
                <span className="font-mono text-slate-200">
                  {device?.adapter || "hci0"}
                </span>
              </div>

              <div className="px-4 py-3 flex items-center justify-between">
                <span className="text-slate-400">Livello Batteria</span>
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
                      {device?.battery_status_text || "2x Batterie AA (BT 3.0 Classic)"}
                    </span>
                  )}
                </div>
              </div>

              <div className="px-4 py-3 flex items-center justify-between">
                <span className="text-slate-400">Sensore Ottico</span>
                <span className="text-slate-200">
                  Microsoft BlueTrack (1000 DPI)
                </span>
              </div>

              <div className="px-4 py-3 flex items-center justify-between">
                <span className="text-slate-400">Profilo Mappatura Attivo</span>
                <span className="font-medium text-[#70b4ff]">
                  {activeProfile}
                </span>
              </div>
            </div>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1">
              <div className="flex items-center gap-1.5 text-slate-200 font-medium">
                <Radio className="w-3.5 h-3.5 text-[#0078d4]" />
                Windows Touch Strip
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Rileva scorrimenti verso l'alto (Swipe Up), verso il basso (Swipe Down) e click singolo.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1">
              <div className="flex items-center gap-1.5 text-slate-200 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-[#0078d4]" />
                Rotellina a 4 Vie
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Supporta inclinazione orizzontale (tilt a sinistra e destra) più click centrale standard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
