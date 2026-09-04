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

import { Header } from "./components/Header";
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

  // Load initial data
  useEffect(() => {
    refreshAllData();

    // Polling interval for Bluetooth state (every 3 seconds)
    const interval = setInterval(() => {
      fetchDeviceStatus();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Listen for hardware gesture triggers from the Rust backend
  useEffect(() => {
    let unlisten: (() => void) | undefined;

    const setupListener = async () => {
      try {
        unlisten = await listen<GestureEventPayload>("gesture-triggered", (event) => {
          const payload = event.payload;
          setLastEvent(payload);
          setHistory((prev) => [payload, ...prev.slice(0, 24)]);
        });
      } catch (err) {
        console.error("Errore registrazione listener gesture-triggered:", err);
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
      console.error("Errore fetch device status:", e);
    }
  };

  const fetchConfig = async () => {
    try {
      const cfg: AppConfig = await invoke("get_config");
      setConfig(cfg);
    } catch (e) {
      console.error("Errore fetch config:", e);
    }
  };

  const fetchPermissions = async () => {
    try {
      const perms: PermissionStatus = await invoke("check_system_permissions");
      setPermissions(perms);
    } catch (e) {
      console.error("Errore fetch permissions:", e);
    }
  };

  const handleToggleEnabled = async (val: boolean) => {
    try {
      await invoke("set_remapping_enabled", { enabled: val });
      setConfig((prev) => ({ ...prev, enabled: val }));
    } catch (e) {
      console.error("Errore toggle enabled:", e);
    }
  };

  const handleSaveAction = async (triggerId: string, action: ActionConfig) => {
    try {
      await invoke("save_mapping", { triggerId, action });
      await fetchConfig();
    } catch (e) {
      console.error("Errore save mapping:", e);
    }
  };

  const handleApplyPreset = async (presetKey: string) => {
    try {
      const updated: AppConfig = await invoke("apply_preset", { presetKey });
      setConfig(updated);
    } catch (e) {
      console.error("Errore apply preset:", e);
    }
  };

  const handleRefreshBt = async () => {
    setIsRefreshingBt(true);
    await fetchDeviceStatus();
    setTimeout(() => setIsRefreshingBt(false), 800);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <Header
        device={device}
        enabled={config.enabled}
        onToggleEnabled={handleToggleEnabled}
        onRefreshBluetooth={handleRefreshBt}
        isRefreshing={isRefreshingBt}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {activeTab === "dashboard" && (
          <DashboardView
            device={device}
            enabled={config.enabled}
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
  );
}

export default App;
