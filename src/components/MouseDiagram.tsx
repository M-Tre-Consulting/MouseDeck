import React from "react";

interface MouseDiagramProps {
  activeTrigger?: string | null;
  driverId?: string;
  className?: string;
  width?: number;
  height?: number;
}

export const MouseDiagram: React.FC<MouseDiagramProps> = ({
  activeTrigger,
  driverId = "logitech_g502_x",
  className = "",
  width = 240,
  height = 310,
}) => {
  const isG502 = driverId === "logitech_g502_x" || (activeTrigger && activeTrigger.startsWith("g"));

  if (isG502) {
    return (
      <G502Diagram
        activeTrigger={activeTrigger}
        className={className}
        width={width}
        height={height}
      />
    );
  }

  return (
    <SculptDiagram
      activeTrigger={activeTrigger}
      className={className}
      width={width}
      height={height}
    />
  );
};

// =============================================================================
// Logitech G502 X Lightspeed Vector Diagram
// =============================================================================
const G502Diagram: React.FC<{
  activeTrigger?: string | null;
  className?: string;
  width: number;
  height: number;
}> = ({ activeTrigger, className, width, height }) => {
  const isG4 = activeTrigger === "g4_back";
  const isG5 = activeTrigger === "g5_forward";
  const isG6 = activeTrigger === "g6_sniper";
  const isG7 = activeTrigger === "g7_dpi_down";
  const isG8 = activeTrigger === "g8_dpi_up";
  const isG9 = activeTrigger === "g9_profile";
  const isMiddleClick = activeTrigger === "middle_click";
  const isTiltLeft = activeTrigger === "tilt_left";
  const isTiltRight = activeTrigger === "tilt_right";

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 260 330"
        width={width}
        height={height}
        className="transition-all duration-300 drop-shadow-2xl"
      >
        <defs>
          {/* Main Dark Faceted Chassis */}
          <linearGradient id="g502Chassis" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e212b" />
            <stop offset="50%" stopColor="#14161f" />
            <stop offset="100%" stopColor="#0a0b0f" />
          </linearGradient>

          {/* Primary Click Flanges (Matte PBT) */}
          <linearGradient id="g502Clicker" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#252a38" />
            <stop offset="100%" stopColor="#12141c" />
          </linearGradient>

          {/* Cyan Glow for active Logitech G triggers */}
          <linearGradient id="gActiveGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f2fe" />
            <stop offset="100%" stopColor="#4facfe" />
          </linearGradient>

          {/* Wheel Metal Accent */}
          <linearGradient id="metalWheel" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2d3345" />
            <stop offset="50%" stopColor="#47526b" />
            <stop offset="100%" stopColor="#2d3345" />
          </linearGradient>

          <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Drop Shadow */}
        <ellipse cx="130" cy="180" rx="95" ry="125" fill="rgba(0,0,0,0.5)" filter="blur(10px)" />

        {/* Thumb Rest Wing (Left protrusion) */}
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

        {/* G6 Sniper Button (Thumb Rest Front Paddle) */}
        <path
          d="M 38 178
             C 38 170, 48 166, 56 166
             C 62 166, 65 174, 65 186
             C 65 196, 58 202, 50 202
             C 42 202, 38 190, 38 178
             Z"
          fill={isG6 ? "url(#gActiveGlow)" : "#1c202d"}
          stroke={isG6 ? "#38bdf8" : "#32394e"}
          strokeWidth={isG6 ? "2" : "1"}
          filter={isG6 ? "url(#cyanGlow)" : undefined}
          className="transition-all duration-150 cursor-pointer"
        />
        <text
          x="51"
          y="188"
          fontSize="8"
          fontWeight="bold"
          textAnchor="middle"
          fill={isG6 ? "#0c0d12" : "#7e8b9f"}
        >
          G6
        </text>

        {/* Main Sculpted Body Silhouette */}
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

        {/* Left Primary Clicker (Lightforce) */}
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

        {/* Right Primary Clicker (Lightforce) */}
        <path
          d="M 175 33
             L 136 38
             L 136 135
             L 194 135
             C 194 105, 186 65, 175 33
             Z"
          fill="url(#g502Clicker)"
          stroke="#2d3345"
          strokeWidth="1"
        />

        {/* Center Divider Gap */}
        <line x1="130" y1="38" x2="130" y2="135" stroke="#0e1017" strokeWidth="2.5" />

        {/* G8 Button (Index Wing - Upper DPI Up) */}
        <path
          d="M 72 66
             L 86 62
             L 86 86
             L 70 86
             Z"
          fill={isG8 ? "url(#gActiveGlow)" : "#222736"}
          stroke={isG8 ? "#38bdf8" : "#3b435b"}
          strokeWidth={isG8 ? "1.8" : "1"}
          filter={isG8 ? "url(#cyanGlow)" : undefined}
          className="transition-all duration-150 cursor-pointer"
        />
        <text
          x="78"
          y="77"
          fontSize="7.5"
          fontWeight="bold"
          textAnchor="middle"
          fill={isG8 ? "#0c0d12" : "#8b9ab4"}
        >
          G8
        </text>

        {/* G7 Button (Index Wing - Lower DPI Down) */}
        <path
          d="M 70 91
             L 86 91
             L 86 116
             L 68 116
             Z"
          fill={isG7 ? "url(#gActiveGlow)" : "#222736"}
          stroke={isG7 ? "#38bdf8" : "#3b435b"}
          strokeWidth={isG7 ? "1.8" : "1"}
          filter={isG7 ? "url(#cyanGlow)" : undefined}
          className="transition-all duration-150 cursor-pointer"
        />
        <text
          x="78"
          y="106"
          fontSize="7.5"
          fontWeight="bold"
          textAnchor="middle"
          fill={isG7 ? "#0c0d12" : "#8b9ab4"}
        >
          G7
        </text>

        {/* G5 Forward Button (Thumb Upper) */}
        <path
          d="M 58 138
             C 58 135, 68 135, 69 135
             L 69 166
             L 56 162
             Z"
          fill={isG5 ? "url(#gActiveGlow)" : "#222736"}
          stroke={isG5 ? "#38bdf8" : "#3b435b"}
          strokeWidth={isG5 ? "1.8" : "1"}
          filter={isG5 ? "url(#cyanGlow)" : undefined}
          className="transition-all duration-150 cursor-pointer"
        />
        <text
          x="63"
          y="153"
          fontSize="7"
          fontWeight="bold"
          textAnchor="middle"
          fill={isG5 ? "#0c0d12" : "#8b9ab4"}
        >
          G5
        </text>

        {/* G4 Back Button (Thumb Lower) */}
        <path
          d="M 56 166
             L 69 170
             L 69 204
             L 54 196
             Z"
          fill={isG4 ? "url(#gActiveGlow)" : "#222736"}
          stroke={isG4 ? "#38bdf8" : "#3b435b"}
          strokeWidth={isG4 ? "1.8" : "1"}
          filter={isG4 ? "url(#cyanGlow)" : undefined}
          className="transition-all duration-150 cursor-pointer"
        />
        <text
          x="62"
          y="188"
          fontSize="7"
          fontWeight="bold"
          textAnchor="middle"
          fill={isG4 ? "#0c0d12" : "#8b9ab4"}
        >
          G4
        </text>

        {/* Scroll Wheel Well */}
        <rect x="119" y="52" width="22" height="58" rx="4" fill="#08090d" stroke="#1b1e2a" strokeWidth="1" />

        {/* Tilt Left Indicator Arrow */}
        <path
          d="M 115 76 L 110 81 L 115 86 Z"
          fill={isTiltLeft ? "#00f2fe" : "#2f3649"}
          filter={isTiltLeft ? "url(#cyanGlow)" : undefined}
          className="transition-colors duration-150"
        />

        {/* Tilt Right Indicator Arrow */}
        <path
          d="M 145 76 L 150 81 L 145 86 Z"
          fill={isTiltRight ? "#00f2fe" : "#2f3649"}
          filter={isTiltRight ? "url(#cyanGlow)" : undefined}
          className="transition-colors duration-150"
        />

        {/* Metallic Dual-Mode Scroll Wheel */}
        <rect
          x="122"
          y="56"
          width="16"
          height="50"
          rx="4"
          fill={isMiddleClick ? "url(#gActiveGlow)" : "url(#metalWheel)"}
          stroke={isMiddleClick ? "#38bdf8" : "#5a6685"}
          strokeWidth={isMiddleClick ? "2" : "1"}
          filter={isMiddleClick ? "url(#cyanGlow)" : undefined}
          className="transition-all duration-150 cursor-pointer"
        />

        {/* Wheel Rubber Ribs */}
        {[-14, -7, 0, 7, 14].map((offset) => (
          <line
            key={offset}
            x1="124"
            y1={81 + offset}
            x2="136"
            y2={81 + offset}
            stroke={isMiddleClick ? "#0c0d12" : "#171a24"}
            strokeWidth="1.5"
          />
        ))}

        {/* Wheel Mode Switch (Mechanical - Non remappable) */}
        <rect x="123" y="116" width="14" height="12" rx="2" fill="#171a24" stroke="#2b3144" strokeWidth="1" />
        <circle cx="130" cy="122" r="2.5" fill="#384055" />

        {/* G9 Profile / Extra Button */}
        <path
          d="M 122 136
             L 138 136
             L 136 156
             L 124 156
             Z"
          fill={isG9 ? "url(#gActiveGlow)" : "#222736"}
          stroke={isG9 ? "#38bdf8" : "#3b435b"}
          strokeWidth={isG9 ? "1.8" : "1"}
          filter={isG9 ? "url(#cyanGlow)" : undefined}
          className="transition-all duration-150 cursor-pointer"
        />
        <text
          x="130"
          y="148"
          fontSize="7.5"
          fontWeight="bold"
          textAnchor="middle"
          fill={isG9 ? "#0c0d12" : "#8b9ab4"}
        >
          G9
        </text>

        {/* Palm Crease Geometric Lines (G502 X Signature) */}
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
          <circle cx="14" cy="14" r="2.5" fill="#00f2fe" opacity="0.6" filter="blur(1px)" />
        </g>
      </svg>
    </div>
  );
};

