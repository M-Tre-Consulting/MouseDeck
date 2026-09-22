import React, { useState } from "react";
import { ActionConfig } from "../types";
import { KeyComboBadge } from "./Keycap";
import { useI18n } from "../i18n";

export interface MouseDiagramProps {
  activeTrigger?: string | null;
  hoveredTrigger?: string | null;
  driverId?: string;
  className?: string;
  width?: number;
  height?: number;
  onTriggerClick?: (triggerId: string, triggerName: string) => void;
  onTriggerHover?: (triggerId: string | null) => void;
  mappings?: Record<string, ActionConfig>;
  showTooltips?: boolean;
}

export const G502_TRIGGER_INFO: Record<
  string,
  { name: string; desc: string; pos: { x: number; y: number } }
> = {
  g6_sniper: {
    name: "Tasto Sniper (G6)",
    desc: "Pulsante DPI Shift / Pollice",
    pos: { x: 50, y: 180 },
  },
  g4_back: {
    name: "Tasto Laterale Indietro (G4)",
    desc: "Pulsante pollice inferiore",
    pos: { x: 60, y: 188 },
  },
  g5_forward: {
    name: "Tasto Laterale Avanti (G5)",
    desc: "Pulsante pollice superiore",
    pos: { x: 62, y: 150 },
  },
  g7_dpi_down: {
    name: "Pulsante Indice DPI Giù (G7)",
    desc: "Tasto indice inferiore",
    pos: { x: 76, y: 104 },
  },
  g8_dpi_up: {
    name: "Pulsante Indice DPI Su (G8)",
    desc: "Tasto indice superiore",
    pos: { x: 76, y: 74 },
  },
  g9_profile: {
    name: "Pulsante Profilo / Macro (G9)",
    desc: "Tasto centrale dietro rotellina",
    pos: { x: 130, y: 146 },
  },
  middle_click: {
    name: "Click Rotellina Centrale",
    desc: "Pulsante 3 rotellina",
    pos: { x: 130, y: 80 },
  },
  tilt_left: {
    name: "Inclinazione Sinistra (Tilt L)",
    desc: "Spinta rotellina verso sinistra",
    pos: { x: 110, y: 81 },
  },
  tilt_right: {
    name: "Inclinazione Destra (Tilt R)",
    desc: "Spinta rotellina verso destra",
    pos: { x: 150, y: 81 },
  },
};

export const SCULPT_TRIGGER_INFO: Record<
  string,
  { name: string; desc: string; pos: { x: number; y: number } }
> = {
  swipe_up: {
    name: "Swipe Up (Scorri in Alto)",
    desc: "Gesto verso l'alto su touch strip",
    pos: { x: 46, y: 126 },
  },
  swipe_down: {
    name: "Swipe Down (Scorri in Basso)",
    desc: "Gesto verso il basso su touch strip",
    pos: { x: 46, y: 186 },
  },
  windows_click: {
    name: "Pulsante Windows Touch",
    desc: "Click fisico su striscia blu",
    pos: { x: 46, y: 156 },
  },
  middle_click: {
    name: "Click Rotellina Centrale",
    desc: "Pulsante 3 centrale",
    pos: { x: 120, y: 86 },
  },
  tilt_left: {
    name: "Inclinazione Sinistra (Tilt L)",
    desc: "Spinta rotellina verso sinistra",
    pos: { x: 100, y: 86 },
  },
  tilt_right: {
    name: "Inclinazione Destra (Tilt R)",
    desc: "Spinta rotellina verso destra",
    pos: { x: 140, y: 86 },
  },
};

export const MX_ANYWHERE_TRIGGER_INFO: Record<
  string,
  { name: string; desc: string; pos: { x: number; y: number } }
> = {
  back: {
    name: "Pulsante Laterale Indietro",
    desc: "Tasto pollice inferiore (Back)",
    pos: { x: 50, y: 172 },
  },
  forward: {
    name: "Pulsante Laterale Avanti",
    desc: "Tasto pollice superiore (Forward)",
    pos: { x: 50, y: 132 },
  },
  middle_click: {
    name: "Click Rotellina MagSpeed",
    desc: "Pulsante 3 centrale della rotella",
    pos: { x: 120, y: 78 },
  },
  tilt_left: {
    name: "Inclinazione Sinistra (Tilt L)",
    desc: "Spinta rotellina verso sinistra",
    pos: { x: 98, y: 78 },
  },
  tilt_right: {
    name: "Inclinazione Destra (Tilt R)",
    desc: "Spinta rotellina verso destra",
    pos: { x: 142, y: 78 },
  },
};

