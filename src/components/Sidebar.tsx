import React from "react";
import { BluetoothDeviceInfo } from "../types";
import {
  LayoutDashboard,
  Sliders,
  Sparkles,
  Settings,
  RefreshCw,
  Battery,
  Globe,
} from "lucide-react";
import { useI18n } from "../i18n";

interface SidebarProps {
  device: BluetoothDeviceInfo | null;
  enabled: boolean;
  onToggleEnabled: (val: boolean) => void;
  onRefreshBluetooth: () => void;
  isRefreshing: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
  appVersion?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  device,
  enabled,
  onToggleEnabled,
  onRefreshBluetooth,
  isRefreshing,
  activeTab,
  onTabChange,
  appVersion = "1.0.0",
}) => {
  const isConnected = device?.connected ?? false;
  const { t, language, setLanguage, languages } = useI18n();

  const navItems = [
    { id: "dashboard", label: t("sidebar.dashboard"), icon: LayoutDashboard },
    { id: "remap", label: t("sidebar.remap"), icon: Sliders },
    { id: "test", label: t("sidebar.test"), icon: Sparkles },
    { id: "settings", label: t("sidebar.settings"), icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#10121a] border-r border-white/[0.07] flex flex-col justify-between shrink-0 select-none h-screen">
      {/* Top section: Titlebar drag area & Device status */}
      <div className="flex flex-col">
        {/* Window drag area / Header */}
        <div className="h-14 px-4 flex items-center gap-3 titlebar-drag-region border-b border-white/[0.04]">
          <img
            src="/icon.png"
            alt="MouseDeck"
            className="w-7 h-7 rounded-lg object-contain border border-white/[0.1] shadow-xs"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-semibold text-slate-100 tracking-tight">
              MouseDeck
            </span>
            <span className="text-[10px] text-slate-500">Hardware Manager</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono ml-auto px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.05]">
            v{appVersion}
          </span>
        </div>

        {/* Device status card */}
        <div className="px-3 pt-3 pb-2">
          <div className="p-3 rounded-xl bg-[#141822] border border-white/[0.06] space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-200 truncate pr-2" title={device?.alias || device?.name || "No Device"}>
                {device?.alias || device?.name || "Microsoft Sculpt Comfort"}
              </span>
              <button
                onClick={onRefreshBluetooth}
                disabled={isRefreshing}
                title="Aggiorna stato Bluetooth"
                className="text-slate-400 hover:text-slate-200 transition-colors no-drag p-1 rounded hover:bg-white/[0.04]"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} />
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? "bg-emerald-400" : "bg-slate-600"
                  }`}
                />
                <span className={isConnected ? "text-slate-300 font-medium" : "text-slate-500"}>
                  {isConnected ? t("common.connected") : t("common.disconnected")}
                </span>
              </div>
              <span className="font-mono text-[10px] text-slate-500">
                {device?.address ? device.address.slice(-8) : "BT / 2.4G"}
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
                <span>{t("sidebar.battery")}</span>
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
                    <span className="font-mono text-[10px] font-medium text-slate-300">
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
        <nav className="px-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/25 shadow-xs font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-indigo-400" : "text-slate-500"
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer: Language selector & Master toggle */}
      <div className="border-t border-white/[0.06] bg-[#0d0f15]">
        {/* Language switcher */}
        <div className="px-4 py-2.5 flex items-center justify-between text-xs border-b border-white/[0.04]">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>{t("sidebar.language")}</span>
          </div>
          <div className="flex items-center bg-white/[0.04] p-0.5 rounded-lg border border-white/[0.06]">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  language === lang.code
                    ? "bg-white/[0.12] text-white shadow-xs font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {lang.code.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Master engine toggle */}
        <div className="p-3">
          <div className="flex items-center justify-between px-1 py-1">
            <div className="flex flex-col">
              <span className="text-xs font-medium text-slate-200">{t("sidebar.remap")}</span>
              <span className="text-[10px] text-slate-500">
                {enabled ? t("sidebar.engineActive") : t("sidebar.enginePaused")}
              </span>
            </div>

            <button
              onClick={() => onToggleEnabled(!enabled)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                enabled ? "bg-indigo-600" : "bg-slate-700"
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm ${
                  enabled ? "translate-x-4.5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
