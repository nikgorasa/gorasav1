import React from 'react';

interface GoRasaLogoProps {
  className?: string;
  height?: number | string;
  width?: number | string;
}

export const GoRasaLogo: React.FC<GoRasaLogoProps> = ({ 
  className = '', 
  height = '42', 
  width = 'auto' 
}) => {
  return (
    <svg 
      viewBox="0 0 450 115" 
      height={height} 
      width={width} 
      className={`inline-block select-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Premium Gold to Burnt Saffron Gradient for India */}
        <linearGradient id="india-saffron-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FCD34D" />    {/* Light Premium Gold */}
          <stop offset="40%" stopColor="#F59E0B" />   {/* Saffron Gold */}
          <stop offset="100%" stopColor="#C2410C" />  {/* Burnt Saffron */}
        </linearGradient>

        {/* Faint aesthetic background gradient for the globe */}
        <radialGradient id="globe-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF7ED" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FFEDD5" stopOpacity="0.1" />
        </radialGradient>
      </defs>

      {/* 1. MATH-PERFECT "G" IN PREMIUM BURNT SAFFRON */}
      <text 
        x="15" 
        y="86" 
        fontFamily="'Outfit', system-ui, -apple-system, sans-serif" 
        fontWeight="850" 
        fontSize="92" 
        fill="#C2410C"
        letterSpacing="-1"
      >
        G
      </text>

      {/* 2. THE GLOBE "O" WITH AN EMBEDDED HIGH-FIDELITY INDIA SHAPE */}
      <g id="globe-o" transform="translate(116, 56)">
        {/* Base soft globe radial gradient fill */}
        <circle cx="0" cy="0" r="26" fill="url(#globe-bg)" />

        {/* Outer burnt saffron globe outline ring */}
        <circle cx="0" cy="0" r="26" fill="none" stroke="#C2410C" strokeWidth="5" />
        
        {/* Delicately rendered Latitudes & Longitudes in burnt saffron */}
        <path d="M -26,0 C -15,-7 15,-7 26,0" fill="none" stroke="#C2410C" strokeWidth="1.5" opacity="0.3" />
        <path d="M -26,0 C -15,7 15,7 26,0" fill="none" stroke="#C2410C" strokeWidth="1.5" opacity="0.3" />
        <path d="M 0,-26 C -8,-15 -8,15 0,26" fill="none" stroke="#C2410C" strokeWidth="1.5" opacity="0.3" />
        <path d="M 0,-26 C 8,-15 8,15 0,26" fill="none" stroke="#C2410C" strokeWidth="1.5" opacity="0.3" />
        
        {/* Faint context outlines of neighbouring landmasses */}
        {/* Middle East & Northern Africa silhouette on West */}
        <path 
          d="M -26,-8 C -22,-11 -17,-9 -14,-5 C -15,0 -19,4 -22,8 C -25,10 -26,7 -26,0 Z" 
          fill="#C2410C" 
          opacity="0.1" 
        />
        {/* Indochina, China, & Southeast Asia silhouette on East */}
        <path 
          d="M 12,-5 C 15,-7 19,-8 23,-9 C 25,-6 26,2 22,8 C 18,9 15,5 12,1 Z" 
          fill="#C2410C" 
          opacity="0.1" 
        />

        {/* HIGH-FIDELITY DETAILED PROFILE OF INDIA - Golden-Saffron Highlight */}
        <path 
          d="M 1,-16 
             C 2.5,-15 2,-11.5 3.5,-11 
             C 5,-10 7.5,-8 9.5,-8 
             C 10.5,-8 11.5,-6 9,-5 
             C 7.5,-4 6.5,-2 6.5,1 
             C 5.5,3.5 3.5,7 1.5,11 
             C 1,12 0,12 -0.5,10.5 
             C -1.5,8 -3.5,4 -4,1 
             C -4.5,0 -6,-1.5 -8,-2.5 
             C -9,-3 -7.5,-6 -5,-6 
             C -4.2,-7.5 -2.5,-12.5 1,-16 Z" 
          fill="url(#india-saffron-grad)" 
          stroke="#FBBF24" 
          strokeWidth="1.1" 
          strokeLinejoin="round"
        />

        {/* Subtle dot at Mumbai / Delhi for high-end cartography touch */}
        <circle cx="-1" cy="0" r="1.2" fill="#FFFFFF" opacity="0.9" />
        <circle cx="2.5" cy="-8" r="1.2" fill="#FFFFFF" opacity="0.9" />
      </g>

      {/* 3. FLUID BURNT SAFFRON FLIGHT PATH ORBIT */}
      <path 
        d="M 66,92 C 86,108 116,104 128,84 Q 146,55 166,28" 
        fill="none" 
        stroke="#C2410C" 
        strokeWidth="4.5" 
        strokeLinecap="round" 
      />

      {/* 4. JET AIRPLANE IN FLIGHT AT APEX OF THE ORBIT */}
      <g transform="translate(166, 28) rotate(42)">
        <path 
          d="M 0,-14 
             L 3,-13
             C 5,-9 8,-4 11,-3
             L 11,1
             L 3,-1
             L 3,9
             L 6,12
             L -6,12
             L -3,9
             L -3,-1
             L -11,1
             L -11,-3
             C -8,-4 -5,-9 0,-14 
             Z" 
          fill="#C2410C" 
        />
      </g>

      {/* 5. BRAND TEXT "RASA" IN VIBRANT GEOMETRIC BURNT SAFFRON */}
      <text 
        x="180" 
        y="86" 
        fontFamily="'Outfit', system-ui, -apple-system, sans-serif" 
        fontWeight="850" 
        fontSize="82" 
        fill="#C2410C"
        letterSpacing="2"
      >
        RASA
      </text>

      {/* 6. SIGNATURE BOTTOM ARCH UNDER THE FINAL 'A' IN 'RASA' */}
      <path 
        d="M 338,91 Q 366,80 394,91" 
        fill="none" 
        stroke="#C2410C" 
        strokeWidth="4" 
        strokeLinecap="round" 
      />

      {/* 7. TRADEMARK NOTATION (TM) IN BURNT SAFFRON */}
      <text 
        x="404" 
        y="30" 
        fontFamily="'Outfit', system-ui, -apple-system, sans-serif" 
        fontWeight="800" 
        fontSize="12" 
        fill="#C2410C"
      >
        TM
      </text>
    </svg>
  );
};

export default GoRasaLogo;