export const MouseDiagram: React.FC<MouseDiagramProps> = ({
  activeTrigger,
  hoveredTrigger,
  driverId = "logitech_g502_x",
  className = "",
  width = 240,
  height = 310,
  onTriggerClick,
  onTriggerHover,
  mappings = {},
  showTooltips = true,
}) => {
  const isG502 =
    driverId === "logitech_g502_x" ||
    (activeTrigger && activeTrigger.startsWith("g")) ||
    (hoveredTrigger && hoveredTrigger.startsWith("g"));

  const isMxAnywhere =
    driverId === "logitech_mx_anywhere_2s" ||
    driverId === "logitech_mx_anywhere_3" ||
    activeTrigger === "back" ||
    activeTrigger === "forward" ||
    hoveredTrigger === "back" ||
    hoveredTrigger === "forward";

  if (isG502) {
    return (
      <G502Diagram
        activeTrigger={activeTrigger}
        hoveredTrigger={hoveredTrigger}
        className={className}
        width={width}
        height={height}
        onTriggerClick={onTriggerClick}
        onTriggerHover={onTriggerHover}
        mappings={mappings}
        showTooltips={showTooltips}
      />
    );
  }

  if (isMxAnywhere) {
    return (
      <MxAnywhereDiagram
        driverId={driverId}
        activeTrigger={activeTrigger}
        hoveredTrigger={hoveredTrigger}
        className={className}
        width={width}
        height={height}
        onTriggerClick={onTriggerClick}
        onTriggerHover={onTriggerHover}
        mappings={mappings}
        showTooltips={showTooltips}
      />
    );
  }

  return (
    <SculptDiagram
      activeTrigger={activeTrigger}
      hoveredTrigger={hoveredTrigger}
      className={className}
      width={width}
      height={height}
      onTriggerClick={onTriggerClick}
      onTriggerHover={onTriggerHover}
      mappings={mappings}
      showTooltips={showTooltips}
    />
  );
};

// =============================================================================
// Tooltip subcomponent for diagrams
// =============================================================================
const DiagramTooltip: React.FC<{
  info: { name: string; desc: string; pos: { x: number; y: number } };
  action?: ActionConfig;
  triggerId: string;
  viewBoxWidth: number;
  viewBoxHeight: number;
}> = ({ info, action, triggerId, viewBoxWidth, viewBoxHeight }) => {
  const { t, language } = useI18n();
  const displayName = t(`triggers.${triggerId}.name`, info.name);
  const displayDesc = t(`triggers.${triggerId}.desc`, info.desc);

  const leftPct = (info.pos.x / viewBoxWidth) * 100;
  const topPct = (info.pos.y / viewBoxHeight) * 100;
  const isRightSide = info.pos.x > viewBoxWidth / 2;

  let transform = isRightSide
    ? "translate(15px, -50%)"
    : "translate(calc(-100% - 15px), -50%)";

  if (info.pos.x > 95 && info.pos.x < 165) {
    transform = info.pos.y < 120 ? "translate(-50%, -125%)" : "translate(-50%, 25px)";
  }

  return (
    <div
      className="absolute pointer-events-none z-30 transition-all duration-150 animate-in fade-in zoom-in-95 bg-[#14161f] p-2.5 rounded-xl shadow-xl border border-white/[0.12] text-left min-w-[190px] max-w-[240px]"
      style={{
        left: `${leftPct}%`,
        top: `${topPct}%`,
        transform,
      }}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
        <span className="font-semibold text-xs text-white leading-tight truncate">
          {displayName}
        </span>
      </div>
      <p className="text-[10px] text-slate-400 leading-tight mb-1.5">{displayDesc}</p>

      {action ? (
        <div className="pt-1.5 border-t border-white/[0.08] flex items-center justify-between gap-2">
          <span className="text-[10px] text-slate-500 font-medium uppercase shrink-0">
            {language === "en" ? "Action:" : "Azione:"}
          </span>
          {action.type === "key_combo" ? (
            <KeyComboBadge combo={action.value} size="sm" />
          ) : (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.08] text-indigo-300 truncate">
              {action.name || action.value}
            </span>
          )}
        </div>
      ) : (
        <div className="pt-1.5 border-t border-white/[0.08] text-[10px] text-slate-500 italic">
          {language === "en" ? "System default action" : "Azione predefinita di sistema"}
        </div>
      )}

      <div className="mt-1.5 pt-1 border-t border-white/[0.05] flex items-center justify-between text-[9px] text-slate-500 font-mono">
        <span>{triggerId}</span>
        <span className="text-indigo-400 font-sans font-medium">
          {language === "en" ? "Click to remap ↗" : "Clicca per rimappare ↗"}
        </span>
      </div>
    </div>
  );
};

