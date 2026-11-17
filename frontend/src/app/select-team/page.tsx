'use client'

import { useStore } from '../../store/useStore'
import { useCampaignStore } from '../../store/useCampaignStore'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { ChevronRight, Trophy, MapPin, Users, Compass, Shield, ArrowRight, ArrowLeft } from 'lucide-react'
import { STADIUMS } from '../../data/stadiums'
import gsap from 'gsap'

const teams = [
  { id: 'csk',  name: 'Chennai Super Kings',         short: 'CSK',  color: '#fbbf24', emoji: '🦁', titles: '5x Champions', stadium: 'Chepauk (M. A. Chidambaram)', city: 'Chennai' },
  { id: 'mi',   name: 'Mumbai Indians',              short: 'MI',   color: '#2563eb', emoji: '🏏', titles: '5x Champions', stadium: 'Wankhede Stadium', city: 'Mumbai' },
  { id: 'rcb',  name: 'Royal Challengers Bengaluru',    short: 'RCB',  color: '#dc2626', emoji: '👑', titles: 'Bold Army', stadium: 'M. Chinnaswamy Stadium', city: 'Bengaluru' },
  { id: 'kkr',  name: 'Kolkata Knight Riders',        short: 'KKR',  color: '#7c3aed', emoji: '⚔️', titles: '3x Champions', stadium: 'Eden Gardens', city: 'Kolkata' },
  { id: 'srh',  name: 'Sunrisers Hyderabad',         short: 'SRH',  color: '#ea580c', emoji: '🌅', titles: '2x Champions', stadium: 'Rajiv Gandhi Stadium', city: 'Hyderabad' },
  { id: 'rr',   name: 'Rajasthan Royals',            short: 'RR',   color: '#db2777', emoji: '💎', titles: 'Inaugural Champions', stadium: 'Sawai Mansingh Stadium', city: 'Jaipur' },
  { id: 'dc',   name: 'Delhi Capitals',              short: 'DC',   color: '#0284c7', emoji: '🦅', titles: 'Roar Macha', stadium: 'Arun Jaitley Stadium', city: 'Delhi' },
  { id: 'pbks', name: 'Punjab Kings',                short: 'PBKS', color: '#b91c1c', emoji: '🗡️', titles: 'Sadda Punjab', stadium: 'Maharaja Yadavindra Stadium', city: 'Mullanpur' },
  { id: 'lsg',  name: 'Lucknow Super Giants',        short: 'LSG',  color: '#0891b2', emoji: '🐘', titles: 'Adab Se', stadium: 'BRSABV Ekana Stadium', city: 'Lucknow' },
  { id: 'gt',   name: 'Gujarat Titans',              short: 'GT',   color: '#0d9488', emoji: '🛡️', titles: '2022 Champions', stadium: 'Narendra Modi Arena', city: 'Ahmedabad' },
]

