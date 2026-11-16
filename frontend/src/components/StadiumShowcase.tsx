'use client'

import { useState, useRef, useEffect } from 'react'
import { STADIUMS, getStadiumForTeam, Stadium } from '../data/stadiums'
import { useStore } from '../store/useStore'
import { MapPin, Users, Flame, Shield, Compass, Sparkles, Trophy, Award, ChevronRight } from 'lucide-react'
import gsap from 'gsap'

export function StadiumShowcase({ onSelectTeam }: { onSelectTeam?: (teamId: string) => void }) {
  const { theme, setTheme } = useStore()
  const activeStadium = getStadiumForTeam(theme)
  const [selectedStadiumId, setSelectedStadiumId] = useState(activeStadium.id)
  const cardRef = useRef<HTMLDivElement>(null)
  const floodlightRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<'pitch' | 'records' | 'tactics'>('pitch')

  const currentStadium = Object.values(STADIUMS).find(s => s.id === selectedStadiumId) || activeStadium

  // Synchronize when store theme changes
  useEffect(() => {
    setSelectedStadiumId(activeStadium.id)
  }, [theme, activeStadium.id])

  // GSAP 3D magnetic tilt & floodlight flare effect on mousemove
  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const centerX = rect.width / 2
      const centerY = rect.height / 2

      const rotateX = ((y - centerY) / centerY) * -6
      const rotateY = ((x - centerX) / centerX) * 6

      gsap.to(card, {
        rotateX,
        rotateY,
        duration: 0.5,
        ease: 'power2.out',
        transformPerspective: 1000,
      })

      if (floodlightRef.current) {
        gsap.to(floodlightRef.current, {
          x: x - 150,
          y: y - 150,
          duration: 0.3,
          ease: 'power1.out',
        })
      }
    }

    const handleMouseLeave = () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.8,
        ease: 'elastic.out(1, 0.4)',
      })
    }

    card.addEventListener('mousemove', handleMouseMove)
    card.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      card.removeEventListener('mousemove', handleMouseMove)
      card.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  // Animate tab content transitions with GSAP
  useEffect(() => {
    gsap.fromTo(
      '.stadium-tab-content',
      { opacity: 0, y: 12, filter: 'blur(4px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.4, ease: 'power2.out' }
    )
  }, [activeTab, currentStadium.id])

  const handleStadiumClick = (stadium: Stadium) => {
    setSelectedStadiumId(stadium.id)
    setTheme(stadium.teamId)
    if (onSelectTeam) onSelectTeam(stadium.teamId)
  }

  return (
    <div className="w-full max-w-5xl mx-auto my-12 text-left">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-950/30 text-emerald-400 text-xs font-semibold mb-2 tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Home Fortress & Pitch Calibration
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
            HOME GROUND <span style={{ color: currentStadium.teamColor }}>FORTRESS</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 max-w-lg mt-1 font-light">
            Every IPL championship is won at home. Calibrate your 25-man mega auction squad to master your home stadium&apos;s soil and boundary dimensions.
          </p>
        </div>

        {/* Home Grounds Quick Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none max-w-full">
          {Object.values(STADIUMS).map((s) => {
            const isSelected = s.id === currentStadium.id
            return (
              <button
                key={s.id}
                onClick={() => handleStadiumClick(s)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer border"
                style={{
                  backgroundColor: isSelected ? s.teamColor : 'rgba(255,255,255,0.03)',
                  color: isSelected ? '#000000' : '#9ca3af',
                  borderColor: isSelected ? s.teamColor : 'rgba(255,255,255,0.08)',
                  boxShadow: isSelected ? `0 0 16px ${s.teamColor}50` : 'none',
                }}
              >
                {s.teamShort}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Stadium 3D Card */}
      <div
        ref={cardRef}
        className="relative rounded-3xl border border-white/10 bg-slate-950/70 backdrop-blur-xl overflow-hidden shadow-2xl transition-shadow duration-500"
        style={{
          boxShadow: `0 20px 60px -15px ${currentStadium.teamColor}20, inset 0 1px 0 rgba(255,255,255,0.1)`,
        }}
      >
        {/* Dynamic Stadium Mouse Follower Floodlight */}
        <div
          ref={floodlightRef}
          className="absolute w-[300px] h-[300px] rounded-full pointer-events-none opacity-20 blur-3xl transition-opacity"
          style={{
            background: `radial-gradient(circle, ${currentStadium.teamColor}, transparent 70%)`,
          }}
        />

        {/* Stadium Top Banner Artwork */}
        <div className="relative p-6 sm:p-8 border-b border-white/10 overflow-hidden">
          {/* Turf and pitch strip backdrop lines */}
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              background: `repeating-linear-gradient(90deg, #10b981 0px, #10b981 40px, #059669 40px, #059669 80px)`,
            }}
          />
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-30"
            style={{ background: currentStadium.teamColor }}
          />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2.5 text-xs text-gray-400 mb-2">
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <MapPin size={13} />
                  {currentStadium.city}, {currentStadium.state}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono">
                  <Users size={13} />
                  Capacity: {currentStadium.capacity}
                </span>
                <span>•</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-white">
                  {currentStadium.soilType}
                </span>
              </div>

              <h3 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-wide">
                {currentStadium.name}
              </h3>

              <p className="text-sm font-medium mt-1" style={{ color: currentStadium.teamColor }}>
                Fortress of the {currentStadium.teamName} ({currentStadium.teamShort})
              </p>
            </div>

            {/* Stadium Quick Stats Cards */}
            <div className="grid grid-cols-2 gap-3 shrink-0">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center min-w-[120px]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Avg 1st Innings</div>
                <div className="font-display text-2xl font-bold text-white mt-0.5">
                  {currentStadium.avgFirstInnings} <span className="text-xs text-emerald-400">Runs</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center min-w-[120px]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Record IPL Score</div>
                <div className="font-display text-xl font-bold text-white mt-0.5">
                  {currentStadium.recordScore.split(' ')[0]}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-white/10 px-6 sm:px-8 bg-black/30">
          <button
            onClick={() => setActiveTab('pitch')}
            className={`py-3.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'pitch'
                ? 'border-[var(--accent-primary)] text-white'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
            style={{
              borderColor: activeTab === 'pitch' ? currentStadium.teamColor : 'transparent',
            }}
          >
            <Compass size={14} />
            Pitch & Outfield
          </button>

          <button
            onClick={() => setActiveTab('records')}
            className={`py-3.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'records'
                ? 'border-[var(--accent-primary)] text-white'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
            style={{
              borderColor: activeTab === 'records' ? currentStadium.teamColor : 'transparent',
            }}
          >
            <Trophy size={14} />
            Stands & Atmosphere
          </button>

          <button
            onClick={() => setActiveTab('tactics')}
            className={`py-3.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'tactics'
                ? 'border-[var(--accent-primary)] text-white'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
            style={{
              borderColor: activeTab === 'tactics' ? currentStadium.teamColor : 'transparent',
            }}
          >
            <Shield size={14} />
            War Room Auction Strategy
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 sm:p-8 stadium-tab-content">
          {activeTab === 'pitch' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Pitch Character
                </span>
                <p className="text-base font-bold text-white mb-2">{currentStadium.pitchType}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{currentStadium.curatorNote}</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Boundary Dimensions
                </span>
                <p className="text-base font-bold text-white mb-2">{currentStadium.boundarySize}</p>
                <div className="text-xs text-gray-400 space-y-1">
                  <div>Straight: <span className="text-white font-mono">68m - 72m</span></div>
                  <div>Square: <span className="text-white font-mono">{currentStadium.boundarySize.split(' ')[0]}</span></div>
                  <div className="text-emerald-400 text-[11px] font-semibold mt-1">High Outfield Speed Index: 9.4/10</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Floodlight System
                </span>
                <p className="text-base font-bold text-white mb-2">{currentStadium.floodlights}</p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  High-definition optical array calibrated for pink & white ball visibility, evening humidity, and late-game dew factor.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'records' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3">
                  Iconic Stands & Roar Zones
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  {currentStadium.stands.map((stand, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-white/5 text-xs font-medium text-gray-200 border border-white/5 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: currentStadium.teamColor }} />
                      {stand}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                    Ground Benchmark Record
                  </span>
                  <div className="font-display text-3xl font-black text-white">
                    {currentStadium.recordScore}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Highest team total recorded in IPL history at this arena.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
                  <span>Matchday Atmosphere</span>
                  <span className="font-semibold text-white">{currentStadium.teamShort} 12th Man Legion</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tactics' && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/20 via-slate-900/40 to-slate-950 border border-emerald-500/20">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Shield size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">
                    Linear Programming Optimizer Calibration
                  </h4>
                  <p className="text-xs text-gray-300 leading-relaxed mb-3">
                    {currentStadium.keyBattles}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white/10 text-emerald-300">
                      Primary Need: {currentStadium.soilType === 'Red Soil' ? 'Express Fast Bowlers & Death Hitters' : 'Cutter Specialists & Spin Anchors'}
                    </span>
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white/10 text-gray-300">
                      Budget Allocation Target: 42% on Top 4 Powerhitters
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
