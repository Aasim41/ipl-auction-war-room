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
        className="absolute -top-20 left-0 w-[800px] h-[700px] pointer-events-none origin-top-left rotate-[28deg] opacity-[0.07] transition-all duration-1000"
        style={{
          background: 'linear-gradient(90deg, rgba(255,255,255,0.7) 0%, var(--accent-primary) 30%, transparent 85%)',
          filter: 'blur(45px)',
        }}
      />
      {/* Right Beam angled down-left */}
      <div
        className="absolute -top-20 right-0 w-[800px] h-[700px] pointer-events-none origin-top-right -rotate-[28deg] opacity-[0.07] transition-all duration-1000"
        style={{
          background: 'linear-gradient(270deg, rgba(255,255,255,0.7) 0%, var(--accent-primary) 30%, transparent 85%)',
          filter: 'blur(45px)',
        }}
      />

      {/* ─── Center Ground Glow & Outfield Oval Curve ─── */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[140vw] h-[480px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 100%, rgba(13, 48, 26, 0.25) 0%, color-mix(in srgb, var(--accent-primary) 12%, transparent) 45%, transparent 75%)',
          filter: 'blur(50px)',
        }}
      />

      {/* ─── Ground Pitch Markings & Boundary Line Watermark ─── */}
      <svg
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[360px] opacity-[0.045] pointer-events-none"
        viewBox="0 0 900 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outfield Boundary Oval */}
        <ellipse cx="450" cy="300" rx="420" ry="180" stroke="white" strokeWidth="2" strokeDasharray="12 12" />
        {/* 30-Yard Inner Circle */}
        <ellipse cx="450" cy="300" rx="260" ry="110" stroke="white" strokeWidth="1.5" strokeDasharray="6 6" />
        {/* Cricket Pitch Strip in center */}
        <rect x="420" y="250" width="60" height="100" rx="4" stroke="white" strokeWidth="1.5" />
        {/* Crease lines */}
        <line x1="410" y1="265" x2="490" y2="265" stroke="white" strokeWidth="1.5" />
        <line x1="410" y1="335" x2="490" y2="335" stroke="white" strokeWidth="1.5" />
        {/* Wickets */}
        <circle cx="445" cy="265" r="2.5" fill="white" />
        <circle cx="450" cy="265" r="2.5" fill="white" />
        <circle cx="455" cy="265" r="2.5" fill="white" />
        <circle cx="445" cy="335" r="2.5" fill="white" />
        <circle cx="450" cy="335" r="2.5" fill="white" />
        <circle cx="455" cy="335" r="2.5" fill="white" />
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
