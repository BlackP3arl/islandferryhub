export default function SpeedboatIcon({ className = "w-8 h-8", color = "white" }: { className?: string; color?: string }) {
  const isLight = color === "white"
  const fillColor = isLight ? "white" : "#1F2937"
  const accentColor = isLight ? "white" : "#374151"
  const stripeColor = isLight ? "#BFDBFE" : "#93C5FD"
  
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Hull - solid black bow view */}
      <path
        d="M12 38 L16 50 L48 50 L52 38 L44 38 L40 34 L20 34 L16 38 Z"
        fill={fillColor}
        stroke={isLight ? "#9CA3AF" : "#4B5563"}
        strokeWidth="1"
      />
      
      {/* White stripe on hull */}
      <rect
        x="16"
        y="40"
        width="32"
        height="4"
        rx="1"
        fill={stripeColor}
      />
      
      {/* Windshield/cabin outline */}
      <path
        d="M22 34 L22 26 L38 26 L42 34"
        fill="none"
        stroke={fillColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Windshield glass */}
      <path
        d="M24 32 L24 28 L36 28 L39 32 Z"
        fill={isLight ? "rgba(191, 219, 254, 0.3)" : "rgba(147, 197, 253, 0.2)"}
      />
      
      {/* Flag pole */}
      <line
        x1="30"
        y1="26"
        x2="30"
        y2="16"
        stroke={fillColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      
      {/* Flag */}
      <path
        d="M30 16 L30 20 L36 18 Z"
        fill={isLight ? "#F87171" : "#FCA5A5"}
      />
      
      {/* Water ripple lines below */}
      <path
        d="M6 54 Q16 51 32 54 Q48 57 58 54"
        stroke={isLight ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.2)"}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M10 58 Q20 56 32 58 Q44 60 54 58"
        stroke={isLight ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.1)"}
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}