// =============================================================================
// Logitech G502 X Lightspeed Vector Diagram
// =============================================================================
const G502Diagram: React.FC<{
  activeTrigger?: string | null;
  hoveredTrigger?: string | null;
  className?: string;
  width: number;
  height: number;
  onTriggerClick?: (triggerId: string, triggerName: string) => void;
  onTriggerHover?: (triggerId: string | null) => void;
  mappings?: Record<string, ActionConfig>;
  showTooltips?: boolean;
}> = ({
  activeTrigger,
  hoveredTrigger,
  className,
  width,
  height,
  onTriggerClick,
  onTriggerHover,
  mappings = {},
  showTooltips = true,
}) => {
  const [internalHover, setInternalHover] = useState<string | null>(null);
  const currentHover = hoveredTrigger !== undefined ? hoveredTrigger : internalHover;

  const isG4 = activeTrigger === "g4_back" || currentHover === "g4_back";
  const isG5 = activeTrigger === "g5_forward" || currentHover === "g5_forward";
  const isG6 = activeTrigger === "g6_sniper" || currentHover === "g6_sniper";
  const isG7 = activeTrigger === "g7_dpi_down" || currentHover === "g7_dpi_down";
  const isG8 = activeTrigger === "g8_dpi_up" || currentHover === "g8_dpi_up";
  const isG9 = activeTrigger === "g9_profile" || currentHover === "g9_profile";
  const isMiddleClick = activeTrigger === "middle_click" || currentHover === "middle_click";
  const isTiltLeft = activeTrigger === "tilt_left" || currentHover === "tilt_left";
  const isTiltRight = activeTrigger === "tilt_right" || currentHover === "tilt_right";

  const handleHover = (id: string | null) => {
    setInternalHover(id);
    onTriggerHover?.(id);
  };

  const handleClick = (id: string) => {
    const info = G502_TRIGGER_INFO[id];
    onTriggerClick?.(id, info?.name || id);
  };

  const activeTooltipInfo = currentHover ? G502_TRIGGER_INFO[currentHover] : null;

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 260 330"
        width={width}
        height={height}
        className="transition-all duration-300 drop-shadow-2xl overflow-visible"
      >
        <defs>
          <linearGradient id="g502Chassis" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e212b" />
            <stop offset="50%" stopColor="#14161f" />
            <stop offset="100%" stopColor="#0a0b0f" />
          </linearGradient>

          <linearGradient id="g502Clicker" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#252a38" />
            <stop offset="100%" stopColor="#12141c" />
          </linearGradient>

          <linearGradient id="gActiveGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>

          <linearGradient id="metalWheel" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2d3345" />
            <stop offset="50%" stopColor="#47526b" />
            <stop offset="100%" stopColor="#2d3345" />
          </linearGradient>

          <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Drop Shadow */}
        <ellipse cx="130" cy="180" rx="95" ry="125" fill="rgba(0,0,0,0.5)" filter="blur(10px)" />

        {/* Thumb Rest Wing */}
        <path
          d="M 68 145
             C 45 155, 24 185, 25 220
             C 26 242, 42 258, 65 264
             C 80 268, 90 268, 98 266
             Z"
          fill="#11131a"
          stroke="#262b3a"
          strokeWidth="1.5"
        />

        {/* Thumb Rest Textured Grip Lines */}
        <path d="M 38 200 Q 52 212 60 230" stroke="#1f2330" strokeWidth="1.5" fill="none" />
        <path d="M 44 210 Q 56 222 64 240" stroke="#1f2330" strokeWidth="1.5" fill="none" />

        {/* G6 Sniper Button */}
        <g
          className="cursor-pointer group"
          onMouseEnter={() => handleHover("g6_sniper")}
          onMouseLeave={() => handleHover(null)}
          onClick={() => handleClick("g6_sniper")}
        >
          <path
            d="M 38 178
               C 38 170, 48 166, 56 166
               C 62 166, 65 174, 65 186
               C 65 196, 58 202, 50 202
               C 42 202, 38 190, 38 178
               Z"
            fill={isG6 ? "url(#gActiveGlow)" : "#1c202d"}
            stroke={isG6 ? "#818cf8" : "#32394e"}
            strokeWidth={isG6 ? "2" : "1"}
            filter={isG6 ? "url(#cyanGlow)" : undefined}
            className="transition-all duration-150"
          />
          <text
            x="51"
            y="188"
            fontSize="8"
            fontWeight="bold"
            textAnchor="middle"
            fill={isG6 ? "#ffffff" : "#7e8b9f"}
            className="pointer-events-none"
          >
            G6
          </text>
        </g>

        {/* Main Body */}
        <path
          d="M 85 32
             C 105 28, 120 28, 130 35
             C 140 28, 155 28, 175 32
             C 188 65, 195 105, 194 140
             C 192 185, 202 210, 196 248
             C 190 285, 168 302, 130 302
             C 95 302, 70 285, 68 248
             C 66 215, 68 180, 68 140
             C 68 105, 75 65, 85 32
             Z"
          fill="url(#g502Chassis)"
          stroke="#262b3a"
          strokeWidth="1.5"
        />

        {/* Left Primary Clicker */}
        <path
          d="M 85 33
             L 124 38
             L 124 135
             L 94 135
             L 68 135
             L 68 105
             C 74 75, 80 50, 85 33
             Z"
          fill="url(#g502Clicker)"
          stroke="#2d3345"
          strokeWidth="1"
        />

        {/* Right Primary Clicker */}
        <path
          d="M 136 38
             L 175 33
             C 180 50, 186 75, 192 105
             L 192 135
             L 166 135
             L 136 135
             Z"
          fill="url(#g502Clicker)"
          stroke="#2d3345"
          strokeWidth="1"
        />

        {/* Center Gap between clickers */}
        <line x1="130" y1="35" x2="130" y2="130" stroke="#08090d" strokeWidth="2.5" />

        {/* Index Finger Wing: G8 and G7 */}
        {/* G8 Button */}
        <g
          className="cursor-pointer"
          onMouseEnter={() => handleHover("g8_dpi_up")}
          onMouseLeave={() => handleHover(null)}
          onClick={() => handleClick("g8_dpi_up")}
        >
          <path
            d="M 72 66
               L 86 62
               L 86 86
               L 70 86
               Z"
            fill={isG8 ? "url(#gActiveGlow)" : "#222736"}
            stroke={isG8 ? "#818cf8" : "#3b435b"}
            strokeWidth={isG8 ? "1.8" : "1"}
            filter={isG8 ? "url(#cyanGlow)" : undefined}
            className="transition-all duration-150"
          />
          <text
            x="78"
            y="77"
            fontSize="7.5"
            fontWeight="bold"
            textAnchor="middle"
            fill={isG8 ? "#ffffff" : "#8b9ab4"}
            className="pointer-events-none"
          >
            G8
          </text>
        </g>

        {/* G7 Button */}
        <g
          className="cursor-pointer"
          onMouseEnter={() => handleHover("g7_dpi_down")}
          onMouseLeave={() => handleHover(null)}
          onClick={() => handleClick("g7_dpi_down")}
        >
          <path
            d="M 70 91
               L 86 91
               L 86 116
               L 68 116
               Z"
            fill={isG7 ? "url(#gActiveGlow)" : "#222736"}
            stroke={isG7 ? "#818cf8" : "#3b435b"}
            strokeWidth={isG7 ? "1.8" : "1"}
            filter={isG7 ? "url(#cyanGlow)" : undefined}
            className="transition-all duration-150"
          />
          <text
            x="78"
            y="106"
            fontSize="7.5"
            fontWeight="bold"
            textAnchor="middle"
            fill={isG7 ? "#ffffff" : "#8b9ab4"}
            className="pointer-events-none"
          >
            G7
          </text>
        </g>

        {/* G5 Forward Button */}
        <g
          className="cursor-pointer"
          onMouseEnter={() => handleHover("g5_forward")}
          onMouseLeave={() => handleHover(null)}
          onClick={() => handleClick("g5_forward")}
        >
          <path
            d="M 58 138
               C 58 135, 68 135, 69 135
               L 69 166
               L 56 162
               Z"
            fill={isG5 ? "url(#gActiveGlow)" : "#222736"}
            stroke={isG5 ? "#818cf8" : "#3b435b"}
            strokeWidth={isG5 ? "1.8" : "1"}
            filter={isG5 ? "url(#cyanGlow)" : undefined}
            className="transition-all duration-150"
          />
          <text
            x="63"
            y="153"
            fontSize="7"
            fontWeight="bold"
            textAnchor="middle"
            fill={isG5 ? "#ffffff" : "#8b9ab4"}
            className="pointer-events-none"
          >
            G5
          </text>
        </g>

        {/* G4 Back Button */}
        <g
          className="cursor-pointer"
          onMouseEnter={() => handleHover("g4_back")}
          onMouseLeave={() => handleHover(null)}
          onClick={() => handleClick("g4_back")}
        >
          <path
            d="M 56 166
               L 69 170
               L 69 204
               L 54 196
               Z"
            fill={isG4 ? "url(#gActiveGlow)" : "#222736"}
            stroke={isG4 ? "#818cf8" : "#3b435b"}
            strokeWidth={isG4 ? "1.8" : "1"}
            filter={isG4 ? "url(#cyanGlow)" : undefined}
            className="transition-all duration-150"
          />
          <text
            x="62"
            y="188"
            fontSize="7"
            fontWeight="bold"
            textAnchor="middle"
            fill={isG4 ? "#ffffff" : "#8b9ab4"}
            className="pointer-events-none"
          >
            G4
          </text>
        </g>

        {/* Scroll Wheel Well */}
        <rect x="119" y="52" width="22" height="58" rx="4" fill="#08090d" stroke="#1b1e2a" strokeWidth="1" />

        {/* Tilt Left Indicator Arrow */}
        <path
          d="M 115 76 L 110 81 L 115 86 Z"
          fill={isTiltLeft ? "#818cf8" : "#2f3649"}
          filter={isTiltLeft ? "url(#cyanGlow)" : undefined}
          className="transition-colors duration-150 cursor-pointer"
          onMouseEnter={() => handleHover("tilt_left")}
          onMouseLeave={() => handleHover(null)}
          onClick={() => handleClick("tilt_left")}
        />

        {/* Tilt Right Indicator Arrow */}
        <path
          d="M 145 76 L 150 81 L 145 86 Z"
          fill={isTiltRight ? "#818cf8" : "#2f3649"}
          filter={isTiltRight ? "url(#cyanGlow)" : undefined}
          className="transition-colors duration-150 cursor-pointer"
          onMouseEnter={() => handleHover("tilt_right")}
          onMouseLeave={() => handleHover(null)}
          onClick={() => handleClick("tilt_right")}
        />

        {/* Metallic Dual-Mode Scroll Wheel */}
        <g
          className="cursor-pointer"
          onMouseEnter={() => handleHover("middle_click")}
          onMouseLeave={() => handleHover(null)}
          onClick={() => handleClick("middle_click")}
        >
          <rect
            x="122"
            y="56"
            width="16"
            height="50"
            rx="4"
            fill={isMiddleClick ? "url(#gActiveGlow)" : "url(#metalWheel)"}
            stroke={isMiddleClick ? "#818cf8" : "#5a6685"}
            strokeWidth={isMiddleClick ? "2" : "1"}
            filter={isMiddleClick ? "url(#cyanGlow)" : undefined}
            className="transition-all duration-150"
          />

          {/* Wheel Rubber Ribs */}
          {[-14, -7, 0, 7, 14].map((offset) => (
            <line
              key={offset}
              x1="124"
              y1={81 + offset}
              x2="136"
              y2={81 + offset}
              stroke={isMiddleClick ? "#ffffff" : "#171a24"}
              strokeWidth="1.5"
            />
          ))}
        </g>

        {/* Wheel Mode Switch (Mechanical) */}
        <rect x="123" y="116" width="14" height="12" rx="2" fill="#171a24" stroke="#2b3144" strokeWidth="1" />
        <circle cx="130" cy="122" r="2.5" fill="#384055" />

        {/* G9 Profile / Extra Button */}
        <g
          className="cursor-pointer"
          onMouseEnter={() => handleHover("g9_profile")}
          onMouseLeave={() => handleHover(null)}
          onClick={() => handleClick("g9_profile")}
        >
          <path
            d="M 122 136
               L 138 136
               L 136 156
               L 124 156
               Z"
            fill={isG9 ? "url(#gActiveGlow)" : "#222736"}
            stroke={isG9 ? "#818cf8" : "#3b435b"}
            strokeWidth={isG9 ? "1.8" : "1"}
            filter={isG9 ? "url(#cyanGlow)" : undefined}
            className="transition-all duration-150"
          />
          <text
            x="130"
            y="148"
            fontSize="7.5"
            fontWeight="bold"
            textAnchor="middle"
            fill={isG9 ? "#ffffff" : "#8b9ab4"}
            className="pointer-events-none"
          >
            G9
          </text>
        </g>

        {/* Palm Crease Geometric Lines */}
        <path
          d="M 90 200
             C 110 208, 150 208, 170 200"
          stroke="#1f2330"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M 130 162
             L 130 195"
          stroke="#1a1e29"
          strokeWidth="1.2"
          strokeDasharray="2 2"
        />

        {/* Logitech G Logo Badge */}
        <g transform="translate(116, 235)">
          <path
            d="M 14 0
               C 6.27 0, 0 6.27, 0 14
               C 0 21.73, 6.27 28, 14 28
               C 21.73 28, 28 21.73, 28 14
               L 16 14
               L 16 17
               L 23.5 17
               C 22.2 21.2, 18.5 24, 14 24
               C 8.48 24, 4 19.52, 4 14
               C 4 8.48, 8.48 4, 14 4
               C 17.5 4, 20.6 5.8, 22.3 8.5
               L 25.5 5.8
               C 23 2.2, 18.8 0, 14 0
               Z"
            fill="#2c3347"
          />
          <circle cx="14" cy="14" r="2.5" fill="#818cf8" opacity="0.6" />
        </g>
      </svg>

      {/* Floating Tooltip */}
      {showTooltips && activeTooltipInfo && currentHover && (
        <DiagramTooltip
          info={activeTooltipInfo}
          action={mappings[currentHover]}
          triggerId={currentHover}
          viewBoxWidth={260}
          viewBoxHeight={330}
        />
      )}
    </div>
  );
};

