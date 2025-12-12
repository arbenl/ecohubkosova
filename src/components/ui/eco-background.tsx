// Eco-themed background patterns and decorative elements

import { cn } from "@/lib/utils"

interface EcoBackgroundProps {
  variant?: "leaves" | "circles" | "waves" | "dots"
  opacity?: number
  className?: string
  children?: React.ReactNode
}

// Subtle leaf pattern SVG
const LeafPattern = () => (
  <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="leaf-pattern" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
        {/* Leaf 1 */}
        <path
          d="M20 30 Q30 20 40 30 Q30 45 20 30"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          opacity="0.3"
        />
        {/* Leaf 2 - rotated */}
        <path
          d="M80 70 Q90 55 100 70 Q90 85 80 70"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          opacity="0.2"
          transform="rotate(45 90 70)"
        />
        {/* Small circle accent */}
        <circle cx="60" cy="100" r="2" fill="currentColor" opacity="0.15" />
        {/* Tiny leaf */}
        <path
          d="M100 20 Q105 15 110 20 Q105 28 100 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.4"
          opacity="0.2"
        />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#leaf-pattern)" />
  </svg>
)

// Organic circles pattern
const CirclePattern = () => (
  <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern
        id="circle-pattern"
        x="0"
        y="0"
        width="100"
        height="100"
        patternUnits="userSpaceOnUse"
      >
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          opacity="0.1"
        />
        <circle
          cx="50"
          cy="50"
          r="25"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.4"
          opacity="0.08"
        />
        <circle
          cx="50"
          cy="50"
          r="10"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.3"
          opacity="0.06"
        />
        <circle cx="10" cy="10" r="5" fill="currentColor" opacity="0.05" />
        <circle cx="90" cy="90" r="3" fill="currentColor" opacity="0.04" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#circle-pattern)" />
  </svg>
)

// Wave pattern
const WavePattern = () => (
  <svg
    className="absolute inset-0 w-full h-full"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="none"
  >
    <defs>
      <pattern id="wave-pattern" x="0" y="0" width="200" height="40" patternUnits="userSpaceOnUse">
        <path
          d="M0 20 Q50 0 100 20 T200 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          opacity="0.1"
        />
        <path
          d="M0 30 Q50 10 100 30 T200 30"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.3"
          opacity="0.07"
        />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#wave-pattern)" />
  </svg>
)

// Dots pattern
const DotsPattern = () => (
  <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="dots-pattern" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
        <circle cx="15" cy="15" r="1.5" fill="currentColor" opacity="0.1" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#dots-pattern)" />
  </svg>
)

const patterns = {
  leaves: LeafPattern,
  circles: CirclePattern,
  waves: WavePattern,
  dots: DotsPattern,
}

export function EcoBackground({
  variant = "leaves",
  opacity = 1,
  className,
  children,
}: EcoBackgroundProps) {
  const Pattern = patterns[variant]

  return (
    <div className={cn("relative", className)}>
      {/* Background pattern layer */}
      <div
        className="absolute inset-0 pointer-events-none text-emerald-600 overflow-hidden"
        style={{ opacity }}
        aria-hidden="true"
      >
        <Pattern />
      </div>

      {/* Gradient overlay for depth */}
      <div
        className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-white/30 to-white/60"
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

// Floating decorative elements
export function FloatingLeaves({ className }: { className?: string }) {
  return (
    <div
      className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}
      aria-hidden="true"
    >
      {/* Top right leaf */}
      <svg
        className="absolute -top-10 -right-10 w-40 h-40 text-emerald-200 opacity-50 animate-pulse"
        viewBox="0 0 100 100"
        fill="currentColor"
      >
        <path d="M50 0 Q80 25 50 50 Q20 25 50 0 M50 50 L50 100" />
      </svg>

      {/* Bottom left leaf */}
      <svg
        className="absolute -bottom-5 -left-5 w-32 h-32 text-emerald-200 opacity-40 transform rotate-180"
        viewBox="0 0 100 100"
        fill="currentColor"
      >
        <path d="M50 0 Q80 25 50 50 Q20 25 50 0" />
      </svg>

      {/* Middle right circle */}
      <div className="absolute top-1/2 -right-20 w-40 h-40 rounded-full bg-emerald-100 opacity-20 blur-3xl" />

      {/* Top left blur */}
      <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-teal-100 opacity-30 blur-3xl" />
    </div>
  )
}

// Recycling-themed decorative element
export function RecycleAccent({ className }: { className?: string }) {
  return (
    <div className={cn("text-emerald-200 opacity-20", className)} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M12 4V2.21c0-.45-.54-.67-.85-.35l-2.8 2.79c-.2.2-.2.51 0 .71l2.79 2.79c.32.31.86.09.86-.36V6c3.31 0 6 2.69 6 6 0 .79-.15 1.56-.44 2.25-.15.36-.04.77.23 1.04.51.51 1.37.33 1.64-.34.37-.91.57-1.91.57-2.95 0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-.79.15-1.56.44-2.25.15-.36.04-.77-.23-1.04-.51-.51-1.37-.33-1.64.34C4.2 9.96 4 10.96 4 12c0 4.42 3.58 8 8 8v1.79c0 .45.54.67.85.35l2.79-2.79c.2-.2.2-.51 0-.71l-2.79-2.79c-.31-.31-.85-.09-.85.36V18z" />
      </svg>
    </div>
  )
}
