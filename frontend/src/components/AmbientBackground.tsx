'use client'

import { useStore } from '../store/useStore'
import { getStadiumForTeam } from '../data/stadiums'
import { useRef } from 'react'

export function AmbientBackground() {
  const theme = useStore((state) => state.theme)
  const stadium = getStadiumForTeam(theme)
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* ─── Ultra-Realistic Night Sky Base with Stadium Turf & Pitch Depth ─── */}
      <div 
        className="absolute inset-0 transition-all duration-1000 ease-out"
        style={{
          background: `
            radial-gradient(circle at 50% 115%, rgba(16, 185, 129, 0.32) 0%, rgba(4, 20, 11, 0.98) 60%),
            radial-gradient(circle at 50% -25%, color-mix(in srgb, var(--accent-primary) 24%, #082014) 0%, #030c06 75%),
            linear-gradient(180deg, #020804 0%, #03140a 40%, #052614 75%, #020b05 100%)
          `
        }}
      />

      {/* ─── 4 Corner Volumetric Stadium Floodlight Towers with Lens Flare ─── */}
      {/* Floodlight 1: Top-Left Tower */}
      <div
        className="absolute -top-16 -left-16 w-[560px] h-[560px] rounded-full pointer-events-none transition-all duration-1000"
        style={{
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.28) 0%, rgba(254, 240, 138, 0.18) 25%, color-mix(in srgb, var(--accent-primary) 35%, transparent) 45%, transparent 75%)',
          filter: 'blur(75px)',
          opacity: 0.9,
        }}
      />
      {/* Floodlight 2: Top-Right Tower */}
      <div
        className="absolute -top-16 -right-16 w-[560px] h-[560px] rounded-full pointer-events-none transition-all duration-1000"
        style={{
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.28) 0%, rgba(254, 240, 138, 0.18) 25%, color-mix(in srgb, var(--accent-primary) 35%, transparent) 45%, transparent 75%)',
          filter: 'blur(75px)',
          opacity: 0.9,
        }}
      />

      {/* ─── Angled Stadium Floodlight Beams (Traversing Arena) ─── */}
      {/* Left Beam angled down-right */}
      <div
        className="absolute -top-24 left-0 w-[950px] h-[850px] pointer-events-none origin-top-left rotate-[30deg] opacity-[0.20] transition-all duration-1000"
        style={{
          background: 'linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(254, 240, 138, 0.4) 20%, var(--accent-primary) 45%, transparent 85%)',
          filter: 'blur(40px)',
        }}
      />
      {/* Right Beam angled down-left */}
      <div
        className="absolute -top-24 right-0 w-[950px] h-[850px] pointer-events-none origin-top-right -rotate-[30deg] opacity-[0.20] transition-all duration-1000"
        style={{
          background: 'linear-gradient(270deg, rgba(255,255,255,0.9) 0%, rgba(254, 240, 138, 0.4) 20%, var(--accent-primary) 45%, transparent 85%)',
          filter: 'blur(40px)',
        }}
      />

      {/* ─── Freshly Cut Outfield Mow Grass Grain & Pitch Realism ─── */}
      <div 
        className="absolute inset-0 opacity-[0.12] pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(90deg, rgba(34, 197, 94, 0.22) 0px, rgba(34, 197, 94, 0.22) 60px, transparent 60px, transparent 120px),
            radial-gradient(ellipse at 50% 60%, rgba(217, 119, 6, 0.12) 0%, transparent 70%)
          `
        }}
      />

      {/* ─── Center Ground Glow & Outfield Oval Curve ─── */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[140vw] h-[580px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 100%, rgba(34, 197, 94, 0.26) 0%, rgba(16, 185, 129, 0.14) 38%, transparent 78%)',
          filter: 'blur(50px)',
        }}
      />

      {/* ─── Ground Pitch Markings & Boundary Line Watermark ─── */}
      <svg
        className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[980px] h-[400px] opacity-[0.22] pointer-events-none"
        viewBox="0 0 900 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outfield Boundary Oval */}
        <ellipse cx="450" cy="300" rx="420" ry="180" stroke="#4ade80" strokeWidth="2.5" strokeDasharray="10 10" />
        {/* 30-Yard Inner Circle */}
        <ellipse cx="450" cy="300" rx="260" ry="110" stroke="#86efac" strokeWidth="2" strokeDasharray="8 8" />
        {/* Cricket Pitch Strip in center (Clay Turf) */}
        <rect x="415" y="240" width="70" height="115" rx="6" fill="rgba(217, 119, 6, 0.18)" stroke="#fbbf24" strokeWidth="2" />
        {/* Bowling and Popping Crease lines */}
        <line x1="405" y1="260" x2="495" y2="260" stroke="#fef08a" strokeWidth="2" />
        <line x1="405" y1="335" x2="495" y2="335" stroke="#fef08a" strokeWidth="2" />
        {/* Return creases */}
        <line x1="415" y1="250" x2="415" y2="270" stroke="#fef08a" strokeWidth="1.5" />
        <line x1="485" y1="250" x2="485" y2="270" stroke="#fef08a" strokeWidth="1.5" />
        <line x1="415" y1="325" x2="415" y2="345" stroke="#fef08a" strokeWidth="1.5" />
        <line x1="485" y1="325" x2="485" y2="345" stroke="#fef08a" strokeWidth="1.5" />
        {/* Wickets (3 Stumps at each end) */}
        <circle cx="445" cy="260" r="3" fill="#ffffff" />
        <circle cx="450" cy="260" r="3" fill="#ffffff" />
        <circle cx="455" cy="260" r="3" fill="#ffffff" />
        <circle cx="445" cy="335" r="3" fill="#ffffff" />
        <circle cx="450" cy="335" r="3" fill="#ffffff" />
        <circle cx="455" cy="335" r="3" fill="#ffffff" />
      </svg>

      {/* ─── Stadium Name Watermark in Night Sky ─── */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 text-center pointer-events-none select-none opacity-[0.04] transition-opacity duration-1000">
        <span className="font-display uppercase text-7xl sm:text-9xl font-black tracking-widest text-white whitespace-nowrap block">
          {stadium.shortName}
        </span>
        <span className="text-xs uppercase tracking-[0.5em] text-white block mt-1 font-mono">
          {stadium.city} • FORTRESS
        </span>
      </div>

      {/* ─── Tactical Vignette (Darkened Edges for True War Room Focus) ─── */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-45"
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 65%, rgba(1, 6, 3, 0.85) 100%)'
        }}
      />
    </div>
  )
}