// =============================================================================
// Microsoft Sculpt Comfort Vector Diagram
// =============================================================================
const SculptDiagram: React.FC<{
  activeTrigger?: string | null;
  hoveredTrigger?: string | null;
  className?: string;
  width: number;
  height: number;
  onTriggerClick?: (triggerId: string, triggerName: string) => void;
  onTriggerHover?: (triggerId: string | null) => void;
  mappings?: Record<string, ActionConfig>;
  showTooltips?: boolean;
}> = ({
  activeTrigger,
  hoveredTrigger,
  className,
  width,
  height,
  onTriggerClick,
  onTriggerHover,
  mappings = {},
  showTooltips = true,
}) => {
  const [internalHover, setInternalHover] = useState<string | null>(null);
  const currentHover = hoveredTrigger !== undefined ? hoveredTrigger : internalHover;

  const isSwipeUp = activeTrigger === "swipe_up" || currentHover === "swipe_up";
  const isSwipeDown = activeTrigger === "swipe_down" || currentHover === "swipe_down";
  const isWinClick = activeTrigger === "windows_click" || currentHover === "windows_click";
  const isStripActive = isSwipeUp || isSwipeDown || isWinClick;

  const isTiltLeft = activeTrigger === "tilt_left" || currentHover === "tilt_left";
  const isTiltRight = activeTrigger === "tilt_right" || currentHover === "tilt_right";
  const isMiddleClick = activeTrigger === "middle_click" || currentHover === "middle_click";

  const handleHover = (id: string | null) => {
    setInternalHover(id);
    onTriggerHover?.(id);
  };

  const handleClick = (id: string) => {
    const info = SCULPT_TRIGGER_INFO[id];
    onTriggerClick?.(id, info?.name || id);
  };

  const activeTooltipInfo = currentHover ? SCULPT_TRIGGER_INFO[currentHover] : null;

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 240 310"
        width={width}
        height={height}
        className="transition-all duration-300 drop-shadow-xl overflow-visible"
      >
        <defs>
          <linearGradient id="chassisGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a1c24" />
            <stop offset="70%" stopColor="#121319" />
            <stop offset="100%" stopColor="#0b0c10" />
          </linearGradient>

          <linearGradient id="blueStrip" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0078d4" />
            <stop offset="100%" stopColor="#005a9e" />
          </linearGradient>

          <linearGradient id="blueStripActive" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>

          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <ellipse cx="120" cy="165" rx="80" ry="115" fill="rgba(0,0,0,0.45)" filter="blur(8px)" />

        <path
          d="M 120 30
             C 180 32, 202 100, 200 170
             C 198 225, 170 275, 120 275
             C 65 275, 36 230, 36 165
             C 36 115, 52 55, 88 35
             Z"
          fill="url(#chassisGrad)"
          stroke="#272b38"
          strokeWidth="1.5"
        />

        <line x1="120" y1="30" x2="120" y2="115" stroke="#252834" strokeWidth="1.5" />

        <rect x="108" y="58" width="24" height="56" rx="6" fill="#090a0e" stroke="#1c1f28" strokeWidth="1" />

        <g
          className="cursor-pointer"
          onMouseEnter={() => handleHover("middle_click")}
          onMouseLeave={() => handleHover(null)}
          onClick={() => handleClick("middle_click")}
        >
          <rect
            x="111"
            y="62"
            width="18"
            height="48"
            rx="5"
            fill={isMiddleClick ? "#6366f1" : "#2f3544"}
            stroke={isMiddleClick ? "#818cf8" : "#454d60"}
            strokeWidth="1"
            className="transition-colors duration-150"
          />

          {[-14, -7, 0, 7, 14].map((offset) => (
            <line
              key={offset}
              x1="113"
              y1={86 + offset}
              x2="127"
              y2={86 + offset}
              stroke="#1c1f28"
              strokeWidth="1"
            />
          ))}
        </g>

        <path
          d="M 104 82 L 98 86 L 104 90 Z"
          fill={isTiltLeft ? "#818cf8" : "#2b3040"}
          filter={isTiltLeft ? "url(#softGlow)" : undefined}
          className="transition-colors duration-150 cursor-pointer"
          onMouseEnter={() => handleHover("tilt_left")}
          onMouseLeave={() => handleHover(null)}
          onClick={() => handleClick("tilt_left")}
        />
        <path
          d="M 136 82 L 142 86 L 136 90 Z"
          fill={isTiltRight ? "#818cf8" : "#2b3040"}
          filter={isTiltRight ? "url(#softGlow)" : undefined}
          className="transition-colors duration-150 cursor-pointer"
          onMouseEnter={() => handleHover("tilt_right")}
          onMouseLeave={() => handleHover(null)}
          onClick={() => handleClick("tilt_right")}
        />

        <g filter={isStripActive ? "url(#softGlow)" : undefined} className="transition-all duration-200">
          <path
            d="M 37 132
               C 38 118, 48 116, 52 116
               C 56 122, 57 185, 52 195
               C 47 195, 38 190, 37 178
               Z"
            fill={isStripActive ? "url(#blueStripActive)" : "url(#blueStrip)"}
            stroke={isStripActive ? "#818cf8" : "#0284c7"}
            strokeWidth={isStripActive ? "1.8" : "1"}
            className="transition-all duration-200"
          />

          {/* Windows Click */}
          <g
            transform="translate(41, 148)"
            className="cursor-pointer"
            onMouseEnter={() => handleHover("windows_click")}
            onMouseLeave={() => handleHover(null)}
            onClick={() => handleClick("windows_click")}
          >
            <rect x="0" y="0" width="4.5" height="4.5" rx="0.5" fill={isWinClick ? "#ffffff" : "rgba(255,255,255,0.85)"} />
            <rect x="5.5" y="0" width="4.5" height="4.5" rx="0.5" fill={isWinClick ? "#ffffff" : "rgba(255,255,255,0.85)"} />
            <rect x="0" y="5.5" width="4.5" height="4.5" rx="0.5" fill={isWinClick ? "#ffffff" : "rgba(255,255,255,0.85)"} />
            <rect x="5.5" y="5.5" width="4.5" height="4.5" rx="0.5" fill={isWinClick ? "#ffffff" : "rgba(255,255,255,0.85)"} />
          </g>

          {/* Swipe Up Arrow */}
          <path
            d="M 46 126 L 43 131 L 49 131 Z"
            fill={isSwipeUp ? "#ffffff" : "rgba(255,255,255,0.4)"}
            className="transition-colors duration-150 cursor-pointer"
            onMouseEnter={() => handleHover("swipe_up")}
            onMouseLeave={() => handleHover(null)}
            onClick={() => handleClick("swipe_up")}
          />

          {/* Swipe Down Arrow */}
          <path
            d="M 46 186 L 43 181 L 49 181 Z"
            fill={isSwipeDown ? "#ffffff" : "rgba(255,255,255,0.4)"}
            className="transition-colors duration-150 cursor-pointer"
            onMouseEnter={() => handleHover("swipe_down")}
            onMouseLeave={() => handleHover(null)}
            onClick={() => handleClick("swipe_down")}
          />
        </g>
      </svg>

      {/* Floating Tooltip */}
      {showTooltips && activeTooltipInfo && currentHover && (
        <DiagramTooltip
          info={activeTooltipInfo}
          action={mappings[currentHover]}
          triggerId={currentHover}
          viewBoxWidth={240}
          viewBoxHeight={310}
        />
      )}
    </div>
  );
};

