import React from "react";

interface KeycapProps {
  label: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "accent" | "muted";
  className?: string;
}

export const formatKeyGlyph = (key: string): { symbol: string; text: string } => {
  const k = key.trim().toLowerCase();
  switch (k) {
    case "super":
    case "win":
    case "meta":
      return { symbol: "⊞", text: "Super" };
    case "ctrl":
    case "control":
      return { symbol: "⌃", text: "Ctrl" };
    case "alt":
      return { symbol: "⌥", text: "Alt" };
    case "shift":
      return { symbol: "⇧", text: "Shift" };
    case "page_up":
    case "pageup":
      return { symbol: "⇞", text: "PgUp" };
    case "page_down":
    case "pagedown":
      return { symbol: "⇟", text: "PgDn" };
    case "tab":
      return { symbol: "⇥", text: "Tab" };
    case "backspace":
      return { symbol: "⌫", text: "Back" };
    case "space":
      return { symbol: "␣", text: "Space" };
    case "enter":
    case "return":
      return { symbol: "↵", text: "Enter" };
    case "esc":
    case "escape":
      return { symbol: "⎋", text: "Esc" };
    case "up":
      return { symbol: "↑", text: "Up" };
    case "down":
      return { symbol: "↓", text: "Down" };
    case "left":
      return { symbol: "←", text: "Left" };
    case "right":
      return { symbol: "→", text: "Right" };
    case "delete":
    case "del":
      return { symbol: "⌦", text: "Del" };
    case "home":
      return { symbol: "↖", text: "Home" };
    case "end":
      return { symbol: "↘", text: "End" };
    case "insert":
    case "ins":
      return { symbol: "⎀", text: "Ins" };
    case "minus":
    case "-":
      return { symbol: "−", text: "-" };
    case "plus":
    case "equal":
    case "+":
    case "=":
      return { symbol: "+", text: "+" };
    default:
      return { symbol: "", text: key.length === 1 ? key.toUpperCase() : key };
  }
};

export const Keycap: React.FC<KeycapProps> = ({
  label,
  size = "sm",
  variant = "default",
  className = "",
}) => {
  const { symbol, text } = formatKeyGlyph(label);

  const sizeClasses = {
    sm: "px-2 py-0.5 min-w-[22px] h-[22px] text-[11px] gap-1",
    md: "px-2.5 py-1 min-w-[28px] h-[28px] text-xs gap-1.5",
    lg: "px-3.5 py-2 min-w-[38px] h-[38px] text-sm font-bold gap-2",
  }[size];

  const variantClasses = {
    default:
      "bg-gradient-to-b from-[#222736] to-[#161923] text-slate-100 border-white/[0.14] shadow-[0_2px_0_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.12)]",
    accent:
      "bg-gradient-to-b from-[#0e3b5e] to-[#092338] text-cyan-300 border-cyan-500/40 shadow-[0_2px_0_rgba(0,0,0,0.6),inset_0_1px_0_rgba(56,189,248,0.25)]",
    muted:
      "bg-[#14161f] text-slate-400 border-white/[0.08] shadow-[0_1px_0_rgba(0,0,0,0.4)]",
  }[variant];

  return (
    <kbd
      className={`inline-flex items-center justify-center font-mono font-medium rounded-md border select-none transition-transform active:translate-y-[1px] ${sizeClasses} ${variantClasses} ${className}`}
    >
      {symbol && <span className="opacity-75 text-[0.9em] leading-none">{symbol}</span>}
      <span className="leading-none">{text}</span>
    </kbd>
  );
};

interface KeyComboBadgeProps {
  combo: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const KeyComboBadge: React.FC<KeyComboBadgeProps> = ({
  combo,
  size = "sm",
  className = "",
}) => {
  if (!combo || !combo.trim()) {
    return <span className="text-xs text-slate-500 italic">Nessuna azione</span>;
  }

  const parts = combo
    .split("+")
    .map((s) => s.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return <span className="text-xs text-slate-500 italic">Nessuna azione</span>;
  }

  return (
    <div className={`inline-flex items-center gap-1.5 flex-wrap ${className}`}>
      {parts.map((part, idx) => (
        <React.Fragment key={idx}>
          <Keycap label={part} size={size} />
          {idx < parts.length - 1 && (
            <span className="text-slate-500 text-[11px] font-bold select-none leading-none">
              +
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
