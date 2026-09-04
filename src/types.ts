export interface ActionConfig {
  type: string; // "key_combo" | "mouse_button" | "media" | "command" | "disabled" | "passthrough"
  value: string;
  name: string;
  description: string;
}

export interface AppConfig {
  enabled: boolean;
  autostart: boolean;
  active_profile: string;
  active_driver: string;
  profiles: Record<string, Record<string, ActionConfig>>;
}

export interface BluetoothDeviceInfo {
  address: string;
  name: string;
  alias: string;
  icon: string;
  connected: boolean;
  paired: boolean;
  trusted: boolean;
  blocked: boolean;
  adapter: string;
  modalias: string;
  vendor_id?: string;
  product_id?: string;
  battery_percentage?: number;
  battery_status_text?: string;
  is_sculpt_comfort: boolean;
}

export interface PermissionStatus {
  uinput_accessible: boolean;
  input_nodes_accessible: boolean;
  setup_script_path: string;
  message: string;
}

export interface GestureEventPayload {
  trigger_id: string;
  action_name: string;
  action_type: string;
  action_value: string;
  timestamp: string;
}
