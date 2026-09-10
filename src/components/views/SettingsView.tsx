import React, { useState, useEffect } from "react";
import { PermissionStatus } from "../../types";
import {
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  Layers,
  Info,
  RotateCcw,
  FileArchive,
  RefreshCw,
  AlertTriangle,
  KeyRound,
  ChevronDown,
  Power,
  Eye,
  Languages,
} from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { useI18n } from "../../i18n";

interface SettingsViewProps {
  permissions: PermissionStatus | null;
  onRefreshPermissions: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  permissions,
  onRefreshPermissions,
}) => {
  const { t, language, setLanguage } = useI18n();
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionType, setActionType] = useState<"install" | "restore" | null>(null);
  const [actionResult, setActionResult] = useState<{ success: boolean; msg: string } | null>(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [autostart, setAutostart] = useState(false);
  const [isUpdatingAutostart, setIsUpdatingAutostart] = useState(false);

  const uinputOk = permissions?.uinput_accessible ?? false;
  const nodesOk = permissions?.input_nodes_accessible ?? false;
  const allOk = uinputOk && nodesOk;
  const rulesInstalled = permissions?.rules_installed ?? false;
  const backupExists = permissions?.backup_exists ?? false;

  useEffect(() => {
    invoke<boolean>("get_autostart_status")
      .then((status) => setAutostart(status))
      .catch((err) => console.error("Errore fetch autostart:", err));
  }, []);

  const handleToggleAutostart = async () => {
    setIsUpdatingAutostart(true);
    const newVal = !autostart;
    try {
      await invoke("set_autostart_cmd", { enabled: newVal });
      setAutostart(newVal);
    } catch (err) {
      console.error("Errore set autostart:", err);
    } finally {
      setIsUpdatingAutostart(false);
    }
  };

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
      setActionResult({
        success: false,
        msg: `${language === "en" ? "Installation error" : "Errore durante l'installazione"}: ${err}`,
      });
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
      setActionResult({
        success: false,
        msg: `${language === "en" ? "Restore error" : "Errore durante il ripristino"}: ${err}`,
      });
    } finally {
      setIsProcessing(false);
      setActionType(null);
    }
  };

  const formatTimestamp = (ts?: string) => {
    if (!ts) return null;
    try {
      const d = new Date(ts);
      return d.toLocaleString(language === "en" ? "en-US" : "it-IT", {
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
          {t("settings.title", "Sistema & Driver Hardware")}
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          {t("settings.subtitle", "Gestione permessi udev, automazione con backup del sistema e ripristino/disinstallazione.")}
        </p>
      </div>

      {/* Interface Language */}
      <div className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
          {t("settings.languageTitle", "Lingua dell'Interfaccia")}
        </h2>

        <div className="desktop-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
              <Languages className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-200">
                {t("settings.languageTitle", "Lingua dell'Interfaccia")}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {t("settings.languageDesc", "Seleziona la lingua per testi, diagrammi e comandi.")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0a0b10] border border-white/[0.08]">
            <button
              type="button"
              onClick={() => setLanguage("it")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                language === "it"
                  ? "bg-cyan-600 text-white font-semibold shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              🇮🇹 Italiano
            </button>
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                language === "en"
                  ? "bg-cyan-600 text-white font-semibold shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              🇬🇧 English
            </button>
          </div>
        </div>
      </div>

      {/* Permissions Group */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {t("settings.permsTitle", "Permessi Kernel Linux & Accesso Dispositivi")}
          </h2>
          <span
            className={`text-xs font-medium flex items-center gap-1.5 ${
              allOk ? "text-emerald-400" : "text-amber-400"
            }`}
          >
            {allOk ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                {language === "en" ? "Permissions Active" : "Permessi Attivi"}
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5" />
                {language === "en" ? "Configuration Required" : "Configurazione Necessaria"}
              </>
            )}
          </span>
        </div>

        <div className="desktop-card overflow-hidden divide-y divide-white/[0.04]">
          {/* Uinput row */}
          <div className="px-4 py-3.5 flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-slate-200">
                {language === "en" ? "Virtual Input Subsystem (/dev/uinput)" : "Sottosistema Virtuale (/dev/uinput)"}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {language === "en"
                  ? "Allows MouseDeck to emulate key strokes, clicks, and media shortcuts"
                  : "Consente a MouseDeck di emulare pressioni tasti, clic e comandi multimediali"}
              </p>
            </div>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded ${
                uinputOk
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}
            >
              {uinputOk
                ? (language === "en" ? "Accessible" : "Accessibile")
                : (language === "en" ? "Not accessible" : "Non accessibile")}
            </span>
          </div>

          {/* Mouse input nodes */}
          <div className="px-4 py-3.5 flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-slate-200">
                {language === "en" ? "Mouse Input Capture (/dev/input/event*)" : "Cattura Input Mouse (/dev/input/event*)"}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {language === "en"
                  ? "Exclusively isolates hardware events without blocking regular input"
                  : "Isola in modo esclusivo gli eventi senza bloccare la normale digitazione"}
              </p>
            </div>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded ${
                nodesOk
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              }`}
            >
              {nodesOk
                ? (language === "en" ? "Accessible" : "Accessibile")
                : (language === "en" ? "Access Required" : "Accesso Richiesto")}
            </span>
          </div>

          {/* Udev rules status */}
          <div className="px-4 py-3.5 flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-slate-200">
                {language === "en" ? "System udev Rules" : "Regole Udev di Sistema"}
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
              {rulesInstalled
                ? (language === "en" ? "Installed" : "Installate")
                : (language === "en" ? "Missing" : "Non presenti")}
            </span>
          </div>

          {/* Backup state */}
          <div className="px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-start gap-2.5">
              <FileArchive className="w-4 h-4 text-[#0078d4] shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-medium text-slate-200">
                  {language === "en" ? "Rollback Snapshot & Backup" : "Snapshot & Backup di Ripristino"}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {backupExists
                    ? (language === "en"
                        ? `Backup saved in ~/.config/mousedeck/backup/ (${formatTimestamp(permissions?.backup_timestamp)})`
                        : `Backup salvato in ~/.config/mousedeck/backup/ (${formatTimestamp(permissions?.backup_timestamp)})`)
                    : (language === "en"
                        ? "Created automatically prior to applying udev rules"
                        : "Creato automaticamente prima dell'applicazione delle regole udev")}
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
              {backupExists
                ? (language === "en" ? "Backup Active" : "Backup Attivo")
                : (language === "en" ? "No Backup" : "Nessun Backup")}
            </span>
          </div>

          {/* Actions Bar */}
          <div className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.01]">
            <div className="text-xs text-slate-400">
              {allOk
                ? (language === "en"
                    ? "Permissions are operational. You can rollback anytime to remove system modifications."
                    : "I permessi sono operativi. Puoi eseguire il ripristino per rimuovere le modifiche di sistema.")
                : (language === "en"
                    ? "Configure permissions with full pristine state snapshot."
                    : "Configura i permessi con salvataggio dello stato originario.")}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRunInstall}
                disabled={isProcessing}
                className="px-3 py-1.5 rounded-lg bg-[#0078d4] hover:bg-[#1084d8] disabled:opacity-40 text-white text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                {isProcessing && actionType === "install" ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    {language === "en" ? "Configuring..." : "Configurazione..."}
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {allOk
                      ? (language === "en" ? "Re-apply & Update Backup" : "Riapplica & Aggiorna Backup")
                      : (language === "en" ? "Configure with Backup" : "Configura con Backup")}
                  </>
                )}
              </button>

              {(backupExists || rulesInstalled) && (
                <button
                  onClick={() => setShowRestoreConfirm(true)}
                  disabled={isProcessing}
                  title={language === "en" ? "Restore previous configuration and uninstall udev rules" : "Ripristina la configurazione precedente e disinstalla le regole udev"}
                  className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 text-xs font-medium border border-red-500/25 transition-colors flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
                >
                  {isProcessing && actionType === "restore" ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      {language === "en" ? "Restoring..." : "Ripristino..."}
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-3 h-3" />
                      {language === "en" ? "Restore & Uninstall" : "Ripristina & Disinstalla"}
                    </>
                  )}
                </button>
              )}

              <button
                onClick={onRefreshPermissions}
                disabled={isProcessing}
                className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.09] text-slate-300 text-xs font-medium border border-white/[0.08] transition-colors cursor-pointer"
              >
                {t("common.refresh", "Aggiorna")}
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
                  {t("settings.restoreConfirmTitle", "Conferma Ripristino Sistema")}
                </div>
                <p className="text-red-300/80 leading-relaxed">
                  {language === "en"
                    ? "Rules in /etc/udev/rules.d/70-mousedeck.rules and uinput configs will be removed, and original files restored from backup. MouseDeck will not be able to intercept gestures without root."
                    : "Verranno rimosse le regole /etc/udev/rules.d/70-mousedeck.rules, il caricamento di uinput e ripristinati eventuali file originari salvati nel backup. MouseDeck non potrà più catturare i gesti senza privilegi di root."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => setShowRestoreConfirm(false)}
                className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.09] text-slate-300 text-xs font-medium border border-white/[0.08] transition-colors cursor-pointer"
              >
                {t("common.cancel", "Annulla")}
              </button>
              <button
                onClick={handleRunRestore}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                {language === "en" ? "Confirm Restore" : "Conferma Ripristino"}
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

        {/* Native Polkit Security Info */}
        <div className="p-3.5 rounded-xl bg-[#090a0e] border border-white/[0.05] flex items-start gap-3 text-xs text-slate-400">
          <div className="w-7 h-7 rounded-lg bg-[#0078d4]/10 border border-[#0078d4]/20 flex items-center justify-center text-[#70b4ff] shrink-0 mt-0.5">
            <KeyRound className="w-3.5 h-3.5" />
          </div>
          <div className="space-y-1">
            <div className="font-medium text-slate-200">
              {language === "en" ? "Native Desktop Authorization (Linux Polkit)" : "Autorizzazione Nativa Desktop (Linux Polkit)"}
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {language === "en"
                ? "MouseDeck manages privilege elevation seamlessly directly in the application through your desktop environment's native security framework (Polkit). No terminal execution is required: clicking configuration buttons opens the system authentication modal."
                : "MouseDeck gestisce l'elevazione dei privilegi direttamente all'interno dell'applicazione tramite il sottosistema di sicurezza nativo del tuo desktop (Polkit). Non è richiesto alcun terminale né l'esecuzione manuale di script: cliccando sui pulsanti viene richiamata la finestra di autenticazione del sistema operativo."}
            </p>
          </div>
        </div>

        {/* Optional Collapsible CLI Reference for Headless / Advanced users */}
        <details className="text-[11px] text-slate-500 group px-1">
          <summary className="cursor-pointer hover:text-slate-400 transition-colors flex items-center gap-1 font-medium list-none">
            <ChevronDown className="w-3 h-3 group-open:rotate-180 transition-transform" />
            <span>{language === "en" ? "Advanced terminal commands (Headless CLI)" : "Opzioni avanzate da terminale (CLI Headless)"}</span>
          </summary>
          <div className="mt-2.5 p-3 rounded-xl bg-black/40 border border-white/[0.04] space-y-2">
            <div className="text-[10px] text-slate-500">
              {language === "en"
                ? "The binary natively provides commands for automated setup and restoration:"
                : "Il binario stesso integra i comandi nativi di installazione e ripristino:"}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-white/[0.02] border border-white/[0.03] flex items-center justify-between gap-2">
                <span className="truncate text-slate-300">pkexec mousedeck --setup-permissions</span>
                <button
                  onClick={() => handleCopy("pkexec mousedeck --setup-permissions")}
                  className="p-1 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  title={language === "en" ? "Copy" : "Copia"}
                >
                  {copiedCmd === "pkexec mousedeck --setup-permissions" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <div className="p-2 rounded bg-white/[0.02] border border-white/[0.03] flex items-center justify-between gap-2">
                <span className="truncate text-slate-300">pkexec mousedeck --restore-permissions</span>
                <button
                  onClick={() => handleCopy("pkexec mousedeck --restore-permissions")}
                  className="p-1 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  title={language === "en" ? "Copy" : "Copia"}
                >
                  {copiedCmd === "pkexec mousedeck --restore-permissions" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>
        </details>
      </div>

      {/* Autostart & Background System Tray Group */}
      <div className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
          {language === "en" ? "Autostart & System Tray" : "Avvio Automatico & System Tray"}
        </h2>

        <div className="desktop-card divide-y divide-white/[0.04] overflow-hidden">
          {/* Autostart row */}
          <div className="px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#0078d4]/10 border border-[#0078d4]/20 flex items-center justify-center text-[#70b4ff] shrink-0 mt-0.5">
                <Power className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-medium text-slate-200">
                  {t("settings.autostartTitle", "Avvio Automatico al Boot (XDG Autostart)")}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  {t("settings.autostartDesc", "Avvia MouseDeck silenziosamente in background all'accesso della sessione utente.")}
                </p>
              </div>
            </div>

            <button
              onClick={handleToggleAutostart}
              disabled={isUpdatingAutostart}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none shrink-0 cursor-pointer ${
                autostart ? "bg-[#0078d4]" : "bg-slate-700"
              }`}
              title={autostart ? (language === "en" ? "Disable autostart" : "Disattiva avvio automatico") : (language === "en" ? "Enable autostart" : "Attiva avvio automatico")}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  autostart ? "translate-x-4.5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          {/* Background Tray status row */}
          <div className="px-4 py-3.5 flex items-center justify-between bg-white/[0.01]">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-medium text-slate-200">
                  {language === "en" ? "Window Close Behavior" : "Comportamento Chiusura Finestra"}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  {language === "en"
                    ? "Closing the window hides the application in the System Tray keeping mouse gestures active. To quit completely, right-click the tray icon and select 'Quit'."
                    : "La chiusura della finestra nasconde l'applicazione nella System Tray mantenendo i gesti del mouse sempre attivi. Per chiudere definitivamente l'applicazione, fai clic destro sull'icona della tray e seleziona 'Esci'."}
                </p>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              {language === "en" ? "Tray Active" : "Tray Attiva"}
            </span>
          </div>
        </div>
      </div>

      {/* Driver Architecture Group */}
      <div className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
          {language === "en" ? "Modular Driver Architecture" : "Architettura Driver Modulare"}
        </h2>

        <div className="desktop-card p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-md bg-[#161a24] border border-white/[0.06] flex items-center justify-center text-[#70b4ff] shrink-0 mt-0.5">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-200">
                {language === "en"
                  ? "Active Modules: Logitech G502 X & Microsoft Sculpt Comfort Drivers"
                  : "Moduli Attivi: Driver Logitech G502 X & Microsoft Sculpt Comfort"}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                {language === "en"
                  ? "Intercepts multi-interface hardware topology (Pointer, Consumer Control, and Virtual Keyboard). Translates custom firmware sequences and low-latency DPI events before they reach the desktop window manager (Wayland/X11)."
                  : "Intercetta la topologia multi-dispositivo del mouse (Puntatore, Consumer Control e Tastiera virtuale). Riconosce le sequenze firmware proprietarie e le traduce prima che raggiungano il window manager (Wayland/X11)."}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-white/[0.04] text-[11px] text-slate-400">
            <span className="text-slate-300 font-medium">
              {language === "en" ? "Extensibility: " : "Estendibilità: "}
            </span>
            {language === "en" ? (
              <>
                You can add support for other mice by implementing the Rust trait{" "}
                <code className="text-[#70b4ff] font-mono">DeviceDriver</code> in{" "}
                <code className="text-slate-300 font-mono">src-tauri/src/drivers/</code>.
              </>
            ) : (
              <>
                È possibile aggiungere moduli per altri mouse implementando il trait Rust{" "}
                <code className="text-[#70b4ff] font-mono">DeviceDriver</code> in{" "}
                <code className="text-slate-300 font-mono">src-tauri/src/drivers/</code>.
              </>
            )}
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
