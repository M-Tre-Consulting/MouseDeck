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
    active_driver: "microsoft_sculpt_comfort",
    profiles: {},
  });
  const [permissions, setPermissions] = useState<PermissionStatus | null>(null);
  const [isRefreshingBt, setIsRefreshingBt] = useState(false);

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

  const handleRefreshBt = async () => {
    setIsRefreshingBt(true);
    await fetchDeviceStatus();
    setTimeout(() => setIsRefreshingBt(false), 600);
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
          {activeTab === "dashboard" && (
            <DashboardView
              device={device}
              activeProfile={config.active_profile}
              onNavigateToRemap={() => setActiveTab("remap")}
              onRefreshBluetooth={handleRefreshBt}
            />
          )}

          {activeTab === "remap" && (
            <RemapView
              config={config}
              onSaveAction={handleSaveAction}
              onApplyPreset={handleApplyPreset}
            />
          )}

          {activeTab === "test" && (
            <LiveTestView
              lastEvent={lastEvent}
              history={history}
              onClearHistory={() => setHistory([])}
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
