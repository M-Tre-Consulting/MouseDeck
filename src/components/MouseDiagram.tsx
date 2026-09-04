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
  width = 240,
  height = 310,
}) => {
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
          {/* Subtle chassis gradient */}
          <linearGradient id="chassisGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a1c24" />
            <stop offset="70%" stopColor="#121319" />
            <stop offset="100%" stopColor="#0b0c10" />
          </linearGradient>

          {/* Microsoft Windows Blue Touch Strip */}
          <linearGradient id="blueStrip" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0078d4" />
            <stop offset="100%" stopColor="#005a9e" />
          </linearGradient>

          {/* Active Strip Glow Gradient */}
          <linearGradient id="blueStripActive" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Soft shadow */}
        <ellipse cx="120" cy="165" rx="80" ry="115" fill="rgba(0,0,0,0.45)" filter="blur(8px)" />

        {/* Outer Ergonomic Silhouette (Sculpt Comfort Asymmetric Curve) */}
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

        {/* Left & Right Button Divider Line */}
        <line x1="120" y1="30" x2="120" y2="115" stroke="#252834" strokeWidth="1.5" />

        {/* Scroll Wheel Housing */}
        <rect x="108" y="58" width="24" height="56" rx="6" fill="#090a0e" stroke="#1c1f28" strokeWidth="1" />

        {/* Scroll Wheel */}
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

        {/* Wheel Texture Ridges */}
        {[-14, -7, 0, 7, 14].map((offset) => (
          <line
            key={offset}
            x1="113"
            y1={86 + offset}
            x2="127"
            y2={86 + offset}
            stroke={isMiddleClick ? "#ffffff" : "#171a22"}
            strokeWidth="1.2"
          />
        ))}

        {/* Tilt Left Indicator */}
        <g className={`transition-opacity duration-150 ${isTiltLeft ? "opacity-100" : "opacity-25"}`}>
          <path
            d="M 102 86 L 93 86 M 97 82 L 93 86 L 97 90"
            stroke={isTiltLeft ? "#38bdf8" : "#818cf8"}
            strokeWidth={isTiltLeft ? "2.5" : "1.5"}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Tilt Right Indicator */}
        <g className={`transition-opacity duration-150 ${isTiltRight ? "opacity-100" : "opacity-25"}`}>
          <path
            d="M 138 86 L 147 86 M 143 82 L 147 86 L 143 90"
            stroke={isTiltRight ? "#38bdf8" : "#818cf8"}
            strokeWidth={isTiltRight ? "2.5" : "1.5"}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* ============================================================ */}
        {/* THE ICONIC BLUE WINDOWS TOUCH STRIP ON LEFT THUMB REST       */}
        {/* ============================================================ */}

        {/* Glow halo when active */}
        {isStripActive && (
          <rect
            x="35"
            y="120"
            width="24"
            height="74"
            rx="12"
            fill="none"
            stroke="#0078d4"
            strokeWidth="4"
            opacity="0.5"
            filter="url(#softGlow)"
          />
        )}

        {/* Main Blue Touch Strip */}
        <rect
          x="37"
          y="122"
          width="20"
          height="70"
          rx="10"
          fill={isStripActive ? "url(#blueStripActive)" : "url(#blueStrip)"}
          stroke={isStripActive ? "#7dd3fc" : "#004578"}
          strokeWidth="1.2"
          className="transition-all duration-200"
        />

        {/* Gesture icon inside the strip */}
        {isSwipeUp ? (
          <g>
            <path
              d="M 47 165 L 47 142 M 42 147 L 47 142 L 52 147"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        ) : isSwipeDown ? (
          <g>
            <path
              d="M 47 142 L 47 165 M 42 160 L 47 165 L 52 160"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        ) : isWinClick ? (
          <circle cx="47" cy="157" r="4.5" fill="#ffffff" />
        ) : (
          /* Subtle Windows Flag */
          <g transform="translate(42.5, 152.5)" fill="#ffffff" opacity="0.9">
            <rect x="0" y="0" width="4" height="4" rx="0.5" />
            <rect x="5" y="0" width="4" height="4" rx="0.5" />
            <rect x="0" y="5" width="4" height="4" rx="0.5" />
            <rect x="5" y="5" width="4" height="4" rx="0.5" />
          </g>
        )}

        {/* Subtle Microsoft mark at base */}
        <g transform="translate(114, 225)" fill="#232733" opacity="0.6">
          <rect x="0" y="0" width="5" height="5" />
          <rect x="7" y="0" width="5" height="5" />
          <rect x="0" y="7" width="5" height="5" />
          <rect x="7" y="7" width="5" height="5" />
        </g>
      </svg>
    </div>
  );
};
