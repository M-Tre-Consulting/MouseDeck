import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

import {
  ActionConfig,
  AppConfig,
  BluetoothDeviceInfo,
  PermissionStatus,
  GestureEventPayload,
} from "./types";
import { ShieldAlert, ShieldCheck, RefreshCw } from "lucide-react";

import { Sidebar } from "./components/Sidebar";
import { DashboardView } from "./components/views/DashboardView";
import { RemapView } from "./components/views/RemapView";
import { LiveTestView } from "./components/views/LiveTestView";
import { SettingsView } from "./components/views/SettingsView";

export function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [device, setDevice] = useState<BluetoothDeviceInfo | null>(null);
  const [config, setConfig] = useState<AppConfig>({
    enabled: true,
    autostart: false,
    active_profile: "Predefinito",
    active_driver: "logitech_g502_x",
    profiles: {},
  });
  const [permissions, setPermissions] = useState<PermissionStatus | null>(null);
  const [isRefreshingBt, setIsRefreshingBt] = useState(false);
  const [isAutoConfiguring, setIsAutoConfiguring] = useState(false);

  const [lastEvent, setLastEvent] = useState<GestureEventPayload | null>(null);
  const [history, setHistory] = useState<GestureEventPayload[]>([]);

  // Initial fetch
  useEffect(() => {
    refreshAllData();

    const interval = setInterval(() => {
      fetchDeviceStatus();
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Hardware event listener from Rust
  useEffect(() => {
    let unlisten: (() => void) | undefined;

    const setupListener = async () => {
      try {
        unlisten = await listen<GestureEventPayload>("gesture-triggered", (event) => {
          const payload = event.payload;
          setLastEvent(payload);
          setHistory((prev) => [payload, ...prev.slice(0, 30)]);
        });
      } catch (err) {
        console.error("Errore listener gesture-triggered:", err);
      }
    };

    setupListener();

    return () => {
      if (unlisten) unlisten();
    };
  }, []);

  const refreshAllData = async () => {
    await fetchDeviceStatus();
    await fetchConfig();
    await fetchPermissions();
  };

  const fetchDeviceStatus = async () => {
    try {
      const dev: BluetoothDeviceInfo | null = await invoke("get_device_status");
      setDevice(dev);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchConfig = async () => {
    try {
      const cfg: AppConfig = await invoke("get_config");
      setConfig(cfg);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPermissions = async () => {
    try {
      const perms: PermissionStatus = await invoke("check_system_permissions");
      setPermissions(perms);
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleEnabled = async (val: boolean) => {
    try {
      await invoke("set_remapping_enabled", { enabled: val });
      setConfig((prev) => ({ ...prev, enabled: val }));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveAction = async (triggerId: string, action: ActionConfig) => {
    try {
      await invoke("save_mapping", { triggerId, action });
      await fetchConfig();
    } catch (e) {
      console.error(e);
    }
  };

  const handleApplyPreset = async (presetKey: string) => {
    try {
      const updated: AppConfig = await invoke("apply_preset", { presetKey });
      setConfig(updated);
    } catch (e) {
      console.error(e);
    }
  };

  const handleChangeDriver = async (driverId: string) => {
    try {
      const updated: AppConfig = await invoke("set_active_driver", { driverId });
      setConfig(updated);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRefreshBt = async () => {
    setIsRefreshingBt(true);
    await fetchDeviceStatus();
    setTimeout(() => setIsRefreshingBt(false), 600);
  };

  const handleQuickAutoSetup = async () => {
    setIsAutoConfiguring(true);
    try {
      await invoke("run_setup_permissions_cmd");
      await fetchPermissions();
    } catch (err) {
      console.error("Auto setup error:", err);
    } finally {
      setIsAutoConfiguring(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#0c0d11] text-slate-200 flex overflow-hidden">
      {/* Left Sidebar (Desktop Navigation) */}
      <Sidebar
        device={device}
        enabled={config.enabled}
        onToggleEnabled={handleToggleEnabled}
        onRefreshBluetooth={handleRefreshBt}
        isRefreshing={isRefreshingBt}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Right Content View */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0e1015]">
        {/* Subtle Titlebar Drag Strip */}
        <div className="h-8 border-b border-white/[0.04] shrink-0 titlebar-drag-region bg-transparent" />

        {/* Scrollable View Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {/* System Permissions Notice Banner */}
          {permissions &&
            (!permissions.uinput_accessible || !permissions.input_nodes_accessible) &&
            activeTab !== "settings" && (
              <div className="mb-6 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-amber-200">
                      Permessi Hardware non Configurati
                    </div>
                    <p className="text-[11px] text-amber-300/80 mt-0.5">
                      MouseDeck può configurare le regole udev creando automaticamente un backup di ripristino istantaneo.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleQuickAutoSetup}
                    disabled={isAutoConfiguring}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    {isAutoConfiguring ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <ShieldCheck className="w-3.5 h-3.5" />
                    )}
                    Configura con Backup
                  </button>
                  <button
                    onClick={() => setActiveTab("settings")}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.09] text-slate-300 text-xs font-medium border border-white/[0.08] transition-colors"
                  >
                    Dettagli
                  </button>
                </div>
              </div>
            )}

          {activeTab === "dashboard" && (
            <DashboardView
              device={device}
              activeProfile={config.active_profile}
              activeDriver={config.active_driver}
              onNavigateToRemap={() => setActiveTab("remap")}
              onRefreshBluetooth={handleRefreshBt}
              onSelectDriver={handleChangeDriver}
            />
          )}

          {activeTab === "remap" && (
            <RemapView
              config={config}
              onSaveAction={handleSaveAction}
              onApplyPreset={handleApplyPreset}
              onChangeDriver={handleChangeDriver}
            />
          )}

          {activeTab === "test" && (
            <LiveTestView
              lastEvent={lastEvent}
              history={history}
              onClearHistory={() => setHistory([])}
              activeDriver={config.active_driver}
            />
          )}

          {activeTab === "settings" && (
            <SettingsView
              permissions={permissions}
              onRefreshPermissions={fetchPermissions}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
