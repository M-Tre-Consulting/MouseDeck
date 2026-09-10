import React from "react";
import { BluetoothDeviceInfo } from "../types";
import {
  LayoutDashboard,
  Sliders,
  Sparkles,
  Settings,
  RefreshCw,
  Battery,
} from "lucide-react";

interface SidebarProps {
  device: BluetoothDeviceInfo | null;
  enabled: boolean;
  onToggleEnabled: (val: boolean) => void;
  onRefreshBluetooth: () => void;
  isRefreshing: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  device,
  enabled,
  onToggleEnabled,
  onRefreshBluetooth,
  isRefreshing,
  activeTab,
  onTabChange,
}) => {
  const isConnected = device?.connected ?? false;

  const navItems = [
    { id: "dashboard", label: "Panoramica", icon: LayoutDashboard },
    { id: "remap", label: "Pulsanti & Gesti", icon: Sliders },
    { id: "test", label: "Test in Tempo Reale", icon: Sparkles },
    { id: "settings", label: "Sistema & Permessi", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0e1015] border-r border-white/[0.06] flex flex-col justify-between shrink-0 select-none h-screen">
      {/* Top section: Titlebar drag area & Device status */}
      <div className="flex flex-col">
        {/* Window drag area / Header */}
        <div className="h-12 px-5 flex items-center gap-2.5 titlebar-drag-region">
          <img
            src="/icon.png"
            alt="MouseDeck"
            className="w-6 h-6 rounded-md object-contain shadow-sm shadow-cyan-500/20"
          />
          <span className="text-xs font-bold tracking-wider uppercase text-slate-200">
            MouseDeck
          </span>
          <span className="text-[10px] text-slate-500 font-mono ml-auto">v1.0</span>
        </div>

        {/* Device card */}
        <div className="px-3 pt-2 pb-3">
          <div className="p-3 rounded-xl bg-[#141720] border border-white/[0.05] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-300 truncate">
                {device?.alias || device?.name || "Microsoft Sculpt Comfort"}
              </span>
              <button
                onClick={onRefreshBluetooth}
                disabled={isRefreshing}
                title="Aggiorna stato Bluetooth"
                className="text-slate-500 hover:text-slate-300 transition-colors no-drag p-1"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} />
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? "bg-emerald-400 shadow-[0_0_6px_#34d399]" : "bg-slate-600"
                  }`}
                />
                <span className={isConnected ? "text-slate-300 font-medium" : "text-slate-500"}>
                  {isConnected ? "Connesso" : "Non connesso"}
                </span>
              </div>
              <span className="font-mono text-[10px] text-slate-500">
                {device?.address ? device.address.slice(-8) : "BT 3.0"}
              </span>
            </div>

            {/* Battery status row */}
            <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Battery
                  className={`w-3.5 h-3.5 ${
                    device?.battery_percentage != null
                      ? device.battery_percentage > 20
                        ? "text-emerald-400"
                        : "text-amber-400"
                      : "text-slate-500"
                  }`}
                />
                <span>Batteria</span>
              </div>
              <div className="flex items-center gap-1.5">
                {device?.battery_percentage != null ? (
                  <>
                    <div className="w-10 h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          device.battery_percentage > 20 ? "bg-emerald-400" : "bg-amber-400"
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, device.battery_percentage))}%` }}
                      />
                    </div>
                    <span className="font-mono text-[10px] font-semibold text-slate-300">
                      {device.battery_percentage}%
                    </span>
                  </>
                ) : (
                  <span className="text-[10px] text-slate-400 font-mono">
                    {device?.battery_status_text?.includes("AA")
                      ? "2x AA"
                      : (device?.battery_status_text || "2x AA (BT 3.0)")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="px-2 space-y-0.5 mt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#1c202a] text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-[#0078d4]" : "text-slate-500"
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer: Master toggle */}
      <div className="p-3 border-t border-white/[0.06] bg-[#0c0d12]">
        <div className="flex items-center justify-between px-2 py-1.5">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-300">Rimappatura</span>
            <span className="text-[10px] text-slate-500">
              {enabled ? "Motore attivo" : "Disattivato"}
            </span>
          </div>

          <button
            onClick={() => onToggleEnabled(!enabled)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
              enabled ? "bg-[#0078d4]" : "bg-slate-700"
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                enabled ? "translate-x-4.5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      </div>
    </aside>
  );
};
