import React from "react";

interface MouseDiagramProps {
  activeTrigger?: string | null;
  className?: string;
  width?: number;
  height?: number;
}

export const MouseDiagram: React.FC<MouseDiagramProps> = ({
  activeTrigger,
  className = "",
  width = 280,
  height = 360,
}) => {
  const isSwipeUp = activeTrigger === "swipe_up";
  const isSwipeDown = activeTrigger === "swipe_down";
  const isWinClick = activeTrigger === "windows_click";
  const isStripActive = isSwipeUp || isSwipeDown || isWinClick;

  const isTiltLeft = activeTrigger === "tilt_left";
  const isTiltRight = activeTrigger === "tilt_right";
  const isMiddleClick = activeTrigger === "middle_click";

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 280 360"
        width={width}
        height={height}
        className="transition-all duration-300 drop-shadow-2xl"
      >
        <defs>
          {/* Subtle body gradient */}
          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="60%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#090d16" />
          </linearGradient>

          {/* Blue Windows Strip gradient */}
          <linearGradient id="blueStripGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00a8ff" />
            <stop offset="100%" stopColor="#0066cc" />
          </linearGradient>

          {/* Glowing strip gradient when active */}
          <linearGradient id="stripGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          {/* Filter for neon glow */}
          <filter id="neonGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="wheelGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Soft shadow under mouse */}
        <ellipse cx="140" cy="190" rx="95" ry="140" fill="rgba(0,0,0,0.5)" filter="blur(10px)" />

        {/* Outer Ergonomic Mouse Body (Asymmetric Sculpt Comfort curvature) */}
        <path
          d="M 140 40
             C 210 42, 235 120, 232 200
             C 230 265, 195 320, 140 320
             C 75 320, 42 270, 42 195
             C 42 135, 60 70, 100 45
             Z"
          fill="url(#bodyGradient)"
          stroke="#334155"
          strokeWidth="2.5"
          className="transition-colors duration-200"
        />

        {/* Center line separating Left and Right click buttons */}
        <path d="M 140 40 L 140 135" stroke="#334155" strokeWidth="2" strokeLinecap="round" />

        {/* Scroll wheel housing pocket */}
        <rect x="127" y="70" width="26" height="64" rx="8" fill="#020617" stroke="#1e293b" strokeWidth="1" />

        {/* Scroll Wheel */}
        <rect
          x="130"
          y="74"
          width="20"
          height="56"
          rx="6"
          fill={isMiddleClick ? "#38bdf8" : "#475569"}
          stroke={isMiddleClick ? "#0284c7" : "#64748b"}
          strokeWidth="1.5"
          filter={isMiddleClick ? "url(#wheelGlow)" : undefined}
          className="transition-all duration-150"
        />

        {/* Scroll wheel grip ridges */}
        {[-16, -8, 0, 8, 16].map((offset) => (
          <line
            key={offset}
            x1="133"
            y1={102 + offset}
            x2="147"
            y2={102 + offset}
            stroke={isMiddleClick ? "#ffffff" : "#1e293b"}
            strokeWidth="1.5"
          />
        ))}

        {/* Tilt Left Arrow */}
        <g
          className={`transition-all duration-150 ${
            isTiltLeft ? "opacity-100 filter drop-shadow-[0_0_8px_#38bdf8]" : "opacity-30 hover:opacity-75"
          }`}
        >
          <path
            d="M 120 102 L 108 102 M 113 97 L 108 102 L 113 107"
            stroke={isTiltLeft ? "#38bdf8" : "#94a3b8"}
            strokeWidth={isTiltLeft ? "3" : "2"}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Tilt Right Arrow */}
        <g
          className={`transition-all duration-150 ${
            isTiltRight ? "opacity-100 filter drop-shadow-[0_0_8px_#38bdf8]" : "opacity-30 hover:opacity-75"
          }`}
        >
          <path
            d="M 160 102 L 172 102 M 167 97 L 172 102 L 167 107"
            stroke={isTiltRight ? "#38bdf8" : "#94a3b8"}
            strokeWidth={isTiltRight ? "3" : "2"}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* ============================================================ */}
        {/* THE ICONIC MICROSOFT SCULPT COMFORT BLUE WINDOWS TOUCH STRIP */}
        {/* ============================================================ */}
        {/* Outer glowing aura when active */}
        {isStripActive && (
          <rect
            x="40"
            y="140"
            width="28"
            height="86"
            rx="14"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="8"
            opacity="0.6"
            filter="url(#neonGlow)"
          />
        )}

        {/* Main Touch Strip Pill */}
        <rect
          x="44"
          y="144"
          width="20"
          height="78"
          rx="10"
          fill={isStripActive ? "url(#stripGlowGrad)" : "url(#blueStripGrad)"}
          stroke={isStripActive ? "#bae6fd" : "#0284c7"}
          strokeWidth={isStripActive ? "2" : "1.2"}
          className={`transition-all duration-200 cursor-pointer ${
            isStripActive ? "scale-105" : ""
          }`}
        />

        {/* Strip Inner Graphics based on active gesture */}
        {isSwipeUp ? (
          /* Animated Up Arrow on Swipe Up */
          <g className="animate-bounce">
            <path
              d="M 54 195 L 54 165 M 48 172 L 54 165 L 60 172"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        ) : isSwipeDown ? (
          /* Animated Down Arrow on Swipe Down */
          <g className="animate-bounce">
            <path
              d="M 54 165 L 54 195 M 48 188 L 54 195 L 60 188"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        ) : isWinClick ? (
          /* Pulsing Dot / Windows Square on Click */
          <circle cx="54" cy="183" r="5" fill="#ffffff" filter="drop-shadow(0 0 4px #ffffff)" />
        ) : (
          /* Default Windows 4-tile logo */
          <g transform="translate(48, 177)" fill="#ffffff" opacity="0.85">
            <rect x="0" y="0" width="5" height="5" rx="0.5" />
            <rect x="6.5" y="0" width="5" height="5" rx="0.5" />
            <rect x="0" y="6.5" width="5" height="5" rx="0.5" />
            <rect x="6.5" y="6.5" width="5" height="5" rx="0.5" />
          </g>
        )}

        {/* Microsoft logo emblem subtly at palm base */}
        <g transform="translate(133, 260)" fill="#475569" opacity="0.4">
          <rect x="0" y="0" width="6" height="6" />
          <rect x="8" y="0" width="6" height="6" />
          <rect x="0" y="8" width="6" height="6" />
          <rect x="8" y="8" width="6" height="6" />
        </g>
      </svg>
    </div>
  );
};
