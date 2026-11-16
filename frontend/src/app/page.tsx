'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Trophy, Users, Zap, Gavel, TrendingUp, Shield, Compass, MapPin, ChevronRight, Sparkles, Activity } from 'lucide-react'
import { useStore } from '../store/useStore'
import { getStadiumForTeam } from '../data/stadiums'
import { StadiumShowcase } from '../components/StadiumShowcase'
import gsap from 'gsap'

const broadcastFeatures = [
  {
    title: 'Linear Programming Optimizer',
    tag: 'Operations Research',
    desc: 'PuLP CBC solver optimizing 25-man squad within ₹125 Cr salary cap and overseas quota.',
    icon: Zap,
    stat: '25 Players • ₹125 Cr',
    color: '#fbbf24'
  },
  {
    title: 'Live Auction Arena',
    tag: 'Bidding Engine',
    desc: 'Broadcast-grade live bidding war room with AI rival franchise counter-bids and paddle wars.',
    icon: Gavel,
    stat: '10 Franchises Live',
    color: '#3b82f6'
  },
  {
    title: 'Home Ground Pitch Engine',
    tag: 'Stadium Calibration',
    desc: 'Pitch-calibrated Playing XI tuned for home turf soil, dew factors, and boundary lengths.',
    icon: Compass,
    stat: '10 Stadium Fortresses',
    color: '#10b981'
  },
  {
    title: '357+ Player Power Index',
    tag: 'Analytics Suite',
    desc: 'Deep strike rate, economy, phase impact, and historical auction valuation models.',
    icon: Users,
    stat: '357 Registered Stars',
    color: '#a855f7'
  }
]

