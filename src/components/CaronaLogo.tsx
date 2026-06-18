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
      className="w-[90%] h-[90%] drop-shadow-[0_3px_6px_rgba(0,0,0,0.15)]" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Modern metallic emerald/forest green body gradient */}
        <linearGradient id="carBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="35%" stopColor="#047857" />
          <stop offset="100%" stopColor="#064e3b" />
        </linearGradient>

        {/* Realistic glossy obsidian glass reflection */}
        <linearGradient id="windshieldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="25%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>

        {/* High-intensity Xenon/LED projection headlights */}
        <linearGradient id="headlightGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#bae6fd" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
      </defs>

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

      {/* 3. CORE REALISTIC CAR ENGINE (CENTER LOGO) */}
      
      {/* Aerodynamic Roof Mount Bar */}
      <rect x="46" y="19" width="8" height="1.5" fill="#3f3f46" rx="0.5" />
      <path 
        d="M 45,19 L 47,15 C 47.5,14 52.5,14 53,15 L 55,19 Z" 
        fill="#eaebee" 
        stroke="#27272a" 
        strokeWidth={0.5} 
      />
      {/* Glowing Neon Strip inside taxi sign */}
      <rect x="48.5" y="15.8" width="3" height="1.2" rx="0.3" fill="#fbbf24" className="animate-pulse" />

      {/* Cabin Roof Pillars & Structure */}
      <path 
        d="M 33,36 L 38,24 C 39.5,21 42,20.5 45,20.5 H 55 C 58,20.5 60.5,21 62,24 L 67,36 Z" 
        fill="url(#carBodyGrad)" 
      />

      {/* Windshield Glass & Reflection Overlay */}
      <path 
        d="M 36,34 L 40,25.5 C 41,23.5 43,23 45,23 H 55 C 57,23 59,23.5 60,25.5 L 64,34 Z" 
        fill="url(#windshieldGrad)" 
      />
      {/* Glossy Diagonal Reflection */}
      <path 
        d="M 44,23 L 38,34 H 42 L 48,23 Z" 
        fill="#ffffff" 
        opacity="0.35" 
      />

      {/* Sleek Side Mirrors */}
      <path 
        d="M 23,38 C 21,38 21,41 24,41 Z" 
        fill="#064e43" 
      />
      <path 
        d="M 77,38 C 79,38 79,41 76,41 Z" 
        fill="#064e43" 
      />

      {/* Outer Tires */}
      <rect x="23" y="55" width="4" height="6" rx="1" fill="#1c1917" />
      <rect x="73" y="55" width="4" height="6" rx="1" fill="#1c1917" />

      {/* Main Premium Car Body */}
      <path 
        d="M 27,36 C 24,36 22,39 22,43 C 22,44 24,53 29,54 H 71 C 76,53 78,44 78,43 C 78,39 76,36 73,36 Z" 
        fill="url(#carBodyGrad)" 
      />
      <path 
        d="M 22,43 C 22,50 25,60 29,61 H 71 C 75,60 78,50 78,43 Z" 
        fill="url(#carBodyGrad)" 
      />

      {/* Sporty Lower Lip (Bumper Diffuser) */}
      <path 
        d="M 26,58 C 28,62 34,64 50,64 C 66,64 72,62 74,58 Z" 
        fill="#111111" 
      />
      <path 
        d="M 28,61 C 32,63.5 40,64.5 50,64.5 C 60,64.5 68,63.5 72,61 Z" 
        fill="#82C233" 
      />

      {/* Sleek LED Projector Headlights */}
      <path 
        d="M 23,41 C 28,41 33,43 33,45.5 C 33,47.5 28,46.5 23.5,43 Z" 
        fill="url(#headlightGrad)" 
      />
      <path 
        d="M 77,41 C 72,41 67,43 67,45.5 C 67,47.5 72,46.5 76.5,43 Z" 
        fill="url(#headlightGrad)" 
      />
      <circle cx="27" cy="43.5" r="1.5" fill="#ffffff" />
      <circle cx="73" cy="43.5" r="1.5" fill="#ffffff" />

      {/* Hexagonal Matte Black Sports Grille */}
      <path 
        d="M 38,45 H 62 L 60,54 H 40 Z" 
        fill="#171717" 
        stroke="#262626" 
        strokeWidth={1} 
      />
      <line x1="41" y1="48" x2="59" y2="48" stroke="#4a4a4a" strokeWidth={1.5} />
      <line x1="42.5" y1="51" x2="57.5" y2="51" stroke="#4a4a4a" strokeWidth={1.5} />

      {/* Glowing Neon Green Vent Diodes */}
      <path d="M 23.5,49 L 25.5,49 C 26.5,49 25.5,53 24.5,53 Z" fill="#10b981" />
      <path d="M 76.5,49 L 74.5,49 C 73.5,49 74.5,53 75.5,53 Z" fill="#10b981" />

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
