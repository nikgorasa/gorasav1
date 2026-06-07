"use client";

import React from "react";

interface GoRasaLogoProps {
  className?: string;
}

export default function GoRasaLogo({ className = "h-9 w-auto" }: GoRasaLogoProps) {
  return (
    <svg
      viewBox="0 0 200 40"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Globe with India shape */}
      <circle cx="20" cy="20" r="16" stroke="#F97316" strokeWidth="2" fill="none" />
      <circle cx="20" cy="20" r="12" stroke="#F97316" strokeWidth="1" fill="none" opacity="0.3" />
      
      {/* India simplified shape */}
      <path
        d="M16 10 L22 10 L24 14 L22 18 L24 22 L22 26 L18 28 L16 24 L14 28 L12 26 L10 22 L12 18 L10 14 L12 10 Z"
        fill="#F97316"
        opacity="0.8"
      />
      
      {/* Flight path */}
      <path
        d="M20 8 Q30 4 38 8"
        stroke="#F97316"
        strokeWidth="1.5"
        strokeDasharray="2 2"
        fill="none"
      />
      
      {/* Airplane */}
      <g transform="translate(36, 6) rotate(15)">
        <path
          d="M0 0 L6 2 L2 2 L2 6 L0 6 L-2 2 L-6 2 Z"
          fill="#F97316"
        />
      </g>

      {/* GoRASA Text */}
      <text
        x="45"
        y="25"
        fontFamily="Outfit, system-ui, sans-serif"
        fontWeight="800"
        fontSize="22"
        fill="#1E293B"
      >
        Go
      </text>
      <text
        x="75"
        y="25"
        fontFamily="Outfit, system-ui, sans-serif"
        fontWeight="800"
        fontSize="22"
        fill="#F97316"
      >
        RASA
      </text>
      
      {/* Tagline */}
      <text
        x="45"
        y="35"
        fontFamily="Inter, system-ui, sans-serif"
        fontWeight="500"
        fontSize="7"
        fill="#94A3B8"
        letterSpacing="2"
      >
        EXPERIENCE THE FINEST
      </text>
    </svg>
  );
}
