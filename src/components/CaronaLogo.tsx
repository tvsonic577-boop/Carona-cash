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
  // Brand color definitions
  const darkGreen = "#0E3F1F";
  const limeGreen = "#82C233";

  const renderLogoContent = () => (
    <svg 
      viewBox="0 0 100 100" 
      className="w-[90%] h-[90%] drop-shadow-[0_2px_4px_rgba(0,0,0,0.08)]" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background Soft Circle Base for maximum color clarity */}
      <circle cx="50" cy="50" r="47" fill="#ffffff" />

      {/* 1. LEFT PIN PATH (Dark Green) */}
      <path 
        d="M 48,12 C 27,13 16,27 16,44 Q 16,65 48,84 L 48,74 Q 25,58 25,44 Q 25,25 48,24 Z" 
        fill={darkGreen} 
      />

      {/* 2. RIGHT PIN PATH (Lime Green) */}
      <path 
        d="M 52,12 C 73,13 84,27 84,44 Q 84,65 52,84 L 52,74 Q 75,58 75,44 Q 75,25 52,24 Z" 
        fill={limeGreen} 
      />

      {/* 3. CENTER CAR LOGO */}
      {/* Taxi Roof Sign */}
      <path 
        d="M 45,26 L 47,21 C 47.5,19.5 49,19.5 50,19.5 C 51,19.5 52.5,19.5 53,21 L 55,26 Z" 
        fill={darkGreen} 
      />
      {/* Taxi Roof Sign Checkered pattern */}
      <rect x="48" y="21.5" width="2" height="2" fill={limeGreen} />
      <rect x="50" y="23.5" width="2" height="2" fill={limeGreen} />

      {/* Cabin Roof & Pillars */}
      <path 
        d="M 38,38 L 41,29 C 41.5,27.5 43,26.5 45,26.5 H 55 C 57,26.5 58.5,27.5 59,29 L 62,38 Z" 
        fill={darkGreen} 
      />
      {/* Windshield Glass Cutout */}
      <path 
        d="M 41,36.5 L 43,30.5 C 43.5,29.5 44.5,29 46,29 H 54 C 55.5,29 56.5,29.5 57,30.5 L 59,36.5 Z" 
        fill="#ffffff" 
      />

      {/* Side Mirrors */}
      <path 
        d="M 28,42 C 26,42 25.5,44.5 27,45 Z" 
        fill={darkGreen} 
      />
      <path 
        d="M 72,42 C 74,42 74.5,44.5 73,45 Z" 
        fill={darkGreen} 
      />

      {/* Car Base Body */}
      <path 
        d="M 34,38 C 30,38 28.5,41.5 28.5,45.5 L 29.5,58.5 C 29.5,61.5 32,61.5 33,61.5 L 34,61.5 L 35,64.5 C 35.3,65.5 36.5,65.5 38.5,65.5 C 40.5,65.5 40.8,65.5 41,64.5 L 41.5,61.5 H 58.5 L 59,64.5 C 59.2,65.5 60.5,65.5 62.5,65.5 C 64.5,65.5 64.7,65.5 65,64.5 L 66,61.5 H 67 C 68,61.5 70.5,61.5 70.5,58.5 L 71.5,45.5 C 71.5,41.5 70,38 66,38 Z" 
        fill={darkGreen} 
      />

      {/* Sleek Headlights */}
      <path 
        d="M 30,48.5 C 33.5,48.5 36.5,50 36.5,51.8 C 36.5,52.8 33.5,52.8 30,51 C 29.5,50.5 29.5,49.5 30,48.5 Z" 
        fill="#ffffff" 
      />
      <path 
        d="M 70,48.5 C 66.5,48.5 63.5,50 63.5,51.8 C 63.5,52.8 66.5,52.8 70,51 C 70.5,50.5 70.5,49.5 70,48.5 Z" 
        fill="#ffffff" 
      />

      {/* Bumper Chrome Lines / Grille */}
      <line x1="42" y1="53.5" x2="58" y2="53.5" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="44" y1="56.5" x2="56" y2="56.5" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />

      {/* 4. LOWER WINGS / LEAVES */}
      {/* Left dark green wing */}
      <path 
        d="M 37,86.5 C 44,86.5 47,88.5 48,89.5 C 44,90.5 37,90.5 37,88.5 Z" 
        fill={darkGreen} 
      />
      {/* Right lime green wing */}
      <path 
        d="M 63,86.5 C 56,86.5 53,88.5 52,89.5 C 56,90.5 63,90.5 63,88.5 Z" 
        fill={limeGreen} 
      />
    </svg>
  );

  if (animated) {
    return (
      <motion.div
        className={`relative ${className} flex items-center justify-center bg-white border border-slate-100 rounded-2xl shadow-md shrink-0 select-none overflow-visible`}
        animate={{
          scale: [1, 1.05, 0.97, 1.03, 1],
          y: [0, -4, 2, -1, 0]
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Soft pulsing halo background highlight using the exact lime-green glow */}
        <motion.div 
          className="absolute inset-0 bg-lime-400/25 rounded-2xl blur-lg -z-10"
          animate={{
            scale: [0.95, 1.3, 0.95],
            opacity: [0.35, 0.7, 0.35]
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {renderLogoContent()}
      </motion.div>
    );
  }

  return (
    <div className={`relative ${className} flex items-center justify-center bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow transition-shadow shrink-0 select-none`}>
      {renderLogoContent()}
    </div>
  );
};