export default function SelectTeamPage() {
  const { theme, setTheme } = useStore()
  const router = useRouter()
  const [hoveredTeam, setHoveredTeam] = useState<string | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // GSAP Entrance
  useEffect(() => {
    if (!mounted) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.gsap-team-card',
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.05, ease: 'power2.out' }
      )
    }, containerRef)

    return () => ctx.revert()
  }, [mounted])

  const activeTeam = teams.find(t => t.id === (hoveredTeam || selectedTeam || theme)) || teams[2]
  const activeStadium = STADIUMS[activeTeam.id] || STADIUMS.rcb

  const { createCampaign, switchCampaign, campaigns } = useCampaignStore()

  const handleSelect = (teamId: string) => {
    setSelectedTeam(teamId)
    setTheme(teamId)
    
    // Find existing campaign for this team or create a new one
    const existing = Object.values(campaigns).find(c => c.teamId === teamId)
    if (existing) {
      switchCampaign(existing.id)
    } else {
      createCampaign(teamId)
    }

    setTimeout(() => {
      router.push('/trade')
    }, 500)
  }

  if (!mounted) return null

  return (
    <div ref={containerRef} className="min-h-screen relative overflow-x-hidden touch-pan-y p-3 sm:p-6 pt-10 sm:pt-12 flex flex-col justify-between text-white w-full max-w-full">

      {/* Top Left Back Button */}
      <button
        onClick={() => router.push('/')}
        className="absolute top-3 sm:top-4 left-3 sm:left-6 z-30 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 border border-white/15 cursor-pointer shadow-lg backdrop-blur-md"
        title="Return to Home Screen"
      >
        <ArrowLeft size={14} className="text-amber-400" />
        <span>Back</span>
      </button>

      {/* Dynamic Floodlight Beam from Top */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] pointer-events-none transition-all duration-700 blur-3xl opacity-20"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${activeTeam.color}, transparent 70%)`
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto w-full text-center">
        
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] sm:text-xs font-semibold text-gray-300 mb-2 tracking-wider uppercase">
            <span>🏏</span>
            <span>CHOOSE YOUR FRANCHISE & HOME GROUND</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-2">
            SELECT YOUR <span style={{ color: activeTeam.color }} className="transition-colors duration-500">FRANCHISE FORTRESS</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 max-w-lg mx-auto font-light">
            Each franchise operates from their iconic home stadium, dictating pitch behavior, boundary tactics, and War Room budget priorities.
          </p>
        </div>

        {/* Active Fortress Preview Strip */}
        <div className="mb-8 p-4 rounded-2xl border border-white/10 bg-slate-950/70 backdrop-blur-md max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-left transition-all duration-500">
          <div className="flex items-center gap-3.5">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl border"
              style={{
                backgroundColor: `${activeTeam.color}20`,
                borderColor: `${activeTeam.color}60`,
              }}
            >
              {activeTeam.emoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-xl font-bold text-white">{activeTeam.name}</span>
                <span className="text-xs px-2 py-0.5 rounded font-bold text-black" style={{ backgroundColor: activeTeam.color }}>
                  {activeTeam.short}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                <MapPin size={12} className="text-emerald-400" />
                <span>{activeStadium.name} ({activeStadium.city})</span>
                <span>•</span>
                <span className="text-amber-400 font-semibold">{activeStadium.soilType}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono shrink-0">
            <div>
              <span className="text-gray-500 block text-[10px]">CAPACITY</span>
              <span className="text-white font-bold">{activeStadium.capacity}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px]">PAR SCORE</span>
              <span className="text-emerald-400 font-bold">{activeStadium.avgFirstInnings}</span>
            </div>
          </div>
        </div>

        {/* 10 Franchises Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {teams.map((team) => {
            const isSelected = (selectedTeam || theme) === team.id
            const isHovered = hoveredTeam === team.id
            const stadium = STADIUMS[team.id] || STADIUMS.rcb
            const existingCampaign = Object.values(campaigns).find(c => c.teamId === team.id)

            return (
              <div
                key={team.id}
                onMouseEnter={() => setHoveredTeam(team.id)}
                onMouseLeave={() => setHoveredTeam(null)}
                onClick={() => handleSelect(team.id)}
                className={`gsap-team-card relative p-3 sm:p-4 rounded-2xl border transition-all duration-300 cursor-pointer text-left flex flex-col justify-between group hover:-translate-y-1.5 ${
                  isSelected
                    ? 'border-white bg-white/10 shadow-2xl scale-[1.02]'
                    : 'border-white/10 bg-slate-950/50 hover:border-white/30 hover:bg-white/5'
                }`}
                style={{
                  boxShadow: isSelected ? `0 10px 30px -10px ${team.color}80` : 'none',
                  borderColor: isSelected ? team.color : undefined,
                }}
              >
                {/* Active Selection Checkmark Badge */}
                {isSelected && (
                  <div
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-black text-[10px] font-black z-20 shadow-lg"
                    style={{ backgroundColor: team.color }}
                  >
                    ✓
                  </div>
                )}

                <div>
                  {/* Top Icon & Short code */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{team.emoji}</span>
                    <div className="flex items-center gap-1">
                      {existingCampaign && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[8px] font-black uppercase border border-amber-500/40">
                          {existingCampaign.currentPhase.replace('_', ' ')}
                        </span>
                      )}
                      <span 
                        className="px-2 py-0.5 rounded text-[10px] font-black tracking-wider"
                        style={{
                          backgroundColor: `${team.color}25`,
                          color: team.color,
                          border: `1px solid ${team.color}50`
                        }}
                      >
                        {team.short}
                      </span>
                    </div>
                  </div>

                  {/* Team Name */}
                  <h3 className="font-bold text-sm text-white leading-tight mb-1 group-hover:text-amber-300 transition-colors">
                    {team.name}
                  </h3>

                  {/* Honors */}
                  <div className="text-[11px] font-medium text-gray-400 mb-3 flex items-center gap-1">
                    <Trophy size={11} className="text-amber-400" />
                    {team.titles}
                  </div>
                </div>

                {/* Stadium Fortress Footnote */}
                <div className="pt-2.5 border-t border-white/5 text-[11px] text-gray-400">
                  <div className="flex items-center gap-1 text-gray-300 font-semibold truncate">
                    <MapPin size={10} className="text-emerald-400 shrink-0" />
                    <span className="truncate">{stadium.shortName}</span>
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5 truncate">
                    {stadium.soilType} • {stadium.capacity}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Enter Squad War Room Button */}
        <div className="mt-10 flex justify-center">
          <button
            onClick={() => handleSelect(selectedTeam || theme || 'rcb')}
            className="px-10 py-4 rounded-2xl font-display text-lg font-bold tracking-wider text-black flex items-center gap-3 transition-all transform hover:scale-105 active:scale-95 shadow-2xl cursor-pointer"
            style={{
              backgroundColor: activeTeam.color,
              boxShadow: `0 10px 40px ${activeTeam.color}60`,
            }}
          >
            <span>CONFIRM & ENTER {activeTeam.short} WAR ROOM</span>
            <ArrowRight size={20} />
          </button>
        </div>

      </div>

      <div />
    </div>
  )
}