// =============================================================================
// Logitech MX Anywhere 2S / 3 Vector Diagram
// =============================================================================
const MxAnywhereDiagram: React.FC<{
  driverId?: string;
  activeTrigger?: string | null;
  hoveredTrigger?: string | null;
  className?: string;
  width: number;
  height: number;
  onTriggerClick?: (triggerId: string, triggerName: string) => void;
  onTriggerHover?: (triggerId: string | null) => void;
  mappings?: Record<string, ActionConfig>;
  showTooltips?: boolean;
}> = ({
  driverId,
  activeTrigger,
  hoveredTrigger,
  className = "",
  width,
  height,
  onTriggerClick,
  onTriggerHover,
  mappings = {},
  showTooltips = true,
}) => {
  const [internalHover, setInternalHover] = useState<string | null>(null);
  const currentHover = hoveredTrigger !== undefined ? hoveredTrigger : internalHover;

  const isBack = activeTrigger === "back" || currentHover === "back";
  const isForward = activeTrigger === "forward" || currentHover === "forward";
  const isMiddleClick = activeTrigger === "middle_click" || currentHover === "middle_click";
  const isTiltLeft = activeTrigger === "tilt_left" || currentHover === "tilt_left";
  const isTiltRight = activeTrigger === "tilt_right" || currentHover === "tilt_right";

  const handleHover = (id: string | null) => {
    setInternalHover(id);
    onTriggerHover?.(id);
  };

  const handleClick = (id: string) => {
    const info = MX_ANYWHERE_TRIGGER_INFO[id];
    onTriggerClick?.(id, info?.name || id);
  };

  const activeTooltipInfo = currentHover ? MX_ANYWHERE_TRIGGER_INFO[currentHover] : null;
  const is3Series = driverId === "logitech_mx_anywhere_3";

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 240 310"
        width={width}
        height={height}
        className="transition-all duration-300 drop-shadow-2xl overflow-visible"
      >
        <defs>
          <linearGradient id="mxChassis" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#222631" />
            <stop offset="45%" stopColor="#181a23" />
            <stop offset="100%" stopColor="#0d0e14" />
          </linearGradient>

          <linearGradient id="mxGrip" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#15171f" />
            <stop offset="100%" stopColor="#0a0b0f" />
          </linearGradient>

          <linearGradient id="mxClicker" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2b303d" />
            <stop offset="100%" stopColor="#161821" />
          </linearGradient>

          <linearGradient id="mxActiveGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>

          <linearGradient id="mxMetalWheel" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3a4153" />
            <stop offset="35%" stopColor="#73819c" />
            <stop offset="65%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#3a4153" />
          </linearGradient>

          <filter id="mxGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient shadow */}
        <ellipse cx="120" cy="165" rx="82" ry="120" fill="rgba(0,0,0,0.5)" filter="blur(10px)" />

        {/* Left textured grip zone (faceted silicone pattern) */}
        <path
          d="M 52 110
             C 46 135, 46 185, 54 215
             C 58 228, 66 242, 75 252
             L 68 245
             C 52 225, 42 185, 42 150
             C 42 125, 46 100, 52 110
             Z"
          fill="url(#mxGrip)"
          stroke="#262b3a"
          strokeWidth="1"
        />

        {/* Right textured grip zone */}
        <path
          d="M 188 110
             C 194 135, 194 185, 186 215
             C 182 228, 174 242, 165 252
             L 172 245
             C 188 225, 198 185, 198 150
             C 198 125, 194 100, 188 110
             Z"
          fill="url(#mxGrip)"
          stroke="#262b3a"
          strokeWidth="1"
        />

        {/* Grip Diamond Facet Details */}
        <path d="M 46 140 L 52 148 L 46 156" stroke="#1d202b" strokeWidth="1" fill="none" />
        <path d="M 45 160 L 52 168 L 47 176" stroke="#1d202b" strokeWidth="1" fill="none" />
        <path d="M 48 180 L 55 188 L 51 196" stroke="#1d202b" strokeWidth="1" fill="none" />

        <path d="M 194 140 L 188 148 L 194 156" stroke="#1d202b" strokeWidth="1" fill="none" />
        <path d="M 195 160 L 188 168 L 193 176" stroke="#1d202b" strokeWidth="1" fill="none" />
        <path d="M 192 180 L 185 188 L 189 196" stroke="#1d202b" strokeWidth="1" fill="none" />

        {/* Main Chassis Body */}
        <path
          d="M 80 34
             C 100 28, 140 28, 160 34
             C 185 45, 196 90, 194 140
             C 192 185, 190 220, 178 255
             C 168 282, 148 296, 120 296
             C 92 296, 72 282, 62 255
             C 50 220, 48 185, 46 140
             C 44 90, 55 45, 80 34
             Z"
          fill="url(#mxChassis)"
          stroke="#2d3345"
          strokeWidth="1.5"
        />

        {/* Left Primary Clicker */}
        <path
          d="M 80 34
             L 116 38
             L 116 130
             L 54 130
             C 50 90, 60 55, 80 34
             Z"
          fill="url(#mxClicker)"
          stroke="#384156"
          strokeWidth="1"
        />

        {/* Right Primary Clicker */}
        <path
          d="M 160 34
             L 124 38
             L 124 130
             L 186 130
             C 190 90, 180 55, 160 34
             Z"
          fill="url(#mxClicker)"
          stroke="#384156"
          strokeWidth="1"
        />

        {/* Center Clicker Gap */}
        <line x1="120" y1="36" x2="120" y2="125" stroke="#0e1017" strokeWidth="2" />

        {/* Thumb Forward Button */}
        <g
          className="cursor-pointer"
          onMouseEnter={() => handleHover("forward")}
          onMouseLeave={() => handleHover(null)}
          onClick={() => handleClick("forward")}
        >
          <path
            d="M 44 122
               C 44 116, 52 116, 54 117
               L 54 144
               C 52 144, 43 142, 43 136
               Z"
            fill={isForward ? "url(#mxActiveGlow)" : "#252b3b"}
            stroke={isForward ? "#818cf8" : "#3b445c"}
            strokeWidth={isForward ? "1.8" : "1"}
            filter={isForward ? "url(#mxGlow)" : undefined}
            className="transition-all duration-150"
          />
          <text
            x="48"
            y="133"
            fontSize="6"
            fontWeight="bold"
            textAnchor="middle"
            fill={isForward ? "#ffffff" : "#94a3b8"}
            className="pointer-events-none"
          >
            F
          </text>
        </g>

        {/* Thumb Back Button */}
        <g
          className="cursor-pointer"
          onMouseEnter={() => handleHover("back")}
          onMouseLeave={() => handleHover(null)}
          onClick={() => handleClick("back")}
        >
          <path
            d="M 43 148
               C 43 145, 52 147, 54 147
               L 54 174
               C 52 176, 45 174, 45 168
               Z"
            fill={isBack ? "url(#mxActiveGlow)" : "#252b3b"}
            stroke={isBack ? "#818cf8" : "#3b445c"}
            strokeWidth={isBack ? "1.8" : "1"}
            filter={isBack ? "url(#mxGlow)" : undefined}
            className="transition-all duration-150"
          />
          <text
            x="49"
            y="163"
            fontSize="6"
            fontWeight="bold"
            textAnchor="middle"
            fill={isBack ? "#ffffff" : "#94a3b8"}
            className="pointer-events-none"
          >
            B
          </text>
        </g>

        {/* Scroll Wheel Well */}
        <rect x="110" y="50" width="20" height="56" rx="4" fill="#0b0c12" stroke="#1d212d" strokeWidth="1" />

        {/* Tilt Left Arrow */}
        <path
          d="M 106 74 L 100 78 L 106 82 Z"
          fill={isTiltLeft ? "#818cf8" : "#333d52"}
          filter={isTiltLeft ? "url(#mxGlow)" : undefined}
          className="transition-colors duration-150 cursor-pointer"
          onMouseEnter={() => handleHover("tilt_left")}
          onMouseLeave={() => handleHover(null)}
          onClick={() => handleClick("tilt_left")}
        />

        {/* Tilt Right Arrow */}
        <path
          d="M 134 74 L 140 78 L 134 82 Z"
          fill={isTiltRight ? "#818cf8" : "#333d52"}
          filter={isTiltRight ? "url(#mxGlow)" : undefined}
          className="transition-colors duration-150 cursor-pointer"
          onMouseEnter={() => handleHover("tilt_right")}
          onMouseLeave={() => handleHover(null)}
          onClick={() => handleClick("tilt_right")}
        />

        {/* MagSpeed Machined Aluminum Wheel */}
        <g
          className="cursor-pointer"
          onMouseEnter={() => handleHover("middle_click")}
          onMouseLeave={() => handleHover(null)}
          onClick={() => handleClick("middle_click")}
        >
          <rect
            x="112"
            y="54"
            width="16"
            height="48"
            rx="4"
            fill={isMiddleClick ? "url(#mxActiveGlow)" : "url(#mxMetalWheel)"}
            stroke={isMiddleClick ? "#818cf8" : "#64748b"}
            strokeWidth={isMiddleClick ? "2" : "1"}
            filter={isMiddleClick ? "url(#mxGlow)" : undefined}
            className="transition-all duration-150"
          />

          {/* Wheel Texture Grips */}
          {[-12, -6, 0, 6, 12].map((offset) => (
            <line
              key={offset}
              x1="114"
              y1={78 + offset}
              x2="126"
              y2={78 + offset}
              stroke={isMiddleClick ? "#ffffff" : "#1e2430"}
              strokeWidth="1.2"
            />
          ))}
        </g>

        {/* Mode Shift / Gesture Button behind wheel */}
        <rect
          x="114"
          y="114"
          width="12"
          height="12"
          rx="2"
          fill="#1b1f2b"
          stroke="#30384a"
          strokeWidth="1"
        />
        <circle cx="120" cy="120" r="2" fill="#475569" />

        {/* Model Subtitle / Series Text */}
        <text
          x="120"
          y="200"
          fontSize="9"
          fontWeight="bold"
          textAnchor="middle"
          letterSpacing="1.5"
          fill="#475569"
          className="select-none font-sans"
        >
          {is3Series ? "MX ANYWHERE 3" : "MX ANYWHERE 2S"}
        </text>

        {/* Logitech "logi" logo badge */}
        <g transform="translate(108, 220)">
          <text
            x="12"
            y="12"
            fontSize="11"
            fontWeight="bold"
            textAnchor="middle"
            fill="#334155"
            letterSpacing="0.5"
            className="select-none font-sans"
          >
            logi
          </text>
        </g>
      </svg>

      {/* Floating Tooltip */}
      {showTooltips && activeTooltipInfo && currentHover && (
        <DiagramTooltip
          info={activeTooltipInfo}
          action={mappings[currentHover]}
          triggerId={currentHover}
          viewBoxWidth={240}
          viewBoxHeight={310}
        />
      )}
    </div>
  );
};


