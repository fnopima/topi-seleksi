import { motion } from 'motion/react';
import { StepPhase } from '../types/sorting';

interface SortingHatSvgProps {
  phase: StepPhase;
  accentColor?: string;
}

export function SortingHatSvg({ phase, accentColor = '#D4AF37' }: SortingHatSvgProps) {
  const isThinking = phase === 'thinking';
  const isRevealed = phase === 'revealed';

  return (
    <motion.div
      className="relative flex items-center justify-center pointer-events-none select-none"
      initial={{ y: -54, opacity: 0, scale: 0.85, rotate: -6 }}
      animate={
        phase === 'entering'
          ? { y: -22, opacity: 0.92, scale: 0.95, rotate: -3 }
          : isThinking
            ? {
                y: 0,
                opacity: 1,
                scale: 1,
                rotate: [-4, 4, -3, 3, 0],
              }
            : {
                y: -3,
                opacity: 1,
                scale: 1.04,
                rotate: 0,
              }
      }
      transition={{
        duration: isThinking ? 0.45 : 0.28,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {/* Subtle magical aura behind the hat during reveal */}
      <div
        className="absolute inset-0 rounded-full blur-xl transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle, ${isRevealed ? accentColor : '#D4AF37'}55 0%, transparent 70%)`,
          opacity: isThinking || isRevealed ? 0.9 : 0.2,
        }}
        aria-hidden="true"
      />

      <svg
        viewBox="0 0 220 175"
        className="relative w-44 h-36 sm:w-52 sm:h-40 drop-shadow-[0_12px_18px_rgba(0,0,0,0.75)]"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="hatLeather" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C5332" />
            <stop offset="48%" stopColor="#56361E" />
            <stop offset="100%" stopColor="#351F10" />
          </linearGradient>
          <linearGradient id="hatBrim" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6B4628" />
            <stop offset="100%" stopColor="#2B180C" />
          </linearGradient>
          <linearGradient id="hatBand" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2D241C" />
            <stop offset="50%" stopColor="#4A3C31" />
            <stop offset="100%" stopColor="#241C16" />
          </linearGradient>
        </defs>

        {/* Curved wide brim */}
        <path
          d="M 14 134 C 36 118, 68 113, 110 113 C 154 113, 188 120, 208 135 C 194 149, 152 154, 108 153 C 62 152, 26 146, 14 134 Z"
          fill="url(#hatBrim)"
          stroke="#21130A"
          strokeWidth="2.5"
        />
        <path
          d="M 28 136 C 58 144, 156 146, 194 135"
          fill="none"
          stroke="#9A6D43"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          opacity="0.6"
        />

        {/* Crown / main cone with bent witch-hat tip */}
        <path
          d="M 54 121 C 59 95, 67 66, 80 42 C 91 22, 112 10, 134 15 C 148 18, 157 28, 153 38 C 144 33, 132 34, 127 42 C 135 61, 151 92, 165 122 C 140 128, 82 128, 54 121 Z"
          fill="url(#hatLeather)"
          stroke="#21130A"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Hat leather band & brass buckle */}
        <path
          d="M 55 113 C 86 121, 136 121, 163 113 L 166 122 C 137 130, 84 130, 53 122 Z"
          fill="url(#hatBand)"
          stroke="#1B130D"
          strokeWidth="1.5"
        />
        <rect
          x="123"
          y="113"
          width="15"
          height="11"
          rx="2"
          fill="none"
          stroke="#D4AF37"
          strokeWidth="2.2"
        />

        {/* Stitched patch detail */}
        <path
          d="M 88 53 L 106 49 L 108 65 L 90 68 Z"
          fill="#694426"
          stroke="#2E1B0D"
          strokeWidth="1.3"
        />
        <path
          d="M 87 57 L 92 56 M 104 53 L 109 52 M 89 64 L 94 63 M 105 61 L 110 60"
          stroke="#C29B6B"
          strokeWidth="1.3"
          strokeLinecap="round"
        />

        {/* Expressive furrowed brow folds */}
        <path
          d="M 79 81 C 88 73, 100 74, 108 82"
          fill="none"
          stroke="#25150B"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M 116 82 C 124 74, 136 73, 143 81"
          fill="none"
          stroke="#25150B"
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* Shadowed eye creases */}
        <ellipse cx="94" cy="85" rx="9" ry="4.5" fill="#23140A" opacity="0.88" />
        <ellipse cx="128" cy="85" rx="9" ry="4.5" fill="#23140A" opacity="0.88" />

        {/* Expressive mouth crease that animates when speaking */}
        <motion.path
          d={
            isRevealed
              ? 'M 81 98 C 98 110, 124 110, 141 98 C 124 103, 98 103, 81 98 Z'
              : isThinking
                ? 'M 83 99 C 98 106, 124 106, 139 99 C 124 101, 98 101, 83 99 Z'
                : 'M 84 100 C 100 103, 122 103, 138 100'
          }
          fill={isRevealed || isThinking ? '#1E1008' : 'none'}
          stroke="#24140A"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </motion.div>
  );
}
