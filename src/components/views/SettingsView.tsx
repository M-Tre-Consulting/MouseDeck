import React, { useState } from "react";
import { PermissionStatus } from "../../types";
import {
  ShieldCheck,
  ShieldAlert,
  Terminal,
  Copy,
  Check,
  Layers,
  Info,
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
    navigator.clipboard.writeText("sudo bash ./setup-permissions.sh");
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
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold text-white tracking-tight">
          Sistema & Driver Hardware
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Gestione permessi udev, modulo kernel uinput ed estensibilità driver.
        </p>
      </div>

      {/* Permissions Group */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Permessi Kernel Linux & Accesso Dispositivi
          </h2>
          <span
            className={`text-xs font-medium flex items-center gap-1.5 ${
              allOk ? "text-emerald-400" : "text-amber-400"
            }`}
          >
            {allOk ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                Permessi Configurati
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5" />
                Setup Richiesto
              </>
            )}
          </span>
        </div>

        <div className="desktop-card overflow-hidden divide-y divide-white/[0.04]">
          <div className="px-4 py-3.5 flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-slate-200">
                Sottosistema Virtuale (/dev/uinput)
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Consente la generazione di tasti, click e combinazioni virtuali
              </p>
            </div>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded ${
                uinputOk
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}
            >
              {uinputOk ? "Accessibile" : "Non accessibile"}
            </span>
          </div>

          <div className="px-4 py-3.5 flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-slate-200">
                Cattura Input Mouse (/dev/input/event*)
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Consente di isolare e consumare gli eventi della touch strip
              </p>
            </div>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded ${
                nodesOk
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              }`}
            >
              {nodesOk ? "Accessibile" : "Accesso Richiesto"}
            </span>
          </div>

          <div className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.01]">
            <div>
              <div className="text-xs font-medium text-slate-200">
                Configurazione Regole udev
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Installa la regola <code>/etc/udev/rules.d/70-sculpt-comfort.rules</code> con tag <code>uaccess</code>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRunSetup}
                disabled={isConfiguring || allOk}
                className="px-3 py-1.5 rounded-lg bg-[#0078d4] hover:bg-[#1084d8] disabled:opacity-40 text-white text-xs font-medium transition-colors"
              >
                {isConfiguring ? "Configurazione..." : allOk ? "Regole Attive" : "Configura con 1 Clic"}
              </button>
              <button
                onClick={onRefreshPermissions}
                className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.09] text-slate-300 text-xs font-medium border border-white/[0.08] transition-colors"
              >
                Aggiorna
              </button>
            </div>
          </div>
        </div>

        {setupResult && (
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
            {setupResult}
          </div>
        )}

        {/* Terminal box */}
        <div className="p-3 rounded-xl bg-[#090a0e] border border-white/[0.05] flex items-center justify-between gap-3 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2 truncate">
            <Terminal className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <span className="text-slate-300">sudo bash ./setup-permissions.sh</span>
          </div>
          <button
            onClick={handleCopyCmd}
            className="px-2.5 py-1 rounded bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-xs font-sans transition-colors flex items-center gap-1 shrink-0"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            {copied ? "Copiato" : "Copia"}
          </button>
        </div>
      </div>

      {/* Driver Architecture Group */}
      <div className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
          Architettura Driver Modulare
        </h2>

        <div className="desktop-card p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-md bg-[#161a24] border border-white/[0.06] flex items-center justify-center text-[#70b4ff] shrink-0 mt-0.5">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-200">
                Modulo Attivo: Microsoft Sculpt Comfort Driver (v1.0)
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Intercetta la topologia multi-dispositivo del mouse (Puntatore, Consumer Control e Tastiera virtuale). Riconosce le sequenze firmware proprietarie della touch strip e le traduce prima che raggiungano il window manager (Wayland/X11).
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-white/[0.04] text-[11px] text-slate-400">
            <span className="text-slate-300 font-medium">Estendibilità: </span>
            È possibile aggiungere moduli per altri mouse implementando il trait Rust <code className="text-[#70b4ff] font-mono">DeviceDriver</code> in <code className="text-slate-300 font-mono">src-tauri/src/drivers/</code>.
          </div>
        </div>
      </div>

      {/* About Box */}
      <div className="desktop-card p-4 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-slate-500" />
          <span>MouseDeck 1.0.0 • Universal Linux Mouse Desktop Suite</span>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">Wayland & X11 Native</span>
      </div>
    </div>
  );
};
