import React from "react";
import { BluetoothDeviceInfo } from "../types";
import {
  Mouse,
  Bluetooth,
  RefreshCw,
  LayoutDashboard,
  Sliders,
  Sparkles,
  Settings,
} from "lucide-react";

interface HeaderProps {
  device: BluetoothDeviceInfo | null;
  enabled: boolean;
  onToggleEnabled: (val: boolean) => void;
  onRefreshBluetooth: () => void;
  isRefreshing: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  device,
  enabled,
  onToggleEnabled,
  onRefreshBluetooth,
  isRefreshing,
  activeTab,
  onTabChange,
}) => {
  const isConnected = device?.connected ?? false;

  return (
    <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Mouse ID */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Mouse className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                SculptFlow
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Linux Wayland/X11
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {device?.name || "Microsoft Sculpt Comfort Mouse"}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1 bg-slate-950/40 p-1 rounded-xl border border-slate-800/60">
          {[
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
            { id: "remap", label: "Rimappatura", icon: Sliders },
            { id: "test", label: "Test Live", icon: Sparkles },
            { id: "settings", label: "Sistema", icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Status & Master Switch */}
        <div className="flex items-center gap-4">
          {/* Bluetooth Status Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected
                  ? "bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse"
                  : "bg-slate-500"
              }`}
            />
            <Bluetooth className="w-3.5 h-3.5 text-slate-400" />
            <span className={isConnected ? "text-slate-200 font-medium" : "text-slate-400"}>
              {isConnected ? "Connesso" : "Disconnesso"}
            </span>
            <button
              onClick={onRefreshBluetooth}
              disabled={isRefreshing}
              title="Aggiorna stato Bluetooth"
              className="ml-1 text-slate-400 hover:text-cyan-400 transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Master Toggle */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Rimappatura</span>
            <button
              onClick={() => onToggleEnabled(!enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                enabled ? "bg-cyan-500 shadow-sm shadow-cyan-500/50" : "bg-slate-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  enabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
