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
      {/* ─── Night Sky Base with Stadium Turf Undertone ─── */}
      <div 
        className="absolute inset-0 transition-all duration-1000 ease-out"
        style={{
          background: `
            radial-gradient(circle at 50% 110%, rgba(16, 185, 129, 0.28) 0%, rgba(4, 18, 10, 0.95) 60%),
            radial-gradient(circle at 50% -20%, color-mix(in srgb, var(--accent-primary) 22%, #082014) 0%, #04120a 75%)
          `
        }}
      />

      {/* ─── 4 Corner Stadium Floodlight Towers ─── */}
      {/* Floodlight 1: Top-Left Tower */}
      <div
        className="absolute -top-12 -left-12 w-[520px] h-[520px] rounded-full pointer-events-none transition-all duration-1000"
        style={{
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.22) 0%, color-mix(in srgb, var(--accent-primary) 35%, transparent) 30%, transparent 70%)',
          filter: 'blur(70px)',
          opacity: 0.85,
        }}
      />
      {/* Floodlight 2: Top-Right Tower */}
      <div
        className="absolute -top-12 -right-12 w-[520px] h-[520px] rounded-full pointer-events-none transition-all duration-1000"
        style={{
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.22) 0%, color-mix(in srgb, var(--accent-primary) 35%, transparent) 30%, transparent 70%)',
          filter: 'blur(70px)',
          opacity: 0.85,
        }}
      />

      {/* ─── Stadium Floodlight Beams (Angled Across Arena) ─── */}
      {/* Left Beam angled down-right */}
      <div
        className="absolute -top-20 left-0 w-[850px] h-[750px] pointer-events-none origin-top-left rotate-[28deg] opacity-[0.16] transition-all duration-1000"
        style={{
          background: 'linear-gradient(90deg, rgba(255,255,255,0.85) 0%, var(--accent-primary) 35%, transparent 85%)',
          filter: 'blur(35px)',
        }}
      />
      {/* Right Beam angled down-left */}
      <div
        className="absolute -top-20 right-0 w-[850px] h-[750px] pointer-events-none origin-top-right -rotate-[28deg] opacity-[0.16] transition-all duration-1000"
        style={{
          background: 'linear-gradient(270deg, rgba(255,255,255,0.85) 0%, var(--accent-primary) 35%, transparent 85%)',
          filter: 'blur(35px)',
        }}
      />

      {/* ─── Center Ground Glow & Outfield Oval Curve ─── */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[140vw] h-[550px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 100%, rgba(34, 197, 94, 0.22) 0%, rgba(16, 185, 129, 0.12) 35%, transparent 75%)',
          filter: 'blur(45px)',
        }}
      />

      {/* ─── Ground Pitch Markings & Boundary Line Watermark ─── */}
      <svg
        className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[950px] h-[380px] opacity-[0.18] pointer-events-none"
        viewBox="0 0 900 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outfield Boundary Oval */}
        <ellipse cx="450" cy="300" rx="420" ry="180" stroke="#4ade80" strokeWidth="2.5" strokeDasharray="10 10" />
        {/* 30-Yard Inner Circle */}
        <ellipse cx="450" cy="300" rx="260" ry="110" stroke="#86efac" strokeWidth="2" strokeDasharray="8 8" />
        {/* Cricket Pitch Strip in center (Clay Turf) */}
        <rect x="415" y="240" width="70" height="115" rx="6" fill="rgba(217, 119, 6, 0.15)" stroke="#fbbf24" strokeWidth="2" />
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
      <div className="absolute top-16 left-1/2 -translate-x-1/2 text-center pointer-events-none select-none opacity-[0.035] transition-opacity duration-1000">
        <span className="font-display uppercase text-7xl sm:text-9xl font-black tracking-widest text-white whitespace-nowrap block">
          {stadium.shortName}
        </span>
        <span className="text-xs uppercase tracking-[0.5em] text-white block mt-1 font-mono">
          {stadium.city} • FORTRESS
        </span>
      </div>

      {/* ─── Subtle Stadium Mist / Atmospheric Dust ─── */}
      <div 
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
          backgroundSize: '36px 36px'
        }}
      />
    </div>
  )
}