export default function LandingPage() {
  const { theme, setTheme } = useStore()
  const activeStadium = getStadiumForTeam(theme)
  const heroRef = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // GSAP Entrance Timeline
  useEffect(() => {
    if (!mounted) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.fromTo(
        '.gsap-broadcast-badge',
        { opacity: 0, y: -20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6 }
      )
      .fromTo(
        '.gsap-hero-title',
        { opacity: 0, y: 30, rotateX: 15 },
        { opacity: 1, y: 0, rotateX: 0, duration: 0.8, stagger: 0.15 },
        '-=0.3'
      )
      .fromTo(
        '.gsap-hero-subtitle',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 },
        '-=0.4'
      )
      .fromTo(
        '.gsap-cta-group',
        { opacity: 0, scale: 0.95, y: 15 },
        { opacity: 1, scale: 1, y: 0, duration: 0.6 },
        '-=0.3'
      )
      .fromTo(
        '.gsap-feature-card',
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 },
        '-=0.2'
      )
    }, heroRef)

    return () => ctx.revert()
  }, [mounted])

  return (
    <div ref={heroRef} className="min-h-screen relative overflow-hidden flex flex-col justify-between text-white">

      {/* ─── Matchday Stadium Ribbon (Top Broadcast Bar) ─── */}
      <div className="relative z-20 border-b border-white/10 bg-black/40 backdrop-blur-md px-6 py-2.5 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              MATCHDAY ARENA ACTIVE
            </span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-300 font-medium">
              Venue: <span className="text-white font-semibold">{activeStadium.name}</span> ({activeStadium.city})
            </span>
            <span className="text-gray-500 hidden md:inline">•</span>
            <span className="text-gray-400 hidden md:inline">
              Pitch: <span className="text-amber-400">{activeStadium.soilType}</span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-gray-400 text-[11px]">
            <span>CAPACITY: <strong className="text-white font-mono">{activeStadium.capacity}</strong></span>
            <span>AVG 1ST INNINGS: <strong className="text-emerald-400 font-mono">{activeStadium.avgFirstInnings}</strong></span>
            <Link 
              href="/select-team" 
              className="text-white font-bold hover:underline transition-colors flex items-center gap-1"
              style={{ color: activeStadium.teamColor }}
            >
              Change Fortress <ChevronRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Main Hero Section ─── */}
      <main className="relative z-10 max-w-6xl mx-auto text-center px-6 pt-12 pb-8 w-full">
        
        {/* Cricket Broadcast Badge */}
        <div className="gsap-broadcast-badge inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-950/20 text-amber-300 text-xs font-semibold mb-6 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
          <Trophy size={14} className="text-amber-400" />
          <span>IPL MEGA AUCTION WAR ROOM & SQUAD OPTIMIZER</span>
          <span className="px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-200 text-[10px] font-bold">2026 EDITION</span>
        </div>

        {/* Hero Title */}
        <h1 ref={headlineRef} className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight leading-[0.92] mb-6">
          <span className="gsap-hero-title block text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
            CONQUER THE
          </span>
          <span 
            className="gsap-hero-title block tracking-tight transition-colors duration-700"
            style={{
              color: activeStadium.teamColor,
              textShadow: `0 0 40px ${activeStadium.teamColor}50`,
            }}
          >
            IPL AUCTION
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="gsap-hero-subtitle text-base sm:text-xl text-gray-300 max-w-2xl mx-auto mb-10 font-normal leading-relaxed">
          The elite cricket decision room for IPL owners & analysts. Calibrate your 25-man squad against your home ground turf, run mathematical linear programming solvers, and dominate rival franchises.
        </p>

        {/* CTA Buttons */}
        <div className="gsap-cta-group flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
          <Link
            href="/squad"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl font-display text-lg font-bold tracking-wider text-black flex items-center justify-center gap-2 transition-all transform hover:scale-105 active:scale-95 shadow-xl cursor-pointer"
            style={{
              backgroundColor: activeStadium.teamColor,
              boxShadow: `0 10px 30px ${activeStadium.teamColor}60`,
            }}
          >
            <Gavel size={20} />
            ENTER SQUAD WAR ROOM
          </Link>

          <Link
            href="/select-team"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl font-display text-lg font-bold tracking-wider text-white bg-white/5 hover:bg-white/10 border border-white/15 flex items-center justify-center gap-2 transition-all transform hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
          >
            <MapPin size={20} />
            SELECT FRANCHISE FORTRESS
          </Link>
        </div>

        {/* ─── Interactive Home Ground Stadium Showcase ─── */}
        <StadiumShowcase />

        {/* ─── 4 Broadcast Capabilities Cards ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left my-8">
          {broadcastFeatures.map((f, i) => (
            <div
              key={i}
              className="gsap-feature-card p-5 rounded-2xl border border-white/10 bg-slate-950/60 backdrop-blur-md hover:border-white/20 transition-all duration-300 group hover:-translate-y-1"
              style={{
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                  style={{ backgroundColor: `${f.color}20`, color: f.color }}
                >
                  <f.icon size={20} />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
                  {f.tag}
                </span>
              </div>

              <h3 className="font-bold text-base text-white mb-1.5 group-hover:text-[var(--accent-primary)] transition-colors">
                {f.title}
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-3">
                {f.desc}
              </p>

              <div className="pt-2.5 border-t border-white/5 text-[11px] font-mono font-semibold text-emerald-400">
                {f.stat}
              </div>
            </div>
          ))}
        </div>

      </main>

      {/* ─── Footer Matchday Broadcast Ticker ─── */}
      <footer className="relative z-10 border-t border-white/10 bg-black/60 backdrop-blur-md py-6 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-3">
            <div 
              className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs text-black"
              style={{ backgroundColor: activeStadium.teamColor }}
            >
              🏏
            </div>
            <span className="font-display text-base font-bold text-white tracking-wider">
              AUCTION<span style={{ color: activeStadium.teamColor }}>XI</span> CRICKET ARENA
            </span>
            <span className="text-gray-600">|</span>
            <span>Home: <strong>{activeStadium.name}</strong></span>
          </div>

          <div className="flex items-center gap-6 text-[11px]">
            <span>Cap: <strong>₹125.0 Cr</strong></span>
            <span>Squad: <strong>18 - 25 Players</strong></span>
            <span>Overseas Cap: <strong>8 Max</strong></span>
            <span>Keeper Rule: <strong>Min 2 WK</strong></span>
          </div>
        </div>
      </footer>

    </div>
  )
}
