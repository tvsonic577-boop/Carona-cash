import React from 'react';
import { motion } from 'motion/react';

interface CaronaLogoProps {
  className?: string;
  animated?: boolean;
}

export const CaronaLogo: React.FC<CaronaLogoProps> = ({ 
  className = "w-12 h-12", 
  animated = false 
}) => {
  if (animated) {
    return (
      <motion.div
        className={`relative ${className} flex items-center justify-center bg-gradient-to-br from-emerald-450 via-emerald-500 to-teal-600 rounded-2xl shadow-xl shadow-emerald-500/30 shrink-0 select-none overflow-visible`}
        animate={{
          scale: [1, 1.04, 0.98, 1.02, 1],
          y: [0, -3, 2, -1, 0]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Soft rotating background glow highlight */}
        <motion.div 
          className="absolute inset-0 bg-emerald-500/40 rounded-2xl blur-lg -z-10"
          animate={{
            scale: [0.9, 1.25, 0.9],
            opacity: [0.4, 0.8, 0.4]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Elegant custom Carona 'C' path with an intersecting route/pin arrow */}
        <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Animated Route Line inside Logo */}
          <motion.path 
            d="M 75 25 C 60 10, 20 10, 20 35 C 20 65, 60 65, 75 50" 
            stroke="#ffffff" 
            strokeWidth="11" 
            strokeLinecap="round"
            animate={{
              strokeDasharray: ["120 120", "150 150"],
              strokeDashoffset: [0, -10]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />
          {/* Interactive Connecting loop arrow */}
          <motion.path 
            d="M 40 50 L 80 50" 
            stroke="#064e3b" 
            strokeWidth="11" 
            strokeLinecap="round"
            initial={{ scaleX: 0.8 }}
            animate={{ scaleX: [0.8, 1.15, 0.8] }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          {/* Pulsing indicator node */}
          <motion.circle 
            cx="80" 
            cy="50" 
            r="9.5" 
            fill="#fbbf24"
            stroke="#ffffff"
            strokeWidth="3.5"
            animate={{
              scale: [0.85, 1.35, 0.85],
              fill: ["#fbbf24", "#34d399", "#fbbf24"]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </svg>
      </motion.div>
    );
  }

  // Pure CSS elegant static version
  return (
    <div className={`relative ${className} flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-500/20 shrink-0 select-none`}>
      <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path 
          d="M 75 25 C 60 10, 20 10, 20 35 C 20 65, 60 65, 75 50" 
          stroke="#ffffff" 
          strokeWidth="11" 
          strokeLinecap="round"
        />
        <path 
          d="M 40 50 L 80 50" 
          stroke="#064e3b" 
          strokeWidth="11" 
          strokeLinecap="round"
        />
        <circle 
          cx="80" 
          cy="50" 
          r="9.5" 
          fill="#fbbf24"
          stroke="#ffffff"
          strokeWidth="3.5"
        />
      </svg>
    </div>
  );
};
