import React, { useState } from "react";
import { PermissionStatus } from "../../types";
import {
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Copy,
  Check,
  Layers,
  Sparkles,
  Info,
  Key,
} from "lucide-react";
import { invoke } from "@tauri-apps/api/core";

interface SettingsViewProps {
  permissions: PermissionStatus | null;
  onRefreshPermissions: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  permissions,
  onRefreshPermissions,
}) => {
  const [copied, setCopied] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [setupResult, setSetupResult] = useState<string | null>(null);

  const uinputOk = permissions?.uinput_accessible ?? false;
  const nodesOk = permissions?.input_nodes_accessible ?? false;
  const allOk = uinputOk && nodesOk;

  const handleCopyCmd = () => {
    const cmd = "sudo bash ./setup-permissions.sh";
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunSetup = async () => {
    setIsConfiguring(true);
    setSetupResult(null);
    try {
      const res: string = await invoke("run_setup_permissions_cmd");
      setSetupResult(res);
      onRefreshPermissions();
    } catch (err) {
      setSetupResult(`Errore: ${err}`);
    } finally {
      setIsConfiguring(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* 1. System Permissions & udev Section */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-cyan-400" />
              Permessi di Sistema & Accesso Hardware
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Per intercettare i gesti del mouse ed emettere eventi virtuali senza eseguire l'app come root, Linux richiede le regole udev con tag <code className="text-cyan-300 font-mono">uaccess</code>.
            </p>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 flex items-center gap-1.5 ${
              allOk
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
            }`}
          >
            {allOk ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                Permessi OK
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5" />
                Configurazione Richiesta
              </>
            )}
          </span>
        </div>

        {/* Status badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-300">Sottosistema Virtuale (/dev/uinput):</span>
            <span className={`text-xs font-semibold ${uinputOk ? "text-emerald-400" : "text-red-400"}`}>
              {uinputOk ? "Accessibile" : "Non accessibile"}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-300">Nodi Eventi Mouse (/dev/input/event*):</span>
            <span className={`text-xs font-semibold ${nodesOk ? "text-emerald-400" : "text-amber-400"}`}>
              {nodesOk ? "Accessibili" : "Permesso Negato"}
            </span>
          </div>
        </div>

        {/* Action Button & Terminal Command */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={handleRunSetup}
              disabled={isConfiguring || allOk}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 transition-all"
            >
              {isConfiguring ? "Configurazione in corso..." : allOk ? "Regole udev già Attive" : "Configura Regole udev Automaticamente"}
            </button>

            <button
              onClick={onRefreshPermissions}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Verifica Nuovamente
            </button>
          </div>

          {setupResult && (
            <p className="text-xs text-cyan-300 bg-cyan-500/10 p-3 rounded-xl border border-cyan-500/20">
              {setupResult}
            </p>
          )}

          {/* Manual terminal box */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-3 font-mono text-xs">
            <div className="flex items-center gap-2 text-slate-300 truncate">
              <Terminal className="w-4 h-4 text-slate-500 shrink-0" />
              <span>sudo bash ./setup-permissions.sh</span>
            </div>
            <button
              onClick={handleCopyCmd}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copiato!" : "Copia"}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Modular Driver Architecture */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-400" />
          Architettura Driver Modulare & Estendibile
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          SculptFlow implementa il pattern a driver modulare in Rust. Il core del sistema gestisce l'intercettazione kernel, la virtualizzazione <code className="text-cyan-300 font-mono">uinput</code> e il monitoraggio BlueZ.
        </p>

        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white">Modulo Attivo:</span>
            <span className="font-mono text-cyan-400">microsoft_sculpt_comfort (v1.0)</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Target Hardware:</span>
            <span className="font-mono text-slate-300">Vendor: 045E | Product: 07A2</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Topologia Input:</span>
            <span className="text-slate-300">Tastiera virtuale mouse + Puntatore + Consumer</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-400 leading-relaxed">
            <span className="font-semibold text-cyan-300">Supporto ad altri mouse in futuro:</span> È sufficiente creare un nuovo modulo in <code className="text-cyan-300 font-mono">src-tauri/src/drivers/</code> implementando il trait <code className="text-cyan-300 font-mono">DeviceDriver</code> per supportare mouse con pulsanti gesture (come Logitech MX Master, Razer, o altri dispositivi HID custom).
          </p>
        </div>
      </div>

      {/* 3. About & Credits */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-2 text-xs text-slate-400">
        <div className="flex items-center gap-2 text-white font-semibold">
          <Info className="w-4 h-4 text-slate-400" />
          SculptFlow v1.0.0 • Linux Native
        </div>
        <p>
          Architettura nativa Rust + Tauri 2.0 + React + TailwindCSS. Progettata specificamente per Linux Wayland (Hyprland/Sway/GNOME) e X11.
        </p>
      </div>
    </div>
  );
};
