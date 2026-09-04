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
  RotateCcw,
  FileArchive,
  RefreshCw,
  AlertTriangle,
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
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionType, setActionType] = useState<"install" | "restore" | null>(null);
  const [actionResult, setActionResult] = useState<{ success: boolean; msg: string } | null>(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);

  const uinputOk = permissions?.uinput_accessible ?? false;
  const nodesOk = permissions?.input_nodes_accessible ?? false;
  const allOk = uinputOk && nodesOk;
  const rulesInstalled = permissions?.rules_installed ?? false;
  const backupExists = permissions?.backup_exists ?? false;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(text);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleRunInstall = async () => {
    setIsProcessing(true);
    setActionType("install");
    setActionResult(null);
    try {
      const res: string = await invoke("run_setup_permissions_cmd");
      setActionResult({ success: true, msg: res });
      onRefreshPermissions();
    } catch (err) {
      setActionResult({ success: false, msg: `Errore durante l'installazione: ${err}` });
    } finally {
      setIsProcessing(false);
      setActionType(null);
    }
  };

  const handleRunRestore = async () => {
    setShowRestoreConfirm(false);
    setIsProcessing(true);
    setActionType("restore");
    setActionResult(null);
    try {
      const res: string = await invoke("run_restore_permissions_cmd");
      setActionResult({ success: true, msg: res });
      onRefreshPermissions();
    } catch (err) {
      setActionResult({ success: false, msg: `Errore durante il ripristino: ${err}` });
    } finally {
      setIsProcessing(false);
      setActionType(null);
    }
  };

  const formatTimestamp = (ts?: string) => {
    if (!ts) return null;
    try {
      const d = new Date(ts);
      return d.toLocaleString("it-IT", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return ts;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold text-white tracking-tight">
          Sistema & Driver Hardware
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Gestione permessi udev, automazione con backup del sistema e ripristino/disinstallazione.
        </p>
      </div>

      {/* Permissions Group */}
      <div className="space-y-3">
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
                Permessi Attivi
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5" />
                Configurazione Necessaria
              </>
            )}
          </span>
        </div>

        <div className="desktop-card overflow-hidden divide-y divide-white/[0.04]">
          {/* Uinput row */}
          <div className="px-4 py-3.5 flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-slate-200">
                Sottosistema Virtuale (/dev/uinput)
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Consente a MouseDeck di emulare pressioni tasti, clic e comandi multimediali
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

          {/* Mouse input nodes */}
          <div className="px-4 py-3.5 flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-slate-200">
                Cattura Input Mouse (/dev/input/event*)
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Isola in modo esclusivo gli eventi della touch strip senza bloccare la tastiera
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

          {/* Udev rules status */}
          <div className="px-4 py-3.5 flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-slate-200">
                Regole Udev di Sistema
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                /etc/udev/rules.d/70-mousedeck.rules
              </p>
            </div>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded ${
                rulesInstalled
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-slate-700/40 text-slate-400 border border-white/[0.08]"
              }`}
            >
              {rulesInstalled ? "Installate" : "Non presenti"}
            </span>
          </div>

          {/* Backup state */}
          <div className="px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-start gap-2.5">
              <FileArchive className="w-4 h-4 text-[#0078d4] shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-medium text-slate-200">
                  Snapshot & Backup di Ripristino
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {backupExists
                    ? `Backup salvato in ~/.config/mousedeck/backup/ (${formatTimestamp(
                        permissions?.backup_timestamp
                      )})`
                    : "Creato automaticamente prima dell'applicazione delle regole udev"}
                </p>
              </div>
            </div>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded ${
                backupExists
                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  : "bg-slate-700/40 text-slate-500 border border-white/[0.06]"
              }`}
            >
              {backupExists ? "Backup Attivo" : "Nessun Backup"}
            </span>
          </div>

          {/* Actions Bar */}
          <div className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.01]">
            <div className="text-xs text-slate-400">
              {allOk
                ? "I permessi sono operativi. Puoi eseguire il ripristino per rimuovere le modifiche di sistema."
                : "Configura i permessi con salvataggio dello stato originario."}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRunInstall}
                disabled={isProcessing}
                className="px-3 py-1.5 rounded-lg bg-[#0078d4] hover:bg-[#1084d8] disabled:opacity-40 text-white text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs"
              >
                {isProcessing && actionType === "install" ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Configurazione...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {allOk ? "Riapplica & Aggiorna Backup" : "Configura Automaticamente"}
                  </>
                )}
              </button>

              {(backupExists || rulesInstalled) && (
                <button
                  onClick={() => setShowRestoreConfirm(true)}
                  disabled={isProcessing}
                  title="Ripristina la configurazione precedente e disinstalla le regole udev"
                  className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 text-xs font-medium border border-red-500/25 transition-colors flex items-center gap-1.5 disabled:opacity-40"
                >
                  {isProcessing && actionType === "restore" ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Ripristino...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-3 h-3" />
                      Ripristina & Disinstalla
                    </>
                  )}
                </button>
              )}

              <button
                onClick={onRefreshPermissions}
                disabled={isProcessing}
                className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.09] text-slate-300 text-xs font-medium border border-white/[0.08] transition-colors"
              >
                Aggiorna
              </button>
            </div>
          </div>
        </div>

        {/* Restore Confirmation Dialog Box */}
        {showRestoreConfirm && (
          <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/30 space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <div className="font-semibold text-red-200">
                  Confermi il ripristino e la disinstallazione delle regole?
                </div>
                <p className="text-red-300/80 leading-relaxed">
                  Verranno rimosse le regole <code>/etc/udev/rules.d/70-mousedeck.rules</code>, il caricamento
                  di <code>uinput</code> e ripristinati eventuali file originari salvati nel backup.
                  MouseDeck non potrà più catturare i gesti senza privilegi di root.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => setShowRestoreConfirm(false)}
                className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.09] text-slate-300 text-xs font-medium border border-white/[0.08] transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={handleRunRestore}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <RotateCcw className="w-3 h-3" />
                Conferma Ripristino
              </button>
            </div>
          </div>
        )}

        {/* Action result banner */}
        {actionResult && (
          <div
            className={`p-3 rounded-xl border text-xs whitespace-pre-line leading-relaxed ${
              actionResult.success
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                : "bg-red-500/10 border-red-500/20 text-red-300"
            }`}
          >
            {actionResult.msg}
          </div>
        )}

        {/* Manual Terminal Commands */}
        <div className="p-3.5 rounded-xl bg-[#090a0e] border border-white/[0.05] space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-slate-500" />
              Comandi manuali da terminale (alternativa CLI)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            {/* Install cmd */}
            <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center justify-between gap-2">
              <div className="truncate text-slate-300">
                sudo bash ./setup-permissions.sh install
              </div>
              <button
                onClick={() => handleCopy("sudo bash ./setup-permissions.sh install")}
                className="p-1 rounded hover:bg-white/[0.08] text-slate-400 hover:text-slate-200 transition-colors shrink-0"
                title="Copia comando installazione"
              >
                {copiedCmd === "sudo bash ./setup-permissions.sh install" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Restore cmd */}
            <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center justify-between gap-2">
              <div className="truncate text-slate-300">
                sudo bash ./setup-permissions.sh restore
              </div>
              <button
                onClick={() => handleCopy("sudo bash ./setup-permissions.sh restore")}
                className="p-1 rounded hover:bg-white/[0.08] text-slate-400 hover:text-slate-200 transition-colors shrink-0"
                title="Copia comando ripristino"
              >
                {copiedCmd === "sudo bash ./setup-permissions.sh restore" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
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
