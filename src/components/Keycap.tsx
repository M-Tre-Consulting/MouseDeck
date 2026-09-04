import React from "react";

interface KeyComboBadgeProps {
  combo: string;
  className?: string;
}

export const KeyComboBadge: React.FC<KeyComboBadgeProps> = ({ combo, className = "" }) => {
  if (!combo) {
    return <span className="text-xs text-slate-500 italic">Nessuno</span>;
  }

  const parts = combo.split("+").map((s) => s.trim());

  const formatKey = (key: string) => {
    switch (key.toLowerCase()) {
      case "super":
      case "win":
      case "meta":
        return "⊞ Super";
      case "ctrl":
      case "control":
        return "Ctrl";
      case "alt":
        return "Alt";
      case "shift":
        return "⇧ Shift";
      case "page_up":
      case "pageup":
        return "Page Up";
      case "page_down":
      case "pagedown":
        return "Page Down";
      case "tab":
        return "Tab ⇥";
      case "backspace":
        return "⌫ Back";
      case "space":
        return "Space";
      case "enter":
        return "↵ Enter";
      case "esc":
        return "Esc";
      default:
        return key.toUpperCase();
    }
  };

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      {parts.map((p, idx) => (
        <React.Fragment key={idx}>
          <span className="keycap">{formatKey(p)}</span>
          {idx < parts.length - 1 && (
            <span className="text-slate-500 text-[10px] font-bold select-none">+</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