// =============================================================================
// Microsoft Sculpt Comfort Vector Diagram
// =============================================================================
const SculptDiagram: React.FC<{
  activeTrigger?: string | null;
  className?: string;
  width: number;
  height: number;
}> = ({ activeTrigger, className, width, height }) => {
  const isSwipeUp = activeTrigger === "swipe_up";
  const isSwipeDown = activeTrigger === "swipe_down";
  const isWinClick = activeTrigger === "windows_click";
  const isStripActive = isSwipeUp || isSwipeDown || isWinClick;

  const isTiltLeft = activeTrigger === "tilt_left";
  const isTiltRight = activeTrigger === "tilt_right";
  const isMiddleClick = activeTrigger === "middle_click";

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 240 310"
        width={width}
        height={height}
        className="transition-all duration-300 drop-shadow-xl"
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
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
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

        <rect
          x="111"
          y="62"
          width="18"
          height="48"
          rx="5"
          fill={isMiddleClick ? "#0078d4" : "#2f3544"}
          stroke={isMiddleClick ? "#38bdf8" : "#454d60"}
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

        <path
          d="M 104 82 L 98 86 L 104 90 Z"
          fill={isTiltLeft ? "#38bdf8" : "#2b3040"}
          filter={isTiltLeft ? "url(#softGlow)" : undefined}
          className="transition-colors duration-150"
        />
        <path
          d="M 136 82 L 142 86 L 136 90 Z"
          fill={isTiltRight ? "#38bdf8" : "#2b3040"}
          filter={isTiltRight ? "url(#softGlow)" : undefined}
          className="transition-colors duration-150"
        />

        <g
          filter={isStripActive ? "url(#softGlow)" : undefined}
          className="transition-all duration-200"
        >
          <path
            d="M 37 132
               C 38 118, 48 116, 52 116
               C 56 122, 57 185, 52 195
               C 47 195, 38 190, 37 178
               Z"
            fill={isStripActive ? "url(#blueStripActive)" : "url(#blueStrip)"}
            stroke={isStripActive ? "#7dd3fc" : "#0284c7"}
            strokeWidth={isStripActive ? "1.8" : "1"}
            className="transition-all duration-200"
          />

          <g transform="translate(41, 148)">
            <rect x="0" y="0" width="4.5" height="4.5" rx="0.5" fill={isWinClick ? "#ffffff" : "rgba(255,255,255,0.85)"} />
            <rect x="5.5" y="0" width="4.5" height="4.5" rx="0.5" fill={isWinClick ? "#ffffff" : "rgba(255,255,255,0.85)"} />
            <rect x="0" y="5.5" width="4.5" height="4.5" rx="0.5" fill={isWinClick ? "#ffffff" : "rgba(255,255,255,0.85)"} />
            <rect x="5.5" y="5.5" width="4.5" height="4.5" rx="0.5" fill={isWinClick ? "#ffffff" : "rgba(255,255,255,0.85)"} />
          </g>

          <path
            d="M 46 126 L 43 131 L 49 131 Z"
            fill={isSwipeUp ? "#ffffff" : "rgba(255,255,255,0.4)"}
            className="transition-colors duration-150"
          />
          <path
            d="M 46 186 L 43 181 L 49 181 Z"
            fill={isSwipeDown ? "#ffffff" : "rgba(255,255,255,0.4)"}
            className="transition-colors duration-150"
          />
        </g>
      </svg>
    </div>
  );
};

