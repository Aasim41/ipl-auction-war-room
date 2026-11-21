'use client'

import React, { useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { useStore } from '../store/useStore'
import { useCampaignStore } from '../store/useCampaignStore'
import { getTeamTheme } from '../data/teamThemes'

export function AmbientBackground() {
  const pathname = usePathname()
  const storeTheme = useStore((state) => state.theme)
  const activeCampaign = useCampaignStore((state) => {
    const activeId = state.activeCampaignId
    return activeId ? state.campaigns[activeId] : null
  })

  // If on home ('/'), allow immediate preview of whatever team tab the user clicked in storeTheme
  // On all other pages (e.g. playing-xi, auction, match), prioritize the active campaign's team
  const currentTeamId = useMemo(() => {
    if (pathname === '/' || !activeCampaign?.teamId) {
      return (storeTheme || activeCampaign?.teamId || 'rcb').toLowerCase()
    }
    return (activeCampaign.teamId || storeTheme || 'rcb').toLowerCase()
  }, [pathname, storeTheme, activeCampaign?.teamId])

  const t = getTeamTheme(currentTeamId)

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none transition-colors duration-700 ease-out"
      style={{ backgroundColor: t.bgDeep }}
      aria-hidden="true"
    >
      {/* ─── LAYER 1: Signature Team Deep Atmospheric Gradient ─── */}
      <div 
        className="absolute inset-0 transition-all duration-700 ease-out"
        style={{
          background: `
            linear-gradient(180deg, 
              ${t.bgMid} 0%, 
              ${t.bgDeep} 40%, 
              ${t.bgDeep} 100%
            )
          `
        }}
      />

      {/* ─── LAYER 2: Radiant Top Stadium Spotlight in Team Primary Color ─── */}
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1200px] h-[650px] pointer-events-none transition-all duration-700 ease-out"
        style={{
          background: `radial-gradient(ellipse at 50% 20%, ${t.glowPrimary} 0%, ${t.glowSecondary} 40%, transparent 75%)`,
          filter: 'blur(40px)',
          opacity: 0.85,
        }}
      />

      {/* ─── LAYER 3: Dual Flank Halos (Left Primary, Right Accent) ─── */}
      {/* Left Team Aura */}
      <div
        className="absolute top-0 left-0 w-[600px] h-[600px] pointer-events-none transition-all duration-700 ease-out"
        style={{
          background: `radial-gradient(circle at 10% 20%, ${t.glowPrimary} 0%, transparent 65%)`,
          filter: 'blur(50px)',
          opacity: 0.7,
        }}
      />
      {/* Right Team Aura */}
      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none transition-all duration-700 ease-out"
        style={{
          background: `radial-gradient(circle at 90% 20%, ${t.glowSecondary} 0%, transparent 65%)`,
          filter: 'blur(50px)',
          opacity: 0.65,
        }}
      />

      {/* ─── LAYER 4: Mid-Arena Team Glow Core ─── */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] pointer-events-none transition-all duration-700 ease-out"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${t.glowPrimary} 0%, transparent 65%)`,
          filter: 'blur(60px)',
          opacity: 0.35,
        }}
      />

      {/* ─── LAYER 5: Bottom Uplight Glow ─── */}
      <div
        className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] pointer-events-none transition-all duration-700 ease-out"
        style={{
          background: `radial-gradient(ellipse at 50% 80%, ${t.glowSecondary} 0%, transparent 70%)`,
          filter: 'blur(50px)',
          opacity: 0.45,
        }}
      />

      {/* ─── LAYER 6: Subtle Geometric Cyber Grid Tinted with Team Color ─── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20 transition-all duration-700 ease-out"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, ${t.primary} 1.2px, transparent 1.2px)
          `,
          backgroundSize: '32px 32px',
        }}
      />

      {/* ─── LAYER 7: Dynamic Team Identity Watermark & Motto ─── */}
      <div className="absolute top-20 sm:top-24 left-1/2 -translate-x-1/2 text-center pointer-events-none select-none transition-all duration-700 ease-out w-full max-w-4xl px-4">
        <span 
          className="font-display uppercase text-7xl sm:text-9xl font-black tracking-widest block transition-all duration-700 ease-out"
          style={{
            color: t.primary,
            opacity: 0.05,
            textShadow: `0 0 60px ${t.primary}`,
          }}
        >
          {t.short}
        </span>
        <span 
          className="text-[11px] sm:text-xs uppercase tracking-[0.4em] font-mono font-bold block mt-1 transition-all duration-700 ease-out"
          style={{
            color: t.accent,
            opacity: 0.08,
          }}
        >
          {t.city} • {t.motto}
        </span>
      </div>

      {/* ─── LAYER 8: Soft Vignette for 100% Legibility of Cards & Tables ─── */}
      <div 
        className="absolute inset-0 pointer-events-none transition-all duration-700 ease-out"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, transparent 45%, ${t.bgDeep} 95%)`,
          opacity: 0.65,
        }}
      />
    </div>
  )
}
