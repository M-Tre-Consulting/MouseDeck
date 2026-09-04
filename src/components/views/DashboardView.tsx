import React, { useState } from "react";
import { BluetoothDeviceInfo } from "../../types";
import {
  Mouse,
  Battery,
  Sliders,
  RefreshCw,
  Cpu,
  Info,
  ExternalLink,
  ShieldCheck,
  Radio,
  Sparkles,
} from "lucide-react";
import { invoke } from "@tauri-apps/api/core";

interface DashboardViewProps {
  device: BluetoothDeviceInfo | null;
  enabled: boolean;
  activeProfile: string;
  onNavigateToRemap: () => void;
  onRefreshBluetooth: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  device,
  enabled,
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
      setReconMsg("Comando di riconnessione inviato!");
      setTimeout(() => onRefreshBluetooth(), 1000);
    } catch (e) {
      setReconMsg(`Errore riconnessione: ${e}`);
    } finally {
      setIsReconnecting(false);
      setTimeout(() => setReconMsg(null), 4000);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* 1. Hero Card: Device Overview */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-7 shadow-2xl">
        {/* Glow ambient background accents */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-xl shadow-cyan-500/20 shrink-0">
              <Mouse className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  {device?.alias || device?.name || "Microsoft Sculpt Comfort Mouse"}
                </h2>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold ${
                    isConnected
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isConnected ? "bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" : "bg-slate-500"
                    }`}
                  />
                  {isConnected ? "Connesso via Bluetooth" : "Non Connesso"}
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1 font-mono">
                MAC: {device?.address || "30:59:B7:79:CE:4C"} • Host: {device?.adapter || "hci0"}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-400">
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 font-mono">
                  Vendor: 045E • Product: 07A2
                </span>
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  Accoppiato & Affidabile
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl text-center">
              <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">
                Motore
              </span>
              <span className={`text-sm font-bold mt-1 block ${enabled ? "text-cyan-400" : "text-slate-500"}`}>
                {enabled ? "Attivo" : "In Pausa"}
              </span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl text-center">
              <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">
                Profilo
              </span>
              <span className="text-sm font-bold text-white mt-1 block truncate">
                {activeProfile}
              </span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl text-center col-span-2 sm:col-span-1">
              <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">
                Protocollo
              </span>
              <span className="text-sm font-bold text-slate-200 mt-1 block">
                BT 3.0 Classic
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Quick Action Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={onNavigateToRemap}
          className="group flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-cyan-500/50 transition-all text-left shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 group-hover:bg-cyan-500/20 text-cyan-400 flex items-center justify-center transition-colors">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Configura Gesti</h4>
              <p className="text-xs text-slate-400">Personalizza Swipe e Click Windows</p>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
        </button>

        <button
          onClick={handleReconnect}
          disabled={isReconnecting || !device}
          className="group flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-blue-500/50 transition-all text-left shadow-lg disabled:opacity-50"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 text-blue-400 flex items-center justify-center transition-colors">
              <RefreshCw className={`w-5 h-5 ${isReconnecting ? "animate-spin" : ""}`} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Riconnetti Mouse</h4>
              <p className="text-xs text-slate-400">Riavvia la sessione Bluetooth HID</p>
            </div>
          </div>
        </button>

        <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <Battery className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Alimentazione</h4>
            <p className="text-xs text-slate-400">2x Batterie AA Stilo</p>
          </div>
        </div>
      </div>

      {reconMsg && (
        <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-300">
          {reconMsg}
        </div>
      )}

      {/* 3. Hardware Specifications Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Caratteristiche Hardware & Architettura
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2.5 text-cyan-400 font-semibold text-sm">
              <Radio className="w-4 h-4" />
              Touch Strip Capacitivo Windows
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              La striscia blu integra un sensore di sfioramento tattile a 2 gesti (Swipe Up verso l'alto e Swipe Down verso il basso) più un click meccanico integrato. Il mouse emula un sub-dispositivo tastiera separato che SculptFlow cattura ed isola.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2.5 text-blue-400 font-semibold text-sm">
              <Sparkles className="w-4 h-4" />
              Sensore Microsoft BlueTrack
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Risoluzione ottica a 1000 DPI con fascio blu ad alta precisione in grado di funzionare su quasi ogni superficie inclusi legno grezzo, marmo e tessuti (escluso vetro trasparente).
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2.5 text-emerald-400 font-semibold text-sm">
              <Cpu className="w-4 h-4" />
              Rotellina Tilt a 4 Direzioni
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Oltre allo scorrimento verticale e al pulsante centrale (middle click), la rotellina si inclina a sinistra e a destra, rimappabile per navigare nella cronologia o cambiare desktop.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2.5 text-indigo-400 font-semibold text-sm">
              <Info className="w-4 h-4" />
              Compatibilità Bluetooth 3.0 HID
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Lo standard Bluetooth 3.0 garantisce compatibilità immediata con qualsiasi scheda BT senza richiedere dongle USB proprietari. La telemetria della batteria non è prevista dallo standard BT 3.0 Classic HID.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
