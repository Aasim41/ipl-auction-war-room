'use client'

import React, { useId } from 'react'
import { useStore } from '../store/useStore'
import { getStadiumForTeam } from '../data/stadiums'

export function AmbientBackground() {
  const theme = useStore((state) => state.theme)
  const stadium = getStadiumForTeam(theme)
  const uid = useId().replace(/:/g, '_')

  // Generate 24 points around the 30-yard fielding circle ellipse (cx: 600, cy: 500, rx: 270, ry: 175)
  const circleDiscs = Array.from({ length: 24 }).map((_, i) => {
    const angle = (i * 2 * Math.PI) / 24
    const x = 600 + 270 * Math.cos(angle)
    const y = 500 + 175 * Math.sin(angle)
    return { x, y }
  })

  // Generate 32 boundary foam cushions around the boundary rope (cx: 600, cy: 500, rx: 530, ry: 345)
  const boundaryCushions = Array.from({ length: 32 }).map((_, i) => {
    const angle = (i * 2 * Math.PI) / 32
    const x = 600 + 530 * Math.cos(angle)
    const y = 500 + 345 * Math.sin(angle)
    const deg = (angle * 180) / Math.PI + 90
    return { x, y, deg, isAccent: i % 2 === 0 }
  })

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden select-none bg-[#05080c]"
      aria-hidden="true"
    >
      {/* ─── LAYER 1: Deep Stadium Night Canopy (No flat green gradient!) ─── */}
      <div 
        className="absolute inset-0 transition-colors duration-1000 ease-out"
        style={{
          background: `
            radial-gradient(circle at 50% 0%, rgba(10, 16, 24, 0.95) 0%, #05080c 80%),
            linear-gradient(180deg, #04070a 0%, #070c12 40%, #091118 70%, #05080c 100%)
          `
        }}
      />

      {/* ─── LAYER 2: 4 Volumetric Corner Floodlight Towers with Halogen Core & Cones ─── */}
      {/* Floodlight 1: Top-Left Tower */}
      <div
        className="absolute -top-12 -left-12 w-[600px] h-[600px] rounded-full pointer-events-none transition-all duration-1000"
        style={{
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.45) 0%, rgba(254, 240, 138, 0.28) 20%, rgba(251, 191, 36, 0.12) 40%, transparent 70%)',
          filter: 'blur(55px)',
          opacity: 0.9,
        }}
      />
      {/* Floodlight 2: Top-Right Tower */}
      <div
        className="absolute -top-12 -right-12 w-[600px] h-[600px] rounded-full pointer-events-none transition-all duration-1000"
        style={{
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.45) 0%, rgba(254, 240, 138, 0.28) 20%, rgba(251, 191, 36, 0.12) 40%, transparent 70%)',
          filter: 'blur(55px)',
          opacity: 0.9,
        }}
      />

      {/* Angled High-Intensity Volumetric Halogen Beams traversing into the stadium */}
      <div
        className="absolute -top-20 left-0 w-[1000px] h-[900px] pointer-events-none origin-top-left rotate-[28deg] opacity-[0.25] transition-all duration-1000"
        style={{
          background: 'linear-gradient(90deg, rgba(255,255,255,0.95) 0%, rgba(254, 240, 138, 0.45) 25%, rgba(250, 204, 21, 0.15) 55%, transparent 85%)',
          filter: 'blur(35px)',
        }}
      />
      <div
        className="absolute -top-20 right-0 w-[1000px] h-[900px] pointer-events-none origin-top-right -rotate-[28deg] opacity-[0.25] transition-all duration-1000"
        style={{
          background: 'linear-gradient(270deg, rgba(255,255,255,0.95) 0%, rgba(254, 240, 138, 0.45) 25%, rgba(250, 204, 21, 0.15) 55%, transparent 85%)',
          filter: 'blur(35px)',
        }}
      />

      {/* ─── LAYER 3: HYPER-REALISTIC CRICKET STADIUM GROUND & 22-YARD PITCH (SVG) ─── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-85"
        viewBox="0 0 1200 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Alternating Lawn Mower Outfield Turf Rings */}
          <radialGradient id={`${uid}_turfMow1`} cx="50%" cy="55%" r="50%">
            <stop offset="0%" stopColor="#165b32" />
            <stop offset="20%" stopColor="#124d2a" />
            <stop offset="40%" stopColor="#196337" />
            <stop offset="60%" stopColor="#0f4224" />
            <stop offset="80%" stopColor="#175d34" />
            <stop offset="100%" stopColor="#0b331b" />
          </radialGradient>

          {/* Center Floodlight Specular Dew Sheen on Grass */}
          <radialGradient id={`${uid}_dewSheen`} cx="50%" cy="55%" r="35%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
            <stop offset="30%" stopColor="#86efac" stopOpacity="0.12" />
            <stop offset="70%" stopColor="#10b981" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#052e16" stopOpacity="0" />
          </radialGradient>

          {/* Authentic 22-Yard Clay Pitch Strip Texture & Depth */}
          <linearGradient id={`${uid}_clayPitch`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7a552b" />
            <stop offset="8%" stopColor="#a7804f" />
            <stop offset="25%" stopColor="#c7a473" />
            <stop offset="50%" stopColor="#dec093" />
            <stop offset="75%" stopColor="#c5a170" />
            <stop offset="92%" stopColor="#a37c4b" />
            <stop offset="100%" stopColor="#785329" />
          </linearGradient>

          {/* Bowler Footmark Rough Patches */}
          <radialGradient id={`${uid}_roughPatch`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#543716" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#734d22" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#9c723f" stopOpacity="0" />
          </radialGradient>

          {/* Grandstand Stadium Bowl Silhouette Gradient */}
          <radialGradient id={`${uid}_standsGrad`} cx="50%" cy="55%" r="55%">
            <stop offset="78%" stopColor="#05080c" stopOpacity="0" />
            <stop offset="88%" stopColor="#09121c" stopOpacity="0.75" />
            <stop offset="95%" stopColor="#0f1c2b" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#05080d" stopOpacity="0.98" />
          </radialGradient>

          {/* Mower Cross-Hatch Lawn Texture Pattern */}
          <pattern id={`${uid}_mowerStripes`} width="60" height="60" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="30" height="60" fill="rgba(255,255,255,0.025)" />
            <rect x="30" width="30" height="60" fill="rgba(0,0,0,0.035)" />
          </pattern>
        </defs>

        {/* ─── STADIUM GRANDSTANDS & SPECTATOR BOWL SILHOUETTE ─── */}
        <ellipse cx="600" cy="500" rx="585" ry="380" fill="url(#standsGrad)" />
        
        {/* Stadium Tier Lights / Spectator Bokeh Sparkle */}
        <ellipse cx="600" cy="500" rx="570" ry="370" fill="none" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1.5" strokeDasharray="3 7" />
        <ellipse cx="600" cy="500" rx="555" ry="360" fill="none" stroke="rgba(254, 240, 138, 0.10)" strokeWidth="1" strokeDasharray="2 12" />

        {/* 360° LED Fascia Ribbon Board at Perimeter */}
        <ellipse cx="600" cy="500" rx="542" ry="352" fill="none" stroke="var(--accent-primary, #f59e0b)" strokeWidth="3" strokeOpacity="0.28" />

        {/* ─── THE CRICKET OUTFIELD TURF ─── */}
        {/* Outfield Base with Concentric Mower Rings */}
        <ellipse cx="600" cy="500" rx="530" ry="345" fill="url(#turfMow1)" />

        {/* Alternating Cut Lawn Rings for Broadcast Stadium Realism */}
        <ellipse cx="600" cy="500" rx="460" ry="300" fill="none" stroke="#1c6b3c" strokeWidth="22" strokeOpacity="0.45" />
        <ellipse cx="600" cy="500" rx="390" ry="255" fill="none" stroke="#124a28" strokeWidth="22" strokeOpacity="0.5" />
        <ellipse cx="600" cy="500" rx="320" ry="210" fill="none" stroke="#1c6b3c" strokeWidth="20" strokeOpacity="0.4" />
        <ellipse cx="600" cy="500" rx="250" ry="165" fill="none" stroke="#124a28" strokeWidth="20" strokeOpacity="0.45" />
        <ellipse cx="600" cy="500" rx="180" ry="120" fill="none" stroke="#1c6b3c" strokeWidth="18" strokeOpacity="0.35" />

        {/* Diamond / Cross-Hatch Lawn Mowing Cut Overlay */}
        <ellipse cx="600" cy="500" rx="530" ry="345" fill={`url(#${uid}_mowerStripes)`} />

        {/* Outfield Floodlight Dew Sheen (Lush glow in center) */}
        <ellipse cx="600" cy="500" rx="420" ry="275" fill="url(#dewSheen)" />

        {/* ─── BOUNDARY ROPE & FOAM CUSHIONS ─── */}
        {/* White Braided Boundary Rope */}
        <ellipse cx="600" cy="500" rx="530" ry="345" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeOpacity="0.85" />
        <ellipse cx="600" cy="500" rx="530" ry="345" fill="none" stroke="#000000" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="3 3" />

        {/* 3D Boundary Foam Cushions (IPL Style Sponsor Wedges) */}
        {boundaryCushions.map((c, idx) => (
          <rect
            key={idx}
            x={c.x - 7}
            y={c.y - 3}
            width="14"
            height="6"
            rx="1.5"
            transform={`rotate(${c.deg} ${c.x} ${c.y})`}
            fill={c.isAccent ? 'var(--accent-primary, #f59e0b)' : '#ffffff'}
            opacity="0.85"
            stroke="#000000"
            strokeWidth="0.5"
          />
        ))}

        {/* ─── 30-YARD FIELDING CIRCLE ─── */}
        {/* Faint White Chalk Arc */}
        <ellipse 
          cx="600" 
          cy="500" 
          rx="270" 
          ry="175" 
          fill="none" 
          stroke="#ffffff" 
          strokeWidth="1.5" 
          strokeDasharray="6 6" 
          strokeOpacity="0.4" 
        />

        {/* 24 Official White Circle Marker Discs (Fielding Domes) */}
        {circleDiscs.map((disc, idx) => (
          <g key={idx}>
            <circle cx={disc.x} cy={disc.y + 0.8} r="3" fill="#000000" opacity="0.35" />
            <circle cx={disc.x} cy={disc.y} r="2.8" fill="#ffffff" opacity="0.9" stroke="#94a3b8" strokeWidth="0.5" />
          </g>
        ))}

        {/* ─── THE 22-YARD CRICKET PITCH (CENTERPIECE) ─── */}
        {/* Pitch Apron Grass Blend (Outer turf transition ring) */}
        <rect x="556" y="365" width="88" height="270" rx="8" fill="#134e2a" opacity="0.75" />

        {/* Central 22-Yard Clay Pitch Strip */}
        <rect 
          x="564" 
          y="375" 
          width="72" 
          height="250" 
          rx="3" 
          fill="url(#clayPitch)" 
          stroke="#5c3f1e" 
          strokeWidth="1.2" 
        />

        {/* Clay Soil Micro-Texture / Cracks */}
        <line x1="565" y1="440" x2="635" y2="440" stroke="#875e30" strokeWidth="0.75" opacity="0.4" />
        <line x1="565" y1="500" x2="635" y2="500" stroke="#875e30" strokeWidth="0.75" opacity="0.4" />
        <line x1="565" y1="560" x2="635" y2="560" stroke="#875e30" strokeWidth="0.75" opacity="0.4" />

        {/* Bowler Landing Footmark Roughs (Right-Arm & Left-Arm Pacer Landing Zones) */}
        {/* Top End Rough (Bowling Crease area) */}
        <ellipse cx="584" cy="416" rx="9" ry="14" fill="url(#roughPatch)" />
        <ellipse cx="616" cy="418" rx="8" ry="12" fill="url(#roughPatch)" />
        {/* Bottom End Rough (Batting Crease area) */}
        <ellipse cx="582" cy="582" rx="9" ry="14" fill="url(#roughPatch)" />
        <ellipse cx="618" cy="580" rx="8" ry="12" fill="url(#roughPatch)" />

        {/* Center Stance Wear Mark (Where Batter taps bat on the pitch) */}
        <ellipse cx="600" cy="564" rx="6" ry="3.5" fill="#5a3b19" opacity="0.65" />
        <ellipse cx="600" cy="436" rx="6" ry="3.5" fill="#5a3b19" opacity="0.65" />

        {/* ─── CRISP WHITE CHALK CREASE MARKINGS ─── */}
        {/* TOP END (Bowling End 1) */}
        {/* Bowling Crease */}
        <line x1="552" y1="412" x2="648" y2="412" stroke="#ffffff" strokeWidth="2.2" strokeOpacity="0.9" />
        {/* Popping Crease (4 ft in front of bowling crease) */}
        <line x1="544" y1="432" x2="656" y2="432" stroke="#ffffff" strokeWidth="2.8" strokeOpacity="0.95" />
        {/* Return Creases (Perpendicular to bowling crease) */}
        <line x1="564" y1="395" x2="564" y2="432" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.85" />
        <line x1="636" y1="395" x2="636" y2="432" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.85" />

        {/* BOTTOM END (Batting End / Striker End) */}
        {/* Bowling Crease */}
        <line x1="552" y1="588" x2="648" y2="588" stroke="#ffffff" strokeWidth="2.2" strokeOpacity="0.9" />
        {/* Popping Crease */}
        <line x1="544" y1="568" x2="656" y2="568" stroke="#ffffff" strokeWidth="2.8" strokeOpacity="0.95" />
        {/* Return Creases */}
        <line x1="564" y1="568" x2="564" y2="605" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.85" />
        <line x1="636" y1="568" x2="636" y2="605" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.85" />

        {/* ─── 3D WOODEN STUMPS & BAILS WITH SHADOWS ─── */}
        {/* Stumps - Top End */}
        <g id={`${uid}_topStumps`}>
          {/* Stumps drop shadow */}
          <line x1="593" y1="412" x2="607" y2="412" stroke="#000000" strokeWidth="2" opacity="0.4" />
          {/* 3 Stumps */}
          <rect x="594" y="401" width="2.4" height="11" rx="0.6" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.4" />
          <rect x="599" y="401" width="2.4" height="11" rx="0.6" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.4" />
          <rect x="604" y="401" width="2.4" height="11" rx="0.6" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.4" />
          {/* Bails */}
          <rect x="593" y="400" width="14" height="1.6" rx="0.5" fill="#fef08a" stroke="#b45309" strokeWidth="0.3" />
        </g>

        {/* Stumps - Bottom End */}
        <g id={`${uid}_bottomStumps`}>
          {/* Stumps drop shadow */}
          <line x1="593" y1="588" x2="607" y2="588" stroke="#000000" strokeWidth="2" opacity="0.4" />
          {/* 3 Stumps */}
          <rect x="594" y="588" width="2.4" height="11" rx="0.6" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.4" />
          <rect x="599" y="588" width="2.4" height="11" rx="0.6" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.4" />
          <rect x="604" y="588" width="2.4" height="11" rx="0.6" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.4" />
          {/* Bails */}
          <rect x="593" y="598" width="14" height="1.6" rx="0.5" fill="#fef08a" stroke="#b45309" strokeWidth="0.3" />
        </g>

        {/* Sight Screens at both Ends */}
        <rect x="576" y="145" width="48" height="6" rx="1.5" fill="#f8fafc" stroke="#64748b" strokeWidth="0.8" opacity="0.6" />
        <rect x="576" y="848" width="48" height="6" rx="1.5" fill="#f8fafc" stroke="#64748b" strokeWidth="0.8" opacity="0.6" />
      </svg>

      {/* ─── LAYER 4: Stadium Fortress Name in Night Atmosphere ─── */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 text-center pointer-events-none select-none opacity-[0.05] transition-opacity duration-1000">
        <span className="font-display uppercase text-7xl sm:text-9xl font-black tracking-widest text-white whitespace-nowrap block">
          {stadium.shortName}
        </span>
        <span className="text-xs uppercase tracking-[0.5em] text-white block mt-1 font-mono">
          {stadium.city} • FORTRESS ARENA
        </span>
      </div>

      {/* ─── LAYER 5: Tactical Vignette (Keeps all text & cards 100% readable) ─── */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(5, 8, 12, 0.75) 100%)'
        }}
      />
    </div>
  )
}
