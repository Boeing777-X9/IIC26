'use client';

import React from 'react';

export interface ShinyTextProps {
  text: string;
  className?: string;
  color?: string;
  shineColor?: string;
  speed?: number;
}

export default function ShinyText({
  text,
  className = '',
  color = '#94a3b8',
  shineColor = '#38bdf8',
  speed = 3
}: ShinyTextProps) {
  return (
    <span
      className={`inline-block font-semibold bg-clip-text text-transparent ${className}`}
      style={{
        backgroundImage: `linear-gradient(120deg, ${color} 0%, ${color} 35%, ${shineColor} 50%, ${color} 65%, ${color} 100%)`,
        backgroundSize: '200% auto',
        animation: `retinix-shine ${speed}s linear infinite`
      }}
    >
      {text}
      <style jsx>{`
        @keyframes retinix-shine {
          0% {
            background-position: 200% center;
          }
          100% {
            background-position: -200% center;
          }
        }
      `}</style>
    </span>
  );
}
