"use client";
// Procedurally generated retinal fundus image SVG component
import { useState, useEffect } from "react";

interface RetinalImageProps {
  mode?: "normal" | "original" | "heatmap" | "overlay";
  size?: number;
  animated?: boolean;
  scanAnimate?: boolean;
  risk?: "low" | "moderate" | "high";
  src?: string | null;
  heatmapSrc?: string | null;
  overlaySrc?: string | null;
}

export default function RetinalImage({
  mode = "normal",
  size = 400,
  animated = false,
  scanAnimate = false,
  risk = "high",
  src = null,
  heatmapSrc = null,
  overlaySrc = null,
}: RetinalImageProps) {
  const [scanY, setScanY] = useState(0);
  const [heatOpacity, setHeatOpacity] = useState(0);

  useEffect(() => {
    if (!scanAnimate) return;
    let frame = 0;
    const interval = setInterval(() => {
      frame += 2;
      setScanY(frame % 100);
      if (frame > 60) setHeatOpacity(Math.min(1, (frame - 60) / 40));
    }, 30);
    return () => clearInterval(interval);
  }, [scanAnimate]);

  // If real image sources are provided from model inference
  const activeImgSrc =
    mode === "heatmap" && heatmapSrc
      ? heatmapSrc
      : mode === "overlay" && overlaySrc
      ? overlaySrc
      : src;

  if (activeImgSrc && activeImgSrc !== "demo") {
    return (
      <div
        className="relative overflow-hidden flex items-center justify-center bg-black"
        style={{ width: size, height: size, borderRadius: "50%" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activeImgSrc}
          alt={`Retinal view (${mode})`}
          className="w-full h-full object-cover select-none"
        />
        {scanAnimate && (
          <div
            className="absolute left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] pointer-events-none"
            style={{ top: `${scanY}%` }}
          />
        )}
        <div className="absolute inset-0 rounded-full border-[10px] border-black/40 pointer-events-none" />
      </div>
    );
  }

  const heatColor = risk === "high" ? "rgba(239,68,68,0.65)" : risk === "moderate" ? "rgba(245,158,11,0.55)" : "rgba(16,185,129,0.45)";
  const heatColor2 = risk === "high" ? "rgba(239,68,68,0.4)" : risk === "moderate" ? "rgba(245,158,11,0.35)" : "rgba(16,185,129,0.3)";

  const showHeat = mode === "heatmap" || mode === "overlay";
  const showOriginal = mode === "normal" || mode === "original" || mode === "overlay";
  const opacity = mode === "overlay" ? 0.75 : 1;

  return (
    <svg
      viewBox="0 0 400 400"
      width={size}
      height={size}
      style={{ borderRadius: "50%", display: "block" }}
    >
      <defs>
        <clipPath id="circle-clip">
          <circle cx="200" cy="200" r="195" />
        </clipPath>
        <radialGradient id="fundus-bg" cx="45%" cy="42%" r="58%">
          <stop offset="0%" stopColor="#7a3020" />
          <stop offset="35%" stopColor="#5c1f10" />
          <stop offset="70%" stopColor="#3d1008" />
          <stop offset="100%" stopColor="#1a0502" />
        </radialGradient>
        <radialGradient id="optic-disc" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f5d99a" />
          <stop offset="40%" stopColor="#e8b96a" />
          <stop offset="100%" stopColor="#c88a40" />
        </radialGradient>
        <radialGradient id="macula" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1a0502" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#2d0d05" stopOpacity="0.5" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <filter id="vessel-blur">
          <feGaussianBlur stdDeviation="0.3" />
        </filter>
        <filter id="heat-blur">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <radialGradient id="heat1" cx="38%" cy="44%" r="28%">
          <stop offset="0%" stopColor={heatColor} />
          <stop offset="60%" stopColor={heatColor2} />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="heat2" cx="55%" cy="38%" r="18%">
          <stop offset="0%" stopColor={heatColor2} />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="heat3" cx="30%" cy="58%" r="14%">
          <stop offset="0%" stopColor={heatColor2} />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>

      <g clipPath="url(#circle-clip)">
        {/* Base fundus */}
        <circle cx="200" cy="200" r="200" fill="url(#fundus-bg)" />

        {/* Blood vessels - main arcade */}
        {showOriginal && (
          <g stroke="#4a150a" strokeWidth="2.5" fill="none" opacity={opacity} filter="url(#vessel-blur)">
            {/* Superior temporal arcade */}
            <path d="M 248 178 Q 220 120 180 90 Q 140 65 100 80" strokeWidth="2.8" />
            <path d="M 248 178 Q 230 130 200 105 Q 170 80 130 75" strokeWidth="2" />
            <path d="M 248 178 Q 240 150 230 130 Q 215 105 195 95" strokeWidth="1.5" />
            {/* Inferior temporal arcade */}
            <path d="M 248 222 Q 220 270 180 300 Q 145 325 108 315" strokeWidth="2.8" />
            <path d="M 248 222 Q 230 265 205 285 Q 175 305 145 300" strokeWidth="2" />
            <path d="M 248 222 Q 240 248 228 265 Q 210 285 190 290" strokeWidth="1.5" />
            {/* Nasal vessels */}
            <path d="M 248 178 Q 268 160 290 155 Q 310 150 330 155" strokeWidth="2" />
            <path d="M 248 222 Q 268 235 285 240 Q 305 248 325 245" strokeWidth="2" />
            {/* Branch vessels */}
            <path d="M 200 105 Q 175 100 155 108 Q 135 115 120 130" strokeWidth="1.2" />
            <path d="M 190 290 Q 165 295 145 285 Q 125 272 115 255" strokeWidth="1.2" />
            <path d="M 230 130 Q 210 120 188 125 Q 170 130 155 145" strokeWidth="1" />
            <path d="M 228 265 Q 210 275 190 272 Q 170 268 155 255" strokeWidth="1" />
            {/* Fine vessels */}
            <path d="M 155 108 Q 140 120 132 140 Q 125 160 128 180" strokeWidth="0.8" />
            <path d="M 145 285 Q 132 268 128 248 Q 124 228 128 208" strokeWidth="0.8" />
            <path d="M 155 145 Q 145 162 142 180 Q 140 200 144 220" strokeWidth="0.7" />
          </g>
        )}

        {/* Lighter vessel highlights */}
        {showOriginal && (
          <g stroke="#8b3520" strokeWidth="1" fill="none" opacity={opacity * 0.6}>
            <path d="M 248 178 Q 220 120 180 90 Q 140 65 100 80" />
            <path d="M 248 222 Q 220 270 180 300 Q 145 325 108 315" />
          </g>
        )}

        {/* Heatmap */}
        {showHeat && (
          <g opacity={scanAnimate ? heatOpacity : 1} filter="url(#heat-blur)">
            <circle cx="152" cy="176" r="60" fill="url(#heat1)" />
            <circle cx="220" cy="152" r="36" fill="url(#heat2)" />
            <circle cx="120" cy="232" r="28" fill="url(#heat3)" />
          </g>
        )}

        {/* Optic disc */}
        {showOriginal && (
          <g opacity={opacity}>
            <circle cx="248" cy="200" r="22" fill="url(#optic-disc)" opacity="0.9" />
            <circle cx="248" cy="200" r="14" fill="#f5e0a0" opacity="0.7" />
            <circle cx="250" cy="198" r="6" fill="#faf0d0" opacity="0.5" />
          </g>
        )}

        {/* Macula / fovea */}
        {showOriginal && (
          <g opacity={opacity}>
            <circle cx="148" cy="200" r="28" fill="url(#macula)" />
            <circle cx="148" cy="200" r="5" fill="#0d0200" opacity="0.8" />
          </g>
        )}

        {/* Heatmap markers */}
        {showHeat && (
          <g opacity={scanAnimate ? heatOpacity : 1}>
            <circle cx="140" cy="165" r="6" fill="rgba(239,68,68,0.8)" />
            <circle cx="165" cy="188" r="5" fill="rgba(239,68,68,0.7)" />
            <circle cx="128" cy="192" r="4" fill="rgba(245,158,11,0.8)" />
            <circle cx="155" cy="155" r="3" fill="rgba(239,68,68,0.6)" />
            <circle cx="218" cy="148" r="4" fill="rgba(245,158,11,0.6)" />
            <circle cx="118" cy="238" r="3.5" fill="rgba(245,158,11,0.7)" />
          </g>
        )}

        {/* Scan line animation */}
        {scanAnimate && heatOpacity < 1 && (
          <rect
            x="5" y={`${scanY * 3.9}px`}
            width="390" height="2"
            fill="rgba(13,148,136,0.6)"
            style={{ filter: "blur(1px)" }}
          />
        )}

        {/* Edge vignette */}
        <circle cx="200" cy="200" r="195" fill="none" stroke="#000" strokeWidth="20" opacity="0.4" />
      </g>
    </svg>
  );
}
